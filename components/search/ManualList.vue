<template>
  <!-- 资料下载：产品手册列表（分页） -->
  <view class="search-results">
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">{{ $t('search.docs') }}</text>
      </view>
      <view class="tip-box">
        <text class="tip-text">{{ $t('search.docsTip') }}</text>
      </view>

      <view v-if="list.length > 0">
        <!-- 正在看另一种语言的手册时说明一下，并可以返回 -->
        <view class="lang-notice" v-if="viewLang">
          <text class="lang-notice-text">{{ $t(viewLang === 'zh' ? 'search.showingZh' : 'search.showingEn') }}</text>
          <text class="lang-notice-link" @tap="backToCurrent">{{ $t('search.backToCurrent') }}</text>
        </view>
        <view class="pdf-box" v-for="manual in list" :key="manual.id">
          <text class="pdf-name">{{ manual.name }}</text>
          <view class="download-box">
            <text
              class="download-text"
              style="margin-right: 20rpx"
              @tap="emitAction(manual, 'view')"
              >{{ $t('search.view') }}</text
            >
            <text class="download-text" @tap="emitAction(manual, 'copy')">{{
              $t('search.download')
            }}</text>
          </view>
        </view>

        <!-- 分页控制 -->
        <view class="pagination" v-if="total > pageSize">
          <view class="pagination-info">
            <text>{{ $t('search.total', { n: total }) }}</text>
          </view>
          <view class="pagination-controls">
            <view
              class="pagination-btn"
              :class="{ disabled: page <= 1 }"
              @tap="changePage(page - 1)"
            >
              <text class="pagination-arrow">‹</text>
            </view>
            <view class="pagination-page">
              <text>{{ page }}</text>
            </view>
            <view
              class="pagination-btn"
              :class="{ disabled: page >= pageCount }"
              @tap="changePage(page + 1)"
            >
              <text class="pagination-arrow">›</text>
            </view>
          </view>
        </view>
      </view>
      <retry-state v-else-if="error" @retry="load" />
      <!-- 当前语言没有手册，但另一种语言有：问一下是否查看 -->
      <view v-else-if="alt" class="alt-prompt">
        <text class="alt-prompt-text">{{ $t(alt.lang === 'zh' ? 'search.altNoEn' : 'search.altNoZh', { n: alt.total }) }}</text>
        <view class="alt-prompt-btn" @tap="showOther">
          <text>{{ $t(alt.lang === 'zh' ? 'search.viewZh' : 'search.viewEn') }}</text>
        </view>
      </view>
      <empty-state v-else :text="$t('search.noManuals')" />
    </view>
  </view>
</template>

<script>
import { getManuals } from "@/api/index.js";
import { getLang } from "@/utils/i18n.js";
import RetryState from "@/components/RetryState.vue";
import EmptyState from "@/components/EmptyState.vue";

