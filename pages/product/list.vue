<template>
  <view class="container">
    <zb-table
      :fit="true"
      :columns="columns"
      :data="products"
      :loading="loading"
      :empty-text="'暂无产品'"
      :border="true"
      :stripe="true"
      :show-header="true"
      @row-click="navigateToDetail"
    >
      <template #empty>
        <view class="empty-state">
          <text class="iconfont icon-empty"></text>
          <text>暂无产品</text>
        </view>
      </template>
    </zb-table>
  </view>
</template>

<script>
import { getProducts } from '@/api/index.js';

export default {
  data() {
    return {
      products: [],
      loading: false,
      catalogId: '',
      hasMore: true,
      parameterKeys: [],
      columns: [],
	  isLoadingPdf: false,
	  pdfDownloadUrl: '',
	  isDownloadingPdf: false
    }
  },
  // 文件缓存（不放在 data 中，避免响应式处理特殊字符 key）
  created() {
    this.fileCache = {};
  },
  onLoad(options) {
    this.catalogId = options.catalogId || options.id;
    this.loadProducts();

    // 从本地存储恢复文件缓存
    try {
      const cachedFiles = uni.getStorageSync('productFileCache');
      if (cachedFiles && typeof cachedFiles === 'object') {
        this.fileCache = cachedFiles;
      }
    } catch (e) {
      console.error('恢复文件缓存失败:', e);
      this.fileCache = {};
    }
  },
  methods: {
    async loadProducts() {
      if (this.loading || !this.hasMore) return;
      
      this.loading = true;
      try {
        const { data } = await getProducts({
          catalogId: this.catalogId,
        });
        
        if (data.code === 0) {
          const newProducts = data.data;
          
          this.products = [...this.products, ...newProducts.map(item => ({...item, ...item.parameters}))];
          this.hasMore = newProducts.length > 0;
          // 提取所有可能的参数键并生成列配置
          if (newProducts.length > 0) {
            // 生成列配置
            this.columns = [
              ...newProducts[0].catalog.paramTitles.map((key, index) => ({
                name: key,
                fixed: index === 0 ? true : false,
                label: key,
              }))
            ];
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    navigateToDetail(row) {
		this.getPdfDownloadUrl(row)
      // uni.navigateTo({
      //   url: `/pages/product/detail?id=${row.id}`
      // });
    },
	// 获取 PDF 下载链接
	getPdfDownloadUrl(product) {
	  if (!product?.fileID || this.isLoadingPdf) return;
	  
	  this.isLoadingPdf = true;
	  uni.showLoading({
	    title: '准备文档...',
		mask:true
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
	        fileid: product.fileID,
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
		this.downloadPdfFile(product)
	  }).catch(error => {
	    uni.hideLoading();
	    this.isLoadingPdf = false;
	    uni.showToast({
	      title: '获取文档链接失败',
	      icon: 'none'
	    });
	  });
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

	// 抽离的下载文件方法，返回下载后的文件路径
	async downloadPdfFile(product) {
	  if (!this.pdfDownloadUrl) {
	    // 如果尚未获取到链接，则尝试重新获取
	    if (product?.fileID) {
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

	  const filePath = wx.env.USER_DATA_PATH + '/' + product.name + '.pdf';
	  const fileId = product.fileID;

	  // 检查缓存中是否有该文件
	  if (this.fileCache[fileId]) {
	    const cachedPath = this.fileCache[fileId];
	    const exists = await this.checkFileExists(cachedPath);

	    if (exists) {
	      uni.showToast({
	        title: '正在打开...',
	        icon: 'none',
	        duration: 500
	      });
	      setTimeout(() => {
	        this.openPdf(cachedPath);
	      }, 100);
	      return cachedPath;
	    } else {
	      // 缓存失效，删除记录
	      delete this.fileCache[fileId];
	      try {
	        uni.setStorageSync('productFileCache', this.fileCache);
	      } catch (e) {
	        console.error('保存缓存失败:', e);
	      }
	    }
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
	    title: '正在下载文档...',
		mask:true
	  });

	  try {
	    const result = await new Promise((resolve, reject) => {
	      wx.downloadFile({
	        url: this.pdfDownloadUrl,
	        filePath: filePath,
	        success: res => resolve(res),
	        fail: err => reject(err)
	      });
	    });

	    uni.hideLoading();
	    this.isDownloadingPdf = false;

	    if (result.statusCode === 200) {
	      // 保存到缓存
	      this.fileCache[fileId] = result.filePath;
	      try {
	        uni.setStorageSync('productFileCache', this.fileCache);
	      } catch (e) {
	        console.error('保存缓存失败:', e);
	      }
		  this.openPdf(result.filePath);
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
	async openPdf(filePath) {
	  // const filePath = await this.downloadPdfFile();
	  if (typeof(filePath) !== 'string') return;
	  
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
  }
}
</script>

<style lang="scss">
@import '@/common/style/common.scss';

.container {
  @include page-container;
  padding: 0;
  height: 90vh;
  :deep(.zb-table) {
    background: $card-background;
    
    .zb-table-header {
      background: darken($card-background, 3%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      
      .zb-table-cell {
        color: $text-secondary;
        font-weight: 500;
        background: darken($card-background, 3%);
        
        &.fixed-left {
          &::after {
            content: '';
            position: absolute;
            right: 0;
            top: 20%;
            height: 60%;
            width: 1px;
            background: rgba(255, 255, 255, 0.05);
          }
        }
      }
    }
    
    .zb-table-row {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      transition: background-color 0.3s ease;
      
      &:active {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .zb-table-cell {
        color: $text-primary;
        background: $card-background;
        
        &.fixed-left {
          &::after {
            content: '';
            position: absolute;
            right: 0;
            top: 20%;
            height: 60%;
            width: 1px;
            background: rgba(255, 255, 255, 0.05);
          }
        }
      }
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
      
      &:not(.iconfont) {
        margin-top: 10rpx;
      }
    }
  }
  
  .load-more {
    text-align: center;
    padding: 30rpx;
    color: $text-light;
    font-size: 28rpx;
    
    &:active {
      opacity: 0.7;
    }
  }
}
</style> 