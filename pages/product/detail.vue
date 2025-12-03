<template>
  <view class="container">
    <view class="product-detail" v-if="product">
      <!-- 产品基本信息 -->
      <view class="header-card">
        <view class="product-info">
          <text class="product-name">{{ product.name }}</text>
          <text class="catalog-name" v-if="product.catalog">{{ product.catalog.name }}</text>
        </view>
      </view>

      <!-- 产品参数列表 -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">产品参数</text>
        </view>
        <view class="params-list">
          <view class="param-item" v-for="(value, key) in product.parameters" :key="key">
            <text class="param-label">{{ key }}</text>
            <text class="param-value">{{ value || '-' }}</text>
          </view>
        </view>
      </view>

      <!-- PDF文档 -->
      <view class="section-card" v-if="product.pdfUrl">
        <view class="section-header">
          <text class="section-title">技术文档</text>
        </view>
        <!-- 当链接正在加载时显示加载中状态 -->
        <view class="pdf-loading" v-if="isLoadingPdf">
          <text class="iconfont icon-loading loading-icon"></text>
          <text class="loading-text">正在准备文档...</text>
        </view>
        <!-- 文档操作按钮 -->
        <view v-else>
          <view class="pdf-box" @tap="openPdf">
            <text class="pdf-name">产品数据手册</text>
            <text class="download-text">查看文档</text>
          </view>
          <view class="pdf-box" @tap="copyLink">
            <text class="pdf-name">产品数据手册</text>
            <text class="download-text">复制链接</text>
          </view>
        </view>
        <view class="pdf-box tip-box" style="font-size: 24rpx; color: #fff; margin-top: 20rpx;">
          点击复制按钮可分享好友或在浏览器粘贴链接进行下载,点击查看按钮可查看PDF,右上角保存或转发文件
        </view>
      </view>


    </view>
  </view>
</template>

<script>
import { getProductDetail } from '@/api/index.js';
import shareMixin from '@/mixins/share.js';

