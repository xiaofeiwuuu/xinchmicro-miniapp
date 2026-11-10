<template>
  <view class="empty-state">
    <!-- 每张图都写成「写死路径的 src」：微信开发者工具的「过滤无依赖文件」靠扫描代码里的路径字符串判断文件有没有用，
         只用变量（:src="image"）的话这些图会被当成没用的文件，真机预览和上传的包里就没有它们（电脑上的开发者工具里能显示，手机上不显示）。
         新增空状态图要在这里加一行 -->
    <image v-if="image === '/static/empty/no-goods.png'" src="/static/empty/no-goods.png" class="empty-image" mode="aspectFit"></image>
    <image v-if="image === '/static/empty/no-result.png'" src="/static/empty/no-result.png" class="empty-image" mode="aspectFit"></image>
    <image v-if="image === '/static/empty/no-orders.png'" src="/static/empty/no-orders.png" class="empty-image" mode="aspectFit"></image>
    <image v-if="image === '/static/empty/no-address.png'" src="/static/empty/no-address.png" class="empty-image" mode="aspectFit"></image>
    <image v-if="image === '/static/empty/no-invoice.png'" src="/static/empty/no-invoice.png" class="empty-image" mode="aspectFit"></image>
    <image v-if="image === '/static/empty/no-cart.png'" src="/static/empty/no-cart.png" class="empty-image" mode="aspectFit"></image>
    <image v-if="image === '/static/empty/no-notice.png'" src="/static/empty/no-notice.png" class="empty-image" mode="aspectFit"></image>
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
    // 插图（可选，比如 /static/empty/no-goods.png、no-result.png）；不传就只有文字
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
