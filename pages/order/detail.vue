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

      <!-- 发票：已付款的订单可以申请开票；申请时选一个「我的」里保存的抬头，再选普票或专票 -->
      <view v-if="showInvoice" class="card">
        <text class="title">{{ $t('inv.section') }}</text>
        <view class="kv">
          <text class="k">{{ invoiceText(invStatus) }}</text>
          <text class="v">{{ order.invoice ? order.invoice.title : '' }}</text>
        </view>
        <view v-if="waitShip" class="kv"><text class="muted">{{ $t('inv.afterShip') }}</text></view>
        <view v-if="order.invoice" class="kv">
          <text class="k">{{ $t('inv.type') }}</text>
          <text class="v">{{ order.invoice.type === 'special' ? $t('inv.typeSpecial') : $t('inv.typeNormal') }}</text>
        </view>
        <view v-if="order.invoiceNo" class="kv">
          <text class="k">{{ $t('inv.no') }}</text>
          <text class="v">{{ order.invoiceNo }}</text>
          <text class="copy" @tap="copy(order.invoiceNo)">{{ $t('order.copy') }}</text>
        </view>
        <!-- 开具后财务会上传电子发票，在这里下载；没上传的话提示联系我们 -->
        <view v-if="invStatus === 'issued'" class="kv">
          <text class="k">{{ $t('inv.file') }}</text>
          <text v-if="order.invoiceFile" class="v">{{ order.invoiceFile.name }}</text>
          <text v-else class="v muted">{{ $t('inv.noFile') }}</text>
        </view>
        <!-- 主要操作做成居中的大按钮：申请开票 / 下载发票 -->
        <view v-if="canApply" class="inv-btn" @tap="openApply"><text>{{ $t('inv.apply') }}</text></view>
        <view v-if="invStatus === 'issued' && order.invoiceFile" class="inv-btn" :class="{ off: downloading }" @tap="downloadInv">
          <text>{{ downloading ? $t('inv.downloading') : $t('inv.downloadBtn') }}</text>
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

    <!-- 申请开票：选发票类型和抬头 -->
    <view v-if="sheet" class="sheet-mask" @tap="sheet = false"></view>
    <view v-if="sheet" class="sheet">
      <text class="sheet-title">{{ $t('inv.apply') }}</text>
      <text class="sheet-label">{{ $t('inv.type') }}</text>
      <view class="seg">
        <view class="seg-item" :class="{ on: pickType === 'normal' }" @tap="pickType = 'normal'"><text>{{ $t('inv.typeNormal') }}</text></view>
        <view class="seg-item" :class="{ on: pickType === 'special' }" @tap="pickType = 'special'"><text>{{ $t('inv.typeSpecial') }}</text></view>
      </view>
      <text class="sheet-label">{{ $t('inv.chooseTitle') }}</text>
      <scroll-view scroll-y class="sheet-list">
        <view v-for="t in titles" :key="t.id" class="opt" :class="{ on: pickTitle === t.id }" @tap="pickTitle = t.id">
          <view class="dot"></view>
          <view class="opt-main">
            <text class="opt-name">{{ t.title }}<text v-if="t.isDefault" class="opt-tag">{{ $t('inv.default') }}</text></text>
            <text class="opt-sub">{{ t.taxId }}</text>
            <text v-if="pickType === 'special' && !complete(t)" class="opt-warn">{{ $t('inv.needFull') }}</text>
          </view>
          <text v-if="pickType === 'special' && !complete(t)" class="copy" @tap.stop="fixTitle(t)">{{ $t('inv.fix') }}</text>
        </view>
      </scroll-view>
      <view class="sheet-actions">
        <text class="manage" @tap="manageTitles">{{ $t('inv.manage') }}</text>
        <view class="btn ghost" @tap="sheet = false"><text>{{ $t('ui.cancel') }}</text></view>
        <view class="btn main" :class="{ disabled: busy }" @tap="submitApply"><text>{{ $t('inv.submit') }}</text></view>
      </view>
    </view>

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
import { getOrderDetail, cancelOrder, confirmReceipt, demoAdvance, getInvoiceTitles, titleComplete, applyInvoice, demoIssueInvoice } from '@/api/shop.js';
import { openInvoiceFile } from '@/utils/invoiceFile.js';
import { safeNavigate } from '@/utils/nav.js';
import { payWithWechat } from '@/utils/pay.js';
import { statusText, STATUS_COLOR, formatTime, canCancel, canInvoice, invoiceStatusOf, invoiceText, PAID_STATUSES } from '@/utils/order.js';
import { logError } from '@/utils/logger.js';
import RetryState from '@/components/RetryState.vue';

