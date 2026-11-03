<template>
  <!-- 自定义导航栏（只有首页用）：左侧放内容（语言开关），中间是标题，右侧给微信胶囊按钮留空。
       固定在顶部，下面放一个等高的占位，页面内容不会被它盖住 -->
  <view>
    <view class="nav-bar" :style="barStyle">
      <view class="nav-row" :style="rowStyle">
        <view class="nav-left"><slot /></view>
        <view class="nav-title" :style="titleStyle">{{ title }}</view>
      </view>
    </view>
    <view :style="placeholderStyle"></view>
  </view>
</template>

<script>
import { getNavBarMetrics } from '@/utils/system.js';

export default {
  name: 'NavBar',
  props: {
    title: { type: String, default: '' }
  },
  data() {
    return { m: getNavBarMetrics() };
  },
  computed: {
    // 样式统一用字符串（不用对象）：uni-app 里"计算属性返回对象"的 :style 在小程序端不够可靠
    // 栏的上内边距 = 胶囊按钮顶部到屏幕顶部的距离，内容行紧接着，与胶囊按钮同位置、同高度
    barStyle() {
      return `height:${this.m.totalHeight}px;padding-top:${this.m.capTop}px;`;
    },
    rowStyle() {
      return `height:${this.m.capHeight}px;`;
    },
    titleStyle() {
      return `left:${this.m.safeSide}px;right:${this.m.safeSide}px;line-height:${this.m.capHeight}px;`;
    },
    placeholderStyle() {
      return `height:${this.m.totalHeight}px;`;
    }
  }
};
</script>

<style lang="scss">
// 颜色与其它页面的原生导航栏一致（pages.json 里的 navigationBarBackgroundColor）
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-sizing: border-box;
  background: #0e1a2d;

  .nav-row {
    position: relative;
    display: flex;
    align-items: center;
  }

  .nav-left {
    position: relative;
    z-index: 1;
    // 首页内容（轮播图、分类按钮）距屏幕左边 40rpx（页面 20rpx + 内边距 20rpx）；
    // 开关文字自带 6rpx 的左内边距，所以这里留 34rpx，让「中」的左边缘和轮播图左边缘对齐
    margin-left: 34rpx;
  }

  .nav-title {
    position: absolute;
    top: 0;
    text-align: center;
    color: #fff;
    // 与其它页面的原生导航栏标题同样大（微信原生标题是 17px）
    font-size: 17px;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
