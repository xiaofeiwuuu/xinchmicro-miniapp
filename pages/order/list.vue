<template>
  <view class="page">
    <view v-if="!invoiceMode && !afterSalesMode" class="tabs">
      <view v-for="t in tabs" :key="t.key" class="tab" :class="{ active: t.key === active }" @tap="switchTab(t.key)">
        <text>{{ t.text }}</text>
      </view>
    </view>

    <RetryState v-if="failed" @retry="load" />
    <LoadingState v-else-if="!loaded" />
    <EmptyState v-else-if="loaded && !list.length" image="/static/empty/no-orders.png" :text="$t('order.empty')" :hint="invoiceMode || afterSalesMode ? '' : $t('order.emptyHint')" />
    <scroll-view v-else scroll-y class="list">
      <view v-for="o in list" :key="o.key" class="card" @tap="open(o)">
        <!-- 教学视频的订单：和商品订单放在同一个列表里，用左上角的「视频」标签区分（数据是分开的两张表，视频没有发货、物流、售后、开票） -->
        <template v-if="o.kind === 'video'">
          <view class="head">
            <view class="no-box"><text class="kind video">{{ $t('order.kind.video') }}</text><text class="no">{{ o.orderNo }}</text></view>
            <text class="status" :style="{ color: videoColor(o.status) }">{{ videoStatusText(o.status) }}</text>
          </view>
          <view class="item"><text class="item-name">{{ o.title }}</text><text class="item-qty">×1</text></view>
          <text v-if="o.courseTitle" class="inv" style="color: rgba(255,255,255,0.45);">{{ o.courseTitle }}</text>
          <view class="foot">
            <text class="time">{{ formatTime(o.createdAt) }}</text>
            <text class="amount">{{ $t('shop.price', { price: (o.amountFen / 100).toFixed(2) }) }}</text>
          </view>
          <view v-if="videoActs(o).length" class="acts">
            <view v-for="a in videoActs(o)" :key="a.key" class="act main" @tap.stop="onAction(a.key, o)"><text>{{ a.text }}</text></view>
          </view>
        </template>
        <template v-else>
        <view class="head">
          <view class="no-box"><text class="kind goods">{{ $t('order.kind.goods') }}</text><text class="no">{{ o.orderNo }}</text></view>
          <!-- 右上角：已全额退款的订单只显示「已全额退款」（不再显示已完成 / 已发货）；没退款的显示订单状态；取消后的退款进度跟在「已取消」后面 -->
          <view class="st-box">
            <text v-if="o.invoiceUnread" class="st-new">{{ $t('inv.newTag') }}</text>
            <text v-if="o.fullyRefunded" class="status" style="color: #4fc3f7;">{{ $t('refund.fullyRefunded') }}</text>
            <template v-else>
              <text class="status" :style="{ color: color(o.status) }">{{ statusText(o.status) }}</text>
              <text v-if="o.refundState" class="status st-refund">{{ $t('refund.short.' + o.refundState) }}</text>
            </template>
          </view>
        </view>
        <text v-if="o.refundedAmount && !o.fullyRefunded" class="inv" style="color: #4fc3f7;">{{ $t('refund.partRefunded', { amount: o.refundedAmount.toFixed(2) }) }}</text>
        <!-- 售后：已退款的不再重复写（右上角或上一行已经说明）；处理中的才显示 -->
        <text v-if="o.afterSales && o.afterSales.length && o.afterSales[0].status !== 'refunded'" class="inv" style="color: #ffb74d;">{{ $t('as.title') }}：{{ $t('as.status.' + o.afterSales[0].status) }}</text>
        <!-- 开票状态：只显示「开票中」；已开票的不展示 -->
        <text v-if="o.status !== 'cancelled' && invoiceStatus(o) === 'requesting'" class="inv" :style="{ color: invColor(o) }">{{ invoiceText(invoiceStatus(o)) }}</text>
        <view v-for="i in o.items.slice(0, 3)" :key="i.productId" class="item">
          <text class="item-name">{{ i.name }}</text>
          <text class="item-qty">×{{ i.qty }}</text>
        </view>
        <text v-if="o.items.length > 3" class="more">…</text>
        <view class="foot">
          <text class="time">{{ formatTime(o.createdAt) }}</text>
          <text class="amount">{{ $t('order.count', { n: count(o) }) }}　{{ $t('shop.price', { price: o.totalAmount.toFixed(2) }) }}</text>
        </view>
        <!-- 操作按钮：待付款（取消、去付款）、待收货（确认收货）、已完成（申请售后、再来一单）。点按钮不会进详情 -->
        <view v-if="actionsOf(o).length" class="acts">
          <view v-for="a in actionsOf(o)" :key="a.key" class="act" :class="[a.main ? 'main' : 'ghost', { busy: busyId === o.id && a.main, disabled: busyId === o.id && !a.main }]" @tap.stop="onAction(a.key, o)"><text>{{ a.text }}</text></view>
        </view>
        </template>
      </view>
      <view class="space"></view>
    </scroll-view>
  </view>
