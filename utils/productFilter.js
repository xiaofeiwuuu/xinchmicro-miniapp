// 产品搜索的纯函数：不依赖页面，方便单独测试

// 型号归一化：转小写并去掉空格、连字符、下划线，使 "xc1234"、"XC-1234 " 都能匹配 "XC-1234"
export const normalizeModel = (s) => String(s == null ? '' : s).toLowerCase().replace(/[\s\-_]/g, '');

export function matchModel(name, keyword) {
  const k = normalizeModel(keyword);
  if (!k) return false;
  return normalizeModel(name).includes(k);
}

const toNumber = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
};

// 解析产品参数值为 {min, max}：
//   "3～5.5"  -> {3, 5.5}
//   "12"      -> {12, 12}
//   "N/A"等无法解析 -> {0, 999}（沿用原有的宽松策略）
//   空/缺失   -> null（没有数据，不参与区间匹配）
export function parseRangeValue(raw) {
  const str = String(raw == null ? '' : raw).trim();
  if (!str) return null;
  if (str.includes('～')) {
    const [minStr, maxStr] = str.split('～');
    const min = toNumber(minStr);
    const max = toNumber(maxStr);
    return { min: min === null ? 0 : min, max: max === null ? 999 : max };
  }
  const v = toNumber(str);
  return v === null ? { min: 0, max: 999 } : { min: v, max: v };
}

// 区间筛选：用户填的范围必须落在产品参数范围内。
// 只填一端时，要求产品范围包含该值；两端都没填视为不筛选。
export function matchRange(raw, filter) {
  const min = toNumber(filter && filter.min);
  const max = toNumber(filter && filter.max);
  if (min === null && max === null) return true;
  const range = parseRangeValue(raw);
  if (!range) return false;
  const lo = min === null ? max : min;
  const hi = max === null ? min : max;
  return lo >= range.min && hi <= range.max;
}

// 文本筛选：不区分大小写的包含匹配；空条件视为不筛选
export function matchText(raw, text) {
  const q = String(text == null ? '' : text).trim().toLowerCase();
  if (!q) return true;
  return String(raw == null ? '' : raw).toLowerCase().includes(q);
}

// 一个产品是否满足全部参数筛选条件。filters: { [paramId]: string | {min, max} }
export function matchParamFilters(product, filters) {
  const params = (product && product.parameters) || {};
  return Object.keys(filters || {}).every((key) => {
    const value = filters[key];
    return value !== null && typeof value === 'object'
      ? matchRange(params[key], value)
      : matchText(params[key], value);
  });
}

// ---------- 表格与筛选器的数据构建 ----------

// 表头文字在空格或括号处换行
export function formatColumnLabel(title) {
  return String(title == null ? '' : title)
    .replace(/ |[（(]/g, (m) => (m === ' ' ? '\n' : '\n' + m))
    .replace(/\n+/g, '\n');
}

// paramTitles 兼容旧格式（字符串）与新格式（{id, title}）；fixedValue 是第一列的 fixed 取值
export function buildColumns(paramTitles, fixedValue) {
  return (paramTitles || []).map((param, index) => ({
    name: typeof param === 'string' ? param : param.id,
    label: formatColumnLabel(typeof param === 'string' ? param : param.title),
    fixed: index === 0 ? fixedValue : false
  }));
}

// 按目录分组，每组带表格列定义；分组顺序沿用对象键（目录 ID 升序）
export function groupByCatalog(products, unknownName) {
  const groups = {};
  (products || []).forEach((product) => {
    const catalogId = product.catalogId;
    if (!catalogId) return;
    if (!groups[catalogId]) {
      const catalog = product.catalog || {};
      const paramTitles = catalog.paramTitles || Object.keys(product.parameters || {});
      groups[catalogId] = {
        catalogId,
        catalogName: catalog.name || unknownName,
        columns: buildColumns(paramTitles, 'left'),
        products: []
      };
    }
    groups[catalogId].products.push({ id: product.id, ...product.parameters });
  });
  return Object.values(groups);
}

// 参数筛选器初始化：labels 供界面渲染（isRange 表示按区间输入），filters 是对应的空条件
export function buildFilterState(paramTitles, sampleParams) {
  const sample = sampleParams || {};
  const labels = (paramTitles || []).map((param) => {
    const id = typeof param === 'string' ? param : param.id;
    const title = typeof param === 'string' ? param : param.title;
    const sampleValue = sample[id] == null ? '' : String(sample[id]);
    return { id, title, sampleValue, isRange: sampleValue.includes('～') };
  });
  const filters = {};
  labels.forEach((l) => {
    filters[l.id] = l.isRange ? { min: '', max: '' } : '';
  });
  return { labels, filters };
}