export default {
  name: "ManualList",
  components: { RetryState, EmptyState },
  data() {
    return {
      list: [],
      page: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      error: false,
      viewLang: "", // 空：显示当前界面语言的手册；"zh"/"en"：用户选择查看另一种语言的手册
      alt: null, // 当前语言没有手册时，另一种语言的情况 { lang, total }；另一种语言也没有则为 null
    };
  },
  computed: {
    pageCount() {
      return Math.ceil(this.total / this.pageSize);
    },
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      try {
        this.loading = true;
        this.error = false;
        const { data } = await getManuals({
          page: this.page,
          pageSize: this.pageSize,
          lang: this.viewLang || undefined,
        });
        if (data.code === 0) {
          this.list = data.data.list;
          this.total = data.data.total;
          // 当前语言一份手册都没有：看看另一种语言有没有，有才提示
          if (!this.viewLang && this.total === 0) this.checkOther();
          else this.alt = null;
        } else {
          this.error = true;
        }
      } catch (e) {
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    // 另一种语言有没有手册（只查数量；失败当作没有，不影响当前显示）
    async checkOther() {
      const lang = getLang() === "en" ? "zh" : "en";
      try {
        const { data } = await getManuals({ page: 1, pageSize: 1, lang });
        this.alt = data.code === 0 && data.data.total > 0 ? { lang, total: data.data.total } : null;
      } catch (e) {
        this.alt = null;
      }
    },
    showOther() {
      if (!this.alt || this.loading) return;
      this.viewLang = this.alt.lang;
      this.page = 1;
      this.load();
    },
    backToCurrent() {
      if (this.loading) return;
      this.viewLang = "";
      this.page = 1;
      this.load();
    },
    changePage(page) {
      if (this.loading || page < 1 || page > this.pageCount) return;
      this.page = page;
      this.load();
    },
    // 点击"查看"/"下载"：交给页面统一处理（获取链接、下载、进度、缓存）
    emitAction(manual, type) {
      this.$emit("action", { manual, type });
    },
  },
};
</script>

<style lang="scss">
@import "@/common/style/common.scss";

.search-results {
  margin-top: 20rpx;
}

.section-card {
  @include card;
  margin: 30rpx 20rpx;
  overflow: hidden;

  .section-header {
    padding: 30rpx;
    border-bottom: 1px solid $border-color;

    .section-title {
      font-size: 32rpx;
      color: $text-primary;
      font-weight: 500;
    }
  }

  .pdf-box {
    padding: 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.3s ease;
    border-bottom: 1px solid $border-color;

    &:active {
      background-color: $hover-color;
    }

    .pdf-name {
      flex: 1;
      min-width: 0; // 允许收缩，长文件名换行而不是把按钮挤出屏幕
      word-break: break-all;
      font-size: 28rpx;
      color: $text-primary;
    }
    .download-box {
      flex-shrink: 0; // 按钮区按内容自适应宽度，中英文都不会被截断
      display: flex;
      align-items: center;
      margin-left: 20rpx;
    }
    .download-text {
      font-size: 26rpx;
      white-space: nowrap;
      color: $primary-color;
      background: rgba($primary-color, 0.1);
      padding: 12rpx 28rpx;
      border-radius: 30rpx;
      border: 1px solid rgba($primary-color, 0.2);
    }
  }

  .lang-notice {
    display: flex;
    justify-content: space-between;
    padding: 16rpx 30rpx;
    font-size: 26rpx;
    color: $text-secondary;

    .lang-notice-link {
      color: $primary-color;
    }
  }

  .tip-box {
    padding: 20rpx 30rpx;

    .tip-text {
      font-size: 28rpx;
      color: $text-secondary;
      line-height: 1.6;
    }
  }
}

// 当前语言没有手册、另一种语言有时的提示
.alt-prompt {
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .alt-prompt-text {
    font-size: 28rpx;
    color: $text-secondary;
    line-height: 1.6;
    text-align: center;
  }

  .alt-prompt-btn {
    margin-top: 30rpx;
    padding: 18rpx 40rpx;
    border-radius: 40rpx;
    border: 1px solid $primary-color;
    color: $primary-color;
    font-size: 28rpx;

    &:active {
      opacity: 0.7;
    }
  }
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  border-top: 1px solid $border-color;

  .pagination-info {
    text {
      font-size: 24rpx;
      color: $text-secondary;
    }
  }

  .pagination-controls {
    display: flex;
    align-items: center;

    .pagination-btn {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8rpx;
      margin: 0 10rpx;

      .pagination-arrow {
        font-size: 40rpx;
        line-height: 1;
        color: $text-primary;
      }

      &.disabled {
        opacity: 0.5;
        pointer-events: none;
      }

      &:active {
        background: rgba(255, 255, 255, 0.1);
      }
    }

    .pagination-page {
      min-width: 60rpx;
      text-align: center;

      text {
        font-size: 28rpx;
        color: $text-primary;
      }
    }
  }
}
</style>
