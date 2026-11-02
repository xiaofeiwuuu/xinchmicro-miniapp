<template>
  <!-- 参数搜索：通过分类、目录和参数筛选 -->
  <view class="param-search">
    <!-- 分类和目录选择器 -->
    <view class="filter-box">
      <view class="filter-tags">
        <view class="tag" @tap="openSelector">
          <text>{{ selectedText }}</text>
          <text class="iconfont icon-down"></text>
        </view>
      </view>
    </view>

    <!-- 参数筛选区域：换目录时用 key 强制重建，清空输入框 -->
    <view
      class="param-filters"
      v-if="catalog && labels.length > 0"
      :key="catalog.id"
    >
      <view class="param-item" v-for="param in labels" :key="param.id">
        <text class="param-label">{{ param.title }}</text>
        <!-- 区间搜索 -->
        <template v-if="param.isRange">
          <view class="range-inputs">
            <input
              type="text"
              v-model="filters[param.id].min"
              :placeholder="$t('search.min')"
              class="range-input"
            />
            <text class="range-separator">-</text>
            <input
              type="text"
              v-model="filters[param.id].max"
              :placeholder="$t('search.max')"
              class="range-input"
            />
          </view>
        </template>
        <!-- 普通搜索 -->
        <template v-else>
          <input
            type="text"
            v-model="filters[param.id]"
            :placeholder="$t('search.inputParam', { title: param.title })"
            class="normal-input"
          />
        </template>
      </view>
    </view>

    <!-- 参数搜索结果列表 -->
    <view
      class="search-results"
      style="height: 40vh"
      v-if="results.length > 0"
    >
      <zb-table
        :columns="columns"
        :data="results"
        :fit="true"
        :border="true"
        :stripe="true"
        height="calc(100vh - 400rpx)"
        @row-click="navigateToProduct"
      >
        <template #empty>
          <view class="empty-state">
            <text class="iconfont icon-empty"></text>
            <text>{{ $t('common.noProduct') }}</text>
          </view>
        </template>
      </zb-table>
    </view>

    <!-- 分类/目录选择弹窗 -->
    <popup-selector
      :show="showSelector"
      :title="selectorTitle"
      :list="selectorList"
      :selectedId="selectedId"
      :showBack="step === 'catalog'"
      @close="handleClose"
      @select="handleSelect"
      @back="handleBack"
    />
  </view>
</template>

<script>
import { getCatalogs } from "@/api/index.js";
import PopupSelector from "@/components/PopupSelector.vue";
import { t } from "@/utils/i18n.js";
import { safeNavigate } from "@/utils/nav.js";
import {
  buildColumns,
  buildFilterState,
  matchParamFilters,
} from "@/utils/productFilter.js";