export default {
  components: { RetryState },
  data() {
    return { order: null, failed: false, busy: false, sheet: false, titles: [], pickType: 'normal', pickTitle: null, downloading: false };
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
    // 已付款但还没发货：发货后才能申请开票，先提示
    waitShip() {
      return this.order && this.order.status === 'pending_ship' && this.invStatus === 'none';
    },
    canDemo() {
      return this.order && this.order.status === 'pending_ship';
    }
  },
  onLoad(options) {
    this.id = Number(options && options.id);
    this.load();
  },
  // 从「补全抬头 / 管理抬头」回来：申请单还开着的话，刷新抬头列表
  onShow() {
    if (this.sheet) this.loadTitles();
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
    complete: titleComplete,
    async loadTitles() {
      try {
        const { data } = await getInvoiceTitles();
        this.titles = data.code === 0 ? data.data || [] : [];
      } catch (e) {
        logError('order.invoice.titles', { error: (e && (e.errMsg || e.message)) || String(e) });
        this.titles = [];
      }
      // 选中的抬头没了（被删了）就选默认的
      if (!this.titles.some((t) => t.id === this.pickTitle)) {
        const d = this.titles.find((t) => t.isDefault) || this.titles[0];
        this.pickTitle = d ? d.id : null;
      }
    },
    async openApply() {
      if (this.busy) return;
      await this.loadTitles();
      // 没有抬头先去添加，不要让用户点了提交才发现失败
      if (!this.titles.length) {
        this.toast('inv.needInfo');
        safeNavigate('/pages/invoice/edit');
        return;
      }
      this.pickType = 'normal';
      this.sheet = true;
    },
    manageTitles() {
      safeNavigate('/pages/invoice/list');
    },
    fixTitle(t) {
      safeNavigate('/pages/invoice/edit?id=' + t.id);
    },
    submitApply() {
      if (this.busy) return;
      const t = this.titles.find((x) => x.id === this.pickTitle);
      if (!t) return this.toast('inv.chooseTitle');
      // 专票要抬头填全注册地址、电话、开户银行和账号（服务端也会检查）
      if (this.pickType === 'special' && !titleComplete(t)) return this.toast('inv.needFull');
      this.sheet = false;
      this.act(() => applyInvoice(this.id, { titleId: t.id, type: this.pickType }));
    },
    // 下载电子发票并用系统能力打开
    async downloadInv() {
      if (this.downloading) return;
      this.downloading = true;
      try {
        const r = await openInvoiceFile(this.id);
        if (r === 'demo') this.toast('inv.demoDownload');
        else if (r === 'fail') this.toast('inv.downloadFail');
      } finally {
        this.downloading = false;
      }
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

  &.off {
    opacity: 0.5;
  }
}
.inv-btn {
  margin-top: 24rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #00a8ff, #0072ff);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;

  &.off {
    opacity: 0.6;
  }
}
.muted {
  color: rgba(255, 255, 255, 0.45);
  font-size: 26rpx;
}
// 申请开票：从底部弹出
.sheet-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 30;
  background: rgba(0, 0, 0, 0.55);
}
.sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 31;
  background: #122642;
  border-radius: 28rpx 28rpx 0 0;
  padding: 32rpx 28rpx;
  padding-bottom: calc(28rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(28rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
}
.sheet-title {
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24rpx;
}
.sheet-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 26rpx;
  margin: 12rpx 0 14rpx;
}
.seg {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 14rpx;
  padding: 6rpx;
}
.seg-item {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  color: rgba(255, 255, 255, 0.7);
  font-size: 26rpx;

  &.on {
    background: #0072ff;
    color: #fff;
    font-weight: 700;
  }
}
.sheet-list {
  max-height: 420rpx;
}
.opt {
  display: flex;
  align-items: center;
  padding: 20rpx 8rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.dot {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  margin-right: 20rpx;
  box-sizing: border-box;
}
.opt.on .dot {
  border-color: #00a8ff;
  background: radial-gradient(#00a8ff 45%, transparent 50%);
}
.opt-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.opt-name {
  color: #fff;
  font-size: 28rpx;
  word-break: break-all;
}
.opt-tag {
  color: #00a8ff;
  border: 1px solid #00a8ff;
  border-radius: 8rpx;
  font-size: 20rpx;
  padding: 0 8rpx;
  margin-left: 12rpx;
}
.opt-sub {
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
  margin-top: 6rpx;
}
.opt-warn {
  color: #ffb74d;
  font-size: 24rpx;
  margin-top: 6rpx;
}
.sheet-actions {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
}
.manage {
  flex: 1;
  color: #00a8ff;
  font-size: 26rpx;
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
