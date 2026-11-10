<!-- 订单详情里的售后：已有的售后申请（状态、原因、退款、退货地址和快递）、申请售后和填写退货快递的底部弹窗。
     所有操作成功后触发 changed(最新订单)，由订单详情页刷新。申请入口按钮在订单详情页的底部，它调用 openApply()。 -->
<template>
  <view>
    <view v-if="sales.length" class="as-card">
      <text class="as-card-title">{{ $t('as.title') }}</text>
      <view v-for="s in sales" :key="s.id" class="as-item">
        <view class="as-head">
          <text class="as-type">{{ $t('as.type.' + s.type) }}</text>
          <text class="as-status" :style="{ color: statusColor(s.status) }">{{ $t('as.status.' + s.status) }}</text>
        </view>
        <view class="as-kv"><text class="as-k">{{ $t('as.reasonLabel') }}</text><text class="as-v">{{ s.reason }}</text></view>
        <view v-if="s.description" class="as-kv"><text class="as-k">{{ $t('as.descLabel') }}</text><text class="as-v">{{ s.description }}</text></view>
        <template v-if="s.status === 'approved' || s.status === 'returning'">
          <view v-if="s.returnTo" class="as-addr-box">
          <view v-for="r in addrRows(s)" :key="r.k" class="as-kv">
            <text class="as-k">{{ $t('as.' + r.k) }}</text><text class="as-v">{{ r.v }}</text>
            <text class="as-copy" @tap="copy(r.v)">{{ $t('order.copy') }}</text>
          </view>
          <view class="as-copyall" @tap="copy(addrAll(s))"><text>{{ $t('as.copyAll') }}</text></view>
        </view>
        </template>
        <view v-if="s.adminNote" class="as-kv">
          <text class="as-k">{{ noteLabel(s) }}</text><text class="as-v">{{ s.adminNote }}</text>
        </view>
        <view v-if="s.returnNo" class="as-kv"><text class="as-k">{{ $t('as.returned') }}</text><text class="as-v">{{ s.returnCompany }} {{ s.returnNo }}</text></view>
        <view v-if="s.refundAmount" class="as-kv"><text class="as-k">{{ $t('as.refundAmount') }}</text><text class="as-v">{{ $t('shop.price', { price: s.refundAmount.toFixed(2) }) }}</text></view>
        <view v-if="s.replaceNo" class="as-kv"><text class="as-k">{{ $t('as.replace') }}</text><text class="as-v">{{ s.replaceCompany }} {{ s.replaceNo }}</text></view>
        <text v-if="s.status === 'refunded'" class="as-tip">{{ $t('as.refundedTip') }}</text>
        <view v-if="s.status === 'requested' || s.status === 'approved'" class="as-actions">
          <view class="as-btn ghost" @tap="cancel(s)"><text>{{ $t('as.cancel') }}</text></view>
          <view v-if="s.status === 'approved' && s.type !== 'refund'" class="as-btn main" @tap="openReturn(s)"><text>{{ $t('as.fillReturn') }}</text></view>
        </view>
      </view>
    </view>

    <!-- 申请售后 -->
    <view v-if="applySheet" class="as-mask" @tap="applySheet = false"></view>
    <view v-if="applySheet" class="as-sheet">
      <text class="as-sheet-title">{{ $t('as.apply') }}</text>
      <view class="as-seg">
        <view v-for="tp in types" :key="tp" class="as-seg-item" :class="{ on: type === tp }" @tap="type = tp"><text>{{ $t('as.type.' + tp) }}</text></view>
      </view>
      <text class="as-hint">{{ $t('as.typeHint.' + type) }}</text>
      <text class="as-label">{{ $t('as.pickReason') }}</text>
      <scroll-view scroll-y class="as-list">
        <view v-for="r in reasons" :key="r.key" class="as-opt" :class="{ on: reason === r.key }" @tap="reason = r.key">
          <view class="as-dot"></view>
          <text class="as-opt-name">{{ $t('as.reason.' + r.key) }}</text>
        </view>
      </scroll-view>
      <textarea
        class="as-input"
        :value="desc"
        maxlength="100"
        :show-confirm-bar="false"
        :placeholder="reason === 'other' ? $t('as.descPhOther') : $t('as.descPh')"
        placeholder-class="as-ph"
        @input="desc = $event.detail.value"
      />
      <view class="as-sheet-actions">
        <view class="as-btn ghost" @tap="applySheet = false"><text>{{ $t('cancel.back') }}</text></view>
        <view class="as-btn main" :class="{ busy: busy }" @tap="submitApply"><text>{{ $t('as.submit') }}</text></view>
      </view>
    </view>

    <!-- 填写退货快递 -->
    <view v-if="retSheet" class="as-mask" @tap="retSheet = false"></view>
    <view v-if="retSheet" class="as-sheet">
      <text class="as-sheet-title">{{ $t('as.fillReturn') }}</text>
      <view v-if="retSale && retSale.returnTo" class="as-addr">
        <text class="as-label" style="margin: 0 0 8rpx;">{{ $t('as.returnAddr') }}</text>
        <view v-if="retSale.returnTo" class="as-addr-box">
        <view v-for="r in addrRows(retSale)" :key="r.k" class="as-kv">
          <text class="as-k">{{ $t('as.' + r.k) }}</text><text class="as-v">{{ r.v }}</text>
          <text class="as-copy" @tap="copy(r.v)">{{ $t('order.copy') }}</text>
        </view>
        <view class="as-copyall" @tap="copy(addrAll(retSale))"><text>{{ $t('as.copyAll') }}</text></view>
        </view>
      </view>
      <text class="as-label">{{ $t('as.company') }}</text>
      <view class="as-chips">
        <view v-for="c in carriers" :key="c" class="as-chip" :class="{ on: company === c }" @tap="company = c"><text>{{ c }}</text></view>
      </view>
      <input v-model="company" class="as-field" maxlength="50" :placeholder="$t('as.companyPh')" placeholder-class="as-ph" />
      <input v-model="expressNo" class="as-field" maxlength="50" :placeholder="$t('as.expressNoPh')" placeholder-class="as-ph" />
      <view class="as-sheet-actions">
        <view class="as-btn ghost" @tap="retSheet = false"><text>{{ $t('cancel.back') }}</text></view>
        <view class="as-btn main" :class="{ busy: busy }" @tap="submitReturn"><text>{{ $t('as.submit') }}</text></view>
      </view>
    </view>
  </view>
