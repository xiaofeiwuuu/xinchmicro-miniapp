<template>
  <view class="container blue">
    <!-- 顶部标签页 -->
    <view class="tabs">
      <view
        class="tab-item"
        v-for="(item, index) in tabs"
        :key="index"
        :class="{ active: currentTab === index }"
        @tap="switchTab(index)"
      >
        <text>{{ item }}</text>
      </view>
    </view>
    <retry-state v-if="loadError && currentTab !== 2" @retry="reload" />

    <!-- 型号搜索 / 参数搜索：切换标签即重置，所以用 v-if -->
    <model-search
      v-if="currentTab === 0"
      :key="modelKey"
      :products="allProducts"
      @keyword-change="onKeywordChange"
    />
    <param-search
      v-if="currentTab === 1"
      :categories="categories"
      :products="allProducts"
      @selection-change="onSelectionChange"
    />
    <!-- 资料下载：保留已加载的列表与页码，用 v-show -->
    <manual-list v-show="currentTab === 2" @action="handleManualAction" />

    <!-- 下载进度（悬浮在页面上，切换标签也不消失） -->
    <download-progress
      v-if="isDownloading"
      :progress="downloadProgress"
      :max-time="downloadTimeout / 1000"
      @cancel="cancelDownload"
    />
  </view>
</template>

<script>
import { getCategories, getProducts, getDownloadUrl } from "@/api/index.js";
import shareMixin from "@/mixins/share.js";
import { getUnifiedCloudUrl } from "@/utils/common.js";
import { t } from "@/utils/i18n.js";
import { getCachedPath } from "@/utils/cache.js";
import { downloadDoc, openDoc } from "@/utils/documents.js";
import RetryState from "@/components/RetryState.vue";
import ModelSearch from "@/components/search/ModelSearch.vue";
import ParamSearch from "@/components/search/ParamSearch.vue";
import ManualList from "@/components/search/ManualList.vue";
import DownloadProgress from "@/components/search/DownloadProgress.vue";

