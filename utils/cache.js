// 本地缓存统一管理
// 1. 文件缓存：fileId -> 本地 PDF 路径，最多保留 MAX_FILES 个，超出按最久未使用淘汰
// 2. 数据缓存：接口数据（key 前缀 dc:），用于"先显示缓存、后台刷新"
// 3. 一键清除：删除全部已下载文档 + 数据缓存（不动语言设置）
// 数据缓存按语言分开存（key 形如 dc:zh:categories）：业务数据（分类、产品名等）中英文内容不同，
// 混在一起的话切换语言后会先显示另一种语言的旧内容。

import { getLang } from '@/utils/i18n.js';

const FILE_KEY = 'fileCache';
// 旧版本各页面各自使用的 key，清除时一并移除
const LEGACY_KEYS = ['productFileCache', 'detailFileCache'];
// 旧版本直接使用、不带前缀的数据缓存 key
const LEGACY_DATA_KEYS = ['categories', 'carousels', 'companyInfo'];
const DATA_PREFIX = 'dc:';

export const MAX_FILES = 20;

const fsm = () => wx.getFileSystemManager();

// 把微信回调式文件 API 包成 Promise；失败统一返回 null，不抛错
const call = (fn, opts) =>
  new Promise((resolve) => {
    try {
      fn(Object.assign({}, opts, { success: (r) => resolve(r || {}), fail: () => resolve(null) }));
    } catch (e) {
      resolve(null);
    }
  });

const fileExists = async (path) => !!(await call(fsm().access.bind(fsm()), { path }));
const removeFile = (path) => call(fsm().unlink.bind(fsm()), { filePath: path });

function readMap() {
  try {
    const raw = uni.getStorageSync(FILE_KEY);
    if (!raw || typeof raw !== 'object') return {};
    const map = {};
    Object.keys(raw).forEach((id) => {
      const v = raw[id];
      // 兼容旧格式：值直接是路径字符串
      if (typeof v === 'string') map[id] = { path: v, time: 0 };
      else if (v && typeof v.path === 'string') map[id] = v;
    });
    return map;
  } catch (e) {
    return {};
  }
}

function writeMap(map) {
  try {
    uni.setStorageSync(FILE_KEY, map);
  } catch (e) {}
}

// 取已缓存且文件仍存在的路径；记录存在但文件已丢失时清掉记录
export async function getCachedPath(fileId) {
  if (!fileId) return null;
  const entry = readMap()[fileId];
  if (!entry) return null;
  const exists = await fileExists(entry.path);
  // 检查文件期间别处可能改过缓存记录，所以写回前要重新读取，不能用之前的快照覆盖
  const map = readMap();
  if (exists) {
    if (map[fileId]) {
      map[fileId].time = Date.now();
      writeMap(map);
    }
    return entry.path;
  }
  if (map[fileId] && map[fileId].path === entry.path) {
    delete map[fileId];
    writeMap(map);
  }
  return null;
}

// 记录缓存；超过上限时淘汰最久未使用的文件
export async function setCachedPath(fileId, path) {
  if (!fileId || !path) return;
  const map = readMap();
  map[fileId] = { path, time: Date.now() };
  writeMap(map); // 先登记，之后即使淘汰过程中有并发操作也不会丢这条

  const ids = Object.keys(map);
  if (ids.length <= MAX_FILES) return;

  const victims = ids
    .filter((id) => id !== fileId)
    .sort((a, b) => map[a].time - map[b].time)
    .slice(0, ids.length - MAX_FILES);
  for (const id of victims) {
    // 不同产品可能共用同一路径，被保留的记录还在用就不能删文件
    const stillUsed = ids.some((o) => o !== id && !victims.includes(o) && map[o].path === map[id].path);
    if (!stillUsed) await removeFile(map[id].path);
  }
  // 删文件是异步的，期间缓存记录可能被别处改过：重新读取后只移除被淘汰的记录
  const latest = readMap();
  victims.forEach((id) => delete latest[id]);
  writeMap(latest);
}

// 统计已下载文档的数量与体积
export async function getFileCacheInfo() {
  const dir = wx.env.USER_DATA_PATH;
  const res = await call(fsm().readdir.bind(fsm()), { dirPath: dir });
  const names = (res && res.files) || [];
  let bytes = 0;
  for (const name of names) {
    const st = await call(fsm().stat.bind(fsm()), { path: dir + '/' + name });
    if (st && st.stats && typeof st.stats.size === 'number') bytes += st.stats.size;
  }
  return { count: names.length, bytes };
}

async function clearFiles() {
  const dir = wx.env.USER_DATA_PATH;
  const { count, bytes } = await getFileCacheInfo();
  if (count > 0) {
    const res = await call(fsm().readdir.bind(fsm()), { dirPath: dir });
    for (const name of (res && res.files) || []) {
      await removeFile(dir + '/' + name);
    }
  }
  [FILE_KEY].concat(LEGACY_KEYS).forEach((k) => {
    try {
      uni.removeStorageSync(k);
    } catch (e) {}
  });
  return bytes;
}

// 删除一个本地文件（下载到错误页等坏文件时使用），失败不抛错
export const discardFile = (path) => (path ? removeFile(path) : Promise.resolve(null));

// ---------- 数据缓存 ----------
// 语言默认取当前语言；请求发出时就确定语言并传进来，响应回来时用户可能已经切换了语言，不能写到另一种语言的缓存里
const dataKey = (key, lang = getLang()) => `${DATA_PREFIX}${lang}:${key}`;

export function readData(key, lang) {
  try {
    const v = uni.getStorageSync(dataKey(key, lang));
    return v === '' ? null : v;
  } catch (e) {
    return null;
  }
}

export function writeData(key, value, lang) {
  try {
    uni.setStorageSync(dataKey(key, lang), value);
  } catch (e) {}
}

function clearData() {
  let keys = [];
  try {
    keys = uni.getStorageInfoSync().keys || [];
  } catch (e) {}
  keys
    .filter((k) => k.startsWith(DATA_PREFIX) || LEGACY_DATA_KEYS.includes(k))
    .forEach((k) => {
      try {
        uni.removeStorageSync(k);
      } catch (e) {}
    });
}

// 一键清除：返回释放的文档体积（字节）
export async function clearAllCache() {
  const bytes = await clearFiles();
  clearData();
  return bytes;
}

export function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}
