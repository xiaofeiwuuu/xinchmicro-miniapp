<template>
  <view>
    <!-- 点开的购物车明细：遮罩 + 从底栏上方升起的面板 -->
    <view v-if="open && lines.length" class="mask" @tap="open = false"></view>
    <view v-if="open && lines.length" class="sheet">
      <view class="sheet-head">
        <view class="all" @tap="toggleAll">
          <view class="check" :class="{ on: allSelected }"><text v-if="allSelected">✓</text></view>
          <text class="all-text">{{ $t('shop.selectAll') }}</text>
        </view>
        <view class="clear" @tap="clear">
          <image src="/static/icon/trash.png" class="clear-icon" mode="aspectFit"></image>
          <text>{{ $t('shop.clear') }}</text>
        </view>
      </view>
      <scroll-view scroll-y class="sheet-list" :style="{ height: listHeight + 'rpx' }">
        <view v-for="line in lines" :key="line.item.id" class="line">
          <view class="check" :class="{ on: line.selected }" @tap="toggle1(line.item.id)">
            <text v-if="line.selected">✓</text>
          </view>
          <view class="line-info">
            <text class="line-name">{{ L(line.item) }}</text>
            <text class="line-price">{{ $t('shop.price', { price: line.item.price.toFixed(2) }) }}</text>
          </view>
          <qty-stepper :item="line.item" />
        </view>
      </scroll-view>
    </view>

    <view class="bar">
      <view class="cart" @tap="toggle">
        <image src="/static/icon/shop.png" class="cart-icon" mode="aspectFit"></image>
        <text v-if="count > 0" class="badge">{{ count > 99 ? '99+' : count }}</text>
      </view>
      <view class="sum" @tap="toggle">
        <text v-if="count > 0" class="total">{{ $t('shop.price', { price: total.toFixed(2) }) }}</text>
        <text v-else class="empty">{{ $t('shop.cartEmpty') }}</text>
      </view>
      <view v-if="count > 0" class="checkout" :class="{ disabled: selectedCount === 0 }" @tap="checkout">
        <text>{{ $t('shop.checkout') }}{{ selectedCount > 0 ? ' (' + selectedCount + ')' : '' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { cartState, clearCart, isSelected, toggleSelect, selectAll } from '@/utils/cart.js';
import QtyStepper from './QtyStepper.vue';

export default {
  name: 'CartBar',
  components: { QtyStepper },
  props: {
    // 当前能查到的所有商品（用来按 id 找价格和名称）
    products: { type: Array, default: () => [] }
  },
  data() {
    return { open: false };
  },
  computed: {
    // 购物车里的每一行；商品已经不在列表里（下架等）的忽略
    lines() {
      const map = {};
      this.products.forEach((p) => {
        map[p.id] = p;
      });
      return Object.keys(cartState.items)
        .filter((id) => map[id])
        .map((id) => ({ item: map[id], qty: cartState.items[id], selected: isSelected(id) }));
    },
    selectedLines() {
      return this.lines.filter((l) => l.selected);
    },
    allSelected() {
      return this.lines.length > 0 && this.selectedLines.length === this.lines.length;
    },
    // 勾选的件数（结算按钮上显示）
    selectedCount() {
      return this.selectedLines.reduce((n, l) => n + l.qty, 0);
    },
    // scroll-view 要有明确高度：每行约 120rpx，最高 560rpx，超过就在里面滚动
    listHeight() {
      return Math.min(this.lines.length * 120, 560);
    },
    count() {
      return this.lines.reduce((n, l) => n + l.qty, 0);
    },
    // 勾选商品的合计。按「分」累加再除以 100，避免小数误差；这里只是显示用，真实金额由服务端算
    total() {
      return this.selectedLines.reduce((sum, l) => sum + Math.round(l.item.price * 100) * l.qty, 0) / 100;
    }
  },
  watch: {
    // 购物车清空后自动收起面板
    count(n) {
      if (n === 0) this.open = false;
    }
  },
  methods: {
    L(o) {
      return o.name;
    },
    toggle() {
      if (this.count > 0) this.open = !this.open;
    },
    toggle1(id) {
      toggleSelect(id);
    },
    toggleAll() {
      selectAll(this.lines.map((l) => l.item.id), !this.allSelected);
    },
    // 清空前二次确认，避免误点
    clear() {
      uni.showModal({
        content: this.$t('shop.clearConfirm'),
        cancelText: this.$t('ui.cancel'),
        confirmText: this.$t('ui.confirm'),
        success: (res) => {
          if (res.confirm) clearCart();
        }
      });
    },
    checkout() {
      if (this.count === 0) return;
      if (this.selectedCount === 0) {
        uni.showToast({ title: this.$t('shop.selectFirst'), icon: 'none' });
        return;
      }
      this.open = false;
      this.$emit('checkout', this.selectedLines.map((l) => ({ item: l.item, qty: l.qty })));
    }
  }
};
</script>

<style lang="scss">
$bar-h: 100rpx;
$gap: 24rpx; // 悬浮：离屏幕左右和底部的距离

// 悬浮胶囊：和屏幕边缘留出间距，圆角加阴影，盖在列表上面
.bar {
  position: fixed;
  left: $gap;
  right: $gap;
  bottom: calc(#{$gap} + constant(safe-area-inset-bottom));
  bottom: calc(#{$gap} + env(safe-area-inset-bottom));
  z-index: 20;
  height: $bar-h;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #173459;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.45);
}
.cart {
  position: relative;
  width: 120rpx;
  height: $bar-h;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cart-icon {
  width: 52rpx;
  height: 52rpx;
}
.badge {
  position: absolute;
  top: 14rpx;
  right: 22rpx;
  min-width: 34rpx;
  height: 34rpx;
  line-height: 34rpx;
  padding: 0 8rpx;
  box-sizing: border-box;
  text-align: center;
  border-radius: 17rpx;
  background: #ff5252;
  color: #fff;
  font-size: 20rpx;
}
.sum {
  flex: 1;
  height: $bar-h;
  display: flex;
  align-items: center;
}
.total {
  color: #ffb74d;
  font-size: 38rpx;
  font-weight: 700;
}
.empty {
  color: rgba(255, 255, 255, 0.5);
  font-size: 28rpx;
}
.checkout {
  height: $bar-h;
  min-width: 240rpx;
  padding: 0 40rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00a8ff, #0072ff);
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;

  &.disabled {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.4);
  }
}

.mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
}
.sheet {
  position: fixed;
  // 贴着屏幕底边从下面升起，宽度铺满；底部留出和悬浮购物车栏一样高的空白，
  // 购物车栏（层级更高）正好盖在这块空白上，列表不会被它挡住
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 15;
  background: #122642;
  border-radius: 24rpx 24rpx 0 0;
  padding: 0 28rpx;
  padding-bottom: calc(#{$bar-h + $gap * 2} + constant(safe-area-inset-bottom));
  padding-bottom: calc(#{$bar-h + $gap * 2} + env(safe-area-inset-bottom));
}
.sheet-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 88rpx;
}
.all {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx 12rpx 0;
}
.all-text {
  color: #fff;
  font-size: 28rpx;
  margin-left: 16rpx;
}
.clear {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
  padding: 12rpx 0 12rpx 24rpx;
}
.clear-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
  opacity: 0.7;
}
// 勾选框：圆形，选中是蓝底白色对勾（项目没有图标字体，用文字符号）
.check {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
  box-sizing: border-box;
  border: 2rpx solid rgba(255, 255, 255, 0.4);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24rpx;
  line-height: 1;

  &.on {
    background: #00a8ff;
    border-color: #00a8ff;
  }
}
.line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.line-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  margin: 0 20rpx;
}
.line-name {
  color: #fff;
  font-size: 28rpx;
}
.line-price {
  color: #ffb74d;
  font-size: 26rpx;
  margin-top: 6rpx;
}
</style>
