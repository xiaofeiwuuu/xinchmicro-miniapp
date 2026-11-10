<template>
  <view class="page">
    <RetryState v-if="failed" @retry="load" />
    <scroll-view v-else-if="order" scroll-y class="body">
      <view class="banner">
        <!-- 状态是带边框的小标签（颜色跟状态走），金额是白色大字：两者大小、颜色都拉开，一眼先看到金额 -->
        <text class="banner-status" :style="{ color: color(order.status) }">{{ statusText(order.status) }}</text>
        <view class="banner-amount"><text class="amount-sym">¥</text><text class="amount-num">{{ order.totalAmount.toFixed(2) }}</text></view>
        <!-- 待付款：倒计时，到点服务端自动取消 -->
        <text v-if="order.status === 'pending_payment'" class="banner-left">
          {{ remain > 0 ? $t('order.payWithin', { t: countdown }) : $t('order.expiring') }}
        </text>
      </view>

      <!-- 开票状态：申请中 / 已开具 / 被驳回，直接显示在页面上，不用点「更多」才看到 -->
      <view v-if="invStatus === 'requesting'" class="card inv-card">
        <view class="inv-row"><text class="title">{{ $t('inv.cardRequesting') }}</text><text class="inv-dot">{{ $t('inv.requesting') }}</text></view>
        <text class="hint">{{ $t('inv.cardRequestingHint') }}</text>
      </view>
      <view v-else-if="invStatus === 'issued'" class="card inv-card">
        <view class="inv-row"><text class="title">{{ $t('inv.cardIssued') }}</text><text v-if="order.invoiceFile" class="inv-link" @tap="downloadInv">{{ $t('inv.downloadBtn') }}</text></view>
        <text class="hint">{{ $t('inv.cardIssuedHint') }}</text>
      </view>
      <view v-else-if="invStatus === 'none' && order.invoiceRejectReason" class="card inv-card">
        <view class="inv-row"><text class="title">{{ $t('inv.cardRejected') }}</text></view>
        <text class="hint">{{ order.invoiceRejectReason }}</text>
      </view>

      <!-- 已取消：取消原因（后台取消时填的原因客户也看得到；客户自己取消的是他选的原因） -->
      <view v-if="order.status === 'cancelled' && order.cancelReason" class="card">
        <text class="title">{{ $t('order.cancelReasonTitle') }}</text>
        <text class="hint">{{ order.cancelReason }}</text>
      </view>

      <!-- 待发货订单的取消申请：审核中，或被商家拒绝（写着原因，可以再次申请） -->
      <view v-if="order.status === 'pending_ship' && order.cancelRequest && order.cancelRequest.status === 'pending'" class="card">
        <text class="title">{{ $t('cancel.reqTitle') }}</text>
        <text class="hint">{{ $t('cancel.reqPending') }}</text>
      </view>
      <view v-else-if="order.status === 'pending_ship' && order.cancelRequest && order.cancelRequest.status === 'rejected'" class="card">
        <text class="title">{{ $t('cancel.reqRejected') }}</text>
        <text class="hint">{{ order.cancelRequest.rejectReason }}</text>
      </view>

      <!-- 付过款又被取消的订单：退款进度 -->
      <view v-if="order.refundState" class="card">
        <text class="title">{{ $t('refund.title') }}</text>
        <text class="hint">{{ $t('refund.' + order.refundState) }}</text>
      </view>

      <view class="card">
        <text class="title">{{ $t('order.address') }}</text>
        <text class="v">{{ order.address.consignee }}　{{ order.address.phone }}</text>
        <text class="sub">{{ order.address.region }} {{ order.address.detail }}</text>
      </view>

      <view v-if="order.expressNo" class="card">
        <text class="title">{{ $t('order.shipping') }}</text>
        <view class="kv"><text class="k">{{ $t('order.expressCompany') }}</text><text class="v">{{ order.expressCompany }}</text></view>
        <view class="kv"><text class="k">{{ $t('order.expressNo') }}</text><text class="v">{{ order.expressNo }}</text><text class="copy" @tap="copy(order.expressNo)">{{ $t('order.copy') }}</text></view>
        <view v-if="logiStatus !== null" class="kv"><text class="k">{{ $t('order.logiStatus') }}</text><text class="v logi" :class="'logi-' + logiStatus">{{ $t('logi.s' + logiStatus) }}</text></view>
        <!-- 物流进度（快递公司给的原话，最新在最上面）：默认只显示最新一条，点「查看全部」展开 -->
        <view v-if="logiTraces.length" class="traces">
          <view v-for="(t, i) in logiOpen ? logiTraces : logiTraces.slice(0, 1)" :key="i" class="trace" :class="{ first: i === 0 }">
            <view class="trace-dot"></view>
            <text class="trace-text">{{ t.text }}</text>
          </view>
          <view v-if="logiTraces.length > 1" class="trace-more" @tap="logiOpen = !logiOpen">
            <text>{{ logiOpen ? $t('order.logiLess') : $t('order.logiMore', { n: logiTraces.length }) }}</text>
          </view>
        </view>
        <!-- 发货时服务端把运单传给了微信物流查询组件，就能打开微信的物流轨迹页 -->
        <view v-if="order.waybillToken" class="track" @tap="openTracking">
          <text class="track-text">{{ $t('order.trackLogistics') }}</text>
          <text class="track-arrow">›</text>
        </view>
      </view>

      <view class="card">
        <text class="title">{{ $t('order.goods') }}</text>
        <view v-for="i in order.items" :key="i.productId" class="item">
          <text class="item-name">{{ i.name }}</text>
          <text class="item-price">{{ $t('shop.price', { price: i.price.toFixed(2) }) }}</text>
          <text class="item-qty">×{{ i.qty }}</text>
        </view>
      </view>

      <view class="card">
        <view class="kv"><text class="k">{{ $t('order.no') }}</text><text class="v">{{ order.orderNo }}</text><text class="copy" @tap="copy(order.orderNo)">{{ $t('order.copy') }}</text></view>
        <view class="kv"><text class="k">{{ $t('order.time') }}</text><text class="v">{{ formatTime(order.createdAt) }}</text></view>
        <view v-if="order.paidBy === 'wechat'" class="kv"><text class="k">{{ $t('order.payMethod') }}</text><text class="v">{{ $t('order.byWechat') }}</text></view>
        <view v-if="order.remark" class="kv"><text class="k">{{ $t('order.remark') }}</text><text class="v">{{ order.remark }}</text></view>
      </view>

      <!-- 售后：已有的申请和处理进度；申请、填退货快递的弹窗也在这个组件里 -->
      <after-sales ref="as" :order="order" @changed="onAsChanged" @refresh="load" />

      <!-- 服务端配置了发货通知模板才有这一行：点一下弹出微信的订阅授权，发货时微信会提醒（这是个可点的入口，不是说明文字，所以留着） -->
      <view v-if="order.status === 'pending_ship' && notifyOn" class="tips">
        <view v-if="!notifyAsked" class="tip link" @tap="enableNotify"><text>{{ $t('order.notifyShip') }} ›</text></view>
        <text v-else class="tip">{{ $t('order.notifyOn') }}</text>
      </view>

      <view class="space"></view>
    </scroll-view>

    <!-- 申请开票：选发票类型和抬头 -->
    <view v-if="sheet" class="sheet-mask" @tap="sheet = false"></view>
    <view v-if="sheet" class="sheet">
      <text class="sheet-title">{{ $t('inv.apply') }}</text>
      <!-- 部分退款过：按实付减去已退的金额开票 -->
      <text v-if="order.invoiceRejectReason" class="sheet-note">{{ $t('inv.rejected', { reason: order.invoiceRejectReason }) }}</text>
      <text v-if="order.refundedAmount > 0" class="sheet-note">{{ $t('inv.amount') }} {{ $t('shop.price', { price: order.invoiceAmount.toFixed(2) }) }}　{{ $t('inv.amountNote', { refund: $t('shop.price', { price: order.refundedAmount.toFixed(2) }) }) }}</text>
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
            <text class="opt-sub">{{ t.kind === 'personal' ? $t('inv.personalTag') : t.taxId }}</text>
            <text v-if="pickType === 'special' && t.kind === 'personal'" class="opt-warn">{{ $t('inv.personalNoSpecial') }}</text>
            <text v-else-if="pickType === 'special' && !complete(t)" class="opt-warn">{{ $t('inv.needFull') }}</text>
          </view>
          <text v-if="pickType === 'special' && t.kind !== 'personal' && !complete(t)" class="copy" @tap.stop="fixTitle(t)">{{ $t('inv.fix') }}</text>
        </view>
      </scroll-view>
      <!-- 管理抬头单独占一行（放在按钮同一行里，它会占掉剩余宽度，按钮就撑不满） -->
      <view class="manage-row"><text class="manage" @tap="manageTitles">{{ $t('inv.manage') }}</text></view>
      <view class="sheet-actions">
        <view class="btn ghost" @tap="sheet = false"><text>{{ $t('ui.cancel') }}</text></view>
        <view class="btn main" :class="{ busy: busy }" @tap="submitApply"><text>{{ $t('inv.submit') }}</text></view>
      </view>
    </view>

    <!-- 取消订单：选原因（买错了、不想要了、太贵了……）或手填 -->
    <view v-if="cancelSheet" class="sheet-mask" @tap="cancelSheet = false"></view>
    <view v-if="cancelSheet" class="sheet">
      <text class="sheet-title">{{ $t(requestMode ? 'cancel.reqTitle' : 'cancel.title') }}</text>
      <text v-if="requestMode" class="sheet-note">{{ $t('cancel.reqNote') }}</text>
      <text class="sheet-label">{{ $t('cancel.pick') }}</text>
      <scroll-view scroll-y class="sheet-list">
        <view v-for="r in reasons" :key="r.key" class="opt" :class="{ on: cancelPick === r.key }" @tap="cancelPick = r.key">
          <view class="dot"></view>
          <text class="opt-name">{{ $t('cancel.' + r.key) }}</text>
        </view>
      </scroll-view>
      <textarea
        v-if="cancelPick === 'other'"
        class="cancel-input"
        :value="cancelText"
        maxlength="50"
        :show-confirm-bar="false"
        :placeholder="$t('cancel.otherPh')"
        placeholder-class="cancel-ph"
        @input="cancelText = $event.detail.value"
      />
      <view class="sheet-actions">
        <view class="btn ghost" @tap="cancelSheet = false"><text>{{ $t('cancel.back') }}</text></view>
        <view class="btn main" :class="{ busy: busy }" @tap="submitCancel"><text>{{ $t(requestMode ? 'cancel.reqSubmit' : 'cancel.submit') }}</text></view>
      </view>
    </view>

    <view v-if="order && footCount" class="footer" :class="{ fill: !footStack, stack: footStack }">
      <view v-if="canCancelOrder" class="btn ghost" @tap="cancel"><text>{{ $t('order.cancel') }}</text></view>
      <!-- 待发货：不能直接取消，申请后等商家处理 -->
      <view v-if="canRequestCancel" class="btn ghost" @tap="cancel"><text>{{ $t('cancel.reqBtn') }}</text></view>
      <!-- 开票、申请售后都收进「更多」，底部只有「再来一单」和「更多」两个 -->
      <view v-if="hasMore" class="btn ghost more" @tap="openMore"><text>{{ $t('inv.more') }}</text></view>
      <view v-if="canReorder" class="btn again" :class="againMain ? 'main' : 'ghost'" @tap="again"><text>{{ $t('order.again') }}</text></view>
      <!-- 微信支付：只有「待付款」的订单可以；金额由服务端按订单算，这里只是显示 -->
      <view v-if="order.status === 'pending_payment'" class="btn main" :class="{ busy: busy }" @tap="wxPay">
        <text>{{ $t('pay.wechat') }}　{{ $t('shop.price', { price: order.totalAmount.toFixed(2) }) }}</text>
      </view>
      <view v-if="canReceive" class="btn main" @tap="receive"><text>{{ $t('order.receive') }}</text></view>
    </view>
  </view>
