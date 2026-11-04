<template>
  <!-- 两个大按钮上下排列（中文 / English），填满父元素的高度；当前语言高亮加粗，点另一个直接切换，不弹窗。
       文字用各语言自己的写法，不依赖当前语言，任何语言的用户都认得出 -->
  <view class="lang-switch">
    <view class="lang-btn" :class="{ active: lang === 'zh' }" @tap="select('zh')">中文</view>
    <view class="lang-btn" :class="{ active: lang === 'en' }" @tap="select('en')">English</view>
  </view>
</template>

<script>
import { getLang, setLang } from '@/utils/i18n.js';

export default {
  name: 'LangSwitch',
  computed: {
    // getLang 读的是响应式状态，在公司页或这里切换后都会自动更新高亮
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
// 样式与首页的分类按钮保持一致（卡片色、圆角、边框）
.lang-switch {
  display: flex;
  flex-direction: column;
  height: 100%;

  .lang-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #122642;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16rpx;
    font-size: 36rpx;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;

    & + .lang-btn {
      margin-top: 20rpx;
    }

    &:active {
      transform: scale(0.98);
    }

    // 当前语言：亮白、加粗、蓝色描边
    &.active {
      background: #173459;
      border-color: #00a8ff;
      color: #fff;
      font-weight: 700;
    }
  }
}
</style>