export default {
  name: "ParamSearch",
  components: { PopupSelector },
  props: {
    categories: {
      type: Array,
      default: () => [],
    },
    // 全部产品（由页面统一加载）
    products: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      category: null, // 选中的分类
      catalog: null, // 选中的目录
      catalogs: [], // 当前分类下的目录
      labels: [], // 参数标签 [{id, title, sampleValue, isRange}]
      filters: {}, // 参数筛选条件 {id: string | {min, max}}
      showSelector: false,
      step: "category", // 选择器步骤：'category' | 'catalog'
    };
  },
  computed: {
    selectedText() {
      if (this.catalog) return `${this.category.name} / ${this.catalog.name}`;
      if (this.category) return this.category.name;
      return t("search.selectPlaceholder");
    },
    selectorTitle() {
      return this.step === "category"
        ? t("search.selectCategory")
        : t("search.selectCatalog");
    },
    selectorList() {
      return this.step === "category" ? this.categories : this.catalogs;
    },
    selectedId() {
      const item = this.step === "category" ? this.category : this.catalog;
      return item ? item.id : "";
    },
    columns() {
      return buildColumns(this.catalog && this.catalog.paramTitles, "left");
    },
    // 当前目录下满足全部筛选条件的产品，展开参数作为表格行
    results() {
      if (!this.catalog) return [];
      return this.products
        .filter((p) => p.catalogId === this.catalog.id)
        .filter((p) => matchParamFilters(p, this.filters))
        .map((p) => ({ id: p.id, ...p.parameters }));
    },
  },
  methods: {
    openSelector() {
      this.step = "category";
      this.showSelector = true;
    },
    handleClose() {
      this.showSelector = false;
      this.step = "category";
    },
    handleBack() {
      this.step = "category";
    },
    async handleSelect(item) {
      if (this.step === "category") {
        // 选分类：清空已选目录，加载该分类的目录后进入目录步骤
        this.category = item;
        this.setCatalog(null);
        // 加载失败时留在分类步骤（已提示），用户可再点一次重试
        if (await this.loadCatalogs(item.id)) this.step = "catalog";
      } else {
        this.setCatalog(item);
        this.handleClose();
      }
    },
    // 返回是否加载成功
    async loadCatalogs(categoryId) {
      try {
        const { data } = await getCatalogs({ categoryId });
        if (data.code === 0) {
          this.catalogs = data.data;
          return true;
        }
      } catch (e) {
        // 统一走下面的提示
      }
      uni.showToast({ title: t("catalog.loadFail"), icon: "none" });
      return false;
    },
    // 选定目录：用该目录第一个产品的值判断每个参数是区间还是普通文本
    setCatalog(catalog) {
      this.catalog = catalog;
      this.labels = [];
      this.filters = {};
      if (catalog) {
        const first = this.products.find((p) => p.catalogId === catalog.id);
        if (first) {
          const state = buildFilterState(catalog.paramTitles, first.parameters);
          this.labels = state.labels;
          this.filters = state.filters;
        }
      }
      // 通知页面当前选择（用于分享标题）
      this.$emit("selection-change", {
        category: this.category,
        catalog: this.catalog,
      });
    },
    // 表格行点击：跳转到产品详情
    navigateToProduct(row) {
      if (row && row.id) {
        safeNavigate(`/pages/product/detail?id=${row.id}`);
      }
    },
  },
};
</script>

<style lang="scss">
@import "@/common/style/common.scss";

.param-search {
  padding: 20rpx;

  .filter-box {
    background: $card-background;
    border-radius: 16rpx;
    padding: 20rpx;
    border: 1px solid rgba(255, 255, 255, 0.05);

    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;

      .tag {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.05);
        padding: 12rpx 24rpx;
        border-radius: 30rpx;
        border: 1px solid rgba(255, 255, 255, 0.1);

        text {
          font-size: 28rpx;
          color: $text-primary;

          &.iconfont {
            font-size: 24rpx;
            margin-left: 8rpx;
            color: $text-secondary;
          }
        }

        &:active {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }

  .param-filters {
    margin-top: 20rpx;
    background: $card-background;
    border-radius: 16rpx;
    border: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 20rpx;

    .param-item {
      width: 45%;
      margin-bottom: 20rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .param-label {
        font-size: 28rpx;
        color: $text-secondary;
        margin-bottom: 10rpx;
        display: block;
      }

      .normal-input {
        width: 80%;
        height: 80rpx;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        color: $text-primary;
        border: 1px solid rgba(255, 255, 255, 0.1);

        &::placeholder {
          color: $text-light;
        }
      }

      .range-inputs {
        display: flex;
        align-items: center;
        width: 100%;

        .range-input {
          flex: 1;
          height: 80rpx;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12rpx;
          padding: 0 20rpx;
          font-size: 28rpx;
          color: $text-primary;
          border: 1px solid rgba(255, 255, 255, 0.1);

          &::placeholder {
            color: $text-light;
          }
        }

        .range-separator {
          padding: 0 20rpx;
          color: $text-secondary;
          font-size: 28rpx;
        }
      }
    }
  }

  .search-results {
    margin-top: 20rpx;

    .empty-state {
      text-align: center;
      padding: 100rpx 0;
      display: flex;
      flex-direction: column;
      align-items: center;

      .iconfont {
        font-size: 80rpx;
        color: rgba(255, 255, 255, 0.2);
        margin-bottom: 20rpx;
      }

      text {
        font-size: 28rpx;
        color: $text-light;
      }
    }
  }
}
</style>
