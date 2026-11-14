<template>
  <view class="wm">
    <!-- 水印：一明一淡两层，每层两行（昵称 + 完整手机号，和水印码）。明的固定在左上角不动；半透明的那层沿一条路线在画面里一直慢慢飘（CSS 动画，不是定时换位置），起点随机。
         竖屏播放页和横屏全屏页共用这个组件，上层的容器要是 position: relative / fixed（水印是绝对定位铺在它里面） -->
    <view class="mark m-a" :style="{ top: fixedTop }"><text v-if="p.markName || p.markPhone" class="mk-l">{{ p.markName }} {{ p.markPhone }}</text><text class="mk-l">{{ p.mark }}</text></view>
    <view class="mark faint m-b" :style="{ animationDelay: delay + 's' }"><text v-if="p.markName || p.markPhone" class="mk-l">{{ p.markName }} {{ p.markPhone }}</text><text class="mk-l">{{ p.mark }}</text></view>
  </view>
</template>

<script>
export default {
  name: 'VideoWatermark',
  // fixedTop：固定的那层水印离上边多远。竖屏默认 6%；横屏页左上角有返回按钮，要往下放一点，不然两个叠在一起
  props: { p: { type: Object, required: true }, fixedTop: { type: String, default: '6%' } },
  data() {
    return { delay: -Math.random() * 32 };
  }
};
</script>

<style lang="scss">
/* 容器本身不挡点击，铺满上层容器 */
.wm { position: absolute; left: 0; top: 0; right: 0; bottom: 0; z-index: 5; pointer-events: none; }
/* 两行文字，每行不换行 */
.mark { position: absolute; display: flex; flex-direction: column; color: rgba(255, 255, 255, 0.5); font-size: 11px; line-height: 1.4; white-space: nowrap; letter-spacing: 1px; pointer-events: none; text-shadow: 0 0 2px rgba(0, 0, 0, 0.6); }
.mark.faint { color: rgba(255, 255, 255, 0.12); text-shadow: none; }
.mk-l { display: block; }
/* 单位用 px 不用 rpx：rpx 按屏幕宽度算，横屏时宽度翻倍，字会跟着翻倍（横屏全屏页也用这个组件）。
   明的固定在左上角；半透明的沿路线飘，路线不出画面（左 ≤48%、上 ≤72%，两行文字最宽约 160px、高约 31px；竖屏画面宽 375px、高 211px，横屏更宽更矮时上限仍然够用），
   匀速、首尾相接、无限循环；负的 animation-delay 让每次打开的起点不一样。一圈 32 秒，看起来是在慢慢游走 */
.m-a { left: 3%; top: 6%; }
.m-b { animation: wander-b 32s linear infinite; }
@keyframes wander-b {
  0% { left: 42%; top: 72%; }
  25% { left: 8%; top: 52%; }
  50% { left: 48%; top: 14%; }
  75% { left: 20%; top: 32%; }
  100% { left: 42%; top: 72%; }
}
</style>
