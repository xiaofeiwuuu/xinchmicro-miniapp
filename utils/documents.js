// 文档（PDF）下载与打开：列表页、详情页、搜索页共用
import { setCachedPath, discardFile } from '@/utils/cache.js';
import { logError } from '@/utils/logger.js';

export const docPath = (name) => wx.env.USER_DATA_PATH + '/' + name + '.pdf';

// 下载文档并登记到文件缓存，成功返回本地路径。
//   onTask(task)：拿到 downloadTask，可用于取消
//   onProgress(percent)：下载进度 0-100
// 失败时 reject；用户主动取消的错误带 aborted = true
export function downloadDoc({ url, name, fileId, timeout, onTask, onProgress }) {
  const filePath = docPath(name);
  return new Promise((resolve, reject) => {
    const options = {
      url,
      filePath,
      success: async (res) => {
        // 服务端返回错误页（如 404）时不能当成 PDF 缓存和打开
        if (res.statusCode !== 200) {
          await discardFile(res.filePath || filePath);
          logError('doc.download', { fileId, status: res.statusCode });
          reject(new Error('HTTP ' + res.statusCode));
          return;
        }
        await setCachedPath(fileId, res.filePath || filePath);
        resolve(res.filePath || filePath);
      },
      fail: (err) => {
        const e = new Error((err && err.errMsg) || 'download failed');
        e.aborted = /abort/i.test((err && err.errMsg) || '');
        // 用户主动取消不算故障，不记日志
        if (!e.aborted) logError('doc.download', { fileId, error: e.message });
        reject(e);
      }
    };
    if (timeout) options.timeout = timeout;
    const task = wx.downloadFile(options);
    if (task && onProgress && task.onProgressUpdate) {
      task.onProgressUpdate((r) => onProgress(r.progress));
    }
    if (onTask) onTask(task);
  });
}

// 用系统能力打开文档
export function openDoc(path) {
  return new Promise((resolve, reject) => {
    wx.openDocument({
      filePath: path,
      showMenu: true,
      success: () => resolve(),
      fail: (e) => reject(e)
    });
  });
}
