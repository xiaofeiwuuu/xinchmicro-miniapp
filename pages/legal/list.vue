<!-- 协议与规则：用户协议 / 隐私政策 / 退换货规则 三项的入口（「我的」页只放这一个入口） -->
<template>
  <view class="page">
    <view class="card">
      <view v-for="l in rows" :key="l.type" class="row" @tap="open(l.type)">
        <text class="row-label">{{ l.text }}</text>
        <text class="row-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script>
import { safeNavigate } from '@/utils/nav.js';

export default {
  computed: {
    rows() {
      return ['terms', 'privacy', 'returns'].map((type) => ({ type, text: this.$t('legal.' + type) }));
    }
  },
  methods: {
    open(type) {
      safeNavigate('/pages/legal/index?type=' + type);
    }
  }
};
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #0e1a2d;
  padding: 24rpx;
  box-sizing: border-box;
}
.card {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  padding: 0 28rpx;
}
.row {
  display: flex;
  align-items: center;
  min-height: 104rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
  }
}
.row-label {
  flex: 1;
  color: #fff;
  font-size: 30rpx;
}
.row-arrow {
  color: rgba(255, 255, 255, 0.4);
  font-size: 36rpx;
}
</style>
