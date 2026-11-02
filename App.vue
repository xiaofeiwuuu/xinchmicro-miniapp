<script>
import { getCompanyInfo } from '@/api/index.js';
export default {
	globalData: {
		themeClass: 'blue' // 固定使用蓝色主题
	},
	onLaunch: async function () {
		try {
			// 老版本基础库没有 wx.cloud
			if (wx.cloud) wx.cloud.init();
			const { data } = await getCompanyInfo();
			if (data.code === 0) {
				uni.setStorageSync('companyInfo', data.data);
			}
		} catch (e) {
			// 断网或服务不可用时保留本地缓存的公司信息
		}
	},
	onShow: function () {
	},
	onHide: function () {
	},
}
</script>

<style lang="scss">
/* 导入主题样式 */
@import './common/style/common.scss';

/* 全局样式 */
page {
	font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
	-webkit-font-smoothing: antialiased;
}
</style>
