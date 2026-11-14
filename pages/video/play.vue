<template>
  <view class="page">
    <LoadingState v-if="loading" />
    <EmptyState v-else-if="gone" :text="$t('video.gone')" />
    <RetryState v-else-if="failed" @retry="init" />
    <view v-else>
      <!-- 播放区：不能播放时（没绑手机、没购买、取地址失败）在同样大小的黑框里说明，下面的详情和选集照常显示 -->
      <view class="box">
        <video v-if="p" id="player" :src="src" :initial-time="resumeAt" class="video" controls :autoplay="true" :show-fullscreen-btn="true" :show-background-playback-button="false" :enable-system-pip="false" :show-casting-button="false" :enable-progress-gesture="p.mode !== 'trial'" @timeupdate="onTime" @controlstoggle="onCtrl" @fullscreenchange="onFsChange" @error="onError" />
        <view v-else class="block">
          <image v-if="d.coverUrl" :src="d.coverUrl" mode="aspectFill" class="block-bg"></image>
          <view class="block-in">
            <text class="block-t">{{ blockText }}</text>
            <button v-if="need === 'phone'" class="block-btn" open-type="getPhoneNumber" @getphonenumber="onPhone">{{ $t('video.bindPhone') }}</button>
            <text v-else-if="need === 'retry'" class="block-btn ghost" @tap="loadPlay">{{ $t('common.retry') }}</text>
          </view>
        </view>
        <!-- 上面关掉了播放器自带的几个会让视频跑出画面的功能：后台小窗播放、系统画中画、投屏。视频一旦变成小窗或投到别处，盖在上面的水印就没有了，所以不能留。
             清晰度：盖在视频右上角的小标签，跟着播放器自带的控制栏一起显示和隐藏（video 的 controlstoggle 事件；菜单打开时一直显示），点开是下拉菜单（小程序的 video 不能往自带的控制栏里加按钮，只能在上面盖自己的元素）。
             「自动」是播放器按网速自己选档；手动选一档就固定在这一档，并从当前进度接着播。只有一档时只显示当前画质，不能点 -->
        <!-- 右上角：清晰度标签（全屏按钮在播放器自带控制栏的右下角，见下面的 fs-hit） -->
        <view v-if="p" :class="['q-bar', { hide: !ctrlShow && !qOpen }]">
          <view v-if="p.tiers && p.tiers.length" class="q-chip" @tap.stop="toggleMenu"><text>{{ curLabel }}</text><text v-if="p.tiers.length > 1" class="q-arrow">{{ qOpen ? '▴' : '▾' }}</text></view>
        </view>
        <!-- 全屏：保留微信自带的全屏按钮（还在控制栏右下角、看起来一样），但原生全屏里水印、清晰度这些盖在上面的东西都会没有，所以在它上面盖一块透明的点击区域，点了进我们自己做的横屏页。
             控制栏隐藏时这块不接收点击（不然点右下角想唤出控制栏，会误进全屏）。万一还是进了原生全屏（没点准），video 的 fullscreenchange 事件里立刻退出并转进横屏页 -->
        <view v-if="p" :class="['fs-hit', { off: !ctrlShow }]" @tap.stop="goFull"></view>
        <view v-if="qOpen" class="q-mask" @tap.stop="qOpen = false"></view>
        <view v-if="qOpen" class="q-menu">
          <text :class="['q-item', { on: curQ === 'auto' }]" @tap.stop="setQuality('auto')">{{ $t('video.auto') }}</text>
          <text v-for="t in p.tiers" :key="t.height" :class="['q-item', { on: curQ === String(t.height) }]" @tap.stop="setQuality(String(t.height))">{{ t.label }}</text>
        </view>
        <view v-if="blocked" class="cover"><text class="cover-t">{{ $t('video.recording') }}</text><text class="cover-b" @tap="resume">{{ $t('video.resume') }}</text></view>
        <view v-if="trialEnd" class="cover"><text class="cover-t">{{ $t('video.trialEnd') }}</text></view>
        <watermark v-if="p" :p="p" />
      </view>

      <!-- 详情 -->
      <view class="info">
        <view class="title-row">
          <text class="i-title">{{ d.title }}</text>
          <view :class="['fav', { on: d.favorited }]" @tap="toggleFav"><view :class="['fav-star', { on: d.favorited }]"></view><text class="fav-t">{{ d.favorited ? $t('video.faved') : $t('video.fav') }}</text></view>
        </view>
        <text class="i-meta">{{ d.courseTitle }}<text v-if="d.chapterTitle"> · {{ d.chapterTitle }}</text> · {{ mmss(d.durationSec) }}</text>
        <text class="i-meta">{{ counts(d) }}</text>
        <view class="price-row">
          <text v-if="d.free" class="p-free">{{ $t('video.free') }}</text>
          <template v-else>
            <text class="p-now">¥{{ yuan(d.priceFen) }}</text>
            <text v-if="d.listPriceFen" class="p-list">¥{{ yuan(d.listPriceFen) }}</text>
            <text v-if="d.listPriceFen" class="p-member">{{ $t('video.memberPrice') }}</text>
            <text v-if="d.trialSeconds" class="p-trial">{{ $t('video.trialTip', { n: d.trialSeconds }) }}</text>
          </template>
        </view>
        <view v-if="!d.owned" class="buy" @tap="buy">{{ $t('video.buy') }} ¥{{ yuan(d.priceFen) }}</view>
        <text v-else-if="d.bought" class="bought-tip">✓ {{ $t('video.bought') }}</text>
        <view v-if="d.intro" class="intro">
          <text class="intro-h">{{ $t('video.intro') }}</text>
          <text :class="['intro-t', { clamp: !openIntro && longIntro }]">{{ d.intro }}</text>
          <view v-if="longIntro" class="intro-toggle" @tap="openIntro = !openIntro"><text>{{ openIntro ? $t('video.fold') : $t('video.unfold') }}</text><text :class="['arrow', { up: openIntro }]">▾</text></view>
        </view>
      </view>

      <!-- 选集：同一课程里的其它视频，当前这一集高亮；点了就在本页切换，不叠页面 -->
      <view v-if="total > 1" class="list">
        <text class="list-h">{{ $t('video.episodes') }}（{{ total }}）</text>
        <view v-for="v in course.videos" :key="v.id" :class="['ep', { on: v.id === id }]" @tap="switchTo(v.id)">
          <view class="thumb">
            <image v-if="v.coverUrl" :src="v.coverUrl" mode="aspectFill" class="thumb-img"></image>
            <text v-else class="thumb-ph">▶</text>
            <text class="thumb-dur">{{ mmss(v.durationSec) }}</text>
          </view>
          <view class="ep-right">
            <view class="ep-main"><text class="ep-title">{{ v.title }}</text><text class="ep-sub">{{ counts(v) }}</text></view>
            <text :class="['tag', v.bought ? 'bought' : v.free ? 'free' : 'paid']">{{ tagText(v) }}</text>
          </view>
        </view>
        <view v-for="ch in course.chapters" :key="ch.id">
          <text class="ch-title">{{ ch.title }}</text>
          <view v-for="v in ch.videos" :key="v.id" :class="['ep', { on: v.id === id }]" @tap="switchTo(v.id)">
            <view class="thumb">
            <image v-if="v.coverUrl" :src="v.coverUrl" mode="aspectFill" class="thumb-img"></image>
            <text v-else class="thumb-ph">▶</text>
            <text class="thumb-dur">{{ mmss(v.durationSec) }}</text>
          </view>
          <view class="ep-right">
            <view class="ep-main"><text class="ep-title">{{ v.title }}</text><text class="ep-sub">{{ counts(v) }}</text></view>
            <text :class="['tag', v.bought ? 'bought' : v.free ? 'free' : 'paid']">{{ tagText(v) }}</text>
          </view>
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
import { getVideoDetail, getVideoCourse, getVideoPlay, bindPhone, setVideoFavorite } from '@/api/shop.js';
import { customerState } from '@/utils/customer.js';
import { fmtCount } from '@/utils/video.js';
import { safeNavigate } from '@/utils/nav.js';
import Watermark from './components/Watermark.vue';
import { setVideoSession } from '@/utils/videoSession.js';

