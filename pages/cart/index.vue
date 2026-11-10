<!-- 购物车页面：列出购物车里所有商品，可勾选、改数量、清空、去结算。
     购物车数据在本机（utils/cart.js），这里取一次最新的商品（价格、库存、起订量以服务端为准），
     对着它把下架、库存不够的处理掉（和商城页一样的规则）。 -->
<template>
  <view class="cart-page">
    <RetryState v-if="failed" @retry="load" />
    <LoadingState v-else-if="!loaded" />
    <view v-else-if="loaded && !lines.length" class="empty-wrap">
      <EmptyState image="/static/empty/no-cart.png" :text="$t('shop.cartEmpty')" />
      <view class="go-shop" @tap="goShop"><text>{{ $t('cart.goShop') }}</text></view>
    </view>

    <template v-else-if="loaded">
      <view class="top">
        <text class="top-count">{{ $t('cart.count', { n: lines.length }) }}</text>
        <view class="top-clear" @tap="clear">
          <image src="/static/icon/trash.png" class="top-clear-icon" mode="aspectFit"></image>
          <text>{{ $t('shop.clear') }}</text>
        </view>
      </view>

      <scroll-view scroll-y class="list">
        <view v-for="line in lines" :key="line.item.id" class="line">
          <view class="check" :class="{ on: line.selected }" @tap="toggleOne(line.item.id)">
            <text v-if="line.selected">✓</text>
          </view>
          <view class="line-info" @tap="openDetail(line.item)">
            <text class="line-name">{{ line.item.name }}</text>
            <view class="line-price-row">
              <text class="line-price">{{ $t('shop.price', { price: unitOf(line).toFixed(2) }) }}</text>
              <text v-if="line.item.listPrice" class="line-member">{{ $t('shop.memberPrice') }}</text>
            </view>
            <text v-if="line.item.minOrderQty > 1" class="line-sub">{{ $t('shop.minQty', { n: line.item.minOrderQty }) }}</text>
            <text v-if="line.item.maxOrderQty > 0" class="line-sub">{{ $t('shop.maxQtyTag', { n: line.item.maxOrderQty }) }}</text>
            <text v-if="nextText(line)" class="line-sub line-next">{{ nextText(line) }}</text>
          </view>
          <qty-stepper :item="line.item" />
        </view>
        <view class="bottom-space"></view>
      </scroll-view>

      <view class="bar">
        <view class="all" @tap="toggleAll">
          <view class="check" :class="{ on: allSelected }"><text v-if="allSelected">✓</text></view>
          <text class="all-text">{{ $t('shop.selectAll') }}</text>
        </view>
        <view class="sum">
          <text class="sum-label">{{ $t('cart.total') }}</text>
          <text class="sum-total">{{ $t('shop.price', { price: total.toFixed(2) }) }}</text>
        </view>
        <view class="checkout" :class="{ disabled: selectedCount === 0 }" @tap="checkout">
          <text>{{ $t('shop.checkout') }}{{ selectedCount > 0 ? ' (' + selectedCount + ')' : '' }}</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import { getShopCatalog } from '@/api/shop.js';
import { getLang } from '@/utils/i18n.js';
import { logError } from '@/utils/logger.js';
import { cartState, clearCart, isSelected, toggleSelect, selectAll, reconcileCart, unitPriceAt, nextTierHint } from '@/utils/cart.js';
import { setCheckout } from '@/utils/checkout.js';
import { safeNavigate } from '@/utils/nav.js';
import RetryState from '@/components/RetryState.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingState from '@/components/LoadingState.vue';
import QtyStepper from '@/components/shop/QtyStepper.vue';