</template>

<script>
import { getOrderDetail, getLogisticsStatus, cancelOrder, requestCancelOrder, confirmReceipt, getInvoiceTitles, titleComplete, applyInvoice, errorText } from '@/api/shop.js';
import { openInvoiceFile } from '@/utils/invoiceFile.js';
import { safeNavigate } from '@/utils/nav.js';
import { payWithWechat } from '@/utils/pay.js';
import { statusText, STATUS_COLOR, formatTime, formatCountdown, CANCEL_REASONS, canApplyAfterSales, canCancel, canInvoice, invoiceBlock, invoiceStatusOf, invoiceText } from '@/utils/order.js';
import { logError } from '@/utils/logger.js';
import RetryState from '@/components/RetryState.vue';
import AfterSales from '@/pages/order/components/AfterSales.vue';
import { reorder } from '@/utils/reorder.js';
import { prefetchSubscribeConfig, shipNotifyEnabled, askNotify } from '@/utils/subscribe.js';

export default {
  components: { RetryState, AfterSales },
  data() {
    return { logiStatus: null, logiTraces: [], logiOpen: false, order: null, failed: false, busy: false, sheet: false, titles: [], pickType: 'normal', pickTitle: null, downloading: false, remain: 0, cancelSheet: false, cancelPick: '', cancelText: '', reasons: CANCEL_REASONS, notifyOn: false, notifyAsked: false };
  },
  computed: {
    canCancelOrder() {
      return this.order && canCancel(this.order);
    },
    // 待发货且没有处理中的申请：可以申请取消
    canRequestCancel() {
      return !!this.order && this.order.status === 'pending_ship' && !(this.order.cancelRequest && this.order.cancelRequest.status === 'pending');
    },
    // 取消弹窗现在是「申请取消」（待发货）还是「直接取消」（待付款）
    requestMode() {
      return !!this.order && this.order.status === 'pending_ship';
    },
    invStatus() {
      return this.order ? invoiceStatusOf(this.order) : 'none';
    },
    // 再来一单：待付款（还没付）和待发货（刚付完）不显示，其它状态都可以（已取消的也行）
    canReorder() {
      return !!this.order && !['pending_payment', 'pending_ship'].includes(this.order.status);
    },
    // 开票按钮：只有已完成的订单有；已全额退款的不需要开票，不显示
    invBtn() {
      const o = this.order;
      if (!o || o.status !== 'completed') return null;
      if (this.invStatus === 'requesting') return { key: 'pending', text: this.$t('inv.requesting') };
      if (this.invStatus === 'issued') return { key: 'issued', text: this.$t('inv.issued') };
      if (this.invBlock === 'fullyRefunded') return null;
      return { key: this.canApply ? 'apply' : 'blocked', text: this.$t(o.invoiceRejectReason ? 'inv.reapply' : 'inv.btnApply') };
    },
    // 再来一单是底部唯一的按钮（已取消、全额退款的已发货）或在已完成订单里时，做成主按钮；旁边还有别的主操作（确认收货）时是次要按钮
    againMain() {
      return this.footCount === 1 || (!!this.order && this.order.status === 'completed');
    },
    // 已完成的订单：再来一单单独占一整行，下面才是「更多」
    footStack() {
      return !!this.order && this.order.status === 'completed';
    },
    // 已发货才能确认收货；已经全额退款的订单不用收货了，不显示这个按钮
    canReceive() {
      return !!this.order && this.order.status === 'shipped' && !this.order.fullyRefunded;
    },
    // 底部栏有几个按钮：两个以上时撑满一行（次要按钮窄、主按钮宽）
    footCount() {
      if (!this.order) return 0;
      return [this.canCancelOrder, this.canRequestCancel, this.hasMore, this.canReorder, this.order.status === 'pending_payment', this.canReceive].filter(Boolean).length;
    },
    // 「更多」里有没有东西：开票相关（已完成的订单）或申请售后
    hasMore() {
      return !!this.invBtn || this.canAfterSales;
    },
    canAfterSales() {
      return !!this.order && canApplyAfterSales(this.order);
    },
    countdown() {
      return formatCountdown(this.remain);
    },
    canApply() {
      return this.order && canInvoice(this.order);
    },
    // 现在不能申请开票时的原因（确认收货后才能、售后处理中、已全额退款）
    invBlock() {
      return this.order ? invoiceBlock(this.order) : null;
    }
  },
  onLoad(options) {
    this.id = Number(options && options.id);
    // 从订单列表点「取消订单」「申请售后」过来：订单取到后自动打开对应的弹窗（?action=cancel|afterSales）
    this.pendingAction = (options && options.action) || '';
    // 提前取好订阅消息的模板 ID（点击时才取就晚了，微信要求授权必须直接在点击里弹）
    prefetchSubscribeConfig().then(() => {
      this.notifyOn = shipNotifyEnabled();
    });
    this.load();
  },
  // 从「补全抬头 / 管理抬头」回来：申请单还开着的话，刷新抬头列表
  onShow() {
    if (this.sheet) this.loadTitles();
    // 从别的页面回来：待付款的订单重新取一次，倒计时按服务端的剩余时间重新开始（onHide 时停掉了）
    if (this.order && this.order.status === 'pending_payment') this.load();
  },
  onUnload() {
    clearInterval(this.ticker);
  },
  onHide() {
    clearInterval(this.ticker); // 回到页面时 onShow 不会重新取订单，倒计时由下一次 load 重启；这里只是别在后台空转
    this.ticker = null;
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
        this.startCountdown();
        this.runPendingAction();
        this.loadLogistics();
      } catch (e) {
        logError('order.detail', { error: (e && (e.errMsg || e.message)) || String(e) });
        if (!this.order) this.failed = true;
      }
    },
    // 列表带来的操作只做一次；订单状态已经不允许时（比如已经付款了）什么都不弹
    runPendingAction() {
      const action = this.pendingAction;
      this.pendingAction = '';
      if (action === 'cancel' && this.canCancelOrder) this.cancel();
      else if (action === 'afterSales' && this.canAfterSales) this.$nextTick(() => this.$refs.as && this.$refs.as.openApply());
      else if (action === 'invoice' && this.canApply) this.$nextTick(() => this.openApply());
    },
    // 开启发货通知：直接在点击里弹订阅授权（不能先 await 别的）
    async enableNotify() {
      this.notifyAsked = await askNotify();
    },
    // 再来一单：按现在的价格库存把这个订单的商品加进购物车，然后去购物车
    async again() {
      if (this.busy) return;
      this.busy = true;
      try {
        const { added, skipped } = await reorder(this.order);
        if (!added) return this.toast('order.againNone');
        if (skipped) uni.showToast({ title: this.$t('order.againPartial', { n: added, m: skipped }), icon: 'none', duration: 2200 });
        else this.toast('order.againOk');
        setTimeout(() => safeNavigate('/pages/shop/index'), skipped ? 1200 : 600);
      } catch (e) {
        logError('order.reorder', { error: (e && (e.errMsg || e.message)) || String(e) });
        this.toast('order.actionFail');
      } finally {
        this.busy = false;
      }
    },
    // 售后申请、撤销、填退货快递成功：组件交回最新的订单
    onAsChanged(order) {
      this.order = order;
      this.toast('as.done');
    },
    // 待付款订单的支付倒计时：服务端给的是「还剩多少秒」，每秒减一；到 0 后每 5 秒向服务端确认一次（它每分钟扫一次超时订单，状态会变成已取消）
    startCountdown() {
      clearInterval(this.ticker);
      this.ticker = null;
      if (!this.order || this.order.status !== 'pending_payment') return;
      this.remain = this.order.payExpiresIn || 0;
      let n = 0;
      this.ticker = setInterval(() => {
        n++;
        if (this.remain > 0) this.remain--;
        else if (n % 5 === 0) this.load();
      }, 1000);
    },
    // 执行一个会改变订单的操作：成功用返回的最新订单刷新页面，失败提示并重新取一次（状态可能已被后台改变）
    // okKey（可选）：成功后弹一条提示（文案 key），比如提交开票申请后「开票申请已提交」
    // 物流状态（运输中、已签收…）：有运单 token 才查，查不到就不显示；不影响页面其它内容
    async loadLogistics() {
      this.logiStatus = null;
      this.logiTraces = [];
      if (!this.order || !this.order.waybillToken) return;
      const id = this.order.id;
      try {
        const { data } = await getLogisticsStatus(id);
        if (this.order && this.order.id === id && data.code === 0 && data.data && Number.isInteger(data.data.status)) {
          this.logiStatus = data.data.status;
          this.logiTraces = Array.isArray(data.data.traces) ? data.data.traces : [];
        }
      } catch (e) {
        logError('order.logistics', { error: (e && (e.errMsg || e.message)) || String(e) });
      }
    },
    // 打开微信的物流轨迹页（插件 logisticsPlugin，参数是服务端传运单得到的 waybillToken）；只在真机上能用
    openTracking() {
      // #ifdef MP-WEIXIN
      try {
        const plugin = requirePlugin('logisticsPlugin');
        plugin.openWaybillTracking({ waybillToken: this.order.waybillToken });
      } catch (e) {
        logError('order.tracking', { error: (e && (e.errMsg || e.message)) || String(e) });
        this.toast('order.trackFail');
      }
      // #endif
    },
    async act(fn, okKey) {
      if (this.busy) return;
      this.busy = true;
      try {
        const { data } = await fn();
        if (data.code !== 0) {
          const err = new Error(data.message || 'action failed');
          err.userMessage = errorText(data); // 订单状态已变化等：告诉用户具体原因
          throw err;
        }
        this.order = data.data;
        if (okKey) this.toast(okKey);
      } catch (e) {
        logError('order.action', { error: (e && (e.errMsg || e.message)) || String(e) });
        if (e && e.userMessage) uni.showToast({ title: e.userMessage, icon: 'none' });
        else this.toast('order.actionFail');
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
    // 开票按钮：能申请就弹申请单；售后处理中给原因；开票中给提示；已开具的弹菜单（下载、复制发票号码）
    // 「更多」菜单（系统自带的菜单）：发票相关放前面（按开票状态：能申请就是「申请开票」，开票中、被拦住的点了给提示，已开具的是「下载发票」「复制发票号码」），然后是申请售后
    openMore() {
      const items = [];
      const b = this.invBtn;
      if (b && b.key === 'apply') items.push({ text: this.$t(this.order.invoiceRejectReason ? 'inv.reapply' : 'inv.apply'), run: () => this.openApply() });
      else if (b && b.key === 'blocked') items.push({ text: this.$t('inv.apply'), run: () => this.invBlock && this.toast('inv.block.' + this.invBlock) });
      else if (b && b.key === 'pending') items.push({ text: this.$t('inv.requesting'), run: () => this.toast('inv.pendingTip') });
      else if (b && b.key === 'issued') {
        if (this.order.invoiceFile) items.push({ text: this.$t('inv.downloadBtn'), run: () => this.downloadInv() });
        if (this.order.invoiceNo) items.push({ text: this.$t('inv.copyNo'), run: () => this.copy(this.order.invoiceNo) });
        if (!items.length) items.push({ text: this.$t('inv.issued'), run: () => this.toast('inv.noFile') });
      }
      if (this.canAfterSales) items.push({ text: this.$t('as.apply'), run: () => this.$refs.as.openApply() });
      if (!items.length) return;
      uni.showActionSheet({
        itemList: items.map((i) => i.text),
        success: (res) => items[res.tapIndex] && items[res.tapIndex].run()
      });
    },
    cancel() {
      this.cancelPick = '';
      this.cancelText = '';
      this.cancelSheet = true;
    },
    submitCancel() {
      if (this.busy) return;
      const r = this.reasons.find((x) => x.key === this.cancelPick);
      if (!r) return this.toast('cancel.needPick');
      let reason = r.zh; // 存进订单的是中文原因，后台看到的和客户的界面语言无关
      if (r.key === 'other') {
        const text = (this.cancelText || '').trim();
        if (!text) return this.toast('cancel.needText');
        reason = '其他原因：' + text;
      }
      this.cancelSheet = false;
      this.act(() => (this.requestMode ? requestCancelOrder(this.id, reason) : cancelOrder(this.id, reason)));
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
    async submitApply() {
      if (this.busy) return;
      const t = this.titles.find((x) => x.id === this.pickTitle);
      if (!t) return this.toast('inv.chooseTitle');
      // 专票要抬头填全注册地址、电话、开户银行和账号（服务端也会检查）
      if (this.pickType === 'special' && t.kind === 'personal') return this.toast('inv.personalNoSpecial');
      if (this.pickType === 'special' && !titleComplete(t)) return this.toast('inv.needFull');
      // 问一下要不要「开票结果通知」（开具或驳回时微信提醒）：必须在点击里直接弹，所以放在所有异步操作之前；
      // 没配置模板时什么都不弹，客户点「不允许」也不影响提交申请
      await askNotify(['invoice']);
      this.sheet = false;
      this.act(() => applyInvoice(this.id, { titleId: t.id, type: this.pickType }), 'inv.applied');
    },
    // 下载电子发票并用系统能力打开
    async downloadInv() {
      if (this.downloading) return;
      this.downloading = true;
      try {
        const r = await openInvoiceFile(this.id);
        if (r === 'fail') this.toast('inv.downloadFail');
      } finally {
        this.downloading = false;
      }
    },
    // 微信支付。结果以服务端确认为准（见 utils/pay.js），不是收银台的回调
    async wxPay() {
      if (this.busy) return;
      this.busy = true;
      try {
        await askNotify(); // 付款前先问一下要不要发货通知（必须在点击里直接弹；没配置模板时什么都不弹，客户点「不允许」也不影响付款）
        const result = await payWithWechat(this.id);
        this.toast({ success: 'pay.success', cancel: 'pay.cancelled', pending: 'pay.pending', unavailable: 'pay.unavailable' }[result] || 'pay.failed');
      } finally {
        this.busy = false;
      }
      this.load(); // 不管结果如何都刷新订单，状态可能已经变了
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
.traces {
  margin-top: 8rpx;
  padding-top: 16rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.trace {
  position: relative;
  padding: 0 0 20rpx 32rpx;
  border-left: 2rpx solid rgba(255, 255, 255, 0.15);
  margin-left: 8rpx;
}
.trace-dot {
  position: absolute;
  left: -9rpx;
  top: 10rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
  background: rgba(255, 255, 255, 0.3);
}
.trace.first .trace-dot {
  background: #4fc3f7;
}
.trace-text {
  display: block;
  color: rgba(255, 255, 255, 0.55);
  font-size: 26rpx;
  line-height: 1.6;
  word-break: break-all;
}
.trace.first .trace-text {
  color: #fff;
}
.trace-more {
  color: #00a8ff;
  font-size: 26rpx;
  padding: 4rpx 0 8rpx 8rpx;
}
.logi {
  font-weight: 700;
  color: #4fc3f7;
}
.logi-4,
.logi-6 {
  color: #81c784;
}
.logi-5 {
  color: #ff8a80;
}
.track {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8rpx;
  padding: 24rpx 0 4rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.track-text {
  color: #00a8ff;
  font-size: 28rpx;
}
.track-arrow {
  color: rgba(255, 255, 255, 0.4);
  font-size: 36rpx;
}
.inv-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.inv-dot {
  height: 36rpx;
  padding: 0 14rpx;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 22rpx;
  color: #4fc3f7;
  border: 1rpx solid rgba(79, 195, 247, 0.6);
  border-radius: 18rpx;
}
.inv-link {
  color: #00a8ff;
  font-size: 28rpx;
  padding: 8rpx 0 8rpx 24rpx;
}
.banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36rpx 0 44rpx;
}
.banner-status {
  padding: 8rpx 32rpx;
  border: 1rpx solid currentColor;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.06);
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.4;
}
.cancel-input {
  width: 100%;
  height: 140rpx;
  margin-top: 16rpx;
  padding: 20rpx 24rpx;
  box-sizing: border-box;
  border-radius: 14rpx;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 28rpx;
}
.cancel-ph {
  color: rgba(255, 255, 255, 0.3);
}
.notify-row {
  margin-top: 16rpx;
  color: #00a8ff;
  font-size: 28rpx;
}
.banner-left {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
  margin-top: 12rpx;
}
.banner-amount {
  display: flex;
  align-items: baseline;
  margin-top: 24rpx;
  color: #fff;
  font-weight: 700;
}
.amount-sym {
  margin-right: 4rpx;
  font-size: 36rpx;
}
.amount-num {
  font-size: 68rpx;
  line-height: 1.1;
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
.link {
  color: #00a8ff;
  font-size: 26rpx;
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
  max-height: 620rpx;
}
.opt {
  display: flex;
  align-items: center;
  padding: 30rpx 8rpx;
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

  // 弹窗里的两个按钮撑满一行：取消/返回窄一点，主按钮宽一点
  .btn {
    margin-left: 0;
    padding: 0;
    white-space: nowrap;
  }
  .btn + .btn {
    margin-left: 20rpx;
  }
  .btn.ghost {
    flex: 1;
  }
  .btn.main {
    flex: 2;
  }
}
.manage-row {
  margin-top: 16rpx;
  text-align: right;
}
.manage {
  color: #00a8ff;
  font-size: 26rpx;
}
.item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
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
.space {
  height: 40rpx;
}
.footer {
  display: flex;
  justify-content: flex-end;
  padding: 24rpx 24rpx;
  padding-bottom: calc(44rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(44rpx + env(safe-area-inset-bottom));
  background: #122642;
}
.tips {
  padding: 4rpx 8rpx 0;
}
.tip {
  display: block;
  margin-bottom: 10rpx;
  color: rgba(255, 255, 255, 0.45);
  font-size: 24rpx;
  line-height: 1.7;

  &.link {
    color: #00a8ff;
  }
}
.btn {
  height: 96rpx;
  padding: 0 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 48rpx;
  font-size: 28rpx;
  margin-left: 20rpx;

  &.more {
    padding: 0 36rpx;
    border-color: rgba(255, 255, 255, 0.25);
  }
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
// 已完成：再来一单占一整行（DOM 里它在「更多」后面，column-reverse 让它显示在上面），「更多」变成下面一行的小字
.footer.stack {
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;

  .btn {
    margin-left: 0;
    padding: 0;
  }
  // 一行：更多（左边，纯文字、没有边框）+ 再来一单（撑满）
  .btn.more {
    order: 1;
    flex: none;
    margin-right: 12rpx;
    padding: 0 40rpx;
    border: none;
    color: rgba(255, 255, 255, 0.92);
    font-size: 34rpx;
    font-weight: 600;
  }
  .btn.again {
    order: 2;
    flex: 1;
  }
}
.sheet-note {
  display: block;
  margin-bottom: 20rpx;
  color: #ffb74d;
  font-size: 24rpx;
  line-height: 1.6;
}
// 底部按钮一律撑满一行（一个按钮就占满整行）；有两个时次要按钮窄一点、主按钮宽一点
.footer.fill {
  justify-content: stretch;

  .btn {
    padding: 0;
    margin-left: 0;
    white-space: nowrap;
  }
  .btn + .btn {
    margin-left: 20rpx;
  }
  .btn.ghost {
    flex: 1;
  }
  .btn.main {
    flex: 2;
  }
}
</style>
