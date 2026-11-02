<template>
  <view class="empty-state">
    <text class="empty-text">{{ text }}</text>
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

  .empty-text {
    font-size: 28rpx;
    color: $text-light;
  }
}
</style>
