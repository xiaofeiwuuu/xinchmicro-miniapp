<template>
  <view class="full">
    <video v-if="src" id="fv" :src="src" :initial-time="startAt" class="fv" controls :autoplay="true" object-fit="contain" :show-fullscreen-btn="true" :show-background-playback-button="false" :enable-system-pip="false" :show-casting-button="false" :enable-progress-gesture="!p || p.mode !== 'trial'" @timeupdate="onTime" @controlstoggle="onCtrl" @fullscreenchange="onFsChange" @error="onError" />
    <text v-if="failed" class="msg">{{ $t('video.playFail') }}</text>
    <!-- 水印、清晰度、返回都盖在视频上面（和竖屏播放页一样的做法）；整页是自己做的横屏页，所以水印在「全屏」里也在 -->
    <watermark v-if="p" :p="p" fixed-top="24%" />
    <!-- 左上角：返回 + 视频标题（跟着控制栏显示/隐藏） -->
    <view :class="['back', { hide: !ctrlShow && !qOpen }]" :style="{ top: cap.top + 'px', height: cap.height + 'px' }" @tap="exit"><text class="back-i">‹</text><text class="back-t">{{ p ? p.title : $t('video.exitFull') }}</text></view>
    <!-- 右下角：和竖屏页一样，保留播放器自带的全屏按钮（这里点它是「退出全屏」），上面盖一块透明点击区域，点了回竖屏页。
         控制栏隐藏时这块不接收点击；万一进了微信原生全屏，fullscreenchange 里立刻退出 -->
    <view :class="['fs-hit', { off: !ctrlShow }]" @tap.stop="exit"></view>
    <view v-if="p && p.tiers && p.tiers.length" :class="['q-chip', { hide: !ctrlShow && !qOpen }]" :style="{ right: cap.right + 'px', top: cap.top + 'px', height: cap.height + 'px' }" @tap.stop="toggleMenu"><text>{{ curLabel }}</text><text v-if="p.tiers.length > 1" class="q-arrow">{{ qOpen ? '▴' : '▾' }}</text></view>
    <view v-if="qOpen" class="q-mask" @tap.stop="qOpen = false"></view>
    <view v-if="qOpen" class="q-menu" :style="{ right: cap.right + 'px', top: (cap.top + cap.height + 6) + 'px' }">
      <text :class="['q-item', { on: curQ === 'auto' }]" @tap.stop="setQuality('auto')">{{ $t('video.auto') }}</text>
      <text v-for="t in p.tiers" :key="t.height" :class="['q-item', { on: curQ === String(t.height) }]" @tap.stop="setQuality(String(t.height))">{{ t.label }}</text>
    </view>
    <view v-if="blocked" class="cover"><text class="cover-t">{{ $t('video.recording') }}</text><text class="cover-b" @tap="resume">{{ $t('video.resume') }}</text></view>
    <view v-if="trialEnd" class="cover"><text class="cover-t">{{ $t('video.trialEnd') }}</text></view>
  </view>
</template>

<script>
// 横屏全屏页：微信自带的全屏会把盖在视频上的水印弄没（全屏时页面上的元素被盖住），所以不用它，自己做一个整页横屏的播放页（pages.json 里设了 pageOrientation: landscape、自定义导航栏）。
// 保护都在：水印、录屏检测/黑屏、试看限制、不能小窗/投屏。进度和清晰度从竖屏页带过来，退出时再带回去。
import { getVideoPlay } from '@/api/shop.js';
import { takeVideoSession } from '@/utils/videoSession.js';
import { getCapsuleSpace } from '@/utils/system.js';
import Watermark from './components/Watermark.vue';