</template>

<script>
import { getOrders, getVideoOrders, confirmReceipt, errorText } from '@/api/shop.js';
import { statusText, STATUS_COLOR, formatTime, UNPAID_STATUSES, invoiceStatusOf, invoiceText, INVOICE_COLOR, canApplyAfterSales, invoiceBlock } from '@/utils/order.js';
import { openInvoiceFile } from '@/utils/invoiceFile.js';
import { payWithWechat } from '@/utils/pay.js';
import { reorder } from '@/utils/reorder.js';
import { askNotify } from '@/utils/subscribe.js';
import { safeNavigate } from '@/utils/nav.js';
import { logError } from '@/utils/logger.js';
import RetryState from '@/components/RetryState.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingState from '@/components/LoadingState.vue';

// 页签：全部 / 待付款（待转账+待核对）/ 待发货 / 待收货（已发货）/ 已完成
const KEYS = ['', 'unpaid', 'pending_ship', 'shipped', 'completed'];
const TAB_TEXT = { '': 'os.all', unpaid: 'os.tab.unpaid', pending_ship: 'os.pending_ship', shipped: 'os.tab.receive', completed: 'os.completed' };

export default {
  components: { RetryState, EmptyState, LoadingState },
  data() {
    return { active: '', invoiceMode: '', afterSalesMode: false, list: [], loaded: false, failed: false, busyId: 0 };
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
        // 全部 / 待付款 / 已完成 这三个页签里，同时带上教学视频的订单（待发货、待收货、开票、售后只有商品才有）
        const withVideo = !this.afterSalesMode && !this.invoiceMode && ['', 'unpaid', 'completed'].includes(tab);
        const videoStatus = tab === 'unpaid' ? 'pending' : tab === 'completed' ? 'paid' : '';
        const [{ data }, videos] = await Promise.all([getOrders(query), withVideo ? this.loadVideoOrders(videoStatus) : []]);
        if (tab !== this.active) return; // 请求期间又切了页签
        if (data.code !== 0) throw new Error(data.message || 'load failed');
        // 「未开票」里不显示已全额退款的订单（不能开票）。服务端新版已经过滤，这里再挡一层，服务端没更新时也不会出现
        const goods = (data.data || []).filter((o) => !(this.invoiceMode === 'none' && o.fullyRefunded)).map((o) => ({ ...o, kind: 'goods', key: 'g' + o.id }));
        const at = (o) => new Date(o.createdAt).getTime() || 0;
        this.list = withVideo ? [...goods, ...videos].sort((a, b) => at(b) - at(a)) : goods; // 两种订单按下单时间混排，最新在前
        this.loaded = true;
      } catch (e) {
        logError('order.list', { error: (e && (e.errMsg || e.message)) || String(e) });
        if (!this.loaded) this.failed = true;
      }
    },
    // 视频订单取不到不影响商品订单的显示
    async loadVideoOrders(status) {
      try {
        const { data } = await getVideoOrders(status);
        return data.code === 0 ? (data.data || []).map((o) => ({ ...o, kind: 'video', key: 'v' + o.orderNo })) : [];
      } catch (e) {
        logError('order.list.video', { error: (e && (e.errMsg || e.message)) || String(e) });
        return [];
      }
    },
    videoStatusText(s) {
      return this.$t({ paid: 'video.bought', pending: 'video.tabPending', cancelled: 'video.tabCancelled' }[s] || 'video.tabAll');
    },
    videoColor: (s) => ({ pending: '#ffb74d', paid: '#4fc3f7', cancelled: 'rgba(255,255,255,0.4)' }[s]),
    // 视频订单的按钮：待付款「去支付」（回购买页，服务端复用没过期的这张单）、已购买且还能看「去观看」
    videoActs(o) {
      if (o.status === 'pending') return [{ key: 'vpay', text: this.$t('video.goPay') }];
      if (o.status === 'paid' && o.playable) return [{ key: 'vwatch', text: this.$t('video.goWatch') }];
      return [];
    },
    open(o) {
      if (o.kind === 'video') {
        if (o.status === 'pending') safeNavigate('/pages/video/buy?id=' + o.videoId);
        else if (o.status === 'paid' && o.playable) safeNavigate('/pages/video/play?id=' + o.videoId);
        return;
      }
      safeNavigate('/pages/order/detail?id=' + o.id);
    },
    toast(key) {
      uni.showToast({ title: this.$t(key), icon: 'none' });
    },
    // 每张订单卡片上的按钮（按状态）：待付款 取消订单 + 去付款；待收货（已发货，没全额退款）确认收货；已完成 申请售后（能申请时）+ 再来一单
    actionsOf(o) {
      // 从「我的 → 我的发票」进来（未开票 / 开票中 / 已开票）：按钮是开票相关的，不是再来一单、申请售后
      if (this.invoiceMode) {
        const st = invoiceStatusOf(o);
        if (st === 'none') return [{ key: 'invApply', text: this.$t(o.invoiceRejectReason ? 'inv.reapply' : 'inv.btnApply'), main: true }];
        if (st === 'issued' && o.invoiceFile) return [{ key: 'invDownload', text: this.$t('inv.downloadBtn'), main: true }];
        return [];
      }
      if (o.status === 'pending_payment') {
        return [
          { key: 'cancel', text: this.$t('order.cancel') },
          { key: 'pay', text: this.$t('order.goPay'), main: true }
        ];
      }
      if (o.status === 'shipped' && !o.fullyRefunded) return [{ key: 'receive', text: this.$t('order.receive'), main: true }];
      if (o.status === 'completed') {
        const out = [];
        if (canApplyAfterSales(o)) out.push({ key: 'as', text: this.$t('as.apply') });
        // 开票：没申请过的显示「开发票」（被驳回过是「重新开票」），申请中显示「开票中」；已开具的、已全额退款的不显示
        if (!o.fullyRefunded) {
          const inv = invoiceStatusOf(o);
          if (inv === 'none') out.push({ key: 'invApply', text: this.$t(o.invoiceRejectReason ? 'inv.reapply' : 'inv.btnApply') });
          else if (inv === 'requesting') out.push({ key: 'invPending', text: this.$t('inv.requesting') });
        }
        out.push({ key: 'again', text: this.$t('order.again'), main: true });
        return out;
      }
      return [];
    },
    // 按钮点击统一走这里：uni-app 编译到小程序后，模板里不能直接调用「对象里存的函数」（a.run(o) 会没反应），只能用 methods 里的方法名
    onAction(key, o) {
      const run = { vpay: () => this.open(o), vwatch: () => this.open(o), cancel: this.cancelOrder, pay: this.pay, receive: this.receive, as: this.applyAfterSales, again: this.again, invApply: this.applyInvoice, invDownload: this.downloadInvoice, invPending: () => this.toast('inv.pendingTip') }[key];
      if (run) run(o);
    },
    // 申请开票的弹窗在详情页里：售后处理中暂时不能开，提示原因；可以开就跳过去并自动打开
    applyInvoice(o) {
      const block = invoiceBlock(o);
      if (block) return uni.showToast({ title: this.$t('inv.block.' + block), icon: 'none' });
      safeNavigate('/pages/order/detail?id=' + o.id + '&action=invoice');
    },
    // 下载发票：每次向服务端要新的临时链接再打开
    async downloadInvoice(o) {
      if (this.busyId) return;
      this.busyId = o.id;
      try {
        if ((await openInvoiceFile(o.id)) === 'fail') this.toast('inv.downloadFail');
      } finally {
        this.busyId = 0;
      }
      this.load(); // 下载过就是已读，列表上的「新发票」标记要去掉
    },
    // 取消订单要选原因、申请售后要填内容，弹窗都在详情页里：跳过去并自动打开
    cancelOrder(o) {
      safeNavigate('/pages/order/detail?id=' + o.id + '&action=cancel');
    },
    applyAfterSales(o) {
      safeNavigate('/pages/order/detail?id=' + o.id + '&action=afterSales');
    },
    // 去付款：和详情页一样，先问发货通知（必须在点击里直接弹），再拉起微信支付，不管结果如何都刷新列表
    async pay(o) {
      if (this.busyId) return;
      this.busyId = o.id;
      try {
        await askNotify();
        const result = await payWithWechat(o.id);
        this.toast({ success: 'pay.success', cancel: 'pay.cancelled', pending: 'pay.pending', unavailable: 'pay.unavailable' }[result] || 'pay.failed');
      } finally {
        this.busyId = 0;
      }
      this.load();
    },
    receive(o) {
      uni.showModal({
        content: this.$t('order.receiveConfirm'),
        cancelText: this.$t('ui.cancel'),
        confirmText: this.$t('ui.confirm'),
        success: async (res) => {
          if (!res.confirm || this.busyId) return;
          this.busyId = o.id;
          try {
            const { data } = await confirmReceipt(o.id);
            if (data.code !== 0) uni.showToast({ title: errorText(data) || this.$t('order.actionFail'), icon: 'none' });
          } catch (e) {
            logError('order.list.receive', { error: (e && (e.errMsg || e.message)) || String(e) });
            this.toast('order.actionFail');
          } finally {
            this.busyId = 0;
          }
          this.load();
        }
      });
    },
    // 再来一单：按现在的价格库存把这个订单的商品加进购物车，然后去购物车
    async again(o) {
      if (this.busyId) return;
      this.busyId = o.id;
      try {
        const { added, skipped } = await reorder(o);
        if (!added) return this.toast('order.againNone');
        if (skipped) uni.showToast({ title: this.$t('order.againPartial', { n: added, m: skipped }), icon: 'none', duration: 2200 });
        else this.toast('order.againOk');
        setTimeout(() => safeNavigate('/pages/shop/index'), skipped ? 1200 : 600);
      } catch (e) {
        logError('order.list.reorder', { error: (e && (e.errMsg || e.message)) || String(e) });
        this.toast('order.actionFail');
      } finally {
        this.busyId = 0;
      }
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
// 页签在一行里平分宽度
.tabs {
  flex-shrink: 0;
  display: flex;
  background: #122642;
}
.tab {
  flex: 1;
  min-width: 0;
  text-align: center;
  padding: 28rpx 0;
  white-space: nowrap;
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
.no-box { display: flex; align-items: center; min-width: 0; }
.kind { flex-shrink: 0; font-size: 22rpx; padding: 2rpx 12rpx; border-radius: 6rpx; margin-right: 12rpx; line-height: 1.4; }
.kind.goods { color: #4fc3f7; border: 1px solid #4fc3f7; }
.kind.video { color: #c792ea; border: 1px solid #c792ea; }
.no {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}
.status {
  font-size: 28rpx;
  font-weight: 600;
}
.st-box {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 16rpx;
}
.st-new {
  height: 36rpx;
  box-sizing: border-box;
  padding: 0 12rpx;
  margin-right: 12rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 22rpx;
  color: #1a1a1a;
  background: #ffb74d;
  border-radius: 8rpx;
}
.st-refund {
  color: #4fc3f7;
  font-size: 24rpx;
  font-weight: 500;
  margin-left: 12rpx;
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
.acts {
  flex-wrap: wrap; // 英文按钮文字较长时换行，不撑出卡片
  display: flex;
  justify-content: flex-end;
  margin-top: 16rpx;
}
.act {
  height: 68rpx;
  padding: 0 36rpx;
  margin-left: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 34rpx;
  font-size: 26rpx;
  white-space: nowrap;

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
    opacity: 0.5;
  }
}
.space {
  height: 40rpx;
}
</style>
