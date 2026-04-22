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

    <!-- 型号搜索：直接通过产品名称搜索 -->
    <view class="search-box" v-if="currentTab === 0">
      <view class="search-input">
        <text class="iconfont icon-search"></text>
        <input
          type="text"
          v-model="modelKeyword"
          placeholder="请输入产品型号搜索"
          @input="handleModelSearch"
        />
      </view>

      <!-- 型号搜索结果列表 -->
      <view class="search-results">
        <view
          class="empty-state"
          v-if="filteredModelProducts.length === 0 && modelKeyword"
        >
          <text class="iconfont icon-empty"></text>
          <text>未找到相关产品</text>
        </view>

        <!-- 使用表格显示搜索结果 -->
        <view v-if="filteredModelProducts.length > 0">
          <!-- 按目录分组显示产品 -->
          <view
            v-for="(group, index) in groupedModelProducts"
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
        <view
          class="param-item"
          v-for="param in parameterLabels"
          :key="param.id"
        >
          <text class="param-label">{{ param.title }}</text>
          <!-- 区间搜索 -->
          <template v-if="param.sampleValue && param.sampleValue.includes('～')">
            <view class="range-inputs">
              <input
                type="text"
                v-model="paramFilters[param.id].min"
                :placeholder="'最小值'"
                @input="handleParamFilter"
                class="range-input"
              />
              <text class="range-separator">-</text>
              <input
                type="text"
                v-model="paramFilters[param.id].max"
                :placeholder="'最大值'"
                @input="handleParamFilter"
                class="range-input"
              />
            </view>
          </template>
          <!-- 普通搜索 -->
          <template v-else>
            <input
              type="text"
              v-model="paramFilters[param.id]"
              :placeholder="'请输入' + param.title"
              @input="handleParamFilter"
              class="normal-input"
            />
          </template>
        </view>
      </view>

      <!-- 参数搜索结果列表 -->
      <view
        class="search-results"
        style="height: 40vh"
        v-if="filteredProducts.length > 0"
      >
        <zb-table
          :columns="columns"
          :data="filteredProducts"
          :fit="true"
          :border="true"
          :stripe="true"
          height="calc(100vh - 400rpx)"
          @row-click="navigateToProduct"
        >
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
        <view class="tip-box">
          <text class="tip-text"
            >点击下载按钮可分享好友或在浏览器粘贴链接进行下载,点击查看按钮可查看PDF,右上角保存或转发文件,文件较大，请在wifi环境下载查看</text
          >
        </view>
        <!-- 替换原有的单个PDF下载为手册列表 -->
        <view v-if="manualsList.length > 0">
          <view
            class="pdf-box"
            v-for="(manual, index) in manualsList"
            :key="manual.id"
          >
            <text class="pdf-name">{{ manual.name }}</text>
            <view class="download-box">
              <text
                class="download-text"
                style="margin-right: 20rpx"
                @tap="downloadManual({ manual, type: 'view' })"
                >查看</text
              >
              <text
                class="download-text"
                @tap="downloadManual({ manual, type: 'copy' })"
                >下载</text
              >
            </view>
          </view>

          <!-- 分页控制 -->
          <view class="pagination" v-if="manualsTotal > manualsPageSize">
            <view class="pagination-info">
              <text>共 {{ manualsTotal }} 条</text>
            </view>
            <view class="pagination-controls">
              <view
                class="pagination-btn"
                :class="{ disabled: manualsPage <= 1 }"
                @tap="changeManualsPage(manualsPage - 1)"
              >
                <text class="iconfont icon-left"></text>
              </view>
              <view class="pagination-page">
                <text>{{ manualsPage }}</text>
              </view>
              <view
                class="pagination-btn"
                :class="{
                  disabled:
                    manualsPage >= Math.ceil(manualsTotal / manualsPageSize),
                }"
                @tap="changeManualsPage(manualsPage + 1)"
              >
                <text class="iconfont icon-right"></text>
              </view>
            </view>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text class="iconfont icon-empty"></text>
          <text>暂无产品手册</text>
        </view>
      </view>
    </view>

    <!-- 分类/目录选择弹窗 -->
    <popup-selector
      :show="showSelector"
      :title="selectorTitle"
      :list="selectorList"
      :selectedId="selectedId"
      :showBack="showBack"
      @close="handleClose"
      @select="handleSelect"
      @back="handleBack"
    />

    <!-- 圆形下载进度条（右下角悬浮） -->
    <view class="download-progress-container" v-if="isDownloading">
      <view
        class="progress-circle"
        @touchstart="handleLongPressStart"
        @touchend="handleLongPressEnd"
        @touchcancel="handleLongPressEnd"
      >
        <!-- Canvas 绘制双圆环进度条 -->
        <canvas
          type="2d"
          id="progressCanvas"
          class="progress-canvas"
        ></canvas>
        <!-- 进度信息 -->
        <view class="progress-info">
          <view class="progress-percent">{{ Math.round(downloadProgress) }}%</view>
        </view>
        <!-- 长按提示 -->
        <view class="long-press-hint" v-if="showLongPressHint">
          <view class="hint-text">{{ canCancelDownload ? '松手取消' : '长按3秒取消' }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  getCategories,
  getCatalogs,
  getProducts,
  getManuals,
} from "@/api/index.js";
import PopupSelector from "@/components/PopupSelector.vue";
import shareMixin from "@/mixins/share.js";
import { getUnifiedCloudUrl } from "@/utils/common.js";

