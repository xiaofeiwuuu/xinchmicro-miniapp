<template>
  <view class="empty-state">
    <image v-if="image" :src="image" class="empty-image" mode="aspectFit"></image>
    <text class="empty-text">{{ text }}</text>
    <text v-if="hint" class="empty-hint">{{ hint }}</text>
  </view>
</template>

<script>
// 统一的空状态（暂无数据/暂无产品等），和 RetryState（加载失败）配套使用
export default {
  name: 'EmptyState',
  props: {
    text: {
      type: String,
      default: ''
    },
    // 插图（可选，比如 /static/empty/no-goods.webp、no-result.webp）；不传就只有文字
    image: {
      type: String,
      default: ''
    },
    // 文字下面的一行小字提示（可选）
    hint: {
      type: String,
      default: ''
    }
  }
};
</script>

<style lang="scss">
@import '@/common/style/common.scss';

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .empty-image {
    width: 360rpx;
    height: 300rpx;
    margin-bottom: 8rpx;
  }
  .empty-text {
    font-size: 28rpx;
    color: $text-light;
  }
  .empty-hint {
    margin-top: 12rpx;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.4);
    text-align: center;
    padding: 0 60rpx;
  }
}
</style>