export default {
  components: { RetryState, EmptyState, LoadingState, QtyStepper },
  data() {
    return { products: [], loaded: false, failed: false };
  },
  computed: {
    // 购物车里的每一行；商品已经不在在售列表里（下架等）的忽略
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
    selectedCount() {
      return this.selectedLines.reduce((n, l) => n + l.qty, 0);
    },
    // 勾选商品的合计：按「分」累加再除以 100，避免小数误差；只是显示用，真实金额由服务端算
    total() {
      return this.selectedLines.reduce((sum, l) => sum + Math.round(unitPriceAt(l.item, l.qty) * 100) * l.qty, 0) / 100;
    }
  },
  onLoad() {
    this.loadedLang = getLang();
  },
  // 每次回到这个页面都重新取：从详情页加了商品、或在别处改了购物车回来，价格库存也可能变了
  onShow() {
    this.loadedLang = getLang();
    this.load();
  },
  methods: {
    // 这一行现在的单价（买到阶梯价的数量会更低）
    unitOf: (line) => unitPriceAt(line.item, line.qty),
    // 再买几件到下一档（没有阶梯价或已经是最后一档返回空）
    nextText(line) {
      const h = nextTierHint(line.item, line.qty);
      return h ? this.$t('buy.nextTier', { n: h.need, price: this.$t('shop.price', { price: h.price.toFixed(2) }) }) : '';
    },
    async load() {
      this.failed = false;
      const lang = getLang();
      try {
        const { data } = await getShopCatalog();
        if (lang !== getLang()) return; // 请求期间切换了语言，丢弃旧语言的结果
        if (data.code !== 0) throw new Error(data.message || 'load failed');
        const out = [];
        (data.data || []).forEach((cat) => cat.catalogs.forEach((catalog) => out.push(...catalog.products)));
        this.products = out;
        this.loaded = true;
        // 取失败时不会走到这里，不会因为取不到商品把购物车清空
        const fixed = reconcileCart(out);
        if (fixed.removed || fixed.adjusted) uni.showToast({ title: this.$t('shop.cartUpdated'), icon: 'none' });
      } catch (e) {
        logError('cart.load', { error: (e && (e.errMsg || e.message)) || String(e) });
        if (!this.loaded) this.failed = true;
      }
    },
    toggleOne(id) {
      toggleSelect(id);
    },
    toggleAll() {
      selectAll(this.lines.map((l) => l.item.id), !this.allSelected);
    },
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
    openDetail(item) {
      safeNavigate('/pages/product/detail?id=' + item.id);
    },
    goShop() {
      safeNavigate('/pages/shop/index');
    },
    checkout() {
      if (!this.selectedCount) {
        uni.showToast({ title: this.$t('shop.selectFirst'), icon: 'none' });
        return;
      }
      setCheckout(this.selectedLines.map((l) => ({ item: l.item, qty: l.qty })));
      safeNavigate('/pages/order/confirm');
    }
  }
};
</script>

<style lang="scss">
.cart-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0e1a2d;
  box-sizing: border-box;
}
.empty-wrap {
  padding-top: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.go-shop {
  margin-top: 40rpx;
  padding: 0 64rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #00a8ff, #0072ff);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 28rpx;
}
.top-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
}
.top-clear {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 26rpx;
}
.top-clear-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
}
.list {
  flex: 1;
  min-height: 0;
  padding: 0 24rpx;
  box-sizing: border-box;
}
.line {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.06);
}
.check {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.4);
  color: #fff;
  font-size: 24rpx;

  &.on {
    background: #00a8ff;
    border-color: #00a8ff;
  }
}
.line-info {
  flex: 1;
  min-width: 0;
  margin: 0 20rpx;
  display: flex;
  flex-direction: column;
}
.line-name {
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  word-break: break-all;
}
.line-price-row {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}
// 价格和「会员价」标签：同高、flex 居中，中线在一条线上（以前基线对齐 + 行高撑高度，标签偏上）
.line-price {
  height: 40rpx;
  display: flex;
  align-items: center;
  color: #ffb74d;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1;
}
.line-member {
  margin-left: 12rpx;
  height: 38rpx;
  box-sizing: border-box;
  padding: 0 12rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 24rpx;
  color: #ffd54f;
  border: 1rpx solid rgba(255, 213, 79, 0.6);
  border-radius: 8rpx;
  white-space: nowrap;
}
.line-sub {
  margin-top: 6rpx;
  color: rgba(255, 255, 255, 0.5);
  font-size: 22rpx;
}
.bottom-space {
  height: calc(200rpx + constant(safe-area-inset-bottom));
  height: calc(200rpx + env(safe-area-inset-bottom));
}
.bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  padding-bottom: calc(44rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(44rpx + env(safe-area-inset-bottom));
  background: #122642;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.all {
  display: flex;
  align-items: center;
}
.all-text {
  margin-left: 12rpx;
  color: rgba(255, 255, 255, 0.85);
  font-size: 26rpx;
}
.sum {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  margin: 0 20rpx;
}
.sum-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}
.sum-total {
  margin-left: 8rpx;
  color: #ffb74d;
  font-size: 36rpx;
  font-weight: 700;
  white-space: nowrap;
}
.checkout {
  height: 96rpx;
  padding: 0 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #00a8ff, #0072ff);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  white-space: nowrap;

  &.disabled {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.4);
  }
}
.line-next { color: #ffb74d; }
</style>
