<!-- 用户协议 / 隐私政策 / 退换货规则：同一个页面，?type=terms|privacy|returns；内容在 utils/legal.js（中英文各一份，按当前语言显示） -->
<template>
  <view class="page">
    <scroll-view v-if="doc" scroll-y class="body">
      <text class="title">{{ doc.title }}</text>
      <!-- 后台配置了：显示后台的富文本；没配置或取不到：显示内置的（审核、断网时也一定有内容） -->
      <template v-if="remote">
        <text class="updated">{{ $t('legal.updatedAt', { t: remote.updatedAt }) }}</text>
        <rich-text :nodes="remote.nodes" user-select></rich-text>
      </template>
      <template v-else>
        <text class="updated">{{ doc.updated }}</text>
        <view v-for="(s, i) in doc.sections" :key="i" class="section">
          <text class="h">{{ s.h }}</text>
          <!-- 文案里用 **…** 标出要加粗的部分 -->
          <text v-for="(p, j) in s.p" :key="j" class="p" user-select><text v-for="(g, k) in segs(p)" :key="k" :class="{ strong: g.b }">{{ g.t }}</text></text>
        </view>
      </template>
      <view class="space"></view>
    </scroll-view>
  </view>
</template>

<script>
import { getLegal, LEGAL_TYPES, styleRichHtml } from '@/utils/legal.js';
import { getLang } from '@/utils/i18n.js';
import { getLegalDoc } from '@/api/index.js';
import { readData, writeData } from '@/utils/cache.js';
import { formatTime } from '@/utils/order.js';
import { logError } from '@/utils/logger.js';

export default {
  data() {
    return { type: 'terms', remote: null }; // remote：后台配置的内容 { nodes, updatedAt }，没有就显示内置的
  },
  computed: {
    doc() {
      return getLegal(this.type, getLang());
    }
  },
  onLoad(options) {
    this.type = LEGAL_TYPES.includes(options && options.type) ? options.type : 'terms';
    this.setTitle();
    this.loadRemote();
  },
  onShow() {
    this.setTitle(); // 全局 onShow 会把标题设回默认，页面自己的 onShow 在它之后，再设一次
  },
  methods: {
    // 先用上次存在本机的（打开就有内容、断网也行），再向服务端取最新的；服务端说「没配置」（404）就清掉本机的，回到内置的
    async loadRemote() {
      const lang = getLang();
      const key = 'legal-' + this.type;
      const cached = readData(key, lang);
      if (cached && cached.html) this.remote = this.toRemote(cached);
      try {
        const { data, statusCode } = await getLegalDoc(this.type);
        if (lang !== getLang()) return; // 请求期间切换了语言，丢弃
        if (data && data.code === 0 && data.data && data.data.html) {
          this.remote = this.toRemote(data.data);
          writeData(key, { html: data.data.html, updatedAt: data.data.updatedAt }, lang);
        } else if (statusCode === 404 || (data && data.errorCode === 'NOT_FOUND')) {
          this.remote = null;
          writeData(key, '', lang);
        }
      } catch (e) {
        logError('legal.load', { type: this.type, error: (e && (e.errMsg || e.message)) || String(e) }); // 取不到就保持现在显示的
      }
    },
    // 把一段文字按 ** 切开，奇数段加粗
    segs(p) {
      return String(p)
        .split('**')
        .map((t, i) => ({ t, b: i % 2 === 1 }))
        .filter((g) => g.t);
    },
    toRemote(d) {
      return { nodes: styleRichHtml(d.html), updatedAt: formatTime(d.updatedAt).slice(0, 10) };
    },
    setTitle() {
      if (this.doc) uni.setNavigationBarTitle({ title: this.doc.title });
    }
  }
};
</script>

<style lang="scss">
.page {
  height: 100vh;
  background: #0e1a2d;
}
.body {
  height: 100%;
  padding: 32rpx 32rpx 0;
  box-sizing: border-box;
}
.title {
  display: block;
  color: #fff;
  font-size: 40rpx;
  font-weight: 700;
}
.updated {
  display: block;
  margin: 12rpx 0 28rpx;
  color: rgba(255, 255, 255, 0.45);
  font-size: 24rpx;
}
.section {
  margin-bottom: 28rpx;
}
.h {
  display: block;
  margin-bottom: 12rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}
.p {
  display: block;
  margin-bottom: 10rpx;
  color: rgba(255, 255, 255, 0.75);
  font-size: 27rpx;
  line-height: 1.75;
}
.strong {
  color: #fff;
  font-weight: 700;
}
.space {
  height: calc(60rpx + constant(safe-area-inset-bottom));
  height: calc(60rpx + env(safe-area-inset-bottom));
}
</style>
