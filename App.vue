<script>
import { getCompanyInfo } from '@/api/index.js';
import { logError } from '@/utils/logger.js';
import { writeData } from '@/utils/cache.js';
import { getLang } from '@/utils/i18n.js';
import { ensureLogin } from '@/utils/customer.js';
export default {
	onLaunch: async function () {
		try {
			// 老版本基础库没有 wx.cloud
			if (wx.cloud) wx.cloud.init();
			// 商城：静默登录，不等待结果，失败也不影响其它页面
			ensureLogin();
			// 按请求发出时的语言写缓存（缓存按语言分开存）
			const lang = getLang();
			const { data } = await getCompanyInfo();
			if (data.code === 0) {
				writeData('companyInfo', data.data, lang);
			}
		} catch (e) {
			// 断网或服务不可用时保留本地缓存的公司信息
			logError('app.launch', { error: (e && (e.errMsg || e.message)) || String(e) });
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
