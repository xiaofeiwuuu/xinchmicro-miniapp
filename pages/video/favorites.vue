<template>
  <view class="page">
    <LoadingState v-if="loading" />
    <RetryState v-else-if="failed" @retry="load" />
    <EmptyState v-else-if="!list.length" :text="$t('video.favEmpty')" />
    <view v-else class="list">
      <view v-for="v in list" :key="v.id" class="ep" @tap="play(v)">
        <view class="thumb">
          <image v-if="v.coverUrl" :src="v.coverUrl" mode="aspectFill" class="thumb-img"></image>
          <text v-else class="thumb-ph">▶</text>
          <text class="thumb-dur">{{ mmss(v.durationSec) }}</text>
        </view>
        <view class="ep-right">
          <view class="ep-main"><text class="ep-title">{{ v.title }}</text><text class="ep-sub">{{ v.courseTitle }}</text></view>
          <text :class="['tag', v.bought ? 'bought' : v.free ? 'free' : 'paid']">{{ tagText(v) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import LoadingState from '@/components/LoadingState.vue';
import RetryState from '@/components/RetryState.vue';
import EmptyState from '@/components/EmptyState.vue';
import { getVideoFavorites } from '@/api/shop.js';
import { safeNavigate } from '@/utils/nav.js';

export default {
  components: { LoadingState, RetryState, EmptyState },
  data() {
    return { loading: true, failed: false, list: [] };
  },
  // 从播放页取消收藏回来，列表要跟着刷新
  onShow() {
    this.load();
  },
  methods: {
    async load() {
      this.failed = false;
      try {
        const { data } = await getVideoFavorites();
        if (data.code !== 0) throw new Error('load failed');
        this.list = data.data;
      } catch (e) {
        if (!this.list.length) this.failed = true;
      } finally {
        this.loading = false;
      }
    },
    mmss(s) {
      s = Number(s) || 0;
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    },
    tagText(v) {
      if (v.bought) return this.$t('video.bought');
      return this.$t(v.free ? 'video.free' : v.trialSeconds ? 'video.trial' : 'video.paid');
    },
    play(v) {
      safeNavigate('/pages/video/play?id=' + v.id);
    }
  }
};
</script>

<style lang="scss">
.page { min-height: 100vh; background: #0e1a2d; padding: 24rpx; box-sizing: border-box; }
.ep { display: flex; align-items: stretch; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.ep:last-child { border-bottom: none; }
.ep-right { flex: 1; min-width: 0; display: flex; align-items: stretch; min-height: 146rpx; box-sizing: border-box; padding: 16rpx 4rpx 16rpx 24rpx; }
.ep-main { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; }
.ep-title { color: #fff; font-size: 32rpx; line-height: 1.4; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.ep-sub { color: rgba(255, 255, 255, 0.45); font-size: 26rpx; margin-top: 8rpx; }
.thumb { position: relative; width: 224rpx; flex-shrink: 0; margin: 10rpx 0; background: #1b2c47; overflow: hidden; border-radius: 8rpx; }
.thumb-img { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.thumb-ph { position: absolute; left: 0; top: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; color: rgba(255, 255, 255, 0.4); font-size: 40rpx; }
.thumb-dur { position: absolute; right: 0; bottom: 0; padding: 2rpx 10rpx; font-size: 22rpx; color: #fff; background: rgba(0, 0, 0, 0.6); border-top-left-radius: 8rpx; }
.tag { align-self: flex-start; font-size: 26rpx; padding: 6rpx 16rpx; border-radius: 8rpx; margin-left: 16rpx; flex-shrink: 0; }
.tag.free { color: #4cd964; border: 1px solid #4cd964; }
.tag.paid { color: #ffb84d; border: 1px solid #ffb84d; }
.tag.bought { color: #4da3ff; border: 1px solid #4da3ff; }
</style>
