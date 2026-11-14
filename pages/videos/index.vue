<template>
  <view class="page">
    <LoadingState v-if="loading" />
    <RetryState v-else-if="failed" @retry="load" />
    <EmptyState v-else-if="!list.length" :text="$t('video.empty')" />
    <view v-else class="grid">
      <view v-for="c in list" :key="c.id" class="card" @tap="open(c.id)">
        <view class="cover">
          <image v-if="c.coverUrl" :src="c.coverUrl" mode="aspectFill" class="cover-img"></image>
          <text v-else class="cover-ph">▶</text>
          <text v-if="c.freeCount" class="badge">{{ $t('video.freeN', { n: c.freeCount }) }}</text>
        </view>
        <view class="info">
          <text class="title">{{ c.title }}</text>
          <text class="meta">{{ $t('video.count', { n: c.count }) }} · {{ $t('video.plays', { n: fmt(c.playCount) }) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import LoadingState from '@/components/LoadingState.vue';
import RetryState from '@/components/RetryState.vue';
import EmptyState from '@/components/EmptyState.vue';
import { getVideoCourses } from '@/api/shop.js';
import { safeNavigate } from '@/utils/nav.js';
import { fmtCount } from '@/utils/video.js';

export default {
  components: { LoadingState, RetryState, EmptyState },
  data() {
    return { loading: true, failed: false, list: [] };
  },
  onShow() {
    this.load();
  },
  methods: {
    fmt: fmtCount,
    async load() {
      this.failed = false;
      if (!this.list.length) this.loading = true;
      try {
        const { data } = await getVideoCourses();
        if (data.code !== 0) throw new Error('load failed');
        this.list = data.data;
      } catch (e) {
        if (!this.list.length) this.failed = true;
      } finally {
        this.loading = false;
      }
    },
    open(id) {
      safeNavigate('/pages/video/course?id=' + id);
    }
  }
};
</script>

<style lang="scss">
.page { min-height: 100vh; background: #0e1a2d; padding: 24rpx; box-sizing: border-box; }
.grid { display: flex; flex-wrap: wrap; justify-content: space-between; }
.card { width: calc(50% - 10rpx); background: rgba(255, 255, 255, 0.06); border-radius: 16rpx; overflow: hidden; margin-bottom: 20rpx; }
.cover { position: relative; width: 100%; height: 200rpx; background: #1b2c47; display: flex; align-items: center; justify-content: center; }
.cover-img { width: 100%; height: 100%; }
.cover-ph { color: rgba(255, 255, 255, 0.4); font-size: 48rpx; }
.badge { position: absolute; left: 0; bottom: 0; padding: 4rpx 16rpx; font-size: 24rpx; color: #fff; background: rgba(76, 217, 100, 0.85); border-top-right-radius: 12rpx; }
.info { padding: 16rpx 18rpx 20rpx; display: flex; flex-direction: column; }
.title { color: #fff; font-size: 32rpx; font-weight: 600; line-height: 1.4; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.meta { color: rgba(255, 255, 255, 0.6); font-size: 26rpx; margin-top: 10rpx; }
</style>
