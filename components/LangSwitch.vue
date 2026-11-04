<template>
  <!-- 一个按钮，只显示「中/EN」：当前语言亮白加粗，另一个变暗；点击直接切换，不弹窗。
       文字固定，不依赖当前语言，任何语言的用户都认得出 -->
  <view class="lang-switch">
    <view class="lang-btn" @tap="toggle">
      <text class="lang-item" :class="{ on: lang === 'zh' }">中</text>
      <text class="lang-sep">/</text>
      <text class="lang-item" :class="{ on: lang === 'en' }">EN</text>
    </view>
  </view>
</template>

<script>
import { getLang, setLang } from '@/utils/i18n.js';

export default {
  name: 'LangSwitch',
  computed: {
    // getLang 读的是响应式状态，在公司页或这里切换后都会自动更新
    lang() {
      return getLang();
    }
  },
  methods: {
    toggle() {
      setLang(this.lang === 'zh' ? 'en' : 'zh');
    }
  }
};
</script>

<style lang="scss">
// 样式与首页的分类按钮保持一致（卡片色、圆角、边框）
.lang-switch {
  height: 100%;

  .lang-btn {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #173459;
    border: 1px solid #00a8ff;
    border-radius: 16rpx;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
    }
  }

  .lang-item {
    font-size: 40rpx;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.45);

    // 当前语言
    &.on {
      font-weight: 700;
      color: #fff;
    }
  }

  .lang-sep {
    font-size: 40rpx;
    color: rgba(255, 255, 255, 0.45);
    margin: 0 12rpx;
  }
}
</style>
