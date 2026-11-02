<template>
  <!-- 型号搜索：直接通过产品名称搜索 -->
  <view class="search-box">
    <view class="search-input">
      <text class="iconfont icon-search"></text>
      <input
        type="text"
        v-model="keyword"
        :placeholder="$t('search.modelPlaceholder')"
      />
    </view>

    <!-- 型号搜索结果列表 -->
    <view class="search-results">
      <view class="empty-state" v-if="matched.length === 0 && keyword">
        <text class="iconfont icon-empty"></text>
        <text>{{ $t('search.notFound') }}</text>
      </view>

      <!-- 按目录分组，用表格显示搜索结果 -->
      <view v-if="matched.length > 0">
        <view
          v-for="(group, index) in groups"
          :key="index"
          class="catalog-group"
        >
          <view class="catalog-title">{{ group.catalogName }}</view>
          <view
            class="catalog-table"
            style="max-height: 400rpx; overflow-y: auto"
          >
            <zb-table
              :columns="group.columns"
              :data="group.products"
              :border="true"
              :fit="true"
              :stripe="true"
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
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { t } from "@/utils/i18n.js";
import { matchModel, groupByCatalog } from "@/utils/productFilter.js";

export default {
  name: "ModelSearch",
  props: {
    // 全部产品（由页面统一加载）
    products: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      keyword: "",
    };
  },
  watch: {
    // 通知页面当前关键词（用于分享标题）
    keyword(value) {
      this.$emit("keyword-change", value);
    },
  },
  computed: {
    matched() {
      if (!this.keyword) return [];
      return this.products.filter((product) =>
        matchModel(product.name, this.keyword)
      );
    },
    groups() {
      return groupByCatalog(this.matched, t("search.unknownCatalog"));
    },
  },
  methods: {
    // 表格行点击：跳转到产品详情
    navigateToProduct(row) {
      if (row && row.id) {
        uni.navigateTo({ url: `/pages/product/detail?id=${row.id}` });
      }
    },
  },
};
</script>

<style lang="scss">
@import "@/common/style/common.scss";

.search-box {
  padding: 20rpx;

  .search-input {
    background: $card-background;
    border-radius: 16rpx;
    padding: 20rpx 30rpx;
    display: flex;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.05);

    .iconfont {
      font-size: 32rpx;
      color: $text-light;
      margin-right: 20rpx;
    }

    input {
      flex: 1;
      font-size: 28rpx;
      color: $text-primary;

      &::placeholder {
        color: $text-light;
      }
    }
  }

  .search-results {
    margin-top: 20rpx;

    .catalog-group {
      margin-bottom: 30rpx;
      background: $card-background;
      border-radius: 16rpx;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);

      &:last-child {
        margin-bottom: 0;
      }

      .catalog-title {
        font-size: 28rpx;
        font-weight: 500;
        color: $text-primary;
        padding: 20rpx;
        background: rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
    }

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
