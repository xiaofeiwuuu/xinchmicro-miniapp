<!-- 商品详情页的「选数量」底部面板：点「加入购物车」或「立即购买」弹出，数量、价格、小计都在这里，点确定才生效。
     mode = 'cart'：把购物车里这个商品的数量设成选的数量（保留勾选状态以外的其它商品不动）；
     mode = 'buy' ：只买这一个，不动购物车，交给父页面跳转（emit buy）。
     数量默认是购物车里已有的，没有就按起订量；不能低于起订量、不能超过库存。 -->
<template>
  <view v-if="visible">
    <view class="bs-mask" @tap="close"></view>
    <view class="bs-sheet">
      <view class="bs-head">
        <text class="bs-price">{{ $t('shop.price', { price: unit.toFixed(2) }) }}</text>
        <text class="bs-unit">{{ $t('buy.perUnit') }}</text>
        <text v-if="item.listPrice" class="bs-member">{{ $t('shop.memberPrice') }}</text>
        <text v-if="item.listPrice" class="bs-list">{{ $t('shop.price', { price: item.listPrice.toFixed(2) }) }}</text>
      </view>
      <text class="bs-name">{{ item.name }}</text>
      <text v-if="hint" class="bs-hint">{{ hint }}</text>
      <!-- 阶梯价：当前买到的那一档高亮 -->
      <view v-if="steps.length > 1" class="bs-tiers">
        <view v-for="s in steps" :key="s.minQty" class="bs-tier" :class="{ on: s.on, last: s.last, off: s.minQty > max }" @tap="pickTier(s)">
          <text v-if="s.last" class="bs-badge">{{ $t('buy.lowest') }}</text>
          <text class="bs-tier-q">{{ s.label }}</text>
          <text class="bs-tier-p">{{ $t('shop.price', { price: s.price.toFixed(2) }) }}</text>
        </view>
      </view>
      <!-- 再买几件到下一档：差一件价格就变，提前告诉客户 -->
      <text v-if="nextHint" class="bs-next">{{ $t('buy.nextTier', { n: nextHint.need, price: $t('shop.price', { price: nextHint.price.toFixed(2) }) }) }}</text>

      <view class="bs-row">
        <text class="bs-label">{{ $t('buy.qty') }}</text>
        <view class="bs-stepper">
          <view class="bs-btn minus" :class="{ off: qty <= min }" @tap="step(-1)"><text>−</text></view>
          <input class="bs-qty" type="number" maxlength="7" :value="text" :cursor-spacing="60" @input="onInput" @blur="commit" @confirm="commit" />
          <view class="bs-btn plus" :class="{ off: qty >= max }" @tap="step(1)"><text>+</text></view>
        </view>
      </view>
      <view class="bs-row">
        <text class="bs-label">{{ $t('buy.total') }}</text>
        <text class="bs-total">{{ $t('shop.price', { price: total }) }}</text>
      </view>
      <text v-if="inCart && mode === 'cart'" class="bs-hint">{{ $t('buy.inCart', { n: inCart }) }}</text>

      <view class="bs-ok" @tap="ok"><text>{{ mode === 'buy' ? $t('detail.buy') : $t('buy.addCart') }}</text></view>
    </view>
  </view>
</template>

<script>
import { qtyOf, setQty, unitPriceAt, lineTotal, tierSteps, capOf, capTipKey, nextTierHint } from '@/utils/cart.js';

export default {
  name: 'BuySheet',
  props: {
    visible: { type: Boolean, default: false },
    mode: { type: String, default: 'cart' }, // cart | buy
    item: { type: Object, required: true },
    hint: { type: String, default: '' }
  },
  data() {
    return { qty: 1, text: '1' };
  },
  computed: {
    min() {
      return this.item.minOrderQty || 1;
    },
    // 能买的最大数量：库存和最大购买数量里小的那个
    max() {
      return capOf(this.item);
    },
    inCart() {
      return qtyOf(this.item.id);
    },
    // 现在这个数量的单价（买到阶梯价的数量会更低）
    unit() {
      return unitPriceAt(this.item, this.qty);
    },
    // 小计按「分」算再转回元，避免小数误差
    total() {
      return lineTotal(this.item, this.qty).toFixed(2);
    },
    // 阶梯：当前买到的那一档 on 为真
    steps() {
      return tierSteps(this.item, this.qty);
    },
    nextHint() {
      return nextTierHint(this.item, this.qty);
    }
  },
  watch: {
    // 每次打开都重新开始：购物车里有就用它，没有按起订量
    visible(v) {
      if (v) this.reset(this.inCart || this.min);
    }
  },
  methods: {
    reset(n) {
      this.qty = n;
      this.text = String(n);
    },
    close() {
      this.$emit('close');
    },
    // 把数量限制在 [起订量, 库存]，返回限制的原因
    clamp(n) {
      if (!(n > 0)) return { qty: this.qty, reason: 'invalid' };
      if (n < this.min) return { qty: this.min, reason: 'min' };
      if (n > this.max) return { qty: this.max, reason: 'max' };
      return { qty: n, reason: 'ok' };
    },
    tip(reason) {
      if (reason === 'min') uni.showToast({ title: this.$t('shop.minQty', { n: this.min }), icon: 'none' });
      else if (reason === 'max') uni.showToast({ title: this.$t(capTipKey(this.item), { n: this.max }), icon: 'none' });
    },
    // 点一档阶梯价：数量直接变成这一档的最低数量（不低于起订量）；这一档超过能买的最大数量（库存、每单限购）就提示、不改数量
    pickTier(s) {
      const target = Math.max(s.minQty, this.min);
      if (target > this.max) {
        this.tip('max');
        return;
      }
      this.reset(target);
    },
    step(d) {
      const { qty, reason } = this.clamp(this.qty + d);
      this.reset(qty);
      this.tip(reason);
    },
    onInput(e) {
      this.text = e.detail.value;
    },
    commit() {
      const { qty, reason } = this.clamp(parseInt(this.text, 10));
      this.reset(qty);
      this.tip(reason);
    },
    ok() {
      this.commit();
      if (this.mode === 'buy') {
        this.$emit('buy', this.qty);
      } else {
        setQty(this.item, this.qty); // 购物车里这个商品的数量设成选的数量
        uni.showToast({ title: this.$t('buy.added'), icon: 'none' });
      }
      this.close();
    }
  }
};
</script>

