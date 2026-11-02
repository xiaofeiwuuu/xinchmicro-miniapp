// 产品文档（PDF）的语言规则：英文界面没有英文版时，先问用户，不直接给中文。
// 服务端 lang=en 时，产品缺英文版 PDF 会回退成中文版（fileID 是中文版的，并标 fileLang: 'zh'）。
// 小程序不静默采用这个回退：用户切到英文却打开一份中文文档容易误导。
// 所以这里弹窗问「暂无英文版，是否打开中文版？」，用户确认才继续，取消就什么都不做。
// 中文界面不受影响（不带 lang，没有 fileLang 字段）。
import { getLang, t } from '@/utils/i18n.js';

let asking = false; // 弹窗期间忽略再次点击，避免连点出现两个弹窗

// 返回这个产品要打开的文件 ID；返回空串表示不继续（没有文档、用户取消、或正在询问）。
// 没有文档会直接提示；缺英文版会弹窗询问。action: 'open'（查看）/ 'copy'（复制链接），只影响弹窗文案。
export async function resolveProductDoc(product, action = 'open', lang = getLang()) {
  const fileId = product && product.fileID;
  if (!fileId) {
    uni.showToast({ title: t('doc.notExist'), icon: 'none' });
    return '';
  }
  if (lang !== 'en' || product.fileLang === 'en') return fileId;
  if (asking) return '';
  asking = true;
  try {
    const confirmed = await new Promise((resolve) => {
      uni.showModal({
        title: t('doc.noEnglishTitle'),
        content: t(action === 'copy' ? 'doc.noEnglishCopy' : 'doc.noEnglishOpen'),
        confirmText: t(action === 'copy' ? 'doc.copyZh' : 'doc.openZh'),
        cancelText: t('common.cancel'),
        success: (res) => resolve(!!res.confirm),
        fail: () => resolve(false)
      });
    });
    return confirmed ? fileId : '';
  } finally {
    asking = false;
  }
}
