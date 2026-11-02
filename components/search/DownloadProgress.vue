<template>
  <!-- 圆形下载进度条（右下角悬浮）：内圈下载进度，外圈剩余时间；长按 3 秒松手取消 -->
  <view class="download-progress-container">
    <view
      class="progress-circle"
      @touchstart="handleLongPressStart"
      @touchend="handleLongPressEnd"
      @touchcancel="handleLongPressEnd"
    >
      <canvas type="2d" id="progressCanvas" class="progress-canvas"></canvas>
      <view class="progress-info">
        <view class="progress-percent">{{ Math.round(progress) }}%</view>
      </view>
      <view class="long-press-hint" v-if="showHint">
        <view class="hint-text">{{
          canCancel ? $t('search.releaseCancel') : $t('search.holdCancel')
        }}</view>
      </view>
    </view>
  </view>
</template>

<script>
const SIZE = 180; // 画布逻辑尺寸
const CENTER = SIZE / 2;

export default {
  name: "DownloadProgress",
  props: {
    // 下载进度 0-100
    progress: {
      type: Number,
      default: 0,
    },
    // 最长下载时间（秒），外圈据此倒计时
    maxTime: {
      type: Number,
      default: 120,
    },
  },
  data() {
    return {
      elapsed: 0, // 已用时间（秒）
      showHint: false, // 是否显示长按提示
      canCancel: false, // 已按满 3 秒，松手即取消
    };
  },
  watch: {
    progress() {
      this.draw();
    },
    elapsed() {
      this.draw();
    },
  },
  mounted() {
    // 组件只在下载期间存在，挂载即开始计时
    this.startTime = Date.now();
    this.countdownTimer = setInterval(() => {
      this.elapsed = (Date.now() - this.startTime) / 1000;
    }, 100);
    // 等 DOM 渲染完成再取 canvas 节点
    this.initTimer = setTimeout(() => this.initCanvas(), 100);
  },
  beforeDestroy() {
    // 离开页面或下载结束时清理所有定时器，避免泄漏
    clearInterval(this.countdownTimer);
    clearTimeout(this.initTimer);
    clearTimeout(this.pressTimer);
  },
  methods: {
    initCanvas() {
      uni
        .createSelectorQuery()
        .in(this)
        .select("#progressCanvas")
        .fields({ node: true, size: true })
        .exec((res) => {
          // 取不到 canvas 时只是不显示进度环，不影响下载
          if (!(res && res[0] && res[0].node)) return;
          const canvas = res[0].node;
          const dpr = uni.getSystemInfoSync().pixelRatio || 2;
          canvas.width = SIZE * dpr;
          canvas.height = SIZE * dpr;
          const ctx = canvas.getContext("2d");
          ctx.scale(dpr, dpr);
          this.ctx = ctx;
          this.draw();
        });
    },

    draw() {
      const ctx = this.ctx;
      if (!ctx) return;
      ctx.clearRect(0, 0, SIZE, SIZE);

      // 1. 中心填充圆，随进度扩大
      const fillRadius = (this.progress / 100) * 35;
      if (fillRadius > 0) {
        const g = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, fillRadius);
        g.addColorStop(0, "rgba(82, 196, 26, 0.3)");
        g.addColorStop(1, "rgba(24, 144, 255, 0.1)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, fillRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. 外圈（倒计时）底环
      ctx.strokeStyle = "rgba(255, 100, 100, 0.2)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, 80, 0, Math.PI * 2);
      ctx.stroke();

      // 3. 外圈剩余时间：从满圆逐渐减少
      const used = Math.min(this.elapsed / this.maxTime, 1);
      const remaining = Math.PI * 2 * (1 - used);
      if (remaining > 0) {
        ctx.strokeStyle = "#ff4444";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, 80, -Math.PI / 2, -Math.PI / 2 + remaining);
        ctx.stroke();
      }

      // 4. 内圈（下载进度）底环
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, 65, 0, Math.PI * 2);
      ctx.stroke();

      // 5. 内圈进度（蓝绿渐变）
      if (this.progress > 0) {
        const g = ctx.createLinearGradient(0, 0, SIZE, SIZE);
        g.addColorStop(0, "#1890ff");
        g.addColorStop(1, "#52c41a");
        ctx.strokeStyle = g;
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(
          CENTER,
          CENTER,
          65,
          -Math.PI / 2,
          -Math.PI / 2 + (Math.PI * 2 * this.progress) / 100
        );
        ctx.stroke();
      }
    },

    // 长按开始：立即提示，3 秒后可松手取消
    handleLongPressStart() {
      this.showHint = true;
      this.canCancel = false;
      wx.vibrateShort({ type: "medium" });
      this.pressTimer = setTimeout(() => {
        this.canCancel = true;
        wx.vibrateShort({ type: "heavy" });
      }, 3000);
    },

    // 松手：已按满 3 秒则通知页面取消下载
    handleLongPressEnd() {
      clearTimeout(this.pressTimer);
      const cancel = this.canCancel;
      this.showHint = false;
      this.canCancel = false;
      if (cancel) this.$emit("cancel");
    },
  },
};
</script>

<style lang="scss">
.download-progress-container {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;

  .progress-circle {
    position: relative;
    width: 180rpx;
    height: 180rpx;
    background: rgba(0, 0, 0, 0.85);
    border-radius: 50%;
    backdrop-filter: blur(10px);
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;

    .progress-canvas {
      position: absolute;
      width: 180rpx;
      height: 180rpx;
      top: 0;
      left: 0;
    }

    .progress-info {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .progress-percent {
        font-size: 40rpx;
        font-weight: bold;
        color: #fff;
        text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.5);
      }
    }

    // 长按提示
    .long-press-hint {
      position: absolute;
      top: -60rpx;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 68, 68, 0.95);
      padding: 12rpx 24rpx;
      border-radius: 20rpx;
      white-space: nowrap;
      animation: bounceIn 0.3s ease;
      box-shadow: 0 4rpx 16rpx rgba(255, 68, 68, 0.4);

      &::after {
        content: "";
        position: absolute;
        bottom: -8rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8rpx solid transparent;
        border-right: 8rpx solid transparent;
        border-top: 8rpx solid rgba(255, 68, 68, 0.95);
      }

      .hint-text {
        font-size: 24rpx;
        color: #fff;
        font-weight: bold;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0.5);
  }
  60% {
    opacity: 1;
    transform: translateX(-50%) scale(1.1);
  }
  100% {
    transform: translateX(-50%) scale(1);
  }
}
</style>
