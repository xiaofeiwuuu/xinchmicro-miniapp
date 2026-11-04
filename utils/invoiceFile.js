// 下载并打开电子发票（PDF）。
// 不读文件缓存：财务可能替换了发票文件，每次都向服务端要一个新的临时链接再下载，下载到的就是最新的。
// 返回 'ok' 打开成功 / 'demo' 演示环境没有真实文件 / 'fail' 失败
import { getInvoiceFile, IS_MOCK } from '@/api/shop.js';
import { downloadDoc, openDoc } from '@/utils/documents.js';
import { logError } from '@/utils/logger.js';

export async function openInvoiceFile(orderId) {
  try {
    const { data } = await getInvoiceFile(orderId);
    if (data.code !== 0) throw new Error(data.message || 'no invoice file');
    if (IS_MOCK && !data.data.url) return 'demo';
    // 下载链接带签名，不要记进日志
    const path = await downloadDoc({ url: data.data.url, name: 'invoice-' + orderId, fileId: 'invoice:' + orderId });
    await openDoc(path);
    return 'ok';
  } catch (e) {
    logError('invoice.file', { error: (e && (e.errMsg || e.message)) || String(e) });
    return 'fail';
  }
}
