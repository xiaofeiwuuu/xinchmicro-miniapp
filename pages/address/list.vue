<template>
  <view class="page">
    <RetryState v-if="failed" @retry="load" />
    <EmptyState v-else-if="loaded && !list.length" :text="$t('addr.empty')" />
    <scroll-view v-else scroll-y class="list">
      <view v-for="a in list" :key="a.id" class="card" @tap="onTap(a)">
        <view class="main">
          <view class="top">
            <text class="name">{{ a.consignee }}</text>
            <text class="phone">{{ a.phone }}</text>
            <text v-if="a.isDefault" class="tag">{{ $t('addr.default') }}</text>
          </view>
          <text class="addr">{{ a.region }} {{ a.detail }}</text>
        </view>
        <view class="edit" @tap.stop="edit(a)">
          <text>{{ $t('addr.edit') }}</text>
        </view>
      </view>
      <view class="space"></view>
    </scroll-view>

    <view class="footer">
      <view class="add" :class="{ disabled: list.length >= max }" @tap="add"><text>{{ $t('addr.add') }}</text></view>
    </view>
  </view>
</template>

<script>
import { getAddresses, MAX_ADDRESSES } from '@/api/shop.js';
import { safeNavigate } from '@/utils/nav.js';
import { setPickedAddress } from '@/utils/checkout.js';
import { logError } from '@/utils/logger.js';
import RetryState from '@/components/RetryState.vue';
import EmptyState from '@/components/EmptyState.vue';

export default {
  components: { RetryState, EmptyState },
  data() {
    return { list: [], loaded: false, failed: false, selectMode: false, max: MAX_ADDRESSES };
  },
  onLoad(options) {
    // 从确认订单页进来是「选择地址」：点一行就选中并返回
    this.selectMode = options && options.select === '1';
  },
  onShow() {
    this.load();
  },
  methods: {
    async load() {
      this.failed = false;
      try {
        const { data } = await getAddresses();
        if (data.code !== 0) throw new Error(data.message || 'load failed');
        this.list = data.data || [];
        this.loaded = true;
      } catch (e) {
        logError('address.load', { error: (e && (e.errMsg || e.message)) || String(e) });
        if (!this.loaded) this.failed = true;
      }
    },
    onTap(a) {
      if (!this.selectMode) return this.edit(a);
      setPickedAddress(a);
      uni.navigateBack();
    },
    add() {
      // 最多 10 个，满了先提示，不要让用户填完表单才被拒绝
      if (this.list.length >= this.max) return uni.showToast({ title: this.$t('addr.limit', { n: this.max }), icon: 'none' });
      this.edit();
    },
    edit(a) {
      safeNavigate('/pages/address/edit' + (a ? '?id=' + a.id : ''));
    }
  }
};
</script>

<style lang="scss">
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0e1a2d;
}
.list {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}
.card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}
.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.top {
  display: flex;
  align-items: center;
}
.name {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}
.phone {
  color: rgba(255, 255, 255, 0.7);
  font-size: 28rpx;
  margin-left: 20rpx;
}
.tag {
  color: #00a8ff;
  border: 1px solid #00a8ff;
  border-radius: 8rpx;
  font-size: 20rpx;
  padding: 0 10rpx;
  margin-left: 16rpx;
}
.addr {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
  margin-top: 12rpx;
}
.edit {
  color: #00a8ff;
  font-size: 26rpx;
  padding: 16rpx 0 16rpx 28rpx;
}
.space {
  height: calc(160rpx + constant(safe-area-inset-bottom));
  height: calc(160rpx + env(safe-area-inset-bottom));
}
// 按钮固定悬浮在屏幕底部（有没有地址都在底部，不跟着内容走）
.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  padding: 0 24rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}
.add {
  &.disabled {
    opacity: 0.5;
  }
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #00a8ff, #0072ff);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
}
</style>
