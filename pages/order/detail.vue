<template>
  <view class="page">
    <RetryState v-if="failed" @retry="load" />
    <scroll-view v-else-if="order" scroll-y class="body">
      <view class="banner">
        <text class="banner-status" :style="{ color: color(order.status) }">{{ statusText(order.status) }}</text>
        <text class="banner-amount">{{ $t('shop.price', { price: order.totalAmount.toFixed(2) }) }}</text>
      </view>

      <!-- 付款提示：只支持微信支付，底部的「微信支付」按钮付款；超时会自动取消 -->
      <view v-if="order.status === 'pending_payment'" class="card">
        <text class="title">{{ $t('order.payHintTitle') }}</text>
        <text class="hint">{{ $t('order.payHint') }}</text>
      </view>
      <!-- 付过款的订单客户自己不能取消，提示联系我们 -->
      <view v-else-if="order.status === 'pending_ship'" class="card">
        <text class="hint">{{ $t('order.contactCancel') }}</text>
      </view>

      <view v-if="order.expressNo" class="card">
        <text class="title">{{ $t('order.shipping') }}</text>
        <view class="kv"><text class="k">{{ $t('order.expressCompany') }}</text><text class="v">{{ order.expressCompany }}</text></view>
        <view class="kv"><text class="k">{{ $t('order.expressNo') }}</text><text class="v">{{ order.expressNo }}</text></view>
      </view>

      <view class="card">
        <text class="title">{{ $t('order.address') }}</text>
        <text class="v">{{ order.address.consignee }}　{{ order.address.phone }}</text>
        <text class="sub">{{ order.address.region }} {{ order.address.detail }}</text>
      </view>

      <view class="card">
        <text class="title">{{ $t('order.goods') }}</text>
        <view v-for="i in order.items" :key="i.productId" class="item">
          <text class="item-name">{{ i.name }}</text>
          <text class="item-price">{{ $t('shop.price', { price: i.price.toFixed(2) }) }}</text>
          <text class="item-qty">×{{ i.qty }}</text>
        </view>
      </view>

      <!-- 发票：已付款的订单可以申请开票；用的是「我的」里保存的开票信息 -->
      <view v-if="showInvoice" class="card">
        <text class="title">{{ $t('inv.section') }}</text>
        <view class="kv">
          <text class="k">{{ invoiceText(invStatus) }}</text>
          <text class="v">{{ order.invoice ? order.invoice.title : '' }}</text>
          <text v-if="canApply" class="copy" @tap="applyInv">{{ $t('inv.apply') }}</text>
        </view>
      </view>

      <view class="card">
        <view class="kv"><text class="k">{{ $t('order.no') }}</text><text class="v">{{ order.orderNo }}</text><text class="copy" @tap="copy(order.orderNo)">{{ $t('order.copy') }}</text></view>
        <view class="kv"><text class="k">{{ $t('order.time') }}</text><text class="v">{{ formatTime(order.createdAt) }}</text></view>
        <view v-if="order.paidBy === 'wechat'" class="kv"><text class="k">{{ $t('order.payMethod') }}</text><text class="v">{{ $t('order.byWechat') }}</text></view>
        <view v-if="order.remark" class="kv"><text class="k">{{ $t('order.remark') }}</text><text class="v">{{ order.remark }}</text></view>
      </view>

      <!-- 仅演示：没有后台时用它模拟后台发货 -->
      <view v-if="canDemo" class="demo" @tap="advance"><text>{{ $t('order.demo') }}</text></view>
      <view v-if="invStatus === 'requesting'" class="demo" @tap="issueInv"><text>{{ $t('inv.demoIssue') }}</text></view>
      <view class="space"></view>
    </scroll-view>

    <view v-if="order && (canCancelOrder || order.status === 'shipped')" class="footer">
      <view v-if="canCancelOrder" class="btn ghost" @tap="cancel"><text>{{ $t('order.cancel') }}</text></view>
      <!-- 微信支付：只有「待付款」的订单可以；金额由服务端按订单算，这里只是显示 -->
      <view v-if="order.status === 'pending_payment'" class="btn main" :class="{ disabled: busy }" @tap="wxPay">
        <text>{{ $t('pay.wechat') }}　{{ $t('shop.price', { price: order.totalAmount.toFixed(2) }) }}</text>
      </view>
      <view v-if="order.status === 'shipped'" class="btn main" @tap="receive"><text>{{ $t('order.receive') }}</text></view>
    </view>
  </view>
</template>

<script>
import { getOrderDetail, cancelOrder, confirmReceipt, demoAdvance, getInvoiceInfo, applyInvoice, demoIssueInvoice } from '@/api/shop.js';
import { safeNavigate } from '@/utils/nav.js';
import { payWithWechat } from '@/utils/pay.js';
import { statusText, STATUS_COLOR, formatTime, canCancel, canInvoice, invoiceStatusOf, invoiceText, PAID_STATUSES } from '@/utils/order.js';
import { logError } from '@/utils/logger.js';
import RetryState from '@/components/RetryState.vue';

