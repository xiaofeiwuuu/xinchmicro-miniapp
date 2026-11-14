<template>
  <view class="page">
    <LoadingState v-if="loading" />
    <EmptyState v-else-if="gone" :text="$t('video.gone')" />
    <RetryState v-else-if="failed" @retry="load" />
    <view v-else>
      <view class="head">
        <text class="h-title">{{ course.title }}</text>
        <text v-if="course.intro" class="h-intro">{{ course.intro }}</text>
      </view>
      <view v-if="course.videos.length" class="group">
        <view v-for="v in course.videos" :key="v.id" class="ep" @tap="play(v)">
          <view class="thumb">
            <image v-if="v.coverUrl" :src="v.coverUrl" mode="aspectFill" class="thumb-img"></image>
            <text v-else class="thumb-ph">▶</text>
            <text class="thumb-dur">{{ mmss(v.durationSec) }}</text>
          </view>
          <view class="ep-right">
            <view class="ep-main"><text class="ep-title">{{ v.title }}</text><text class="ep-sub">{{ counts(v) }}</text></view>
            <text :class="['tag', badge(v).cls]">{{ badge(v).text }}</text>
          </view>
        </view>
      </view>
      <view v-for="ch in course.chapters" :key="ch.id" class="group">
        <text class="g-title">{{ ch.title }}</text>
        <view v-for="v in ch.videos" :key="v.id" class="ep" @tap="play(v)">
          <view class="thumb">
            <image v-if="v.coverUrl" :src="v.coverUrl" mode="aspectFill" class="thumb-img"></image>
            <text v-else class="thumb-ph">▶</text>
            <text class="thumb-dur">{{ mmss(v.durationSec) }}</text>
          </view>
          <view class="ep-right">
            <view class="ep-main"><text class="ep-title">{{ v.title }}</text><text class="ep-sub">{{ counts(v) }}</text></view>
            <text :class="['tag', badge(v).cls]">{{ badge(v).text }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import LoadingState from '@/components/LoadingState.vue';
import RetryState from '@/components/RetryState.vue';
import EmptyState from '@/components/EmptyState.vue';
import { getVideoCourse } from '@/api/shop.js';
import { safeNavigate } from '@/utils/nav.js';
import { fmtCount } from '@/utils/video.js';

export default {
  components: { LoadingState, RetryState, EmptyState },
  data() {
    return { id: 0, loading: true, failed: false, gone: false, course: { title: '', intro: '', chapters: [], videos: [] } };
  },
  onLoad(q) {
    this.id = Number(q.id) || 0;
  },
  onShow() {
    this.load();
  },
  methods: {
    async load() {
      this.failed = false;
      try {
        const { data, statusCode } = await getVideoCourse(this.id);
        if (statusCode === 404 || (data && data.errorCode === 'NOT_FOUND')) { this.gone = true; return; }
        if (data.code !== 0) throw new Error('load failed');
        this.course = data.data;
      } catch (e) {
        this.failed = true;
      } finally {
        this.loading = false;
      }
    },
    // 播放量、购买量（购买量为 0 时不显示，免费的集本来就没有购买）
    counts(v) {
      const a = this.$t('video.plays', { n: fmtCount(v.playCount) });
      return v.buyCount > 0 && !v.free ? a + ' · ' + this.$t('video.buys', { n: fmtCount(v.buyCount) }) : a;
    },
    mmss(s) {
      s = Number(s) || 0;
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    },
    // 标签只说类型，不显示价格：免费 / 试看（收费但能试看）/ 付费
    badge(v) {
      if (v.free) return { text: this.$t('video.free'), cls: 'free' };
      if (v.bought) return { text: this.$t('video.bought'), cls: 'bought' };
      return { text: this.$t(v.trialSeconds ? 'video.trial' : 'video.paid'), cls: 'paid' };
    },
    play(v) {
      safeNavigate('/pages/video/play?id=' + v.id);
    }
  }
};
</script>

<style lang="scss">
.page { min-height: 100vh; background: #0e1a2d; padding: 24rpx; box-sizing: border-box; }
.head { padding: 8rpx 4rpx 24rpx; display: flex; flex-direction: column; }
.h-title { color: #fff; font-size: 40rpx; font-weight: 700; }
.h-intro { color: rgba(255, 255, 255, 0.6); font-size: 30rpx; margin-top: 12rpx; line-height: 1.5; }
.group { margin-bottom: 20rpx; }
.g-title { display: block; color: rgba(255, 255, 255, 0.7); font-size: 30rpx; padding: 20rpx 4rpx; }
.ep { display: flex; align-items: stretch; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.ep:last-child { border-bottom: none; }
.ep-right { flex: 1; min-width: 0; display: flex; align-items: stretch; min-height: 146rpx; box-sizing: border-box; padding: 16rpx 4rpx 16rpx 24rpx; }
.ep-main { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; }
.ep-title { color: #fff; font-size: 32rpx; line-height: 1.4; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
/* 封面贴左边，上下各留 10rpx 空白（图片 224×126，和点播截图的比例接近）；绝对定位铺满封面盒子 */
.thumb { position: relative; width: 224rpx; flex-shrink: 0; margin: 10rpx 0; background: #1b2c47; overflow: hidden; border-radius: 8rpx; }
.thumb-img { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.thumb-ph { position: absolute; left: 0; top: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; color: rgba(255, 255, 255, 0.4); font-size: 40rpx; }
.thumb-dur { position: absolute; right: 0; bottom: 0; padding: 2rpx 10rpx; font-size: 22rpx; color: #fff; background: rgba(0, 0, 0, 0.6); border-top-left-radius: 8rpx; }
.ep-sub { color: rgba(255, 255, 255, 0.45); font-size: 26rpx; margin-top: 8rpx; }
.tag { align-self: flex-start; font-size: 26rpx; padding: 6rpx 16rpx; border-radius: 8rpx; margin-left: 16rpx; flex-shrink: 0; }
.tag.free { color: #4cd964; border: 1px solid #4cd964; }
.tag.paid { color: #ffb84d; border: 1px solid #ffb84d; }
.tag.bought { color: #4da3ff; border: 1px solid #4da3ff; }
</style>