export default {
  components: { LoadingState, RetryState, EmptyState, Watermark },
  data() {
    return {
      src: '', qOpen: false, ctrlShow: true, curQ: 'auto', resumeAt: 0, lastTime: 0, id: 0, favBusy: false, loading: true, failed: false, gone: false, need: '', d: {}, course: { chapters: [], videos: [] },
      p: null, openIntro: false, blocked: false, trialEnd: false
    };
  },
  computed: {
    // 标签上显示的画质：自动 / 手动选的那一档（没有那一档时，是实际用的最接近的一档）
    curLabel() {
      const tiers = (this.p && this.p.tiers) || [];
      if (tiers.length === 1) return tiers[0].label;
      if (this.curQ === 'auto') return this.$t('video.auto');
      const hit = tiers.find((t) => t.height <= Number(this.curQ));
      return hit ? hit.label : this.$t('video.auto');
    },
    // 简介超过 3 行才出现「展开」：小程序里量不准文字行数，按字数和换行估计（一行约 22 个字）
    longIntro() {
      const t = String((this.d && this.d.intro) || '');
      return t.length > 60 || t.split('\n').length > 3;
    },
    total() {
      return this.course.videos.length + this.course.chapters.reduce((n, c) => n + c.videos.length, 0);
    },
    blockText() {
      return { phone: this.$t('video.needPhone'), buy: this.$t('video.needBuy'), retry: this.$t('video.playFail') }[this.need] || '';
    }
  },
  onLoad(q) {
    this.id = Number(q.id) || 0;
    this.protect();
    // 在购买页付款成功后回到这里：重新取详情和播放地址（买过的就能完整看了）
    this.onBought = (id) => { if (id === this.id) this.init(); };
    uni.$on('video:bought', this.onBought);
    // 从横屏全屏页退出回来：从那边的进度和清晰度接着播
    this.onFullExit = (r) => {
      if (r.id !== this.id || !this.p) return;
      this.curQ = r.q || 'auto';
      this.resumeAt = Math.floor(r.time) || 0;
      this.ctrlShow = true;
      const next = this.srcOf(this.curQ);
      this.src = '';
      this.$nextTick(() => { this.src = next; });
    };
    uni.$on('video:full-exit', this.onFullExit);
    this.init();
  },
  onUnload() {
    uni.$off('video:bought', this.onBought);
    uni.$off('video:full-exit', this.onFullExit);
    try { if (wx.setVisualEffectOnCapture) wx.setVisualEffectOnCapture({ visualEffect: 'none' }); } catch (e) { /* ignore */ }
  },
  methods: {
    yuan(fen) {
      return (Number(fen) / 100).toFixed(2).replace(/\.00$/, '');
    },
    counts(v) {
      const a = this.$t('video.plays', { n: fmtCount(v.playCount) });
      return v.buyCount > 0 && !v.free ? a + ' · ' + this.$t('video.buys', { n: fmtCount(v.buyCount) }) : a;
    },
    tagText(v) {
      if (v.bought) return this.$t('video.bought');
      return this.$t(v.free ? 'video.free' : v.trialSeconds ? 'video.trial' : 'video.paid');
    },
    mmss(s) {
      s = Number(s) || 0;
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    },
    // 防录屏：安卓用微信的「录屏/截屏时画面变黑」；iOS 不能变黑，只能发现录屏就暂停并遮住
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
      try { uni.createVideoContext('player', this).pause(); } catch (e) { /* ignore */ }
    },
    resume() {
      this.blocked = false;
      try { uni.createVideoContext('player', this).play(); } catch (e) { /* ignore */ }
    },
    // 先取详情（标题、价格、所在课程），再并行取选集和播放地址
    async init() {
      this.failed = false; this.gone = false; this.loading = true; this.openIntro = false; this.p = null; this.need = ''; this.trialEnd = false;
      try {
        const { data, statusCode } = await getVideoDetail(this.id);
        if (statusCode === 404 || (data && data.errorCode === 'NOT_FOUND')) { this.gone = true; return; }
        if (data.code !== 0) throw new Error('load failed');
        this.d = data.data;
        this.loadList(data.data.courseId);
        this.loading = false;
        await this.loadPlay();
      } catch (e) {
        this.failed = true;
      } finally {
        this.loading = false;
      }
    },
    async loadList(courseId) {
      if (this.course.id === courseId) return;
      try {
        const { data } = await getVideoCourse(courseId);
        if (data.code === 0) this.course = data.data;
      } catch (e) { /* 选集取不到不影响播放 */ }
    },
    async loadPlay() {
      this.need = ''; this.p = null;
      try {
        const { data } = await getVideoPlay(this.id);
        if (data.code === 0) { this.p = data.data; this.curQ = this.savedQuality(); this.resumeAt = 0; this.src = this.srcOf(this.curQ); return; }
        if (data.errorCode === 'PHONE_REQUIRED') this.need = 'phone';
        else if (data.errorCode === 'NOT_PURCHASED') this.need = 'buy';
        else this.need = 'retry';
      } catch (e) {
        this.need = 'retry';
      }
    },
    switchTo(id) {
      if (id === this.id) return;
      this.id = id;
      this.init();
    },
    // 收藏 / 取消：先改界面，失败再改回来；处理中不能连点
    async toggleFav() {
      if (this.favBusy) return;
      this.favBusy = true;
      const on = !this.d.favorited;
      this.d = { ...this.d, favorited: on };
      try {
        const { data } = await setVideoFavorite(this.id, on);
        if (data.code !== 0) throw new Error('fav failed');
        uni.showToast({ title: this.$t(on ? 'video.favOn' : 'video.favOff'), icon: 'none' });
      } catch (e) {
        this.d = { ...this.d, favorited: !on };
        uni.showToast({ title: this.$t('video.favFail'), icon: 'none' });
      } finally {
        this.favBusy = false;
      }
    },
    // 上次选的清晰度（记在手机上）。这个视频没有那一档就用最接近且不更高的，再没有就自动
    savedQuality() {
      try { return uni.getStorageSync('videoQuality') || 'auto'; } catch (e) { return 'auto'; }
    },
    srcOf(q) {
      const tiers = (this.p && this.p.tiers) || [];
      if (q === 'auto' || !tiers.length) return this.p.url;
      const want = Number(q);
      const hit = tiers.find((t) => t.height <= want); // tiers 是高到低排的：第一个不高于想要的
      return hit ? hit.url : this.p.url;
    },
    // 播放器的控制栏显示 / 隐藏时跟着变。事件不触发的老版本，标签就一直显示
    onCtrl(e) {
      this.ctrlShow = !(e && e.detail && e.detail.show === false);
    },
    // 保险：进了微信原生全屏（没点在盖着的区域上，或手势触发）就立刻退出，转进我们的横屏页，不让客户在没有水印的原生全屏里看
    onFsChange(e) {
      if (!(e && e.detail && e.detail.fullScreen)) return;
      try { uni.createVideoContext('player', this).exitFullScreen(); } catch (err) { /* ignore */ }
      this.goFull();
    },
    // 进入横屏全屏页：先暂停这边，把已经取到的播放数据和当前进度、清晰度交给它
    goFull() {
      try { uni.createVideoContext('player', this).pause(); } catch (e) { /* ignore */ }
      setVideoSession({ id: this.id, p: this.p, q: this.curQ, time: this.lastTime });
      safeNavigate('/pages/video/full?id=' + this.id);
    },
    toggleMenu() {
      if (this.p && this.p.tiers && this.p.tiers.length > 1) this.qOpen = !this.qOpen;
    },
    setQuality(q) {
      this.qOpen = false;
      if (q === this.curQ) return;
      this.curQ = q;
      try { uni.setStorageSync('videoQuality', q); } catch (e) { /* 记不住就算了 */ }
      this.resumeAt = Math.floor(this.lastTime) || 0;
      const next = this.srcOf(q);
      this.ctrlShow = true; // 换地址后控制栏会重新出现
      this.src = ''; // 先清空再换地址，播放器才会重新加载
      this.$nextTick(() => { this.src = next; });
    },
    buy() {
      safeNavigate('/pages/video/buy?id=' + this.id);
    },
    async onPhone(e) {
      const d = e.detail || {};
      if (!d.code) return;
      try {
        const { data } = await bindPhone(d.code);
        if (data.code !== 0) throw new Error('bind failed');
        customerState.customer = { ...(customerState.customer || {}), phone: data.data.phone };
        this.loadPlay();
      } catch (err) {
        uni.showToast({ title: this.$t('prof.phoneFail'), icon: 'none' });
      }
    },
    // 试看：到点暂停并盖住。（这是小程序端限制，服务端给的是完整视频流；要防止绕过，购买功能做时再改成服务端只发试看片段）
    onTime(e) {
      const t = e && e.detail && e.detail.currentTime;
      if (t >= 0) this.lastTime = t; // 切清晰度时从这里接着播
      if (!this.p || this.p.mode !== 'trial' || this.trialEnd) return;
      if (t >= this.p.trialSeconds) {
        this.trialEnd = true;
        try { uni.createVideoContext('player', this).pause(); } catch (err) { /* ignore */ }
      }
    },
    onError() {
      uni.showToast({ title: this.$t('video.playFail'), icon: 'none' });
    }
  }
};
</script>