export default {
  mixins: [shareMixin],
  data() {
    return {
      id: '',
      product: null,
      pdfDownloadUrl: '', // 存储 PDF 下载链接
      pdfTempFilePath: '', // 缓存临时文件路径
      isLoadingPdf: false, // PDF 加载状态
      isDownloadingPdf: false // PDF 下载状态
    }
  },
  // 文件缓存（不放在 data 中，避免响应式处理特殊字符 key）
  created() {
    this.fileCache = {};
  },
  onLoad(options) {
    this.id = options.id;
    this.loadProductDetail();

    // 从本地存储恢复文件缓存
    try {
      const cachedFiles = uni.getStorageSync('detailFileCache');
      if (cachedFiles && typeof cachedFiles === 'object') {
        this.fileCache = cachedFiles;
        console.log('已恢复详情页文件缓存:', this.fileCache);
      }
    } catch (e) {
      console.error('恢复文件缓存失败:', e);
      this.fileCache = {};
    }
  },
  // 自定义分享内容
  onShareAppMessage() {
    return {
      title: this.product ? this.product.name : '产品详情',
      path: `/pages/product/detail?id=${this.id}`,
      success: function(res) {
        uni.showToast({
          title: '分享成功',
          icon: 'none'
        });
      },
      fail: function(res) {
        uni.showToast({
          title: '分享失败',
          icon: 'none'
        });
      }
    }
  },
  methods: {
    // 获取产品详情
    async loadProductDetail() {
      try {
        const { data } = await getProductDetail(this.id);
        if (data.code === 0) {
          this.product = data.data;
          uni.setNavigationBarTitle({
            title: this.product.name
          });
          
          // 如果产品有 PDF 文件，立即获取下载链接
          if (this.product.fileID) {
            this.getPdfDownloadUrl();
          }
        } else {
          uni.showToast({
            title: '获取产品详情失败',
            icon: 'none'
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
    
    // 检查文件是否存在
    checkFileExists(filePath) {
      return new Promise((resolve) => {
        wx.getFileSystemManager().access({
          path: filePath,
          success: () => resolve(true),
          fail: () => resolve(false)
        });
      });
    },

    // 获取 PDF 下载链接
    getPdfDownloadUrl() {
      if (!this.product?.fileID || this.isLoadingPdf) return;
      
      this.isLoadingPdf = true;
      uni.showLoading({
        title: '准备文档...',
		
      });
      
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
            fileid: this.product.fileID,
            max_age: 60 * 60
          }]
        }
      }).then(data => {
        uni.hideLoading();
        this.isLoadingPdf = false;
        
        if (!data.data.data.file_list.length || !data.data.data.file_list[0].download_url) {
          uni.showToast({
            title: '获取文档链接失败',
            icon: 'none'
          });
          return;
        }
        
        this.pdfDownloadUrl = data.data.data.file_list[0].download_url;
      }).catch(error => {
        uni.hideLoading();
        this.isLoadingPdf = false;
        uni.showToast({
          title: '获取文档链接失败',
          icon: 'none'
        });
      });
    },
    
    // 抽离的下载文件方法，返回下载后的文件路径
    async downloadPdfFile() {
      if (!this.pdfDownloadUrl) {
        // 如果尚未获取到链接，则尝试重新获取
        if (this.product?.fileID) {
          this.getPdfDownloadUrl();
          uni.showToast({
            title: '正在准备文档，请稍后再试',
            icon: 'none'
          });
        } else {
          uni.showToast({
            title: '文档不存在',
            icon: 'none'
          });
        }
        return null;
      }

      // 确保 fileCache 是对象
      if (!this.fileCache || typeof this.fileCache !== 'object') {
        this.fileCache = {};
      }

      const fileId = this.product.fileID;

      // 检查缓存中是否有该文件
      if (this.fileCache[fileId]) {
        const cachedPath = this.fileCache[fileId];
        const exists = await this.checkFileExists(cachedPath);

        if (exists) {
          console.log('使用缓存文件:', cachedPath);
          this.pdfTempFilePath = cachedPath;
          return cachedPath;
        } else {
          // 缓存失效，删除记录
          console.log('缓存文件不存在，删除记录');
          delete this.fileCache[fileId];
          uni.setStorageSync('detailFileCache', this.fileCache);
        }
      }

      // 如果已经有缓存的文件路径，直接返回
      if (this.pdfTempFilePath) {
        return this.pdfTempFilePath;
      }
      
      if (this.isDownloadingPdf) {
        uni.showToast({
          title: '文档正在下载中，请稍候',
          icon: 'none'
        });
        return null;
      }
      
      this.isDownloadingPdf = true;
      uni.showLoading({
        title: '正在下载文档...'
      });
      
      try {
        const result = await new Promise((resolve, reject) => {
          wx.downloadFile({
            url: this.pdfDownloadUrl,
            filePath: wx.env.USER_DATA_PATH+'/'+this.product.name+'.pdf',
            success: res => resolve(res),
            fail: err => reject(err)
          });
        });
        
        uni.hideLoading();
        this.isDownloadingPdf = false;

        if (result.statusCode === 200) {
          this.pdfTempFilePath = result.filePath;

          // 保存到缓存
          const fileId = this.product.fileID;
          this.fileCache[fileId] = result.filePath;
          uni.setStorageSync('detailFileCache', this.fileCache);
          console.log('文件已缓存:', fileId, result.filePath);

          return result.filePath;
        } else {
          throw new Error('下载失败，状态码：' + result.statusCode);
        }
      } catch (error) {
        uni.hideLoading();
        this.isDownloadingPdf = false;
        uni.showToast({
          title: '下载文件失败',
          icon: 'none'
        });
        return null;
      }
    },
    
    // 查看PDF
    async openPdf() {
      const filePath = await this.downloadPdfFile();
      if (!filePath) return;
      
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
    
    // 复制链接
    async copyLink() {
      // 复制链接到剪贴板
      if (this.pdfDownloadUrl) {
        uni.setClipboardData({
          data: this.pdfDownloadUrl,
          success: () => {
            uni.showToast({
              title: '链接复制成功',
              icon: 'none'
            });
          }
        });
      }
    },
  }
}
</script>

<style lang="scss">
@import '@/common/style/common.scss';

.container {
  @include page-container;
  padding: 0 0 30rpx;
  box-sizing: border-box;

  .product-detail {
    .header-card {
      @include header-card;
      margin: 0;
      background: #0e1a2d;

      .product-info {
        .product-name {
          font-size: 44rpx;
          font-weight: bold;
          margin-bottom: 20rpx;
          display: block;
          color: #FFFFFF;
          text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
        }

        .catalog-name {
          font-size: 28rpx;
          color: rgba(255, 255, 255, 0.9);
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

      .params-list {
        .param-item {
          display: flex;
          padding: 24rpx 30rpx;
          border-bottom: 1px solid $border-color;
          transition: background-color 0.3s ease;

          &:last-child {
            border-bottom: none;
          }

          &:active {
            background-color: $hover-color;
          }

          .param-label {
            width: 280rpx;
            font-size: 28rpx;
            color: $text-secondary;
          }

          .param-value {
            flex: 1;
            font-size: 28rpx;
            color: $text-primary;
          }
        }
      }

      .pdf-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60rpx 0;
        
        .loading-icon {
          font-size: 48rpx;
          color: $primary-color;
          margin-bottom: 20rpx;
          animation: rotate 1.5s linear infinite;
        }
        
        .loading-text {
          font-size: 28rpx;
          color: $text-secondary;
        }
      }

      .pdf-box {
        padding: 30rpx;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.3s ease;

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
        
        &.tip-box {
          flex-direction: column;
          align-items: flex-start;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 8rpx;
          margin: 0 30rpx 30rpx;
          padding: 20rpx;
        }
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>