export default {
  components: { Watermark },
  data() {
    return { id: 0, p: null, src: '', curQ: 'auto', startAt: 0, lastTime: 0, qOpen: false, ctrlShow: true, cap: getCapsuleSpace(), blocked: false, trialEnd: false, failed: false };
  },
  computed: {
    curLabel() {
      const tiers = (this.p && this.p.tiers) || [];
      if (tiers.length === 1) return tiers[0].label;
      if (this.curQ === 'auto') return this.$t('video.auto');
      const hit = tiers.find((t) => t.height <= Number(this.curQ));
      return hit ? hit.label : this.$t('video.auto');
    }
  },
  async onLoad(q) {
    this.id = Number(q.id) || 0;
    this.protect();
    // 右上角是微信自带的胶囊按钮（它的位置已经算了刘海的安全区，这里不用再加）（关闭小程序），去不掉也不能挪；转成横屏后它的位置会变，所以转屏之后要重新取，并且窗口尺寸一变就再取
    this.placeChrome = () => { this.cap = getCapsuleSpace(); };
    setTimeout(this.placeChrome, 300);
    setTimeout(this.placeChrome, 1000);
    if (wx.onWindowResize) wx.onWindowResize(this.placeChrome);
    const s = takeVideoSession(this.id);
    if (s) {
      this.p = s.p; this.curQ = s.q || 'auto'; this.startAt = Math.floor(s.time || 0); this.lastTime = this.startAt;
      this.src = this.srcOf(this.curQ);
      return;
    }
    // 直接打开（没有从播放页带数据过来）：自己取一次
    try {
      const { data } = await getVideoPlay(this.id);
      if (data.code !== 0) throw new Error('play failed');
      this.p = data.data; this.src = this.p.url;
    } catch (e) {
      this.failed = true;
    }
  },
  onUnload() {
    try { if (wx.setVisualEffectOnCapture) wx.setVisualEffectOnCapture({ visualEffect: 'none' }); } catch (e) { /* ignore */ }
    try { if (wx.offWindowResize) wx.offWindowResize(this.placeChrome); } catch (e) { /* ignore */ }
    uni.$emit('video:full-exit', { id: this.id, time: this.lastTime, q: this.curQ });
  },
  methods: {
    // 防录屏：和竖屏播放页一样
    protect() {
      try {
        if (wx.setVisualEffectOnCapture) wx.setVisualEffectOnCapture({ visualEffect: 'hidden' });
        const on = (r) => { const s = r && (r.state !== undefined ? r.state : r.recording); return s === 'on' || s === 'start' || s === 'started' || s === true || s === 1; };
        if (wx.getScreenRecordingState) wx.getScreenRecordingState({ success: (r) => on(r) && this.block() });
        if (wx.onScreenRecordingStateChanged) wx.onScreenRecordingStateChanged((r) => on(r) && this.block());
      } catch (e) { /* 老版本没有这些接口，不影响播放 */ }
    },
    block() {
      this.blocked = true;
      try { uni.createVideoContext('fv', this).pause(); } catch (e) { /* ignore */ }
    },
    resume() {
      this.blocked = false;
      try { uni.createVideoContext('fv', this).play(); } catch (e) { /* ignore */ }
    },
    srcOf(q) {
      const tiers = (this.p && this.p.tiers) || [];
      if (q === 'auto' || !tiers.length) return this.p.url;
      const hit = tiers.find((t) => t.height <= Number(q));
      return hit ? hit.url : this.p.url;
    },
    onCtrl(e) {
      this.ctrlShow = !(e && e.detail && e.detail.show === false);
    },
    toggleMenu() {
      if (this.p && this.p.tiers && this.p.tiers.length > 1) this.qOpen = !this.qOpen;
    },
    setQuality(q) {
      this.qOpen = false;
      if (q === this.curQ) return;
      this.curQ = q;
      try { uni.setStorageSync('videoQuality', q); } catch (e) { /* 记不住就算了 */ }
      this.startAt = Math.floor(this.lastTime) || 0;
      const next = this.srcOf(q);
      this.ctrlShow = true;
      this.src = '';
      this.$nextTick(() => { this.src = next; });
    },
    // 试看：到点暂停并盖住（和竖屏页一样，是小程序端限制）
    onTime(e) {
      const t = e && e.detail && e.detail.currentTime;
      if (t >= 0) this.lastTime = t;
      if (!this.p || this.p.mode !== 'trial' || this.trialEnd) return;
      if (t >= this.p.trialSeconds) {
        this.trialEnd = true;
        try { uni.createVideoContext('fv', this).pause(); } catch (err) { /* ignore */ }
      }
    },
    onError() {
      uni.showToast({ title: this.$t('video.playFail'), icon: 'none' });
    },
    // 保险：进了微信原生全屏（没点准、手势触发）就立刻退出原生全屏，回竖屏页
    onFsChange(e) {
      if (!(e && e.detail && e.detail.fullScreen)) return;
      try { uni.createVideoContext('fv', this).exitFullScreen(); } catch (err) { /* ignore */ }
      this.exit();
    },
    exit() {
      uni.navigateBack();
    }
  }
};
</script>

<style lang="scss">
/* 这个页面是横屏，样式一律用 px，不能用 rpx：rpx 按屏幕宽度算（750rpx = 屏幕宽），横屏时宽度翻倍，字和按钮会跟着变成两倍大 */
page { background: #000; }
.full { position: fixed; left: 0; top: 0; right: 0; bottom: 0; background: #000; }
.fv { width: 100%; height: 100%; }
.msg { position: absolute; left: 0; right: 0; top: 45%; text-align: center; color: #fff; font-size: 15px; }
.back { box-sizing: border-box; position: absolute; left: calc(12px + env(safe-area-inset-left)); max-width: 60%; z-index: 8; display: flex; align-items: center; padding: 4px 12px 4px 8px; border-radius: 4px; background: rgba(0, 0, 0, 0.55); color: #fff; font-size: 14px; transition: opacity 0.25s; }
.back-i { font-size: 22px; line-height: 1; margin-right: 4px; flex-shrink: 0; }
.back-t { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fs-hit { position: absolute; right: 0; bottom: 0; width: calc(80px + env(safe-area-inset-right)); height: 60px; z-index: 8; }
.fs-hit.off { pointer-events: none; }
.q-chip { box-sizing: border-box; position: absolute; z-index: 8; display: flex; align-items: center; padding: 3px 9px; border-radius: 4px; background: rgba(0, 0, 0, 0.55); color: #fff; font-size: 13px; transition: opacity 0.25s; }
.back.hide, .q-chip.hide { opacity: 0; pointer-events: none; }
.q-arrow { margin-left: 4px; font-size: 11px; }
.q-mask { position: absolute; left: 0; top: 0; right: 0; bottom: 0; z-index: 7; }
.q-menu { position: absolute; z-index: 9; min-width: 80px; padding: 3px 0; border-radius: 5px; background: rgba(20, 28, 44, 0.95); }
.q-item { display: block; text-align: center; padding: 7px 14px; color: rgba(255, 255, 255, 0.85); font-size: 14px; }
.q-item.on { color: #4da3ff; font-weight: 600; }
.cover { position: absolute; left: 0; top: 0; right: 0; bottom: 0; background: #111; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; }
.cover-t { color: #fff; font-size: 16px; }
.cover-b { color: #4da3ff; font-size: 15px; margin-top: 12px; padding: 6px 12px; border: 1px solid #4da3ff; border-radius: 4px; }
</style>
