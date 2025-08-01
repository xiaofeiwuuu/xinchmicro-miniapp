<template>
  <view class="container blue">
    <!-- 顶部标签页 -->
    <view class="tabs">
      <view class="tab-item" v-for="(item, index) in tabs" :key="index" :class="{ 'active': currentTab === index }"
        @tap="switchTab(index)">
        <text>{{ item }}</text>
      </view>
    </view>

    <!-- 型号搜索：直接通过产品名称搜索 -->
    <view class="search-box" v-if="currentTab === 0">
      <view class="search-input">
        <text class="iconfont icon-search"></text>
        <input type="text" v-model="modelKeyword" placeholder="请输入产品型号搜索" @input="handleModelSearch" />
      </view>

      <!-- 型号搜索结果列表 -->
      <view class="search-results">
        <view class="empty-state" v-if="filteredModelProducts.length === 0 && modelKeyword">
          <text class="iconfont icon-empty"></text>
          <text>未找到相关产品</text>
        </view>

        <!-- 使用表格显示搜索结果 -->
        <view v-if="filteredModelProducts.length > 0">
          <!-- 按目录分组显示产品 -->
          <view v-for="(group, index) in groupedModelProducts" :key="index" class="catalog-group">
            <view class="catalog-title">{{ group.catalogName }}</view>
            <view class="catalog-table" style="max-height: 400rpx;overflow-y: auto;">
              <zb-table :columns="group.columns" :data="group.products" :border="true" :fit="true" :stripe="true"
                @row-click="navigateToProduct">
                <template #empty>
                  <view class="empty-state">
                    <text class="iconfont icon-empty"></text>
                    <text>暂无产品</text>
                  </view>
                </template>
              </zb-table>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 参数搜索：通过分类、目录和参数筛选 -->
    <view class="param-search" v-if="currentTab === 1">
      <!-- 分类和目录选择器 -->
      <view class="filter-box">
        <view class="filter-tags">
          <view class="tag" @tap="openSelector">
            <text>{{ getSelectedText }}</text>
            <text class="iconfont icon-down"></text>
          </view>
        </view>
      </view>

      <!-- 参数筛选区域 -->
      <view class="param-filters" v-if="selectedCatalog && showParamFilters">
        <view class="param-item" v-for="(label, key) in parameterLabels" :key="key">
          <text class="param-label">{{ key }}</text>
          <!-- 区间搜索 -->
          <template v-if="label.includes('～')">
            <view class="range-inputs">
              <input type="text" v-model="paramFilters[key].min" :placeholder="'最小值'" @input="handleParamFilter"
                class="range-input" />
              <text class="range-separator">-</text>
              <input type="text" v-model="paramFilters[key].max" :placeholder="'最大值'" @input="handleParamFilter"
                class="range-input" />
            </view>
          </template>
          <!-- 普通搜索 -->
          <template v-else>
            <input type="text" v-model="paramFilters[key]" :placeholder="'请输入' + key" @input="handleParamFilter"
              class="normal-input" />
          </template>
        </view>
      </view>

      <!-- 参数搜索结果列表 -->
      <view class="search-results" style="height: 40vh;" v-if="filteredProducts.length > 0">
        <zb-table :columns="columns" :data="filteredProducts" :fit="true" :border="true" :stripe="true"
          height="calc(100vh - 400rpx)" @row-click="navigateToProduct">
          <template #empty>
            <view class="empty-state">
              <text class="iconfont icon-empty"></text>
              <text>暂无产品</text>
            </view>
          </template>
        </zb-table>
      </view>
    </view>

    <!-- 资料下载页面 -->
    <view class="search-results" v-if="currentTab === 2">
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">产品资料</text>
        </view>
        <!-- 替换原有的单个PDF下载为手册列表 -->
        <view v-if="manualsList.length > 0">
          <view class="pdf-box" v-for="(manual, index) in manualsList" :key="manual.id">
            <text class="pdf-name">{{ manual.name }}</text>
            <view class="download-box">
              <text class="download-text" style="margin-right: 20rpx;" @tap="downloadManual({manual,type:'view'})">查看</text>
              <text class="download-text" @tap="downloadManual({manual,type:'copy'})">复制</text>
            </view>
          </view>

          <!-- 分页控制 -->
          <view class="pagination" v-if="manualsTotal > manualsPageSize">
            <view class="pagination-info">
              <text>共 {{ manualsTotal }} 条</text>
            </view>
            <view class="pagination-controls">
              <view class="pagination-btn" :class="{ 'disabled': manualsPage <= 1 }"
                @tap="changeManualsPage(manualsPage - 1)">
                <text class="iconfont icon-left"></text>
              </view>
              <view class="pagination-page">
                <text>{{ manualsPage }}</text>
              </view>
              <view class="pagination-btn"
                :class="{ 'disabled': manualsPage >= Math.ceil(manualsTotal / manualsPageSize) }"
                @tap="changeManualsPage(manualsPage + 1)">
                <text class="iconfont icon-right"></text>
              </view>
            </view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text class="iconfont icon-empty"></text>
          <text>暂无产品手册</text>
        </view>
        <view class="tip-box">
          <text class="tip-text">点击复制按钮可分享好友或在浏览器粘贴链接进行下载,点击查看按钮可查看PDF,右上角保存或转发文件</text>
        </view>
      </view>
    </view>

    <!-- 分类/目录选择弹窗 -->
    <popup-selector :show="showSelector" :title="selectorTitle" :list="selectorList" :selectedId="selectedId"
      :showBack="showBack" @close="handleClose" @select="handleSelect" @back="handleBack" />
  </view>