<style lang="scss">
.page { min-height: 100vh; background: #0e1a2d; padding-bottom: 48rpx; }
.box { position: relative; width: 100%; height: 422rpx; background: #000; }
.video { width: 100%; height: 422rpx; }
.block { position: relative; width: 100%; height: 422rpx; background: #111; overflow: hidden; }
.block-bg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; opacity: 0.25; }
.block-in { position: absolute; left: 0; top: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 48rpx; }
.block-t { color: #fff; font-size: 32rpx; text-align: center; line-height: 1.6; }
.block-btn { margin-top: 28rpx; padding: 0 48rpx; height: 80rpx; line-height: 80rpx; border-radius: 40rpx; background: #1677ff; color: #fff; font-size: 32rpx; }
.block-btn.ghost { background: transparent; border: 1px solid #4da3ff; color: #4da3ff; }
.cover { position: absolute; left: 0; top: 0; right: 0; bottom: 0; background: #111; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; }
.cover-t { color: #fff; font-size: 32rpx; }
.cover-b { color: #4da3ff; font-size: 30rpx; margin-top: 24rpx; padding: 12rpx 24rpx; border: 1px solid #4da3ff; border-radius: 8rpx; }
.q-bar { position: absolute; right: 16rpx; top: 16rpx; z-index: 8; display: flex; align-items: center; transition: opacity 0.25s; }
.q-bar.hide { opacity: 0; pointer-events: none; }
.fs-hit { position: absolute; right: 0; bottom: 0; width: 128rpx; height: 104rpx; z-index: 8; }
.fs-hit.off { pointer-events: none; }
.q-chip { display: flex; align-items: center; padding: 6rpx 18rpx; margin-left: 12rpx; border-radius: 8rpx; background: rgba(0, 0, 0, 0.55); color: #fff; font-size: 26rpx; }
.q-arrow { margin-left: 8rpx; font-size: 22rpx; }
.q-mask { position: absolute; left: 0; top: 0; right: 0; bottom: 0; z-index: 7; }
.q-menu { position: absolute; right: 16rpx; top: 68rpx; z-index: 9; min-width: 160rpx; padding: 6rpx 0; border-radius: 10rpx; background: rgba(20, 28, 44, 0.95); }
.q-item { display: block; text-align: center; padding: 14rpx 28rpx; color: rgba(255, 255, 255, 0.85); font-size: 28rpx; }
.q-item.on { color: #4da3ff; font-weight: 600; }
.info { padding: 28rpx; display: flex; flex-direction: column; }
.title-row { display: flex; align-items: flex-start; }
.title-row .i-title { flex: 1; min-width: 0; }
.fav { flex-shrink: 0; width: 120rpx; margin-left: 20rpx; display: flex; flex-direction: column; align-items: center; color: rgba(255, 255, 255, 0.6); }
.fav.on { color: #ffc53d; }
/* 圆润的五角星：SVG（描边加圆角的连接处）做成 base64 背景图，不用字体符号（字体里的星是尖角，各手机还不一样大）。灰色空心 / 黄色实心 */
.fav-star { width: 48rpx; height: 48rpx; background-size: 100% 100%; background-repeat: no-repeat; background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBvbHlnb24gcG9pbnRzPSIxMi4wMCw0LjIwIDE0LjUzLDkuMzIgMjAuMTgsMTAuMTQgMTYuMDksMTQuMTMgMTcuMDUsMTkuNzYgMTIuMDAsMTcuMTAgNi45NSwxOS43NiA3LjkxLDE0LjEzIDMuODIsMTAuMTQgOS40Nyw5LjMyIiBmaWxsPSJub25lIiBzdHJva2U9IiNiOGJmY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"); }
.fav-star.on { background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBvbHlnb24gcG9pbnRzPSIxMi4wMCw0LjIwIDE0LjUzLDkuMzIgMjAuMTgsMTAuMTQgMTYuMDksMTQuMTMgMTcuMDUsMTkuNzYgMTIuMDAsMTcuMTAgNi45NSwxOS43NiA3LjkxLDE0LjEzIDMuODIsMTAuMTQgOS40Nyw5LjMyIiBmaWxsPSIjZmZjNTNkIiBzdHJva2U9IiNmZmM1M2QiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"); }
.fav-t { font-size: 24rpx; white-space: nowrap; }
.i-title { color: #fff; font-size: 38rpx; font-weight: 700; line-height: 1.4; }
.i-meta { color: rgba(255, 255, 255, 0.5); font-size: 28rpx; margin-top: 10rpx; }
.price-row { display: flex; align-items: center; flex-wrap: wrap; margin-top: 20rpx; min-height: 56rpx; }
.p-free { color: #4cd964; font-size: 38rpx; font-weight: 700; }
.p-now { color: #ff6b57; font-size: 44rpx; font-weight: 700; line-height: 1; }
.p-list { color: rgba(255, 255, 255, 0.4); font-size: 28rpx; text-decoration: line-through; margin-left: 14rpx; line-height: 1; }
.p-member { color: #ffb84d; border: 1px solid #ffb84d; font-size: 24rpx; padding: 2rpx 10rpx; border-radius: 6rpx; margin-left: 12rpx; line-height: 1.2; }
.p-trial { color: rgba(255, 255, 255, 0.55); font-size: 28rpx; margin-left: 20rpx; }
.bought-tip { margin-top: 20rpx; color: #4da3ff; font-size: 30rpx; }
.buy { margin-top: 24rpx; height: 88rpx; line-height: 88rpx; text-align: center; border-radius: 44rpx; background: #1677ff; color: #fff; font-size: 34rpx; }
.intro { margin-top: 28rpx; display: flex; flex-direction: column; }
.intro-h { color: rgba(255, 255, 255, 0.7); font-size: 30rpx; margin-bottom: 10rpx; }
.intro-t { color: rgba(255, 255, 255, 0.6); font-size: 30rpx; line-height: 1.6; word-break: break-all; }
.intro-t.clamp { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
.intro-toggle { align-self: flex-start; display: flex; align-items: center; padding: 12rpx 0 0; color: #4da3ff; font-size: 30rpx; }
.intro-toggle .arrow { margin-left: 6rpx; font-size: 22rpx; transition: transform 0.2s; }
.intro-toggle .arrow.up { transform: rotate(180deg); }
.list { margin: 0 24rpx; }
.list-h { display: block; color: rgba(255, 255, 255, 0.7); font-size: 30rpx; padding: 20rpx 4rpx 8rpx; }
.ch-title { display: block; color: rgba(255, 255, 255, 0.5); font-size: 28rpx; padding: 20rpx 4rpx 8rpx; }
/* 每一集：封面和标题在同一个整行里，下划线画在整行底部（和课程详情页同样的样子）；封面贴左边，上下各留 10rpx */
.ep { display: flex; align-items: stretch; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.ep:last-child { border-bottom: none; }
.ep-right { flex: 1; min-width: 0; display: flex; align-items: stretch; min-height: 146rpx; box-sizing: border-box; padding: 16rpx 4rpx 16rpx 24rpx; }
.ep-main { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; }
.ep.on .ep-title { color: #4da3ff; font-weight: 600; }
.ep-sub { color: rgba(255, 255, 255, 0.45); font-size: 26rpx; margin-top: 8rpx; }
.ep-title { color: #fff; font-size: 32rpx; line-height: 1.4; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.thumb { position: relative; width: 224rpx; flex-shrink: 0; margin: 10rpx 0; background: #1b2c47; overflow: hidden; border-radius: 8rpx; }
.thumb-img { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.thumb-ph { position: absolute; left: 0; top: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; color: rgba(255, 255, 255, 0.4); font-size: 40rpx; }
.thumb-dur { position: absolute; right: 0; bottom: 0; padding: 2rpx 10rpx; font-size: 22rpx; color: #fff; background: rgba(0, 0, 0, 0.6); border-top-left-radius: 8rpx; }
.tag { align-self: flex-start; font-size: 26rpx; padding: 6rpx 16rpx; border-radius: 8rpx; margin-left: 16rpx; flex-shrink: 0; }
.tag.free { color: #4cd964; border: 1px solid #4cd964; }
.tag.paid { color: #ffb84d; border: 1px solid #ffb84d; }
.tag.bought { color: #4da3ff; border: 1px solid #4da3ff; }
</style>
