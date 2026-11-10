<template>
  <!-- 商城页第一次加载时的骨架屏：布局和真实页面一致（左边分类、右边按目录分段的商品卡片），灰色占位 + 流动的微光。
       数据回来后直接换成真实内容，不会跳动 -->
  <view class="sk-body">
    <view class="sk-left">
      <view v-for="i in 7" :key="i" class="sk-cat">
        <view class="sk sk-cat-text" :class="{ short: i % 3 === 0 }"></view>
      </view>
    </view>
    <view class="sk-right">
      <view class="sk-section">
        <view class="sk sk-title"></view>
        <view class="sk sk-count"></view>
      </view>
      <view v-for="i in 4" :key="i" class="sk-card">
        <view class="sk sk-name" :class="{ short: i % 2 === 0 }"></view>
        <view class="sk-tags">
          <view class="sk sk-tag"></view>
          <view class="sk sk-tag wide"></view>
        </view>
        <view class="sk-bottom">
          <view class="sk sk-price"></view>
          <view class="sk sk-btn"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ShopSkeleton'
};
</script>

<style lang="scss">
.sk-body {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}
// 灰色占位块 + 从左到右流过的微光
.sk {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.06) 25%, rgba(255, 255, 255, 0.14) 37%, rgba(255, 255, 255, 0.06) 63%);
  background-size: 400% 100%;
  animation: sk-shine 1.4s ease infinite;
  border-radius: 8rpx;
}
@keyframes sk-shine {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.sk-left {
  width: 200rpx;
  background: rgba(255, 255, 255, 0.04);
}
.sk-cat {
  padding: 36rpx 16rpx;
  display: flex;
  justify-content: center;
}
.sk-cat-text {
  width: 120rpx;
  height: 32rpx;
  &.short {
    width: 84rpx;
  }
}

.sk-right {
  flex: 1;
  min-width: 0;
  padding: 0 20rpx;
}
.sk-section {
  display: flex;
  align-items: center;
  padding: 28rpx 4rpx 20rpx;
}
.sk-title {
  width: 220rpx;
  height: 36rpx;
}
.sk-count {
  width: 36rpx;
  height: 28rpx;
  margin-left: 16rpx;
}
.sk-card {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.sk-name {
  width: 70%;
  height: 34rpx;
  &.short {
    width: 48%;
  }
}
.sk-tags {
  display: flex;
  margin-top: 16rpx;
}
.sk-tag {
  width: 96rpx;
  height: 32rpx;
  margin-right: 12rpx;
  &.wide {
    width: 140rpx;
  }
}
.sk-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 22rpx;
}
.sk-price {
  width: 150rpx;
  height: 40rpx;
}
.sk-btn {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
}
</style>