</template>

<script>
import { getCategories, getCatalogs, getProducts, getManuals } from '@/api/index.js';
import PopupSelector from '@/components/PopupSelector.vue';
import shareMixin from '@/mixins/share.js';
import { getUnifiedCloudUrl } from '@/utils/common.js';

export default {
  mixins: [shareMixin],
  components: {
    PopupSelector
  },
  data() {
    return {
      // 标签页配置
      tabs: ['型号搜索', '参数搜索', '资料下载'],
      currentTab: 0,

      // 数据缓存
      allProducts: [], // 所有产品数据
      categories: [], // 所有分类数据
      catalogs: [], // 当前分类下的目录数据

      // 型号搜索
      modelKeyword: '', // 型号搜索关键词

      // 参数搜索
      selectedCategory: null, // 选中的分类
      selectedCatalog: null, // 选中的目录
      parameterLabels: {}, // 参数标签集合
      paramFilters: {}, // 参数筛选条件

      // 选择器控制
      showSelector: false, // 是否显示选择器弹窗
      selectorStep: 'category', // 选择器步骤：'category' | 'catalog'
      showParamFilters: true, // 控制参数过滤器显示

      // 公司信息
      companyInfo: {},

      // 添加表格列定义
      columns: [],

      // 新增手册列表
      manualsList: [],

      // 手册分页参数
      manualsPage: 1,
      manualsPageSize: 10,
      manualsTotal: 0,
      manualsLoading: false,
    }
  },
  computed: {
    // 型号搜索结果
    filteredModelProducts() {
      if (!this.modelKeyword) return [];
      return this.allProducts.filter(product =>
        product.name.toLowerCase().includes(this.modelKeyword.toLowerCase())
      );
    },

    // 按目录分组的型号搜索结果
    groupedModelProducts() {
      // 按目录ID分组
      const groupsMap = {};

      this.filteredModelProducts.forEach(product => {
        const catalogId = product.catalogId;
        if (!catalogId) return;

        if (!groupsMap[catalogId]) {
          // 查找目录信息
          const catalog = product.catalog || {};
          const catalogName = catalog.name || '未知目录';

          // 创建列定义
          const paramTitles = catalog.paramTitles || Object.keys(product.parameters || {});
          const columns = paramTitles.map((key, index) => ({
            name: key,
            label: key,
            fixed: index === 0 ? 'left' : false,
          }));

          groupsMap[catalogId] = {
            catalogId,
            catalogName,
            columns,
            products: []
          };
        }

        // 添加产品到组
        groupsMap[catalogId].products.push({
          id: product.id,
          ...product.parameters
        });
      });
      // 转换为数组
      return Object.values(groupsMap);
    },
    // 参数搜索结果
    filteredProducts() {
      if (!this.selectedCatalog) return [];
      // 先筛选出当前目录下的产品
      const catalogProducts = this.allProducts.filter(product =>
        product.catalogId === this.selectedCatalog.id
      );

      // 根据参数条件筛选
      return catalogProducts.filter(product => {
        return Object.entries(this.paramFilters).every(([key, value]) => {
          // 如果是区间搜索
          if (typeof value === 'object') {
            if (!value.min || !value.max) return true;

            const paramStr = product.parameters[key];
            let paramMin, paramMax;
            if (paramStr.includes('～')) {
              const [minStr, maxStr] = paramStr.split('～');
              paramMin = !minStr || isNaN(parseFloat(minStr)) ? 0 : parseFloat(minStr);
              paramMax = !maxStr || isNaN(parseFloat(maxStr)) ? 999 : parseFloat(maxStr);
            } else {
              const singleValue = parseFloat(paramStr);
              if (isNaN(singleValue)) {
                paramMin = 0;
                paramMax = 999;
              } else {
                paramMin = paramMax = singleValue;
              }
            }

            const searchMin = parseFloat(value.min);
            const searchMax = parseFloat(value.max);

            return searchMin >= paramMin && searchMax <= paramMax;
          }
          // 普通搜索
          if (!value) return true;
          return product.parameters[key]?.toString().toLowerCase().includes(value.toLowerCase());
        });
      }).map(product => {
        // 将product.parameters直接展开作为表格行数据
        return {
          id: product.id,
          ...product.parameters
        };
      });
    },
    // 选择器标题
    selectorTitle() {
      return this.selectorStep === 'category' ? '选择产品分类' : '选择产品目录';
    },
    // 选择器列表数据
    selectorList() {
      return this.selectorStep === 'category' ? this.categories : this.catalogs;
    },
    // 选择器选中项ID
    selectedId() {
      return this.selectorStep === 'category'
        ? (this.selectedCategory && this.selectedCategory.id)
        : (this.selectedCatalog && this.selectedCatalog.id);
    },
    // 是否显示返回按钮
    showBack() {
      return this.selectorStep === 'catalog';
    },
    // 选择器显示文本
    getSelectedText() {
      if (this.selectedCatalog) {
        return `${this.selectedCategory.name} / ${this.selectedCatalog.name}`;
      }
      if (this.selectedCategory) {
        return this.selectedCategory.name;
      }
      return '选择分类/目录';
    }
  },
  async onLoad() {
    // 一次性加载所有数据
    await Promise.all([
      this.loadCategories(),
      this.loadAllProducts()
    ]);

    const info = uni.getStorageSync('companyInfo');
    if (info) {
      this.companyInfo = info;
    }

    // 加载产品手册列表
    this.loadManuals();
  },
  methods: {
    getUnifiedCloudUrl,
    // 切换标签页
    switchTab(index) {
      this.currentTab = index;
      this.modelKeyword = '';
      if (index !== 1) {
        this.selectedCategory = null;
        this.selectedCatalog = null;
        this.showParamFilters = false;
        this.parameterLabels = {};
        this.paramFilters = {};
      }
    },

    // 加载分类数据
    async loadCategories() {
      try {
        const { data } = await getCategories();
        if (data.code === 0) {
          this.categories = data.data;
        }
      } catch (e) {
        console.error(e);
      }
    },

    // 加载目录数据
    async loadCatalogs(categoryId) {
      try {
        const { data } = await getCatalogs({ categoryId });
        if (data.code === 0) {
          this.catalogs = data.data;
        }
      } catch (e) {
        console.error(e);
      }
    },

    // 加载所有产品数据
    async loadAllProducts() {
      try {
        const { data } = await getProducts();
        if (data.code === 0) {
          this.allProducts = data.data;
        }
      } catch (e) {
        console.error(e);
      }
    },

    // 打开选择器
    openSelector() {
      this.selectorStep = 'category';
      this.showSelector = true;
    },

    // 关闭选择器
    handleClose() {
      this.showSelector = false;
      this.selectorStep = 'category';
    },

    // 选择器选择事件
    async handleSelect(item) {
      if (this.selectorStep === 'category') {
        // 选择分类后加载目录
        this.selectedCategory = item;
        this.selectedCatalog = null;
        this.showParamFilters = false;
        this.parameterLabels = {};
        this.paramFilters = {};
        await this.loadCatalogs(item.id);
        this.selectorStep = 'catalog';
      } else {
        // 选择目录后关闭弹窗
        this.handleCatalogSelect(item);
        this.handleClose();
      }
    },

    // 选择器返回事件
    handleBack() {
      this.selectorStep = 'category';
    },

    // 处理目录选择
    handleCatalogSelect(catalog) {
      this.showParamFilters = false; // 先隐藏参数过滤器
      this.selectedCatalog = catalog;
      this.parameterLabels = {};
      this.paramFilters = {};

      // 提取参数标签
      const catalogProducts = this.allProducts.filter(product =>
        product.catalogId === catalog.id
      );

      if (catalogProducts.length > 0) {
        this.$nextTick(() => {
          this.parameterLabels = { ...catalogProducts[0].parameters };
          // 初始化参数筛选对象
          this.paramFilters = Object.keys(this.parameterLabels).reduce((acc, key) => {
            // 如果是区间参数，使用对象存储最大最小值
            if (this.parameterLabels[key].includes('～')) {
              acc[key] = { min: '', max: '' };
            } else {
              acc[key] = '';
            }
            return acc;
          }, {});

          // 更新表格列定义
          const paramTitles = catalog.paramTitles || Object.keys(catalogProducts[0].parameters || {});
          this.columns = paramTitles.map((key, index) => ({
            name: key,
            label: key,
            fixed: index === 0 ? 'left' : false,
          }));

          // 重新显示参数过滤器
          setTimeout(() => {
            this.showParamFilters = true;
          }, 0);
        });
      }
    },

    // 型号搜索处理
    handleModelSearch() {
      // 实时过滤，使用计算属性
    },

    // 参数筛选处理
    handleParamFilter() {
      // 实时过滤，使用计算属性
    },

    // 跳转到产品详情
    navigateToProduct(product) {
      // 如果是表格行点击，product是行数据
      const productId = product.id;
      if (productId) {
        uni.navigateTo({
          url: `/pages/product/detail?id=${productId}`
        });
      }
    },

    // 自定义搜索页分享内容
    onShareAppMessage() {
      let title = '产品搜索';
      let path = '/pages/search/index';

      // 如果在参数搜索页面且已选择分类和目录
      if (this.currentTab === 1 && this.selectedCategory && this.selectedCatalog) {
        title = `${this.selectedCategory.name} - ${this.selectedCatalog.name}`;
        path = `/pages/search/index?tab=1&categoryId=${this.selectedCategory.id}&catalogId=${this.selectedCatalog.id}`;
      }
      // 如果在型号搜索页面且有搜索关键词
      else if (this.currentTab === 0 && this.modelKeyword) {
        title = `搜索：${this.modelKeyword}`;
        path = `/pages/search/index?tab=0&keyword=${this.modelKeyword}`;
      }

      return {
        title: title,
        path: path,
        success: function (res) {
          uni.showToast({
            title: '分享成功',
            icon: 'none'
          });
        },
        fail: function (res) {
          uni.showToast({
            title: '分享失败',
            icon: 'none'
          });
        }
      }
    },

    // 添加处理文件下载的方法
    handleFileDownload(data) {
      wx.downloadFile({
        url: data.url,
        filePath: wx.env.USER_DATA_PATH+'/'+data.fileName + '.pdf',
        success: (res) => {
          uni.hideLoading();
          const filePath = res.filePath;
          wx.openDocument({
            filePath: filePath,
            showMenu: true,
            success: function (res) {
              console.log('打开文档成功');
            },
            fail: function (err) {
              uni.showToast({
                title: '打开文档失败',
                icon: 'none'
              });
            }
          });
        },
        fail: (err) => {
          uni.hideLoading();
          uni.showToast({
            title: '查看文件失败',
            icon: 'none'
          });
        }
      });
    },

    // 加载产品手册列表
    async loadManuals() {
      try {
        this.manualsLoading = true;
        const { data } = await getManuals({
          page: this.manualsPage,
          pageSize: this.manualsPageSize
        });
        if (data.code === 0) {
          this.manualsList = data.data.list;
          this.manualsTotal = data.data.total;
        }
      } catch (e) {
        console.error('加载产品手册失败', e);
      } finally {
        this.manualsLoading = false;
      }
    },

    // 切换手册页码
    changeManualsPage(page) {
      if (this.manualsLoading) return;
      if (page < 1 || page > Math.ceil(this.manualsTotal / this.manualsPageSize)) return;

      this.manualsPage = page;
      this.loadManuals();
    },

    // 修改为下载指定手册
    downloadManual(manual) {
      if (!manual.manual || !manual.manual.fileId) {
        uni.showToast({
          title: '手册文件不存在',
          icon: 'none'
        });
        return;
      }
      uni.showLoading({
        title: '正在获取下载链接...'
      });
      // 使用云函数获取下载链接
      wx.cloud.callContainer({
        config: {
          env: 'prod-3gdwxhfn933cdfa7', // 微信云托管的环境ID
        },
        header: {
          'X-WX-SERVICE': 'express-036x', // 服务名称
        },
        path: '/api/files/download',
        method: 'POST',
        data: {
          file_list: [{
            fileid: manual.manual.fileId,
            max_age: 60 * 60
          }]
        }
      }).then(data => {
        if (!data.data.data.file_list.length || !data.data.data.file_list[0].download_url) return;

        const downloadUrl = this.getUnifiedCloudUrl(data.data.data.file_list[0].download_url);
        const res = {
          url: downloadUrl,
          fileName: manual.manual.name
        }
        if(manual.type === 'view'){
          this.handleFileDownload(res);
        }else{
          uni.hideLoading();
          uni.setClipboardData({
            data: downloadUrl,
            success: () => {
              uni.showToast({
                  title: '复制成功',
                  icon: 'none'
              });
            }
          });
        }
      }).catch(error => {
        uni.showToast({
          title: '获取下载链接失败',
          icon: 'none'
        });
      });
    },
  }
}
</script>