export default {
  mixins: [shareMixin],
  components: {
    RetryState,
    ModelSearch,
    ParamSearch,
    ManualList,
    DownloadProgress,
  },
  data() {
    return {
      currentTab: 0,

      // 全部产品与分类（由本页统一加载，传给两个搜索组件）
      allProducts: [],
      categories: [],
      loadError: false,

      // 型号搜索：key 变化会重建组件，用来在重复点击标签时清空关键词
      modelKey: 0,

      // 子组件上报的当前状态，仅用于生成分享标题
      modelKeyword: "",
      selectedCategory: null,
      selectedCatalog: null,

      // 文档下载
      isDownloading: false,
      downloadProgress: 0,
      downloadTimeout: 120000, // 毫秒，同时作为进度环的倒计时总长
    };
  },
  computed: {
    tabs() {
      return [t("search.tabModel"), t("search.tabParam"), t("search.tabDocs")];
    },
  },
  created() {
    // 下载任务对象不需要响应式
    this.downloadTask = null;
    // 正在取链接或下载文档期间忽略再次点击，避免并发下载同一个文件
    this.busy = false;
  },
  async onLoad() {
    await Promise.all([this.loadCategories(), this.loadAllProducts()]);
  },
  onUnload() {
    if (this.downloadTask) this.downloadTask.abort();
  },
  methods: {
    // 切换标签页：清空搜索关键词；离开参数搜索时清空已选分类/目录
    switchTab(index) {
      if (index === 0) this.modelKey += 1;
      this.currentTab = index;
      this.modelKeyword = "";
      if (index !== 1) {
        this.selectedCategory = null;
        this.selectedCatalog = null;
      }
    },

    onKeywordChange(keyword) {
      this.modelKeyword = keyword;
    },

    onSelectionChange({ category, catalog }) {
      this.selectedCategory = category;
      this.selectedCatalog = catalog;
    },

    // 重新加载分类与产品数据
    async reload() {
      this.loadError = false;
      await Promise.all([this.loadCategories(), this.loadAllProducts()]);
    },

    async loadCategories() {
      try {
        const { data } = await getCategories();
        if (data.code === 0) {
          this.categories = data.data;
        } else {
          this.loadError = true;
        }
      } catch (e) {
        this.loadError = true;
      }
    },

    async loadAllProducts() {
      try {
        const { data } = await getProducts();
        if (data.code === 0) {
          // 兼容 data.data.list 和 data.data 两种格式
          this.allProducts = Array.isArray(data.data?.list)
            ? data.data.list
            : Array.isArray(data.data)
            ? data.data
            : [];
        } else {
          this.loadError = true;
        }
      } catch (e) {
        this.loadError = true;
      }
    },

    // 资料列表里点了"查看"(view) 或"下载"(copy 链接)
    async handleManualAction({ manual, type }) {
      if (!manual || !manual.fileId) {
        uni.showToast({ title: t("search.manualMissing"), icon: "none" });
        return;
      }
      if (this.busy || this.isDownloading) {
        uni.showToast({ title: t("doc.waitDownloading"), icon: "none" });
        return;
      }
      this.busy = true;
      try {
        // 查看：本地已有就直接打开，不需要网络
        if (type === "view") {
          const cachedPath = await getCachedPath(manual.fileId);
          if (cachedPath) {
            uni.showToast({ title: t("doc.opening"), icon: "none", duration: 500 });
            setTimeout(() => this.openDocument(cachedPath), 100);
            return;
          }
        }

        uni.showLoading({ title: t("search.gettingLink"), mask: true });
        let url;
        try {
          url = getUnifiedCloudUrl(await getDownloadUrl(manual.fileId));
        } catch (e) {
          uni.hideLoading();
          uni.showToast({ title: t("search.linkFail"), icon: "none" });
          return;
        }
        uni.hideLoading();

        if (type === "view") {
          await this.downloadAndOpen({ url, name: manual.name, fileId: manual.fileId });
        } else {
          uni.setClipboardData({
            data: url,
            success: () => {
              uni.showToast({ title: t("search.copyOk"), icon: "none" });
            },
          });
        }
      } finally {
        this.busy = false;
      }
    },

    // 下载并打开（带进度环，可长按取消）
    async downloadAndOpen({ url, name, fileId }) {
      this.isDownloading = true;
      this.downloadProgress = 0;

      try {
        const path = await downloadDoc({
          url,
          name,
          fileId,
          timeout: this.downloadTimeout,
          onTask: (task) => {
            this.downloadTask = task;
          },
          onProgress: (percent) => {
            this.downloadProgress = percent;
          },
        });
        this.finishDownload();
        this.openDocument(path);
      } catch (e) {
        this.finishDownload();
        // 用户主动取消时已提示过，不再重复报错
        if (!e.aborted) {
          uni.showToast({ title: t("doc.downloadFail"), icon: "none" });
        }
      }
    },

    finishDownload() {
      this.isDownloading = false;
      this.downloadProgress = 0;
      this.downloadTask = null;
    },

    cancelDownload() {
      if (this.downloadTask) this.downloadTask.abort();
      this.finishDownload();
      uni.showToast({
        title: t("search.cancelled"),
        icon: "none",
        duration: 2000,
      });
    },

    openDocument(path) {
      uni.hideLoading();
      openDoc(path).catch(() => {
        uni.showToast({ title: t("doc.openFail"), icon: "none" });
      });
    },

    // 自定义搜索页分享内容
    onShareAppMessage() {
      let title = t("search.shareTitle");
      let path = "/pages/search/index";

      if (this.currentTab === 1 && this.selectedCategory && this.selectedCatalog) {
        // 参数搜索已选好分类和目录
        title = `${this.selectedCategory.name} - ${this.selectedCatalog.name}`;
        path = `/pages/search/index?tab=1&categoryId=${this.selectedCategory.id}&catalogId=${this.selectedCatalog.id}`;
      } else if (this.currentTab === 0 && this.modelKeyword) {
        // 型号搜索有关键词
        title = t("search.shareKeyword", { keyword: this.modelKeyword });
        path = `/pages/search/index?tab=0&keyword=${encodeURIComponent(this.modelKeyword)}`;
      }

      return { title, path };
    },
  },
};
</script>

<style lang="scss">
@import "@/common/style/common.scss";

.container {
  @include page-container;
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  .tabs {
    display: flex;
    background: $card-background;
    padding: 0 40rpx;
    margin: 20rpx 20rpx 0;
    border-radius: 16rpx;
    border: 1px solid rgba(255, 255, 255, 0.05);

    .tab-item {
      flex: 1;
      text-align: center;
      padding: 30rpx 0;
      position: relative;

      text {
        font-size: 28rpx;
        color: $text-secondary;
        font-weight: 500;
      }

      &.active {
        text {
          color: $primary-color;
        }

        &::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 4rpx;
          background: $primary-gradient;
          border-radius: 2rpx;
        }
      }
    }
  }
}
</style>