export default {
  mixins: [shareMixin],
  components: {
    PopupSelector,
  },
  data() {
    return {
      // 标签页配置
      tabs: ["型号搜索", "参数搜索", "资料下载"],
      currentTab: 0,

      // 数据缓存
      allProducts: [], // 所有产品数据
      categories: [], // 所有分类数据
      catalogs: [], // 当前分类下的目录数据

      // 型号搜索
      modelKeyword: "", // 型号搜索关键词

      // 参数搜索
      selectedCategory: null, // 选中的分类
      selectedCatalog: null, // 选中的目录
      parameterLabels: [], // 参数标签列表 [{id, title, sampleValue}]
      paramFilters: {}, // 参数筛选条件

      // 选择器控制
      showSelector: false, // 是否显示选择器弹窗
      selectorStep: "category", // 选择器步骤：'category' | 'catalog'
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

      // 下载进度
      downloadProgress: 0,
      isDownloading: false,
      downloadStartTime: 0,      // 下载开始时间
      downloadElapsedTime: 0,    // 已用时间（秒）
      maxDownloadTime: 120,      // 最大下载时间（秒），即 timeout
      countdownTimer: null,      // 倒计时定时器
      canvasContext: null,       // Canvas 上下文
      downloadTask: null,        // 下载任务对象

      // 长按取消
      showLongPressHint: false,  // 是否显示长按提示
      canCancelDownload: false,  // 是否可以取消下载（3秒后）
      longPressTimer: null,      // 长按定时器
    };
  },
  // 将 fileCache 移到 data 外面，避免响应式处理导致的错误
  // 因为 fileId 包含特殊字符（/、: 等），不适合作为响应式对象的 key
  onLoad() {
    this.fileCache = {};
  },
  watch: {
    // 监听进度和时间变化，重绘 canvas
    downloadProgress() {
      if (this.isDownloading) {
        this.drawProgress();
      }
    },
    downloadElapsedTime() {
      if (this.isDownloading) {
        this.drawProgress();
      }
    },
    isDownloading(val) {
      if (val) {
        // 开始下载时初始化 canvas，延迟确保 DOM 渲染完成
        this.$nextTick(() => {
          setTimeout(() => {
            this.initCanvas();
          }, 100);
        });
      }
    }
  },
  computed: {
    // 下载进度圆环周长（内圈）
    progressCircumference() {
      return 2 * Math.PI * 38; // 半径为 38
    },
    // 下载进度偏移量
    progressOffset() {
      return this.progressCircumference - (this.downloadProgress / 100) * this.progressCircumference;
    },
    // 倒计时圆环周长（外圈）
    countdownCircumference() {
      return 2 * Math.PI * 45; // 半径为 45
    },
    // 倒计时偏移量（随时间减少）
    countdownOffset() {
      const timeProgress = (this.downloadElapsedTime / this.maxDownloadTime) * 100;
      return this.countdownCircumference - (timeProgress / 100) * this.countdownCircumference;
    },
    // 填充圆的半径（根据进度从 0 到 35）
    fillRadius() {
      return (this.downloadProgress / 100) * 35;
    },
    // 型号搜索结果
    filteredModelProducts() {
      if (!this.modelKeyword) return [];
      return this.allProducts.filter((product) =>
        product.name.toLowerCase().includes(this.modelKeyword.toLowerCase())
      );
    },

    // 按目录分组的型号搜索结果
    groupedModelProducts() {
      // 按目录ID分组
      const groupsMap = {};

      this.filteredModelProducts.forEach((product) => {
        const catalogId = product.catalogId;
        if (!catalogId) return;

        if (!groupsMap[catalogId]) {
          // 查找目录信息
          const catalog = product.catalog || {};
          const catalogName = catalog.name || "未知目录";

          // 创建列定义 - 适配新的 paramTitles 格式 [{id, title}]
          const paramTitles =
            catalog.paramTitles || Object.keys(product.parameters || {});
          const columns = paramTitles.map((param, index) => ({
            // 兼容旧格式（字符串）和新格式（对象）
            name: typeof param === 'string' ? param : param.id,
            label: typeof param === 'string' ? param : param.title,
            fixed: index === 0 ? "left" : false,
          }));

          groupsMap[catalogId] = {
            catalogId,
            catalogName,
            columns,
            products: [],
          };
        }

        // 添加产品到组
        groupsMap[catalogId].products.push({
          id: product.id,
          ...product.parameters,
        });
      });
      // 转换为数组
      return Object.values(groupsMap);
    },
    // 参数搜索结果
    filteredProducts() {
      if (!this.selectedCatalog) return [];
      // 先筛选出当前目录下的产品
      const catalogProducts = this.allProducts.filter(
        (product) => product.catalogId === this.selectedCatalog.id
      );

      // 根据参数条件筛选
      return catalogProducts
        .filter((product) => {
          return Object.entries(this.paramFilters).every(([key, value]) => {
            // 如果是区间搜索
            if (typeof value === "object") {
              if (!value.min || !value.max) return true;

              const paramStr = product.parameters[key];
              let paramMin, paramMax;
              if (paramStr.includes("～")) {
                const [minStr, maxStr] = paramStr.split("～");
                paramMin =
                  !minStr || isNaN(parseFloat(minStr)) ? 0 : parseFloat(minStr);
                paramMax =
                  !maxStr || isNaN(parseFloat(maxStr))
                    ? 999
                    : parseFloat(maxStr);
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
            return product.parameters[key]
              ?.toString()
              .toLowerCase()
              .includes(value.toLowerCase());
          });
        })
        .map((product) => {
          // 将product.parameters直接展开作为表格行数据
          return {
            id: product.id,
            ...product.parameters,
          };
        });
    },
    // 选择器标题
    selectorTitle() {
      return this.selectorStep === "category" ? "选择产品分类" : "选择产品目录";
    },
    // 选择器列表数据
    selectorList() {
      return this.selectorStep === "category" ? this.categories : this.catalogs;
    },
    // 选择器选中项ID
    selectedId() {
      return this.selectorStep === "category"
        ? this.selectedCategory && this.selectedCategory.id
        : this.selectedCatalog && this.selectedCatalog.id;
    },
    // 是否显示返回按钮
    showBack() {
      return this.selectorStep === "catalog";
    },
    // 选择器显示文本
    getSelectedText() {
      if (this.selectedCatalog) {
        return `${this.selectedCategory.name} / ${this.selectedCatalog.name}`;
      }
      if (this.selectedCategory) {
        return this.selectedCategory.name;
      }
      return "选择分类/目录";
    },
  },
  async onLoad() {
    // 一次性加载所有数据
    await Promise.all([this.loadCategories(), this.loadAllProducts()]);

    const info = uni.getStorageSync("companyInfo");
    if (info) {
      this.companyInfo = info;
    }

    // 从本地存储恢复文件缓存
    try {
      const cachedFiles = uni.getStorageSync("fileCache");
      if (cachedFiles && typeof cachedFiles === "object") {
        this.fileCache = cachedFiles;
      }
    } catch (e) {
      console.error("恢复文件缓存失败:", e);
      this.fileCache = {};
    }

    // 加载产品手册列表
    this.loadManuals();
  },
  methods: {
    getUnifiedCloudUrl,
    // 切换标签页
    switchTab(index) {
      this.currentTab = index;
      this.modelKeyword = "";
      if (index !== 1) {
        this.selectedCategory = null;
        this.selectedCatalog = null;
        this.showParamFilters = false;
        this.parameterLabels = [];
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
      this.selectorStep = "category";
      this.showSelector = true;
    },

    // 关闭选择器
    handleClose() {
      this.showSelector = false;
      this.selectorStep = "category";
    },

    // 选择器选择事件
    async handleSelect(item) {
      if (this.selectorStep === "category") {
        // 选择分类后加载目录
        this.selectedCategory = item;
        this.selectedCatalog = null;
        this.showParamFilters = false;
        this.parameterLabels = [];
        this.paramFilters = {};
        await this.loadCatalogs(item.id);
        this.selectorStep = "catalog";
      } else {
        // 选择目录后关闭弹窗
        this.handleCatalogSelect(item);
        this.handleClose();
      }
    },

    // 选择器返回事件
    handleBack() {
      this.selectorStep = "category";
    },

    // 处理目录选择
    handleCatalogSelect(catalog) {
      this.showParamFilters = false; // 先隐藏参数过滤器
      this.selectedCatalog = catalog;
      this.parameterLabels = [];
      this.paramFilters = {};

      // 提取参数标签
      const catalogProducts = this.allProducts.filter(
        (product) => product.catalogId === catalog.id
      );

      if (catalogProducts.length > 0) {
        this.$nextTick(() => {
          // 适配新的 paramTitles 格式 [{id, title}]
          const paramTitles = catalog.paramTitles || [];
          const sampleParams = catalogProducts[0].parameters || {};

          // 构建参数标签列表 [{id, title, sampleValue}]
          this.parameterLabels = paramTitles.map(param => {
            const id = typeof param === 'string' ? param : param.id;
            const title = typeof param === 'string' ? param : param.title;
            const sampleValue = sampleParams[id] || '';
            return { id, title, sampleValue };
          });

          // 初始化参数筛选对象，key 为 id
          this.paramFilters = this.parameterLabels.reduce(
            (acc, param) => {
              // 如果是区间参数，使用对象存储最大最小值
              if (param.sampleValue && param.sampleValue.includes("～")) {
                acc[param.id] = { min: "", max: "" };
              } else {
                acc[param.id] = "";
              }
              return acc;
            },
            {}
          );

          // 更新表格列定义 - 适配新的 paramTitles 格式 [{id, title}]
          const paramTitles =
            catalog.paramTitles ||
            Object.keys(catalogProducts[0].parameters || {});
          this.columns = paramTitles.map((param, index) => ({
            // 兼容旧格式（字符串）和新格式（对象）
            name: typeof param === 'string' ? param : param.id,
            label: typeof param === 'string' ? param : param.title,
            fixed: index === 0 ? "left" : false,
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
          url: `/pages/product/detail?id=${productId}`,
        });
      }
    },

    // 自定义搜索页分享内容
    onShareAppMessage() {
      let title = "产品搜索";
      let path = "/pages/search/index";

      // 如果在参数搜索页面且已选择分类和目录
      if (
        this.currentTab === 1 &&
        this.selectedCategory &&
        this.selectedCatalog
      ) {
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
            title: "分享成功",
            icon: "none",
          });
        },
        fail: function (res) {
          uni.showToast({
            title: "分享失败",
            icon: "none",
          });
        },
      };
    },

    // 检查文件是否存在
    checkFileExists(filePath) {
      return new Promise((resolve) => {
        wx.getFileSystemManager().access({
          path: filePath,
          success: () => resolve(true),
          fail: () => resolve(false),
        });
      });
    },

    // 打开文档
    openDocument(filePath) {
      uni.hideLoading();
      wx.openDocument({
        filePath: filePath,
        showMenu: true,
        success: () => {
          console.log("打开文档成功");
        },
        fail: () => {
          uni.showToast({
            title: "打开文档失败",
            icon: "none",
          });
        },
      });
    },

    // 启动倒计时
    startCountdown() {
      this.stopCountdown(); // 先清除之前的定时器
      this.countdownTimer = setInterval(() => {
        this.downloadElapsedTime = (Date.now() - this.downloadStartTime) / 1000;
      }, 100); // 每 100ms 更新一次
    },

    // 停止倒计时
    stopCountdown() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
    },

    // 长按开始
    handleLongPressStart() {
      // 立即显示"长按3秒取消"提示
      this.showLongPressHint = true;
      this.canCancelDownload = false;

      // 震动反馈
      wx.vibrateShort({
        type: 'medium'
      });

      // 3 秒后可以取消
      this.longPressTimer = setTimeout(() => {
        this.canCancelDownload = true;
        // 再次震动提示可以松手取消
        wx.vibrateShort({
          type: 'heavy'
        });
      }, 3000);
    },

    // 长按结束
    handleLongPressEnd() {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }

      // 如果已经满 3 秒，则执行取消操作
      if (this.canCancelDownload) {
        this.cancelDownload();
      }

      // 重置状态
      this.showLongPressHint = false;
      this.canCancelDownload = false;
    },

    // 取消下载
    cancelDownload() {
      if (this.downloadTask) {
        this.downloadTask.abort();
        this.downloadTask = null;
      }

      // 停止倒计时
      this.stopCountdown();

      // 重置状态
      this.isDownloading = false;
      this.downloadProgress = 0;
      this.downloadElapsedTime = 0;

      // 提示取消成功
      uni.showToast({
        title: '已取消下载',
        icon: 'none',
        duration: 2000
      });
    },

    // 初始化 Canvas
    initCanvas() {
      const query = uni.createSelectorQuery().in(this);
      query.select('#progressCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res && res[0] && res[0].node) {
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');

            // 设置画布尺寸（高分辨率）
            const dpr = uni.getSystemInfoSync().pixelRatio || 2;
            canvas.width = 180 * dpr;
            canvas.height = 180 * dpr;
            ctx.scale(dpr, dpr);

            this.canvasContext = ctx;
            this.canvas = canvas;
            this.drawProgress();
          } else {
            console.error('Canvas 节点获取失败');
          }
        });
    },

    // 绘制进度条
    drawProgress() {
      if (!this.canvasContext) return;

      const ctx = this.canvasContext;
      const centerX = 90;
      const centerY = 90;

      // 清空画布
      ctx.clearRect(0, 0, 180, 180);

      // 1. 绘制填充圆（中心，根据进度扩大）
      const fillRadius = (this.downloadProgress / 100) * 35;
      if (fillRadius > 0) {
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, fillRadius);
        gradient.addColorStop(0, 'rgba(82, 196, 26, 0.3)');
        gradient.addColorStop(1, 'rgba(24, 144, 255, 0.1)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, fillRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. 绘制倒计时圆环背景（最外圈，半径 80）
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.2)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
      ctx.stroke();

      // 3. 绘制倒计时圆环进度（最外圈，红色粗线，从满圆逐渐减少）
      const timeProgress = Math.min((this.downloadElapsedTime / this.maxDownloadTime), 1);
      const remainingAngle = Math.PI * 2 * (1 - timeProgress); // 剩余角度
      if (remainingAngle > 0) {
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 6; // 加粗红线
        ctx.lineCap = 'round';
        ctx.beginPath();
        // 从顶部开始，绘制剩余的圆弧（满圆 → 逐渐减少）
        ctx.arc(centerX, centerY, 80, -Math.PI / 2, -Math.PI / 2 + remainingAngle);
        ctx.stroke();
      }

      // 4. 绘制下载进度圆环背景（内圈，半径 65）
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 65, 0, Math.PI * 2);
      ctx.stroke();

      // 5. 绘制下载进度圆环（内圈，蓝绿渐变）
      const progressAngle = (Math.PI * 2 * this.downloadProgress) / 100;
      if (this.downloadProgress > 0) {
        // 创建渐变色
        const gradient = ctx.createLinearGradient(0, 0, 180, 180);
        gradient.addColorStop(0, '#1890ff');
        gradient.addColorStop(1, '#52c41a');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 65, -Math.PI / 2, -Math.PI / 2 + progressAngle);
        ctx.stroke();
      }

      // Canvas 2D API 会自动渲染，不需要手动 draw
    },

    // 添加处理文件下载的方法
    async handleFileDownload(data) {
      const filePath = wx.env.USER_DATA_PATH + "/" + data.fileName + ".pdf";

      // 确保 fileCache 是对象
      if (!this.fileCache || typeof this.fileCache !== "object") {
        this.fileCache = {};
      }

      // 检查文件是否已缓存
      if (this.fileCache[data.fileId]) {
        const cachedPath = this.fileCache[data.fileId];
        const exists = await this.checkFileExists(cachedPath);
        if (exists) {
          uni.hideLoading();
          uni.showToast({
            title: "正在打开...",
            icon: "none",
            duration: 500,
          });
          setTimeout(() => {
            this.openDocument(cachedPath);
          }, 100);
          return;
        } else {
          // 缓存失效，删除缓存记录
          delete this.fileCache[data.fileId];
          // 同步到本地存储
          try {
            uni.setStorageSync("fileCache", this.fileCache);
          } catch (e) {
            console.error("保存缓存失败:", e);
          }
        }
      }

      // 下载新文件
      this.isDownloading = true;
      this.downloadProgress = 0;
      this.downloadStartTime = Date.now();
      this.downloadElapsedTime = 0;
      this.maxDownloadTime = 120; // 最大下载时间 100 秒
      uni.hideLoading(); // 关闭 loading，改用进度条显示

      // 启动倒计时定时器
      this.startCountdown();

      // 创建下载任务并保存引用
      this.downloadTask = wx.downloadFile({
        url: data.url,
        filePath: filePath,
        timeout: 120000, // 超时时间 120 秒（120000ms = 120秒）
        success: (res) => {
          // 保存到内存缓存
          this.fileCache[data.fileId] = res.filePath;
          // 持久化到本地存储
          try {
            uni.setStorageSync("fileCache", this.fileCache);
          } catch (e) {
            console.error("保存缓存失败:", e);
          }

          // 下载完成，隐藏进度条
          this.stopCountdown();
          this.isDownloading = false;
          this.downloadProgress = 0;

          // 打开文档
          this.openDocument(res.filePath);
        },
        fail: (e) => {
          // 下载失败，隐藏进度条
          this.stopCountdown();
          this.isDownloading = false;
          this.downloadProgress = 0;

          uni.showToast({
            title: "下载文件失败",
            icon: "none",
          });
        },
      });

      // 监听下载进度
      this.downloadTask.onProgressUpdate((res) => {
        this.downloadProgress = res.progress;
      });
    },

    // 加载产品手册列表
    async loadManuals() {
      try {
        this.manualsLoading = true;
        const { data } = await getManuals({
          page: this.manualsPage,
          pageSize: this.manualsPageSize,
        });
        if (data.code === 0) {
          this.manualsList = data.data.list;
          this.manualsTotal = data.data.total;
        }
      } catch (e) {
        console.error("加载产品手册失败", e);
      } finally {
        this.manualsLoading = false;
      }
    },

    // 切换手册页码
    changeManualsPage(page) {
      if (this.manualsLoading) return;
      if (
        page < 1 ||
        page > Math.ceil(this.manualsTotal / this.manualsPageSize)
      )
        return;

      this.manualsPage = page;
      this.loadManuals();
    },

    // 修改为下载指定手册
    downloadManual(manual) {
      if (!manual.manual || !manual.manual.fileId) {
        uni.showToast({
          title: "手册文件不存在",
          icon: "none",
        });
        return;
      }
      uni.showLoading({
        title: "正在获取链接...",
      });
      // 使用云函数获取下载链接
      wx.cloud
        .callContainer({
          config: {
            env: "prod-3gdwxhfn933cdfa7", // 微信云托管的环境ID
          },
          header: {
            "X-WX-SERVICE": "express-036x", // 服务名称
          },
          path: "/api/files/download",
          method: "POST",
          data: {
            file_list: [
              {
                fileid: manual.manual.fileId,
                max_age: 60 * 60,
              },
            ],
          },
        })
        .then((data) => {
          if (
            !data.data.data.file_list.length ||
            !data.data.data.file_list[0].download_url
          ) {
            uni.hideLoading();
            uni.showToast({
              title: "获取下载链接失败",
              icon: "none",
            });
            return;
          }

          const downloadUrl = this.getUnifiedCloudUrl(
            data.data.data.file_list[0].download_url
          );
          const fileData = {
            url: downloadUrl,
            fileName: manual.manual.name,
            fileId: manual.manual.fileId,
          };
          if (manual.type === "view") {
            // 更新加载提示为下载中
            uni.showLoading({
              title: "正在下载...",
            });
            this.handleFileDownload(fileData);
          } else {
            uni.hideLoading();
            uni.setClipboardData({
              data: downloadUrl,
              success: () => {
                uni.showToast({
                  title: "复制成功",
                  icon: "none",
                });
              },
            });
          }
        })
        .catch((error) => {
          uni.hideLoading();
          uni.showToast({
            title: "获取下载链接失败",
            icon: "none",
          });
        });
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
      flex: 1;
      font-size: 28rpx;
      color: $text-primary;
    }
    .download-box{
      width: 50%;
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
      font-size: 28rpx;
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

// 圆形下载进度条样式
.download-progress-container {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;

  .progress-circle {
    position: relative;
    width: 180rpx;
    height: 180rpx;
    background: rgba(0, 0, 0, 0.85);
    border-radius: 50%;
    backdrop-filter: blur(10px);
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;

    .progress-canvas {
      position: absolute;
      width: 180rpx;
      height: 180rpx;
      top: 0;
      left: 0;
    }

    .progress-info {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .progress-percent {
        font-size: 40rpx;
        font-weight: bold;
        color: #fff;
        text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.5);
      }
    }

    // 长按提示
    .long-press-hint {
      position: absolute;
      top: -60rpx;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 68, 68, 0.95);
      padding: 12rpx 24rpx;
      border-radius: 20rpx;
      white-space: nowrap;
      animation: bounceIn 0.3s ease;
      box-shadow: 0 4rpx 16rpx rgba(255, 68, 68, 0.4);

      &::after {
        content: '';
        position: absolute;
        bottom: -8rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8rpx solid transparent;
        border-right: 8rpx solid transparent;
        border-top: 8rpx solid rgba(255, 68, 68, 0.95);
      }

      .hint-text {
        font-size: 24rpx;
        color: #fff;
        font-weight: bold;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0.5);
  }
  60% {
    opacity: 1;
    transform: translateX(-50%) scale(1.1);
  }
  100% {
    transform: translateX(-50%) scale(1);
  }
}
</style>
