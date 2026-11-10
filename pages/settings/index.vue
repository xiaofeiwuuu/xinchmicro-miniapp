<!-- 设置：语言、清除缓存（原来直接放在「我的」页里） -->
<template>
  <view class="page">
    <view class="card">
      <view class="row" @tap="showLangPopup = true">
        <image src="/static/icon/language.png" class="row-icon" mode="aspectFit"></image>
        <text class="row-label">{{ $t('about.language') }}</text>
        <text class="row-value">{{ langLabel }}</text>
        <text class="row-arrow">›</text>
      </view>
      <view class="row" @tap="handleClearCache">
        <image src="/static/icon/clear.png" class="row-icon" mode="aspectFit"></image>
        <text class="row-label">{{ $t('about.clearCache') }}</text>
        <text class="row-value">{{ cacheSize }}</text>
        <text class="row-arrow">›</text>
      </view>
    </view>

    <!-- 注销账号：和语言、缓存分开放在最底部，红色文字，免得误点 -->
    <view class="delete-entry" @tap="safeNavigate('/pages/account/delete')">
      <text>{{ $t('acct.entry') }}</text>
    </view>

    <popup-selector
      :show="showLangPopup"
      :title="$t('about.language')"
      :list="langList"
      :selectedId="lang"
      @close="showLangPopup = false"
      @select="handleSelectLang"
    />
  </view>
</template>

<script>
import PopupSelector from '@/components/PopupSelector.vue';
import { safeNavigate } from '@/utils/nav.js';
import { getLang, setLang } from '@/utils/i18n.js';
import { getCompanyInfo } from '@/api/index.js';
import { clearAllCache, getFileCacheInfo, formatSize, writeData } from '@/utils/cache.js';
import { logError } from '@/utils/logger.js';

export default {
  components: { PopupSelector },
  data() {
    return {
      cacheSize: '0 B',
      showLangPopup: false,
      // 语言名用各自的母语写法，不随界面语言变化
      langList: [
        { id: 'zh', name: '中文' },
        { id: 'en', name: 'English' }
      ]
    };
  },
  computed: {
    lang() {
      return getLang();
    },
    langLabel() {
      const item = this.langList.find((l) => l.id === this.lang);
      return item ? item.name : '';
    }
  },
  onShow() {
    this.refreshCacheSize();
  },
  methods: {
    safeNavigate(url) {
      safeNavigate(url);
    },
    handleSelectLang(item) {
      setLang(item.id);
      this.showLangPopup = false;
    },
    async refreshCacheSize() {
      const { bytes } = await getFileCacheInfo();
      this.cacheSize = formatSize(bytes);
    },
    handleClearCache() {
      uni.showModal({
        title: this.$t('about.clearCache'),
        content: this.$t('about.clearConfirm'),
        confirmText: this.$t('common.confirm'),
        cancelText: this.$t('common.cancel'),
        success: async (res) => {
          if (!res.confirm) return;
          await clearAllCache();
          await this.refreshCacheSize();
          uni.showToast({ title: this.$t('about.cleared'), icon: 'none' });
          // 公司信息缓存被清掉了，重新取一次写回（公司页没有缓存时会先空一下）
          const lang = getLang();
          try {
            const { data } = await getCompanyInfo();
            if (data.code === 0) writeData('companyInfo', data.data, lang);
          } catch (e) {
            logError('settings.clearCache.company', { error: (e && (e.errMsg || e.message)) || String(e) });
          }
        }
      });
    }
  }
};
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #0e1a2d;
  padding: 24rpx;
  box-sizing: border-box;
}
.card {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  padding: 0 28rpx;
}
.row {
  display: flex;
  align-items: center;
  min-height: 104rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
  }
}
.delete-entry {
  margin-top: 64rpx;
  padding: 28rpx 0;
  text-align: center;
  color: #ff7875;
  font-size: 26rpx;
}
.row-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}
.row-label {
  flex: 1;
  color: #fff;
  font-size: 30rpx;
}
.row-value {
  color: rgba(255, 255, 255, 0.5);
  font-size: 26rpx;
  margin-right: 12rpx;
}
.row-arrow {
  color: rgba(255, 255, 255, 0.4);
  font-size: 36rpx;
}
</style>
