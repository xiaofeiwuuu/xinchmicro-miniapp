<template>
  <view class="page">
    <scroll-view v-if="!invoiceMode && !afterSalesMode" scroll-x class="tabs">
      <view class="tabs-inner">
        <view v-for="t in tabs" :key="t.key" class="tab" :class="{ active: t.key === active }" @tap="switchTab(t.key)">
          <text>{{ t.text }}</text>
        </view>
      </view>
    </scroll-view>

    <RetryState v-if="failed" @retry="load" />
    <EmptyState v-else-if="loaded && !list.length" :text="$t('order.empty')" />
    <scroll-view v-else scroll-y class="list">
      <view v-for="o in list" :key="o.id" class="card" @tap="open(o)">
        <view class="head">
          <text class="no">{{ o.orderNo }}</text>
          <text class="status" :style="{ color: color(o.status) }">{{ statusText(o.status) }}</text>
        </view>
        <text v-if="o.refundState" class="inv" style="color: #4fc3f7;">{{ $t('refund.short.' + o.refundState) }}</text>
        <text v-if="o.afterSales && o.afterSales.length" class="inv" style="color: #ffb74d;">{{ $t('as.title') }}：{{ $t('as.status.' + o.afterSales[0].status) }}</text>
        <text v-if="o.status !== 'cancelled' && invoiceStatus(o) !== 'none'" class="inv" :style="{ color: invColor(o) }">{{ invoiceText(invoiceStatus(o)) }}</text>
        <view v-for="i in o.items.slice(0, 3)" :key="i.productId" class="item">
          <text class="item-name">{{ i.name }}</text>
          <text class="item-qty">×{{ i.qty }}</text>
        </view>
        <text v-if="o.items.length > 3" class="more">…</text>
        <view class="foot">
          <text class="time">{{ formatTime(o.createdAt) }}</text>
          <text class="amount">{{ $t('order.count', { n: count(o) }) }}　{{ $t('shop.price', { price: o.totalAmount.toFixed(2) }) }}</text>
        </view>
      </view>
      <view class="space"></view>
    </scroll-view>
  </view>
</template>

<script>
import { getOrders } from '@/api/shop.js';
import { statusText, STATUS_COLOR, formatTime, UNPAID_STATUSES, invoiceStatusOf, invoiceText, INVOICE_COLOR } from '@/utils/order.js';
import { safeNavigate } from '@/utils/nav.js';
import { logError } from '@/utils/logger.js';
import RetryState from '@/components/RetryState.vue';
import EmptyState from '@/components/EmptyState.vue';

// 页签：全部 / 待付款（待转账+待核对）/ 待发货 / 待收货（已发货）/ 已完成
const KEYS = ['', 'unpaid', 'pending_ship', 'shipped', 'completed'];
const TAB_TEXT = { '': 'os.all', unpaid: 'os.tab.unpaid', pending_ship: 'os.pending_ship', shipped: 'os.tab.receive', completed: 'os.completed' };

export default {
  components: { RetryState, EmptyState },
  data() {
    return { active: '', invoiceMode: '', afterSalesMode: false, list: [], loaded: false, failed: false };
  },
  computed: {
    tabs() {
      return KEYS.map((k) => ({ key: k, text: this.$t(TAB_TEXT[k]) }));
    }
  },
  onLoad(options) {
    // ?tab=unpaid 打开对应页签；?invoice=none|requesting|issued 是「我的发票」，按开票状态列出订单，没有页签
    if (options && KEYS.includes(options.tab)) this.active = options.tab;
    // ?afterSales=1 是「退款/售后」：列出有过售后申请的订单，也没有页签
    if (options && options.afterSales === '1') {
      this.afterSalesMode = true;
      uni.setNavigationBarTitle({ title: this.$t('as.entry') });
    }
    if (options && ['none', 'requesting', 'issued'].includes(options.invoice)) {
      this.invoiceMode = options.invoice;
      uni.setNavigationBarTitle({ title: invoiceText(options.invoice) });
    }
  },
  onShow() {
    // 全局的 onShow 会把导航栏标题设回「我的订单」；特殊模式（售后、开票状态）的标题要在它之后再设一次，页面自己的 onShow 比全局 mixin 晚执行
    if (this.afterSalesMode) uni.setNavigationBarTitle({ title: this.$t('as.entry') });
    else if (this.invoiceMode) uni.setNavigationBarTitle({ title: invoiceText(this.invoiceMode) });
    // 从详情页操作（取消、上传凭证等）回来要刷新
    this.load();
  },
  methods: {
    statusText,
    formatTime,
    invoiceText,
    invoiceStatus: invoiceStatusOf,
    invColor: (o) => INVOICE_COLOR[invoiceStatusOf(o)],
    color: (s) => STATUS_COLOR[s],
    count: (o) => o.items.reduce((n, i) => n + i.qty, 0),
    switchTab(key) {
      if (key === this.active) return;
      this.active = key;
      this.loaded = false;
      this.list = [];
      this.load();
    },
    async load() {
      this.failed = false;
      const tab = this.active;
      try {
        const query = this.afterSalesMode
          ? { afterSales: true }
          : this.invoiceMode
          ? { invoice: this.invoiceMode }
          : tab === 'unpaid'
          ? { statuses: UNPAID_STATUSES }
          : { status: tab };
        const { data } = await getOrders(query);
        if (tab !== this.active) return; // 请求期间又切了页签
        if (data.code !== 0) throw new Error(data.message || 'load failed');
        this.list = data.data || [];
        this.loaded = true;
      } catch (e) {
        logError('order.list', { error: (e && (e.errMsg || e.message)) || String(e) });
        if (!this.loaded) this.failed = true;
      }
    },
    open(o) {
      safeNavigate('/pages/order/detail?id=' + o.id);
    }
  }
};
</script>

<style lang="scss">
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0e1a2d;
}
.tabs {
  flex-shrink: 0;
  white-space: nowrap;
  background: #122642;
}
.tabs-inner {
  display: inline-flex;
}
.tab {
  padding: 28rpx 32rpx;
  color: rgba(255, 255, 255, 0.6);
  font-size: 28rpx;
  border-bottom: 4rpx solid transparent;

  &.active {
    color: #fff;
    font-weight: 700;
    border-bottom-color: #00a8ff;
  }
}
.list {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}
.card {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}
.no {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}
.status {
  font-size: 28rpx;
  font-weight: 600;
}
.item {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
}
.item-name {
  flex: 1;
  min-width: 0;
  color: #fff;
  font-size: 28rpx;
}
.item-qty {
  color: rgba(255, 255, 255, 0.7);
  font-size: 28rpx;
  margin-left: 20rpx;
}
.inv {
  display: block;
  font-size: 24rpx;
  margin-bottom: 8rpx;
}
.more {
  color: rgba(255, 255, 255, 0.4);
}
.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.time {
  color: rgba(255, 255, 255, 0.4);
  font-size: 24rpx;
}
.amount {
  color: #ffb74d;
  font-size: 28rpx;
  font-weight: 600;
}
.space {
  height: 40rpx;
}
</style>
