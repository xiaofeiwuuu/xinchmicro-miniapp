<template>
  <view class="product-card" @tap="$emit('open', item)">
    <view class="info">
      <text class="name">{{ L(item) }}</text>
      <text v-if="item.desc" class="desc">{{ item.desc }}</text>
      <view class="meta">
        <text v-if="tag" class="tag">{{ tag }}</text>
        <text v-if="item.minOrderQty > 1" class="tag">{{ $t('shop.minQty', { n: item.minOrderQty }) }}</text>
        <text v-if="item.stock <= 0" class="tag sold">{{ $t('shop.soldOut') }}</text>
        <text v-else-if="!buyable" class="tag sold">{{ $t('shop.belowMin') }}</text>
        <text v-else class="tag">{{ $t('shop.stock', { n: item.stock }) }}</text>
      </view>
    </view>

    <!-- 底部一行：价格在左，加减按钮在最右 -->
    <view class="bottom">
      <text class="price">{{ $t('shop.price', { price: item.price.toFixed(2) }) }}</text>
      <qty-stepper :item="item" />
    </view>
  </view>
</template>

<script>
import { canBuy } from '@/utils/cart.js';
import QtyStepper from './QtyStepper.vue';

export default {
  name: 'ProductCard',
  components: { QtyStepper },
  props: {
    item: { type: Object, required: true },
    tag: { type: String, default: '' } // 搜索结果里显示所属目录
  },
  computed: {
    buyable() {
      return canBuy(this.item);
    }
  },
  methods: {
    // 服务端已按语言取好名称（英文缺失时回退中文），直接用 name
    L(o) {
      return o.name;
    }
  }
};
</script>

<style lang="scss">
.product-card {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.info {
  display: flex;
  flex-direction: column;
}
.name {
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}
.desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  margin-top: 6rpx;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  margin-top: 12rpx;
}
.tag {
  color: rgba(255, 255, 255, 0.7);
  font-size: 22rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8rpx;
  padding: 4rpx 12rpx;
  margin-right: 12rpx;
}
.tag.sold {
  color: #ff8a80;
}
.bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  min-height: 56rpx;
}
.price {
  color: #ffb74d;
  font-size: 34rpx;
  font-weight: 600;
}
</style>
