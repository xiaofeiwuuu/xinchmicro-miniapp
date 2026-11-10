<template>
  <view class="page">
    <RetryState v-if="failed" @retry="load" />
    <LoadingState v-else-if="!loaded" />
    <EmptyState v-else-if="loaded && !list.length" image="/static/empty/no-invoice.png" :text="$t('inv.empty')" />
    <scroll-view v-else scroll-y class="list">
      <view v-for="t in list" :key="t.id" class="card" @tap="edit(t)">
        <view class="main">
          <view class="top">
            <text class="name">{{ t.title }}</text>
          </view>
          <!-- 标签：个人 / 企业；普票 / 专票（专票要填全注册地址、电话、开户银行和账号，没填全和个人抬头都只能开普票）；默认 -->
          <view class="tags">
            <text class="tag">{{ $t(t.kind === 'personal' ? 'inv.personalTag' : 'inv.kindCompany') }}</text>
            <text class="tag">{{ $t(complete(t) ? 'inv.tagSpecial' : 'inv.tagNormal') }}</text>
            <text v-if="t.isDefault" class="tag tag-default">{{ $t('inv.default') }}</text>
          </view>
          <text v-if="t.kind !== 'personal'" class="line">{{ $t('inv.taxId') }}：{{ t.taxId }}</text>
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
import LoadingState from '@/components/LoadingState.vue';

export default {
  components: { RetryState, EmptyState, LoadingState },
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
  flex: 1;
  min-width: 0; // 名称再长也只在左侧这一栏里换行，不会把右边的「编辑」挤走
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.4;
  word-break: break-all;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 14rpx;
  margin-bottom: -8rpx; // 抵掉最后一行标签的底部间距
}
.tag {
  flex-shrink: 0;
  height: 44rpx;
  padding: 0 16rpx;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  color: #00a8ff;
  border: 1px solid #00a8ff;
  border-radius: 10rpx;
  font-size: 24rpx;
  white-space: nowrap; // 标签文字本身不换行，放不下就整个标签换到下一行
  margin-right: 14rpx;
  margin-bottom: 8rpx;
}
.tag-default {
  color: #ffb74d;
  border-color: #ffb74d;
}
.line {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
  margin-top: 20rpx;
  word-break: break-all;
}
// 右栏固定宽度，左栏占剩下的全部
.edit {
  flex-shrink: 0;
  width: 112rpx;
  box-sizing: border-box;
  text-align: right;
  white-space: nowrap;
  color: #00a8ff;
  font-size: 26rpx;
  padding: 16rpx 0;
}
.space {
  height: calc(184rpx + constant(safe-area-inset-bottom));
  height: calc(184rpx + env(safe-area-inset-bottom));
}
// 按钮固定悬浮在屏幕底部
.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  padding: 0 24rpx;
  padding-bottom: calc(48rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
}
.add {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 48rpx;
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
