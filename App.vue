<script>
import { getCompanyInfo } from '@/api/index.js';
export default {
	globalData: {
		themeClass: 'blue' // 固定使用蓝色主题
	},
	onLaunch: async function () {
		wx.cloud.init();
		const { data } = await getCompanyInfo();
		if (data.code === 0) {
			uni.setStorageSync('companyInfo', data.data);
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