export default {
  components: { RetryState },
  data() {
    return { order: null, failed: false, busy: false };
  },
  computed: {
    canCancelOrder() {
      return this.order && canCancel(this.order);
    },
    invStatus() {
      return this.order ? invoiceStatusOf(this.order) : 'none';
    },
    // 已付款的订单才显示发票一栏
    showInvoice() {
      return this.order && (PAID_STATUSES.includes(this.order.status) || this.invStatus !== 'none');
    },
    canApply() {
      return this.order && canInvoice(this.order);
    },
    canDemo() {
      return this.order && this.order.status === 'pending_ship';
    }
  },
  onLoad(options) {
    this.id = Number(options && options.id);
    this.load();
  },
  methods: {
    statusText,
    formatTime,
    invoiceText,
    color: (s) => STATUS_COLOR[s],
    toast(key) {
      uni.showToast({ title: this.$t(key), icon: 'none' });
    },
    async load() {
      this.failed = false;
      try {
        const { data } = await getOrderDetail(this.id);
        if (data.code !== 0) throw new Error(data.message || 'load failed');
        this.order = data.data;
      } catch (e) {
        logError('order.detail', { error: (e && (e.errMsg || e.message)) || String(e) });
        if (!this.order) this.failed = true;
      }
    },
    // 执行一个会改变订单的操作：成功用返回的最新订单刷新页面，失败提示并重新取一次（状态可能已被后台改变）
    async act(fn) {
      if (this.busy) return;
      this.busy = true;
      try {
        const { data } = await fn();
        if (data.code !== 0) throw new Error(data.message || 'action failed');
        this.order = data.data;
      } catch (e) {
        logError('order.action', { error: (e && (e.errMsg || e.message)) || String(e) });
        this.toast('order.actionFail');
        this.load();
      } finally {
        this.busy = false;
      }
    },
    confirm(key, onOk) {
      uni.showModal({
        content: this.$t(key),
        cancelText: this.$t('ui.cancel'),
        confirmText: this.$t('ui.confirm'),
        success: (res) => res.confirm && onOk()
      });
    },
    cancel() {
      this.confirm('order.cancelConfirm', () => this.act(() => cancelOrder(this.id)));
    },
    receive() {
      this.confirm('order.receiveConfirm', () => this.act(() => confirmReceipt(this.id)));
    },
    async applyInv() {
      if (this.busy) return;
      // 没填开票信息先去填，不要让用户点了申请才发现失败
      let info = null;
      try {
        const { data } = await getInvoiceInfo();
        info = data.code === 0 ? data.data : null;
      } catch (e) {
        logError('order.invoice.info', { error: (e && (e.errMsg || e.message)) || String(e) });
      }
      if (!info) {
        this.toast('inv.needInfo');
        safeNavigate('/pages/invoice/info');
        return;
      }
      this.confirm('inv.applyConfirm', () => this.act(() => applyInvoice(this.id)));
    },
    issueInv() {
      this.act(() => demoIssueInvoice(this.id));
    },
    // 微信支付。结果以服务端确认为准（见 utils/pay.js），不是收银台的回调
    async wxPay() {
      if (this.busy) return;
      this.busy = true;
      try {
        const result = await payWithWechat(this.id);
        this.toast({ success: 'pay.success', cancel: 'pay.cancelled', pending: 'pay.pending' }[result] || 'pay.failed');
      } finally {
        this.busy = false;
      }
      this.load(); // 不管结果如何都刷新订单，状态可能已经变了
    },
    advance() {
      this.act(() => demoAdvance(this.id));
    },
    copy(text) {
      uni.setClipboardData({ data: String(text).replace(/\s/g, ''), success: () => this.toast('ui.copied') });
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
.body {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}
.banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36rpx 0 44rpx;
}
.banner-status {
  font-size: 40rpx;
  font-weight: 700;
}
.banner-amount {
  color: #ffb74d;
  font-size: 44rpx;
  font-weight: 700;
  margin-top: 12rpx;
}
.card {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
}
.title {
  color: rgba(255, 255, 255, 0.5);
  font-size: 26rpx;
  margin-bottom: 16rpx;
}
.hint {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  line-height: 1.6;
  margin-bottom: 12rpx;
}
.kv {
  display: flex;
  align-items: baseline;
  padding: 8rpx 0;
}
.k {
  width: 160rpx;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 26rpx;
}
.v {
  flex: 1;
  min-width: 0;
  color: #fff;
  font-size: 28rpx;
  word-break: break-all;

  &.amount {
    color: #ffb74d;
    font-weight: 700;
  }
}
.sub {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
  margin-top: 8rpx;
}
.copy {
  color: #00a8ff;
  font-size: 26rpx;
  padding-left: 20rpx;
}
.item {
  display: flex;
  align-items: center;
  padding: 10rpx 0;
}
.item-name {
  flex: 1;
  min-width: 0;
  color: #fff;
  font-size: 28rpx;
}
.item-price {
  color: #ffb74d;
  font-size: 28rpx;
  margin-left: 20rpx;
}
.item-qty {
  min-width: 90rpx;
  text-align: right;
  color: rgba(255, 255, 255, 0.7);
  font-size: 28rpx;
}
.demo {
  margin: 8rpx 0 0;
  padding: 20rpx;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
  border: 1px dashed rgba(255, 255, 255, 0.25);
  border-radius: 16rpx;
}
.space {
  height: 40rpx;
}
.footer {
  display: flex;
  justify-content: flex-end;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #122642;
}
.btn {
  height: 80rpx;
  padding: 0 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  margin-left: 20rpx;

  &.ghost {
    border: 1px solid rgba(255, 255, 255, 0.4);
    color: rgba(255, 255, 255, 0.8);
  }
  &.main {
    background: linear-gradient(135deg, #00a8ff, #0072ff);
    color: #fff;
    font-weight: 700;
  }
  &.disabled {
    opacity: 0.6;
  }
}
</style>
