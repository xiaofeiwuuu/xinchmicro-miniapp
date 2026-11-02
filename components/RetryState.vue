<template>
  <view class="retry-state" @tap="$emit('retry')">
    <text class="retry-text">{{ $t('common.loadFail') }}</text>
    <text class="retry-btn">{{ $t('common.retry') }}</text>
  </view>
</template>

<script>
export default {
  name: 'RetryState'
};
</script>

<style lang="scss">
.retry-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .retry-text {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 24rpx;
  }

  .retry-btn {
    font-size: 26rpx;
    color: #00a8ff;
    padding: 10rpx 40rpx;
    border: 1px solid rgba(0, 168, 255, 0.5);
    border-radius: 30rpx;
  }
}
</style>
