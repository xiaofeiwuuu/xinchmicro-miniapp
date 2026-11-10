<template>
  <view class="product-card" @tap="$emit('open', item)">
    <view class="info">
      <text class="name">{{ L(item) }}</text>
      <text v-if="item.desc" class="desc">{{ item.desc }}</text>
      <view class="meta">
        <text v-if="tag" class="tag">{{ tag }}</text>
        <text v-if="item.minOrderQty > 1" class="tag">{{ $t('shop.minQty', { n: item.minOrderQty }) }}</text>
        <text v-if="item.maxOrderQty > 0" class="tag">{{ $t('shop.maxQtyTag', { n: item.maxOrderQty }) }}</text>
        <text v-if="item.stock <= 0" class="tag sold">{{ $t('shop.soldOut') }}</text>
        <text v-else-if="!buyable" class="tag sold">{{ $t('shop.belowMin') }}</text>
        <text v-else-if="!item.stockUnlimited" class="tag">{{ $t('shop.stock', { n: item.stock }) }}</text>
      </view>
    </view>

    <!-- 底部一行：价格在左，加减按钮在最右 -->
    <view class="bottom">
      <view class="price-box">
        <text class="price">{{ $t('shop.price', { price: item.price.toFixed(2) }) }}</text>
        <!-- 会员价生效时：金边小标签加划线的普通价 -->
        <text v-if="item.tiers && item.tiers.length" class="tier-tag">{{ $t('shop.tiered') }}</text>
        <text v-if="item.listPrice" class="member-tag">{{ $t('shop.memberPrice') }}</text>
        <text v-if="item.listPrice" class="list-price">{{ $t('shop.price', { price: item.listPrice.toFixed(2) }) }}</text>
      </view>
      <qty-stepper :item="item" />
    </view>
  </view>
</template>

<script>
import { canBuy } from '@/utils/cart.js';
import QtyStepper from '@/components/shop/QtyStepper.vue';

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
  flex-shrink: 0;
  height: 42rpx; // 和右边标签同高，用 flex 居中，价格和标签的中线才在一条线上
  display: flex;
  align-items: center;
  color: #ffb74d;
  font-size: 34rpx;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}
// 价格、阶梯价、会员价、划线价排在同一行（不换行：换行后标签掉到下一行就对不齐了）
.price-box { flex: 1; min-width: 0; display: flex; align-items: center; flex-wrap: nowrap; overflow: hidden; }
// 价格旁边的小标签：固定高度、flex 居中，文字上下居中（以前用 line-height 撑，文字偏上）
.tier-tag, .member-tag { flex-shrink: 0; white-space: nowrap; margin-left: 10rpx; height: 42rpx; box-sizing: border-box; padding: 0 12rpx; display: inline-flex; align-items: center; justify-content: center; line-height: 1; font-size: 24rpx; border-radius: 8rpx; }
.tier-tag { color: #ffb74d; border: 1rpx solid rgba(255, 183, 77, 0.6); }
.member-tag { color: #ffd54f; border: 1rpx solid rgba(255, 213, 79, 0.6); }
.list-price { flex-shrink: 1; min-width: 0; height: 42rpx; display: flex; align-items: center; margin-left: 10rpx; color: rgba(255, 255, 255, 0.45); font-size: 24rpx; line-height: 1; text-decoration: line-through; white-space: nowrap; overflow: hidden; }
</style>
