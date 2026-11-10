<template>
  <!-- 加载中：转圈 + 文字。数据还没回来、页面还是空的时候显示，不然用户只看到一片空白 -->
  <view class="loading-state">
    <view class="spinner"></view>
    <text class="loading-text">{{ text || $t('ui.loading') }}</text>
  </view>
</template>

<script>
// 统一的加载中状态，和 EmptyState（暂无数据）、RetryState（加载失败）配套使用
export default {
  name: 'LoadingState',
  props: {
    text: {
      type: String,
      default: ''
    }
  }
};
</script>

<style lang="scss">
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 0;

  .spinner {
    width: 64rpx;
    height: 64rpx;
    box-sizing: border-box;
    border: 6rpx solid rgba(255, 255, 255, 0.12);
    border-top-color: #00a8ff;
    border-radius: 50%;
    animation: loading-spin 0.8s linear infinite;
  }
  .loading-text {
    margin-top: 24rpx;
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.5);
  }
}
@keyframes loading-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
