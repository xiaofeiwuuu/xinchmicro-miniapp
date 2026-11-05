<template>
  <view class="page">
    <scroll-view scroll-y class="body">
      <!-- 收货地址：点击选择；没有地址时提示添加 -->
      <view class="card addr" @tap="chooseAddress">
        <view v-if="address" class="addr-main">
          <view class="addr-top">
            <text class="name">{{ address.consignee }}</text>
            <text class="phone">{{ address.phone }}</text>
          </view>
          <text class="addr-text">{{ address.region }} {{ address.detail }}</text>
        </view>
        <text v-else class="addr-empty">{{ $t('oc.addAddress') }}</text>
        <text class="arrow">›</text>
      </view>

      <view class="card">
        <text class="title">{{ $t('oc.items') }}</text>
        <view v-for="l in lines" :key="l.item.id" class="item">
          <text class="item-name">{{ l.item.name }}</text>
          <text class="item-price">{{ $t('shop.price', { price: l.item.price.toFixed(2) }) }}</text>
          <text class="item-qty">×{{ l.qty }}</text>
        </view>
      </view>

      <view class="card">
        <text class="title">{{ $t('oc.remark') }}</text>
        <textarea v-model="remark" class="remark" maxlength="200" :placeholder="$t('oc.remarkPh')" placeholder-class="ph" />
      </view>

      <text class="tip">{{ $t('oc.tip') }}</text>
      <view class="space"></view>
    </scroll-view>

    <view class="footer">
      <view class="sum">
        <text class="sum-label">{{ $t('oc.total') }}</text>
        <text class="sum-value">{{ $t('shop.price', { price: total.toFixed(2) }) }}</text>
      </view>
      <view class="submit" :class="{ busy: submitting }" @tap="submit"><text>{{ $t('oc.submit') }}</text></view>
    </view>
  </view>
</template>

<script>
import { getAddresses, createOrder, errorText } from '@/api/shop.js';
import { getCheckout, clearCheckout, takePickedAddress } from '@/utils/checkout.js';
import { removeItems } from '@/utils/cart.js';
import { ensureLogin } from '@/utils/customer.js';
import { sumAmount } from '@/utils/order.js';
import { safeNavigate } from '@/utils/nav.js';
import { logError } from '@/utils/logger.js';

export default {
  data() {
    return { lines: [], address: null, remark: '', submitting: false };
  },
  computed: {
    total() {
      return sumAmount(this.lines.map((l) => ({ price: l.item.price, qty: l.qty })));
    }
  },
  onLoad() {
    this.lines = getCheckout();
    // 同一次进入这个页面用同一个请求号：连点、网络重试都只会生成一个订单
    this.requestId = Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    if (!this.lines.length) {
      uni.showToast({ title: this.$t('oc.empty'), icon: 'none' });
      setTimeout(() => uni.navigateBack(), 800);
      return;
    }
    this.loadDefaultAddress();
  },
  onShow() {
    const picked = takePickedAddress();
    if (picked) this.address = picked;
  },
  methods: {
    async loadDefaultAddress() {
      try {
        const { data } = await getAddresses();
        if (data.code === 0 && !this.address) this.address = data.data.find((a) => a.isDefault) || data.data[0] || null;
      } catch (e) {
        logError('order.confirm.address', { error: (e && (e.errMsg || e.message)) || String(e) });
      }
    },
    chooseAddress() {
      safeNavigate('/pages/address/list?select=1');
    },
    async submit() {
      if (this.submitting) return;
      if (!this.address) {
        uni.showToast({ title: this.$t('oc.needAddress'), icon: 'none' });
        return;
      }
      this.submitting = true;
      try {
        if (!(await ensureLogin())) {
          uni.showToast({ title: this.$t('oc.loginFail'), icon: 'none' });
          return;
        }
        const { data } = await createOrder({
          lines: this.lines,
          addressId: this.address.id,
          remark: this.remark.trim(),
          requestId: this.requestId
        });
        if (data.code !== 0) {
          const err = new Error(data.message || 'submit failed');
          err.userMessage = errorText(data); // 库存不足、已下架、起订量等：告诉用户具体原因
          throw err;
        }
        removeItems(this.lines.map((l) => l.item.id));
        clearCheckout();
        // 用订单详情替换当前页：返回键不会回到已经提交过的确认页
        uni.redirectTo({ url: '/pages/order/detail?id=' + data.data.id });
      } catch (e) {
        logError('order.submit', { error: (e && (e.errMsg || e.message)) || String(e) });
        uni.showToast({ title: (e && e.userMessage) || this.$t('oc.failed'), icon: 'none' });
      } finally {
        this.submitting = false;
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
.body {
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
.addr {
  display: flex;
  align-items: center;
}
.addr-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.addr-top {
  display: flex;
  align-items: center;
}
.name {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}
.phone {
  color: rgba(255, 255, 255, 0.7);
  font-size: 28rpx;
  margin-left: 20rpx;
}
.addr-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
  margin-top: 12rpx;
}
.addr-empty {
  flex: 1;
  color: #00a8ff;
  font-size: 30rpx;
}
.arrow {
  color: rgba(255, 255, 255, 0.4);
  font-size: 40rpx;
  margin-left: 16rpx;
}
.title {
  display: block;
  color: rgba(255, 255, 255, 0.5);
  font-size: 26rpx;
  margin-bottom: 16rpx;
}
.item {
  display: flex;
  align-items: center;
  padding: 14rpx 0;
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
.remark {
  width: 100%;
  height: 160rpx;
  color: #fff;
  font-size: 28rpx;
}
.ph {
  color: rgba(255, 255, 255, 0.3);
}
.tip {
  display: block;
  color: rgba(255, 255, 255, 0.45);
  font-size: 24rpx;
  line-height: 1.6;
  padding: 0 8rpx;
}
.space {
  height: 40rpx;
}
.footer {
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  padding-bottom: calc(constant(safe-area-inset-bottom));
  padding-bottom: calc(env(safe-area-inset-bottom));
  height: 120rpx;
  box-sizing: content-box;
  background: #122642;
}
.sum {
  flex: 1;
  display: flex;
  align-items: baseline;
}
.sum-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
}
.sum-value {
  color: #ffb74d;
  font-size: 40rpx;
  font-weight: 700;
  margin-left: 16rpx;
}
.submit {
  height: 88rpx;
  min-width: 240rpx;
  padding: 0 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #00a8ff, #0072ff);
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;

  &.busy {
    opacity: 0.6;
  }
}
</style>
