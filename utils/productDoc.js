// 产品文档（PDF）的语言规则：当前语言的文档不存在、另一种语言有时，先问用户，不静默替换，也不直接说没有。
//
// - 英文界面：服务端 lang=en 缺英文版时会回退成中文版（fileID 是中文版，标 fileLang: 'zh'）。
//   小程序不静默采用，问「暂无英文版，是否打开中文版？」。
// - 中文界面：不带 lang，服务端返回原始数据（同时有 fileID 中文版和 fileIDEn 英文版）。
//   没有中文版但有英文版时问「暂无中文版，是否打开英文版？」。
// - 两种语言都没有：提示「文档不存在」。
// 用户确认才继续，取消什么都不做。
import { getLang, t } from '@/utils/i18n.js';

let asking = false; // 弹窗期间忽略再次点击，避免连点出现两个弹窗

const has = (s) => typeof s === 'string' && s.trim() !== '';

// 弹窗询问，返回用户是否确认
function ask(kind, action) {
  return new Promise((resolve) => {
    uni.showModal({
      title: t(`doc.no${kind}Title`),
      content: t(`doc.no${kind}${action === 'copy' ? 'Copy' : 'Open'}`),
      confirmText: t(action === 'copy' ? 'doc.copyZh' : 'doc.openZh'),
      cancelText: t('common.cancel'),
      success: (res) => resolve(!!res.confirm),
      fail: () => resolve(false)
    });
  });
}

// 返回这个产品要打开的文件 ID；返回空串表示不继续（没有文档、用户取消、或正在询问）。
// 调用方必须用返回的文件 ID 去取链接/下载，不能再直接读 product.fileID（可能选的是另一种语言的）。
// action: 'open'（查看）/ 'copy'（复制链接），只影响弹窗文案。
export async function resolveProductDoc(product, action = 'open', lang = getLang()) {
  let fileId = '';
  let missing = ''; // 当前语言缺失时，要询问的类型（English / Chinese）
  if (product && lang === 'en') {
    fileId = has(product.fileID) ? product.fileID : '';
    // 只有服务端明确标了 fileLang: 'zh'（缺英文版回退成中文版）才询问。
    // 还没部署新版本的服务端不认识 lang=en、不返回 fileLang（undefined），此时不能当成"缺英文版"，否则每个产品都会弹窗
    if (fileId && product.fileLang === 'zh') missing = 'English';
  } else if (product) {
    if (has(product.fileID)) fileId = product.fileID;
    else if (has(product.fileIDEn)) { fileId = product.fileIDEn; missing = 'Chinese'; }
  }

  if (!fileId) {
    uni.showToast({ title: t('doc.notExist'), icon: 'none' });
    return '';
  }
  if (!missing) return fileId;
  if (asking) return '';
  asking = true;
  try {
    return (await ask(missing, action)) ? fileId : '';
  } finally {
    asking = false;
  }
}