</template>

<script>
import { applyAfterSales, cancelAfterSales, returnAfterSales, errorText } from '@/api/shop.js';
import { AFTER_SALE_TYPES, AFTER_SALE_REASONS, CARRIERS } from '@/utils/order.js';
import { logError } from '@/utils/logger.js';

const COLORS = { requested: '#ffb74d', approved: '#4fc3f7', returning: '#ffb74d', refunding: '#4fc3f7', refund_failed: '#ff8a80', refunded: '#81c784', completed: '#81c784', rejected: 'rgba(255,255,255,0.5)', cancelled: 'rgba(255,255,255,0.5)' };

export default {
  name: 'AfterSales',
  props: { order: { type: Object, required: true } },
  data() {
    return { applySheet: false, retSheet: false, type: 'refund', reason: '', desc: '', retSale: null, company: '', expressNo: '', busy: false, types: AFTER_SALE_TYPES, reasons: AFTER_SALE_REASONS, carriers: CARRIERS };
  },
  computed: {
    sales() {
      return this.order.afterSales || [];
    }
  },
  methods: {
    statusColor: (s) => COLORS[s] || '#fff',
    noteLabel(s) {
      return this.$t(s.status === 'rejected' ? 'as.rejectNote' : 'as.adminNote');
    },
    addrRows(s) {
      const t = s.returnTo;
      return [{ k: 'receiver', v: t.name }, { k: 'receiverPhone', v: t.phone }, { k: 'returnAddr', v: t.address }].filter((r) => r.v);
    },
    addrAll(s) {
      const t = s.returnTo;
      return [t.name, t.phone, t.address].filter(Boolean).join(' ');
    },
    copy(text) {
      uni.setClipboardData({ data: String(text), success: () => this.toast(this.$t('ui.copied')) });
    },
    toast(text) {
      uni.showToast({ title: text, icon: 'none' });
    },
    openApply() {
      this.type = 'refund';
      this.reason = '';
      this.desc = '';
      this.applySheet = true;
    },
    openReturn(s) {
      this.retSale = s;
      this.company = '';
      this.expressNo = '';
      this.retSheet = true;
    },
    // 执行一个会改变订单的操作：成功交给父页面刷新；失败用服务端的错误码给出具体原因
    async run(fn, closeSheet) {
      if (this.busy) return;
      this.busy = true;
      try {
        const { data } = await fn();
        if (data.code !== 0) {
          const err = new Error(data.message || 'failed');
          err.userMessage = errorText(data);
          throw err;
        }
        this[closeSheet] = false;
        this.$emit('changed', data.data);
      } catch (e) {
        logError('aftersales.action', { error: (e && (e.errMsg || e.message)) || String(e) });
        this.toast((e && e.userMessage) || this.$t('order.actionFail'));
        this.$emit('refresh'); // 状态可能已经被商家改了，重新取一次
      } finally {
        this.busy = false;
      }
    },
    submitApply() {
      const r = this.reasons.find((x) => x.key === this.reason);
      if (!r) return this.toast(this.$t('as.needReason'));
      const desc = (this.desc || '').trim();
      if (r.key === 'other' && !desc) return this.toast(this.$t('as.needDesc'));
      this.run(() => applyAfterSales(this.order.id, { type: this.type, reason: r.zh, description: desc }), 'applySheet');
    },
    submitReturn() {
      const company = (this.company || '').trim();
      const no = (this.expressNo || '').trim();
      if (!company || !no) return this.toast(this.$t('as.needExpress'));
      this.run(() => returnAfterSales(this.retSale.id, { company, no }), 'retSheet');
    },
    cancel(s) {
      uni.showModal({
        content: this.$t('as.cancelConfirm'),
        cancelText: this.$t('ui.cancel'),
        confirmText: this.$t('ui.confirm'),
        success: (res) => res.confirm && this.run(() => cancelAfterSales(s.id), 'applySheet')
      });
    }
  }
};
</script>

