<!-- 公告弹窗：打开小程序时从服务端取当前生效的公告，没看过的依次弹出（一次最多 5 条）。
     每条公告每台设备只弹一次，后台改了内容会再弹一次。取不到公告（没网、服务端出错）就什么都不弹，不影响使用。 -->
<template>
  <view v-if="current" class="ann-mask" @touchmove.stop.prevent>
    <view class="ann-card">
      <view class="ann-head">
        <text class="ann-title">{{ current.title }}</text>
        <text v-if="queue.length > 1" class="ann-count">{{ index + 1 }}/{{ queue.length }}</text>
      </view>
      <scroll-view scroll-y class="ann-body">
        <text class="ann-content" user-select>{{ current.content }}</text>
      </scroll-view>
      <view class="ann-btn" @tap="close"><text>{{ $t('ann.ok') }}</text></view>
    </view>
  </view>
</template>

<script>
import { getAnnouncements } from '@/api/index.js';
import { readSeen, writeSeen, pickUnseen } from '@/utils/announcement.js';
import { logError } from '@/utils/logger.js';

export default {
  name: 'AnnouncementPopup',
  data() {
    return { queue: [], index: 0 };
  },
  computed: {
    current() {
      return this.queue[this.index] || null;
    }
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      try {
        const { data } = await getAnnouncements();
        if (!data || data.code !== 0) return;
        this.queue = pickUnseen(data.data, readSeen());
        this.index = 0;
      } catch (e) {
        logError('announcement.load', { error: (e && (e.errMsg || e.message)) || String(e) });
      }
    },
    // 点「知道了」才算看过；然后弹下一条
    close() {
      const a = this.current;
      if (a) {
        const seen = readSeen();
        seen[a.id] = a.version;
        writeSeen(seen);
      }
      this.index += 1;
    }
  }
};
</script>

<style lang="scss">
.ann-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ann-card {
  width: 600rpx;
  // 公告很短时也不要缩成一小条；正文区会撑满中间，按钮落在底部
  min-height: 560rpx;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: #16263f;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
  padding: 40rpx 36rpx 32rpx;
  box-sizing: border-box;
}
.ann-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
}
.ann-title {
  align-self: stretch;
  text-align: center;
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
  word-break: break-all;
}
.ann-count {
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
}
.ann-body {
  flex: 1;
  min-height: 0;
  max-height: 44vh;
}
.ann-content {
  color: rgba(255, 255, 255, 0.85);
  font-size: 28rpx;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
}
.ann-btn {
  margin-top: 32rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #00a8ff, #0072ff);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
}
</style>
