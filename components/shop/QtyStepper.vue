<template>
  <!-- 加减按钮：数量为 0 时只显示「+」；点击不会冒泡到外层（比如卡片的点击） -->
  <view v-if="buyable" class="stepper">
    <view v-if="qty > 0" class="btn minus" @tap.stop="reduce"><text>−</text></view>
    <!-- 数量可以直接输入（数字键盘）：输入完点键盘「完成」或点别处时生效 -->
    <input
      v-if="qty > 0"
      class="qty"
      type="number"
      maxlength="7"
      :value="text"
      :cursor-spacing="40"
      @tap.stop
      @input="onInput"
      @blur="commit"
      @confirm="commit"
    />
    <view class="btn plus" @tap.stop="add"><text>+</text></view>
  </view>
</template>

<script>
import { addItem, reduceItem, setQty, qtyOf, canBuy, capOf, capTipKey } from '@/utils/cart.js';

export default {
  name: 'QtyStepper',
  props: {
    item: { type: Object, required: true }
  },
  data() {
    return { text: '' };
  },
  computed: {
    qty() {
      return qtyOf(this.item.id);
    },
    buyable() {
      return canBuy(this.item);
    }
  },
  watch: {
    // 用 + / − 或输入生效后，输入框显示的永远是购物车里的真实数量
    qty: {
      immediate: true,
      handler(n) {
        this.text = String(n);
      }
    }
  },
  methods: {
    onInput(e) {
      this.text = e.detail.value; // 记住输入框里现在的内容（让后面改回真实数量时一定会刷新）
    },
    commit() {
      const { qty, reason } = setQty(this.item, this.text);
      this.text = String(qty);
      if (reason === 'min') uni.showToast({ title: this.$t('shop.minQty', { n: this.item.minOrderQty }), icon: 'none' });
      else if (reason === 'max') uni.showToast({ title: this.$t(capTipKey(this.item), { n: capOf(this.item) }), icon: 'none' });
    },
    add() {
      if (addItem(this.item) === 'max') {
        uni.showToast({ title: this.$t(capTipKey(this.item), { n: capOf(this.item) }), icon: 'none' });
      }
    },
    reduce() {
      reduceItem(this.item);
    }
  }
};
</script>

<style lang="scss">
.stepper {
  display: flex;
  align-items: center;
  flex-shrink: 0; // 价格行很长时不能把加减区域挤窄
}
.btn {
  box-sizing: border-box; // 减号有 1px 边框：边框算在 52rpx 以内，否则比加号大一圈、圆角也不够
  flex-shrink: 0; // 不能被挤扁，否则不是正圆
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  line-height: 1;

  &.plus {
    background: #00a8ff;
    color: #fff;
  }
  &.minus {
    border: 1px solid #00a8ff;
    color: #00a8ff;
  }
}
.qty {
  flex-shrink: 0;
  width: 100rpx;
  height: 52rpx;
  margin: 0 8rpx;
  text-align: center;
  color: #fff;
  font-size: 28rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8rpx;
}
</style>