<style lang="scss">
.as-card {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}
.as-card-title {
  display: block;
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}
.as-item {
  padding: 16rpx 0 8rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.06);

  &:first-of-type {
    border-top: none;
  }
}
.as-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}
.as-type {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}
.as-status {
  font-size: 26rpx;
  font-weight: 600;
}
.as-kv {
  display: flex;
  padding: 6rpx 0;
  line-height: 1.6;
}
.as-k {
  flex: 0 0 150rpx;
  color: rgba(255, 255, 255, 0.5);
  font-size: 26rpx;
}
.as-v {
  flex: 1;
  min-width: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 26rpx;
  white-space: pre-wrap;
  word-break: break-all;
}
.as-copy {
  flex: 0 0 auto;
  margin-left: 16rpx;
  padding: 0 4rpx;
  color: #07c160;
  font-size: 24rpx;
  line-height: 1.8;
}
.as-copyall {
  display: inline-block;
  margin: 8rpx 0 6rpx;
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.85);
  font-size: 24rpx;
}
.as-tip {
  display: block;
  margin-top: 6rpx;
  color: rgba(255, 255, 255, 0.45);
  font-size: 24rpx;
}
.as-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12rpx;
}
.as-btn {
  height: 72rpx;
  padding: 0 36rpx;
  margin-left: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 36rpx;
  font-size: 26rpx;

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

// 底部弹窗（和订单详情里开发票、取消订单的弹窗同一套样式）
.as-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 30;
  background: rgba(0, 0, 0, 0.55);
}
.as-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 31;
  max-height: 86vh;
  background: #122642;
  border-radius: 28rpx 28rpx 0 0;
  padding: 32rpx 28rpx;
  padding-bottom: calc(48rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.as-sheet-title {
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24rpx;
}
.as-seg {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 14rpx;
  padding: 6rpx;
}
.as-seg-item {
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
.as-hint {
  display: block;
  margin: 14rpx 4rpx 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
}
.as-label {
  display: block;
  color: rgba(255, 255, 255, 0.55);
  font-size: 26rpx;
  margin: 20rpx 0 10rpx;
}
.as-list {
  max-height: 520rpx;
}
.as-opt {
  display: flex;
  align-items: center;
  padding: 30rpx 8rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.as-dot {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  margin-right: 20rpx;
  box-sizing: border-box;
}
.as-opt.on .as-dot {
  border-color: #00a8ff;
  background: radial-gradient(#00a8ff 45%, transparent 50%);
}
.as-opt-name {
  color: #fff;
  font-size: 28rpx;
}
.as-input {
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
.as-field {
  height: 84rpx;
  margin-top: 16rpx;
  padding: 0 24rpx;
  border-radius: 14rpx;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 28rpx;
}
.as-ph {
  color: rgba(255, 255, 255, 0.3);
}
.as-addr {
  padding: 18rpx 22rpx;
  margin-bottom: 8rpx;
  border-radius: 14rpx;
  background: rgba(255, 255, 255, 0.06);
}
.as-addr-text {
  color: #fff;
  font-size: 26rpx;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
.as-chips {
  display: flex;
  flex-wrap: wrap;
}
.as-chip {
  padding: 10rpx 22rpx;
  margin: 0 14rpx 14rpx 0;
  border-radius: 28rpx;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.75);
  font-size: 24rpx;

  &.on {
    border-color: #00a8ff;
    color: #00a8ff;
  }
}
.as-sheet-actions {
  display: flex;
  margin-top: 24rpx;

  // 弹窗里的按钮高一点、撑满一行（卡片里行内的「撤销」「填写退货快递」仍是小按钮）
  .as-btn {
    height: 96rpx;
    padding: 0;
    margin-left: 0;
    border-radius: 48rpx;
    font-size: 28rpx;
    white-space: nowrap;
  }
  .as-btn + .as-btn {
    margin-left: 20rpx;
  }
  .as-btn.ghost {
    flex: 1;
  }
  .as-btn.main {
    flex: 2;
  }
}
</style>