<style lang="scss">
@import '@/common/style/common.scss';

.container {
  @include page-container;
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  // height: 100;
  // 添加蓝色主题的特定样式
  &.blue {
    .tabs {
      .tab-item {
        &.active {
          text {
            color: $primary-color;
          }
        }
      }
    }

    .search-input {
      .iconfont {
        color: $text-light;
      }
    }
  }

  .tabs {
    display: flex;
    background: $card-background;
    padding: 0 40rpx;
    margin: 20rpx 20rpx 0;
    border-radius: 16rpx;
    border: 1px solid rgba(255, 255, 255, 0.05);
    // backdrop-filter: blur(10px);

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
          content: '';
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

  .search-box {
    padding: 20rpx;

    .search-input {
      background: $card-background;
      border-radius: 16rpx;
      padding: 20rpx 30rpx;
      display: flex;
      align-items: center;
      border: 1px solid rgba(255, 255, 255, 0.05);
      // backdrop-filter: blur(10px);

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
  }

  .param-search {
    padding: 20rpx;

    .filter-box {
      background: $card-background;
      border-radius: 16rpx;
      padding: 20rpx;
      border: 1px solid rgba(255, 255, 255, 0.05);
      // backdrop-filter: blur(10px);

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
  }

  .search-results {
    margin-top: 20rpx;
    // height: 40vh;
    // padding: 20rpx;

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

    .product-item {
      @include list-item;
      margin-bottom: 20rpx;

      .product-content {
        width: 100%;

        .product-info {
          flex: 1;
          margin-right: 20rpx;

          .product-name {
            font-size: 32rpx;
            color: $text-primary;
            font-weight: 500;
            margin-bottom: 16rpx;
            @include text-ellipsis;
          }

          .product-params {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;

            .param-item {
              width: 45%;
              display: flex;
              align-items: center;
              margin-bottom: 8rpx;

              &:last-child {
                margin-bottom: 0;
              }

              .param-label {
                font-size: 24rpx;
                color: $text-secondary;
                margin-right: 16rpx;
                min-width: 120rpx;
              }

              .param-value {
                font-size: 24rpx;
                color: $text-primary;
                @include text-ellipsis;
                flex: 1;
              }
            }
          }
        }

        .iconfont {
          color: rgba(255, 255, 255, 0.3);
          font-size: 24rpx;
        }
      }
    }
  }
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
      font-size: 28rpx;
      color: $text-primary;
    }

    .download-text {
      font-size: 28rpx;
      color: $primary-color;
      background: rgba($primary-color, 0.1);
      padding: 12rpx 40rpx;
      border-radius: 30rpx;
      border: 1px solid rgba($primary-color, 0.2);
    }
  }

  .tip-box {
    padding: 20rpx 30rpx;

    .tip-text {
      font-size: 24rpx;
      color: $text-secondary;
      line-height: 1.6;
    }
  }
}

// 添加分页控件样式
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

      .iconfont {
        font-size: 24rpx;
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