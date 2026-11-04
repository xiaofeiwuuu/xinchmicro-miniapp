<template>
  <view class="page">
    <RetryState v-if="failed" @retry="load" />
    <EmptyState v-else-if="loaded && !list.length" :text="$t('inv.empty')" />
    <scroll-view v-else scroll-y class="list">
      <view v-for="t in list" :key="t.id" class="card" @tap="edit(t)">
        <view class="main">
          <view class="top">
            <text class="name">{{ t.title }}</text>
            <text v-if="t.isDefault" class="tag">{{ $t('inv.default') }}</text>
          </view>
          <text class="line">{{ $t('inv.taxId') }}：{{ t.taxId }}</text>
          <!-- 专票要填全注册地址、电话、开户银行和账号：没填全的抬头只能开普票，这里提前提示 -->
          <text v-if="!complete(t)" class="warn">{{ $t('inv.normalOnly') }}</text>
        </view>
        <view class="edit" @tap.stop="edit(t)"><text>{{ $t('addr.edit') }}</text></view>
      </view>
      <view class="space"></view>
    </scroll-view>

    <view class="footer">
      <view class="add" :class="{ disabled: list.length >= max }" @tap="add"><text>{{ $t('inv.add') }}</text></view>
    </view>
  </view>
</template>

<script>
import { getInvoiceTitles, titleComplete, MAX_INVOICE_TITLES } from '@/api/shop.js';
import { safeNavigate } from '@/utils/nav.js';
import { logError } from '@/utils/logger.js';
import RetryState from '@/components/RetryState.vue';
import EmptyState from '@/components/EmptyState.vue';

export default {
  components: { RetryState, EmptyState },
  data() {
    return { list: [], loaded: false, failed: false, max: MAX_INVOICE_TITLES };
  },
  onShow() {
    this.load();
  },
  methods: {
    complete: titleComplete,
    async load() {
      this.failed = false;
      try {
        const { data } = await getInvoiceTitles();
        if (data.code !== 0) throw new Error(data.message || 'load failed');
        this.list = data.data || [];
        this.loaded = true;
      } catch (e) {
        logError('invoice.titles.load', { error: (e && (e.errMsg || e.message)) || String(e) });
        if (!this.loaded) this.failed = true;
      }
    },
    add() {
      if (this.list.length >= this.max) return uni.showToast({ title: this.$t('inv.limit', { n: this.max }), icon: 'none' });
      safeNavigate('/pages/invoice/edit');
    },
    edit(t) {
      safeNavigate('/pages/invoice/edit?id=' + t.id);
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
  word-break: break-all;
}
.tag {
  flex-shrink: 0;
  color: #00a8ff;
  border: 1px solid #00a8ff;
  border-radius: 8rpx;
  font-size: 20rpx;
  padding: 0 10rpx;
  margin-left: 16rpx;
}
.line {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
  margin-top: 12rpx;
}
.warn {
  color: #ffb74d;
  font-size: 24rpx;
  margin-top: 10rpx;
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
// 按钮固定悬浮在屏幕底部
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

  &.disabled {
    opacity: 0.5;
  }
}
</style>