<style lang="scss">
.bs-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 40;
  background: rgba(0, 0, 0, 0.55);
}
.bs-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 41;
  display: flex;
  flex-direction: column;
  padding: 32rpx 28rpx;
  padding-bottom: calc(48rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
  background: #122642;
  border-radius: 28rpx 28rpx 0 0;
}
.bs-head {
  display: flex;
  align-items: center;
}
.bs-price {
  color: #ffb74d;
  font-size: 44rpx;
  font-weight: 700;
  white-space: nowrap;
}
.bs-unit {
  margin-left: 6rpx;
  color: rgba(255, 255, 255, 0.5);
  font-size: 22rpx;
}
.bs-tiers {
  display: flex;
  flex-wrap: wrap;
  margin: 16rpx -8rpx 0;
}
// 每行 3 个、宽度完全一样
.bs-tier {
  position: relative;
  box-sizing: border-box;
  flex: 0 0 calc(33.333% - 16rpx);
  width: calc(33.333% - 16rpx);
  margin: 8rpx;
  padding: 12rpx 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 10rpx;
  color: rgba(255, 255, 255, 0.6);

  &.on {
    border-color: #ffb74d;
    color: #ffb74d;
  }
  &:active {
    opacity: 0.7;
  }
  // 这一档的数量超过能买的最大数量：变暗，点了会提示
  &.off {
    opacity: 0.4;
  }
}
.bs-tier.last {
  border-color: rgba(255, 183, 77, 0.8);
}
// 最后一档（最低价）右下角的小角标，和前一档一眼区分
.bs-badge {
  position: absolute;
  bottom: -16rpx;
  right: -6rpx;
  height: 32rpx;
  padding: 0 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 20rpx;
  color: #1a1a1a;
  background: #ffb74d;
  border-radius: 8rpx;
}
.bs-next {
  display: block;
  margin-top: 12rpx;
  color: #ffb74d;
  font-size: 26rpx;
}
.bs-tier-q {
  font-size: 26rpx;
  line-height: 1.3;
  text-align: center;
}
.bs-tier-p {
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.3;
  margin-top: 4rpx;
}
.bs-member {
  margin-left: 14rpx;
  height: 42rpx;
  box-sizing: border-box;
  padding: 0 14rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 26rpx;
  color: #ffd54f;
  border: 1rpx solid rgba(255, 213, 79, 0.6);
  border-radius: 8rpx;
  white-space: nowrap;
}
.bs-list {
  margin-left: 12rpx;
  color: rgba(255, 255, 255, 0.45);
  font-size: 26rpx;
  line-height: 1;
  text-decoration: line-through;
}
.bs-name {
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.85);
  font-size: 28rpx;
}
.bs-hint {
  display: block;
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
}
.bs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28rpx;
  padding-top: 24rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.bs-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 28rpx;
}
.bs-total {
  color: #ffb74d;
  font-size: 32rpx;
  font-weight: 700;
}
.bs-stepper {
  display: flex;
  align-items: center;
}
.bs-btn {
  box-sizing: border-box; // 减号的边框算在 64rpx 以内
  flex-shrink: 0; // 不能被挤扁，否则不是正圆
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  line-height: 1;

  &.plus {
    background: #00a8ff;
    color: #fff;
  }
  &.minus {
    border: 1px solid #00a8ff;
    color: #00a8ff;
  }
  &.off {
    opacity: 0.35;
  }
}
.bs-qty {
  width: 120rpx;
  height: 64rpx;
  margin: 0 12rpx;
  text-align: center;
  color: #fff;
  font-size: 30rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8rpx;
}
.bs-ok {
  margin-top: 32rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #00a8ff, #0072ff);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
}
</style>
