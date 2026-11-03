<template>
  <!-- 纯文字「中 / EN」：当前语言加粗、亮白，另一个常规、偏灰；点另一边直接切换，不弹窗。
       文字用各语言自己的写法，不依赖当前语言，任何语言的用户都认得出 -->
  <view class="lang-switch">
    <view class="lang-option" :class="{ active: lang === 'zh' }" @tap.stop="select('zh')">中</view>
    <view class="lang-sep">/</view>
    <view class="lang-option" :class="{ active: lang === 'en' }" @tap.stop="select('en')">EN</view>
  </view>
</template>

<script>
import { getLang, setLang } from '@/utils/i18n.js';

export default {
  name: 'LangSwitch',
  computed: {
    // getLang 读的是响应式状态，在公司页或这里切换后都会自动更新加粗
    lang() {
      return getLang();
    }
  },
  methods: {
    select(id) {
      setLang(id); // 与当前语言相同时 setLang 什么都不做
    }
  }
};
</script>

<style lang="scss">
.lang-switch {
  display: inline-flex;
  align-items: center;
  font-size: 40rpx;

  .lang-option {
    position: relative;
    padding: 8rpx 6rpx;
    color: rgba(255, 255, 255, 0.55);
    font-weight: 400;

    // 文字小，但手指要点得中：把可点击区域向外扩（约 88rpx 高）
    &::before {
      content: '';
      position: absolute;
      top: -20rpx;
      bottom: -20rpx;
      left: -8rpx;
      right: -8rpx;
    }

    &.active {
      color: #fff;
      font-weight: 700;
    }
  }

  .lang-sep {
    padding: 0 4rpx;
    color: rgba(255, 255, 255, 0.35);
  }
}
</style>
