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

/* ===== 按钮的按下反馈和「处理中」状态（全局：页面里按钮的类名在下面列出，新增按钮用这些类名就自动有） =====
   - 按下：变淡一点、略微缩小（不可点的 .disabled 和处理中的 .busy 不动）
   - 处理中：给按钮加 busy 类 → 变淡、不能再点、文字前面出现转圈（颜色跟文字一样，主按钮白色、描边按钮蓝色都合适） */
.btn,
.as-btn,
.act,
.save,
.del,
.add,
.submit,
.checkout,
.buy-btn,
.bs-ok,
.ann-btn,
.bs-btn,
.seg-item {
	transition: opacity 0.15s ease, transform 0.12s ease;
}
.btn:not(.disabled):not(.busy):active,
.as-btn:not(.disabled):not(.busy):active,
.act:not(.disabled):not(.busy):active,
.save:not(.disabled):not(.busy):active,
.del:not(.disabled):not(.busy):active,
.add:not(.disabled):not(.busy):active,
.submit:not(.disabled):not(.busy):active,
.checkout:not(.disabled):not(.busy):active,
.buy-btn:not(.disabled):not(.busy):active,
.bs-ok:not(.disabled):not(.busy):active,
.ann-btn:not(.disabled):not(.busy):active,
.bs-btn:not(.off):active {
	opacity: 0.75;
	transform: scale(0.96);
}
/* 小的文字链接按钮（复制、编辑等）：只变淡 */
.copy:active,
.edit:active,
.as-copy:active,
.as-copyall:active,
.manage:active,
.retry-btn:active {
	opacity: 0.55;
}
.busy {
	pointer-events: none;
	opacity: 0.75;
}
.busy::before {
	content: '';
	display: inline-block;
	vertical-align: middle;
	flex-shrink: 0;
	box-sizing: border-box;
	width: 30rpx;
	height: 30rpx;
	margin-right: 12rpx;
	border: 4rpx solid currentColor;
	border-top-color: transparent;
	border-radius: 50%;
	animation: btn-spin 0.8s linear infinite;
}
@keyframes btn-spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
