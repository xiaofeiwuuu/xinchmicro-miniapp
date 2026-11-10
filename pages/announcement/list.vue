<template>
  <view class="page">
    <RetryState v-if="failed" @retry="load" />
    <LoadingState v-else-if="!loaded" />
    <EmptyState v-else-if="loaded && !list.length" image="/static/empty/no-notice.webp" :text="$t('ann.empty')" />
    <scroll-view v-else scroll-y class="list">
      <view v-for="a in list" :key="a.id" class="card">
        <text class="title">{{ a.title }}</text>
        <text class="content" user-select>{{ a.content }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getAnnouncements } from '@/api/index.js';
import { logError } from '@/utils/logger.js';
import RetryState from '@/components/RetryState.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingState from '@/components/LoadingState.vue';

// 公告列表：和弹窗用同一个接口，显示当前生效的公告（最新的在前，最多 5 条）
export default {
  components: { RetryState, EmptyState, LoadingState },
  data() {
    return { list: [], loaded: false, failed: false };
  },
  onShow() {
    this.load();
  },
  methods: {
    async load() {
      this.failed = false;
      try {
        const { data } = await getAnnouncements();
        if (!data || data.code !== 0) throw new Error((data && data.message) || 'load failed');
        this.list = data.data || [];
        this.loaded = true;
      } catch (e) {
        logError('announcement.list', { error: (e && (e.errMsg || e.message)) || String(e) });
        if (!this.loaded) this.failed = true;
      }
    }
  }
};
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #0e1a2d;
}
.list {
  height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}
.card {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}
.title {
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
  word-break: break-all;
}
.content {
  margin-top: 16rpx;
  color: rgba(255, 255, 255, 0.75);
  font-size: 28rpx;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
