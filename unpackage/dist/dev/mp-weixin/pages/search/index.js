(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/search/index"],{

/***/ 47:
/*!**************************************************************************************************!*\
  !*** /Users/xiaofeiwu/Documents/my-project/芯辰微/芯辰微小程序/main.js?{"page":"pages%2Fsearch%2Findex"} ***!
  \**************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 26);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _index = _interopRequireDefault(__webpack_require__(/*! ./pages/search/index.vue */ 48));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_index.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 48:
/*!*******************************************************************************!*\
  !*** /Users/xiaofeiwu/Documents/my-project/芯辰微/芯辰微小程序/pages/search/index.vue ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index_vue_vue_type_template_id_482e85b8___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.vue?vue&type=template&id=482e85b8& */ 49);
/* harmony import */ var _index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.vue?vue&type=script&lang=js& */ 51);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _index_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.vue?vue&type=style&index=0&lang=scss& */ 53);
/* harmony import */ var _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 36);

var renderjs





/* normalize component */

var component = Object(_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _index_vue_vue_type_template_id_482e85b8___WEBPACK_IMPORTED_MODULE_0__["render"],
  _index_vue_vue_type_template_id_482e85b8___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  null,
  null,
  false,
  _index_vue_vue_type_template_id_482e85b8___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "pages/search/index.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 49:
/*!**************************************************************************************************************!*\
  !*** /Users/xiaofeiwu/Documents/my-project/芯辰微/芯辰微小程序/pages/search/index.vue?vue&type=template&id=482e85b8& ***!
  \**************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_template_id_482e85b8___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./index.vue?vue&type=template&id=482e85b8& */ 50);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_template_id_482e85b8___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_template_id_482e85b8___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_template_id_482e85b8___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_template_id_482e85b8___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 50:
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!/Users/xiaofeiwu/Documents/my-project/芯辰微/芯辰微小程序/pages/search/index.vue?vue&type=template&id=482e85b8& ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return recyclableRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "components", function() { return components; });
var components
try {
  components = {
    zbTable: function () {
      return __webpack_require__.e(/*! import() | uni_modules/zb-table/components/zb-table/zb-table */ "uni_modules/zb-table/components/zb-table/zb-table").then(__webpack_require__.bind(null, /*! @/uni_modules/zb-table/components/zb-table/zb-table.vue */ 95))
    },
  }
} catch (e) {
  if (
    e.message.indexOf("Cannot find module") !== -1 &&
    e.message.indexOf(".vue") !== -1
  ) {
    console.error(e.message)
    console.error("1. 排查组件名称拼写是否正确")
    console.error(
      "2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"
    )
    console.error(
      "3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件"
    )
  } else {
    throw e
  }
}
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  var g0 =
    _vm.currentTab === 0
      ? _vm.filteredModelProducts.length === 0 && _vm.modelKeyword
      : null
  var g1 = _vm.currentTab === 0 ? _vm.filteredModelProducts.length : null
  var l0 =
    _vm.currentTab === 1 && _vm.selectedCatalog && _vm.showParamFilters
      ? _vm.__map(_vm.parameterLabels, function (label, key) {
          var $orig = _vm.__get_orig(label)
          var g2 = label.includes("～")
          return {
            $orig: $orig,
            g2: g2,
          }
        })
      : null
  var g3 = _vm.currentTab === 1 ? _vm.filteredProducts.length : null
  var g4 = _vm.currentTab === 2 ? _vm.manualsList.length : null
  var g5 =
    _vm.currentTab === 2 && g4 > 0 && _vm.manualsTotal > _vm.manualsPageSize
      ? Math.ceil(_vm.manualsTotal / _vm.manualsPageSize)
      : null
  var g6 = _vm.isDownloading ? Math.round(_vm.downloadProgress) : null
  _vm.$mp.data = Object.assign(
    {},
    {
      $root: {
        g0: g0,
        g1: g1,
        l0: l0,
        g3: g3,
        g4: g4,
        g5: g5,
        g6: g6,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 51:
/*!********************************************************************************************************!*\
  !*** /Users/xiaofeiwu/Documents/my-project/芯辰微/芯辰微小程序/pages/search/index.vue?vue&type=script&lang=js& ***!
  \********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./index.vue?vue&type=script&lang=js& */ 52);
/* harmony import */ var _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 52:
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!/Users/xiaofeiwu/Documents/my-project/芯辰微/芯辰微小程序/pages/search/index.vue?vue&type=script&lang=js& ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni, wx) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _regenerator = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/regenerator */ 30));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ 32));
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ 13));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ 5));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ 11));
var _index = __webpack_require__(/*! @/api/index.js */ 33);
var _share = _interopRequireDefault(__webpack_require__(/*! @/mixins/share.js */ 43));
var _common = __webpack_require__(/*! @/utils/common.js */ 44);
var _mixins$components$da;
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var PopupSelector = function PopupSelector() {
  __webpack_require__.e(/*! require.ensure | components/PopupSelector */ "components/PopupSelector").then((function () {
    return resolve(__webpack_require__(/*! @/components/PopupSelector.vue */ 104));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var _default = (_mixins$components$da = {
  mixins: [_share.default],
  components: {
    PopupSelector: PopupSelector
  },
  data: function data() {
    return {
      // 标签页配置
      tabs: ["型号搜索", "参数搜索", "资料下载"],
      currentTab: 0,
      // 数据缓存
      allProducts: [],
      // 所有产品数据
      categories: [],
      // 所有分类数据
      catalogs: [],
      // 当前分类下的目录数据

      // 型号搜索
      modelKeyword: "",
      // 型号搜索关键词

      // 参数搜索
      selectedCategory: null,
      // 选中的分类
      selectedCatalog: null,
      // 选中的目录
      parameterLabels: {},
      // 参数标签集合
      paramFilters: {},
      // 参数筛选条件

      // 选择器控制
      showSelector: false,
      // 是否显示选择器弹窗
      selectorStep: "category",
      // 选择器步骤：'category' | 'catalog'
      showParamFilters: true,
      // 控制参数过滤器显示

      // 公司信息
      companyInfo: {},
      // 添加表格列定义
      columns: [],
      // 新增手册列表
      manualsList: [],
      // 手册分页参数
      manualsPage: 1,
      manualsPageSize: 10,
      manualsTotal: 0,
      manualsLoading: false,
      // 下载进度
      downloadProgress: 0,
      isDownloading: false,
      downloadStartTime: 0,
      // 下载开始时间
      downloadElapsedTime: 0,
      // 已用时间（秒）
      maxDownloadTime: 120,
      // 最大下载时间（秒），即 timeout
      countdownTimer: null,
      // 倒计时定时器
      canvasContext: null,
      // Canvas 上下文
      downloadTask: null,
      // 下载任务对象

      // 长按取消
      showLongPressHint: false,
      // 是否显示长按提示
      canCancelDownload: false,
      // 是否可以取消下载（3秒后）
      longPressTimer: null // 长按定时器
    };
  },
  // 将 fileCache 移到 data 外面，避免响应式处理导致的错误
  // 因为 fileId 包含特殊字符（/、: 等），不适合作为响应式对象的 key
  onLoad: function onLoad() {
    this.fileCache = {};
  },
  watch: {
    // 监听进度和时间变化，重绘 canvas
    downloadProgress: function downloadProgress() {
      if (this.isDownloading) {
        this.drawProgress();
      }
    },
    downloadElapsedTime: function downloadElapsedTime() {
      if (this.isDownloading) {
        this.drawProgress();
      }
    },
    isDownloading: function isDownloading(val) {
      var _this = this;
      if (val) {
        // 开始下载时初始化 canvas，延迟确保 DOM 渲染完成
        this.$nextTick(function () {
          setTimeout(function () {
            _this.initCanvas();
          }, 100);
        });
      }
    }
  },
  computed: {
    // 下载进度圆环周长（内圈）
    progressCircumference: function progressCircumference() {
      return 2 * Math.PI * 38; // 半径为 38
    },
    // 下载进度偏移量
    progressOffset: function progressOffset() {
      return this.progressCircumference - this.downloadProgress / 100 * this.progressCircumference;
    },
    // 倒计时圆环周长（外圈）
    countdownCircumference: function countdownCircumference() {
      return 2 * Math.PI * 45; // 半径为 45
    },
    // 倒计时偏移量（随时间减少）
    countdownOffset: function countdownOffset() {
      var timeProgress = this.downloadElapsedTime / this.maxDownloadTime * 100;
      return this.countdownCircumference - timeProgress / 100 * this.countdownCircumference;
    },
    // 填充圆的半径（根据进度从 0 到 35）
    fillRadius: function fillRadius() {
      return this.downloadProgress / 100 * 35;
    },
    // 型号搜索结果
    filteredModelProducts: function filteredModelProducts() {
      var _this2 = this;
      if (!this.modelKeyword) return [];
      return this.allProducts.filter(function (product) {
        return product.name.toLowerCase().includes(_this2.modelKeyword.toLowerCase());
      });
    },
    // 按目录分组的型号搜索结果
    groupedModelProducts: function groupedModelProducts() {
      // 按目录ID分组
      var groupsMap = {};
      this.filteredModelProducts.forEach(function (product) {
        var catalogId = product.catalogId;
        if (!catalogId) return;
        if (!groupsMap[catalogId]) {
          // 查找目录信息
          var catalog = product.catalog || {};
          var catalogName = catalog.name || "未知目录";

          // 创建列定义
          var paramTitles = catalog.paramTitles || Object.keys(product.parameters || {});
          var columns = paramTitles.map(function (key, index) {
            return {
              name: key,
              label: key,
              fixed: index === 0 ? "left" : false
            };
          });
          groupsMap[catalogId] = {
            catalogId: catalogId,
            catalogName: catalogName,
            columns: columns,
            products: []
          };
        }

        // 添加产品到组
        groupsMap[catalogId].products.push(_objectSpread({
          id: product.id
        }, product.parameters));
      });
      // 转换为数组
      return Object.values(groupsMap);
    },
    // 参数搜索结果
    filteredProducts: function filteredProducts() {
      var _this3 = this;
      if (!this.selectedCatalog) return [];
      // 先筛选出当前目录下的产品
      var catalogProducts = this.allProducts.filter(function (product) {
        return product.catalogId === _this3.selectedCatalog.id;
      });

      // 根据参数条件筛选
      return catalogProducts.filter(function (product) {
        return Object.entries(_this3.paramFilters).every(function (_ref) {
          var _product$parameters$k;
          var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];
          // 如果是区间搜索
          if ((0, _typeof2.default)(value) === "object") {
            if (!value.min || !value.max) return true;
            var paramStr = product.parameters[key];
            var paramMin, paramMax;
            if (paramStr.includes("～")) {
              var _paramStr$split = paramStr.split("～"),
                _paramStr$split2 = (0, _slicedToArray2.default)(_paramStr$split, 2),
                minStr = _paramStr$split2[0],
                maxStr = _paramStr$split2[1];
              paramMin = !minStr || isNaN(parseFloat(minStr)) ? 0 : parseFloat(minStr);
              paramMax = !maxStr || isNaN(parseFloat(maxStr)) ? 999 : parseFloat(maxStr);
            } else {
              var singleValue = parseFloat(paramStr);
              if (isNaN(singleValue)) {
                paramMin = 0;
                paramMax = 999;
              } else {
                paramMin = paramMax = singleValue;
              }
            }
            var searchMin = parseFloat(value.min);
            var searchMax = parseFloat(value.max);
            return searchMin >= paramMin && searchMax <= paramMax;
          }
          // 普通搜索
          if (!value) return true;
          return (_product$parameters$k = product.parameters[key]) === null || _product$parameters$k === void 0 ? void 0 : _product$parameters$k.toString().toLowerCase().includes(value.toLowerCase());
        });
      }).map(function (product) {
        // 将product.parameters直接展开作为表格行数据
        return _objectSpread({
          id: product.id
        }, product.parameters);
      });
    },
    // 选择器标题
    selectorTitle: function selectorTitle() {
      return this.selectorStep === "category" ? "选择产品分类" : "选择产品目录";
    },
    // 选择器列表数据
    selectorList: function selectorList() {
      return this.selectorStep === "category" ? this.categories : this.catalogs;
    },
    // 选择器选中项ID
    selectedId: function selectedId() {
      return this.selectorStep === "category" ? this.selectedCategory && this.selectedCategory.id : this.selectedCatalog && this.selectedCatalog.id;
    },
    // 是否显示返回按钮
    showBack: function showBack() {
      return this.selectorStep === "catalog";
    },
    // 选择器显示文本
    getSelectedText: function getSelectedText() {
      if (this.selectedCatalog) {
        return "".concat(this.selectedCategory.name, " / ").concat(this.selectedCatalog.name);
      }
      if (this.selectedCategory) {
        return this.selectedCategory.name;
      }
      return "选择分类/目录";
    }
  }
}, (0, _defineProperty2.default)(_mixins$components$da, "onLoad", function onLoad() {
  var _this4 = this;
  return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
    var info, cachedFiles;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return Promise.all([_this4.loadCategories(), _this4.loadAllProducts()]);
          case 2:
            info = uni.getStorageSync("companyInfo");
            if (info) {
              _this4.companyInfo = info;
            }

            // 从本地存储恢复文件缓存
            try {
              cachedFiles = uni.getStorageSync("fileCache");
              if (cachedFiles && (0, _typeof2.default)(cachedFiles) === "object") {
                _this4.fileCache = cachedFiles;
              }
            } catch (e) {
              console.error("恢复文件缓存失败:", e);
              _this4.fileCache = {};
            }

            // 加载产品手册列表
            _this4.loadManuals();
          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }))();
}), (0, _defineProperty2.default)(_mixins$components$da, "methods", {
  getUnifiedCloudUrl: _common.getUnifiedCloudUrl,
  // 切换标签页
  switchTab: function switchTab(index) {
    this.currentTab = index;
    this.modelKeyword = "";
    if (index !== 1) {
      this.selectedCategory = null;
      this.selectedCatalog = null;
      this.showParamFilters = false;
      this.parameterLabels = {};
      this.paramFilters = {};
    }
  },
  // 加载分类数据
  loadCategories: function loadCategories() {
    var _this5 = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
      var _yield$getCategories, data;
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return (0, _index.getCategories)();
            case 3:
              _yield$getCategories = _context2.sent;
              data = _yield$getCategories.data;
              if (data.code === 0) {
                _this5.categories = data.data;
              }
              _context2.next = 11;
              break;
            case 8:
              _context2.prev = 8;
              _context2.t0 = _context2["catch"](0);
              console.error(_context2.t0);
            case 11:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 8]]);
    }))();
  },
  // 加载目录数据
  loadCatalogs: function loadCatalogs(categoryId) {
    var _this6 = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
      var _yield$getCatalogs, data;
      return _regenerator.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return (0, _index.getCatalogs)({
                categoryId: categoryId
              });
            case 3:
              _yield$getCatalogs = _context3.sent;
              data = _yield$getCatalogs.data;
              if (data.code === 0) {
                _this6.catalogs = data.data;
              }
              _context3.next = 11;
              break;
            case 8:
              _context3.prev = 8;
              _context3.t0 = _context3["catch"](0);
              console.error(_context3.t0);
            case 11:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[0, 8]]);
    }))();
  },
  // 加载所有产品数据
  loadAllProducts: function loadAllProducts() {
    var _this7 = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
      var _yield$getProducts, data;
      return _regenerator.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return (0, _index.getProducts)();
            case 3:
              _yield$getProducts = _context4.sent;
              data = _yield$getProducts.data;
              if (data.code === 0) {
                _this7.allProducts = data.data;
              }
              _context4.next = 11;
              break;
            case 8:
              _context4.prev = 8;
              _context4.t0 = _context4["catch"](0);
              console.error(_context4.t0);
            case 11:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, null, [[0, 8]]);
    }))();
  },
  // 打开选择器
  openSelector: function openSelector() {
    this.selectorStep = "category";
    this.showSelector = true;
  },
  // 关闭选择器
  handleClose: function handleClose() {
    this.showSelector = false;
    this.selectorStep = "category";
  },
  // 选择器选择事件
  handleSelect: function handleSelect(item) {
    var _this8 = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
      return _regenerator.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (!(_this8.selectorStep === "category")) {
                _context5.next = 11;
                break;
              }
              // 选择分类后加载目录
              _this8.selectedCategory = item;
              _this8.selectedCatalog = null;
              _this8.showParamFilters = false;
              _this8.parameterLabels = {};
              _this8.paramFilters = {};
              _context5.next = 8;
              return _this8.loadCatalogs(item.id);
            case 8:
              _this8.selectorStep = "catalog";
              _context5.next = 13;
              break;
            case 11:
              // 选择目录后关闭弹窗
              _this8.handleCatalogSelect(item);
              _this8.handleClose();
            case 13:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }))();
  },
  // 选择器返回事件
  handleBack: function handleBack() {
    this.selectorStep = "category";
  },
  // 处理目录选择
  handleCatalogSelect: function handleCatalogSelect(catalog) {
    var _this9 = this;
    this.showParamFilters = false; // 先隐藏参数过滤器
    this.selectedCatalog = catalog;
    this.parameterLabels = {};
    this.paramFilters = {};

    // 提取参数标签
    var catalogProducts = this.allProducts.filter(function (product) {
      return product.catalogId === catalog.id;
    });
    if (catalogProducts.length > 0) {
      this.$nextTick(function () {
        _this9.parameterLabels = _objectSpread({}, catalogProducts[0].parameters);
        // 初始化参数筛选对象
        _this9.paramFilters = Object.keys(_this9.parameterLabels).reduce(function (acc, key) {
          // 如果是区间参数，使用对象存储最大最小值
          if (_this9.parameterLabels[key].includes("～")) {
            acc[key] = {
              min: "",
              max: ""
            };
          } else {
            acc[key] = "";
          }
          return acc;
        }, {});

        // 更新表格列定义
        var paramTitles = catalog.paramTitles || Object.keys(catalogProducts[0].parameters || {});
        _this9.columns = paramTitles.map(function (key, index) {
          return {
            name: key,
            label: key,
            fixed: index === 0 ? "left" : false
          };
        });

        // 重新显示参数过滤器
        setTimeout(function () {
          _this9.showParamFilters = true;
        }, 0);
      });
    }
  },
  // 型号搜索处理
  handleModelSearch: function handleModelSearch() {
    // 实时过滤，使用计算属性
  },
  // 参数筛选处理
  handleParamFilter: function handleParamFilter() {
    // 实时过滤，使用计算属性
  },
  // 跳转到产品详情
  navigateToProduct: function navigateToProduct(product) {
    // 如果是表格行点击，product是行数据
    var productId = product.id;
    if (productId) {
      uni.navigateTo({
        url: "/pages/product/detail?id=".concat(productId)
      });
    }
  },
  // 自定义搜索页分享内容
  onShareAppMessage: function onShareAppMessage() {
    var title = "产品搜索";
    var path = "/pages/search/index";

    // 如果在参数搜索页面且已选择分类和目录
    if (this.currentTab === 1 && this.selectedCategory && this.selectedCatalog) {
      title = "".concat(this.selectedCategory.name, " - ").concat(this.selectedCatalog.name);
      path = "/pages/search/index?tab=1&categoryId=".concat(this.selectedCategory.id, "&catalogId=").concat(this.selectedCatalog.id);
    }
    // 如果在型号搜索页面且有搜索关键词
    else if (this.currentTab === 0 && this.modelKeyword) {
      title = "\u641C\u7D22\uFF1A".concat(this.modelKeyword);
      path = "/pages/search/index?tab=0&keyword=".concat(this.modelKeyword);
    }
    return {
      title: title,
      path: path,
      success: function success(res) {
        uni.showToast({
          title: "分享成功",
          icon: "none"
        });
      },
      fail: function fail(res) {
        uni.showToast({
          title: "分享失败",
          icon: "none"
        });
      }
    };
  },
  // 检查文件是否存在
  checkFileExists: function checkFileExists(filePath) {
    return new Promise(function (resolve) {
      wx.getFileSystemManager().access({
        path: filePath,
        success: function success() {
          return resolve(true);
        },
        fail: function fail() {
          return resolve(false);
        }
      });
    });
  },
  // 打开文档
  openDocument: function openDocument(filePath) {
    uni.hideLoading();
    wx.openDocument({
      filePath: filePath,
      showMenu: true,
      success: function success() {
        console.log("打开文档成功");
      },
      fail: function fail() {
        uni.showToast({
          title: "打开文档失败",
          icon: "none"
        });
      }
    });
  },
  // 启动倒计时
  startCountdown: function startCountdown() {
    var _this10 = this;
    this.stopCountdown(); // 先清除之前的定时器
    this.countdownTimer = setInterval(function () {
      _this10.downloadElapsedTime = (Date.now() - _this10.downloadStartTime) / 1000;
    }, 100); // 每 100ms 更新一次
  },
  // 停止倒计时
  stopCountdown: function stopCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  },
  // 长按开始
  handleLongPressStart: function handleLongPressStart() {
    var _this11 = this;
    // 立即显示"长按3秒取消"提示
    this.showLongPressHint = true;
    this.canCancelDownload = false;

    // 震动反馈
    wx.vibrateShort({
      type: 'medium'
    });

    // 3 秒后可以取消
    this.longPressTimer = setTimeout(function () {
      _this11.canCancelDownload = true;
      // 再次震动提示可以松手取消
      wx.vibrateShort({
        type: 'heavy'
      });
    }, 3000);
  },
  // 长按结束
  handleLongPressEnd: function handleLongPressEnd() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // 如果已经满 3 秒，则执行取消操作
    if (this.canCancelDownload) {
      this.cancelDownload();
    }

    // 重置状态
    this.showLongPressHint = false;
    this.canCancelDownload = false;
  },
  // 取消下载
  cancelDownload: function cancelDownload() {
    if (this.downloadTask) {
      this.downloadTask.abort();
      this.downloadTask = null;
    }

    // 停止倒计时
    this.stopCountdown();

    // 重置状态
    this.isDownloading = false;
    this.downloadProgress = 0;
    this.downloadElapsedTime = 0;

    // 提示取消成功
    uni.showToast({
      title: '已取消下载',
      icon: 'none',
      duration: 2000
    });
  },
  // 初始化 Canvas
  initCanvas: function initCanvas() {
    var _this12 = this;
    var query = uni.createSelectorQuery().in(this);
    query.select('#progressCanvas').fields({
      node: true,
      size: true
    }).exec(function (res) {
      if (res && res[0] && res[0].node) {
        var canvas = res[0].node;
        var ctx = canvas.getContext('2d');

        // 设置画布尺寸（高分辨率）
        var dpr = uni.getSystemInfoSync().pixelRatio || 2;
        canvas.width = 180 * dpr;
        canvas.height = 180 * dpr;
        ctx.scale(dpr, dpr);
        _this12.canvasContext = ctx;
        _this12.canvas = canvas;
        _this12.drawProgress();
      } else {
        console.error('Canvas 节点获取失败');
      }
    });
  },
  // 绘制进度条
  drawProgress: function drawProgress() {
    if (!this.canvasContext) return;
    var ctx = this.canvasContext;
    var centerX = 90;
    var centerY = 90;

    // 清空画布
    ctx.clearRect(0, 0, 180, 180);

    // 1. 绘制填充圆（中心，根据进度扩大）
    var fillRadius = this.downloadProgress / 100 * 35;
    if (fillRadius > 0) {
      var gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, fillRadius);
      gradient.addColorStop(0, 'rgba(82, 196, 26, 0.3)');
      gradient.addColorStop(1, 'rgba(24, 144, 255, 0.1)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, fillRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. 绘制倒计时圆环背景（最外圈，半径 80）
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.2)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.stroke();

    // 3. 绘制倒计时圆环进度（最外圈，红色粗线，从满圆逐渐减少）
    var timeProgress = Math.min(this.downloadElapsedTime / this.maxDownloadTime, 1);
    var remainingAngle = Math.PI * 2 * (1 - timeProgress); // 剩余角度
    if (remainingAngle > 0) {
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 6; // 加粗红线
      ctx.lineCap = 'round';
      ctx.beginPath();
      // 从顶部开始，绘制剩余的圆弧（满圆 → 逐渐减少）
      ctx.arc(centerX, centerY, 80, -Math.PI / 2, -Math.PI / 2 + remainingAngle);
      ctx.stroke();
    }

    // 4. 绘制下载进度圆环背景（内圈，半径 65）
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 65, 0, Math.PI * 2);
    ctx.stroke();

    // 5. 绘制下载进度圆环（内圈，蓝绿渐变）
    var progressAngle = Math.PI * 2 * this.downloadProgress / 100;
    if (this.downloadProgress > 0) {
      // 创建渐变色
      var _gradient = ctx.createLinearGradient(0, 0, 180, 180);
      _gradient.addColorStop(0, '#1890ff');
      _gradient.addColorStop(1, '#52c41a');
      ctx.strokeStyle = _gradient;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 65, -Math.PI / 2, -Math.PI / 2 + progressAngle);
      ctx.stroke();
    }

    // Canvas 2D API 会自动渲染，不需要手动 draw
  },
  // 添加处理文件下载的方法
  handleFileDownload: function handleFileDownload(data) {
    var _this13 = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6() {
      var filePath, cachedPath, exists;
      return _regenerator.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              filePath = wx.env.USER_DATA_PATH + "/" + data.fileName + ".pdf"; // 确保 fileCache 是对象
              if (!_this13.fileCache || (0, _typeof2.default)(_this13.fileCache) !== "object") {
                _this13.fileCache = {};
              }

              // 检查文件是否已缓存
              if (!_this13.fileCache[data.fileId]) {
                _context6.next = 16;
                break;
              }
              cachedPath = _this13.fileCache[data.fileId];
              _context6.next = 6;
              return _this13.checkFileExists(cachedPath);
            case 6:
              exists = _context6.sent;
              if (!exists) {
                _context6.next = 14;
                break;
              }
              uni.hideLoading();
              uni.showToast({
                title: "正在打开...",
                icon: "none",
                duration: 500
              });
              setTimeout(function () {
                _this13.openDocument(cachedPath);
              }, 100);
              return _context6.abrupt("return");
            case 14:
              // 缓存失效，删除缓存记录
              delete _this13.fileCache[data.fileId];
              // 同步到本地存储
              try {
                uni.setStorageSync("fileCache", _this13.fileCache);
              } catch (e) {
                console.error("保存缓存失败:", e);
              }
            case 16:
              // 下载新文件
              _this13.isDownloading = true;
              _this13.downloadProgress = 0;
              _this13.downloadStartTime = Date.now();
              _this13.downloadElapsedTime = 0;
              _this13.maxDownloadTime = 120; // 最大下载时间 100 秒
              uni.hideLoading(); // 关闭 loading，改用进度条显示

              // 启动倒计时定时器
              _this13.startCountdown();

              // 创建下载任务并保存引用
              _this13.downloadTask = wx.downloadFile({
                url: data.url,
                filePath: filePath,
                timeout: 120000,
                // 超时时间 120 秒（120000ms = 120秒）
                success: function success(res) {
                  // 保存到内存缓存
                  _this13.fileCache[data.fileId] = res.filePath;
                  // 持久化到本地存储
                  try {
                    uni.setStorageSync("fileCache", _this13.fileCache);
                  } catch (e) {
                    console.error("保存缓存失败:", e);
                  }

                  // 下载完成，隐藏进度条
                  _this13.stopCountdown();
                  _this13.isDownloading = false;
                  _this13.downloadProgress = 0;

                  // 打开文档
                  _this13.openDocument(res.filePath);
                },
                fail: function fail(e) {
                  // 下载失败，隐藏进度条
                  _this13.stopCountdown();
                  _this13.isDownloading = false;
                  _this13.downloadProgress = 0;
                  uni.showToast({
                    title: "下载文件失败",
                    icon: "none"
                  });
                }
              });

              // 监听下载进度
              _this13.downloadTask.onProgressUpdate(function (res) {
                _this13.downloadProgress = res.progress;
              });
            case 25:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }))();
  },
  // 加载产品手册列表
  loadManuals: function loadManuals() {
    var _this14 = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee7() {
      var _yield$getManuals, data;
      return _regenerator.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              _this14.manualsLoading = true;
              _context7.next = 4;
              return (0, _index.getManuals)({
                page: _this14.manualsPage,
                pageSize: _this14.manualsPageSize
              });
            case 4:
              _yield$getManuals = _context7.sent;
              data = _yield$getManuals.data;
              if (data.code === 0) {
                _this14.manualsList = data.data.list;
                _this14.manualsTotal = data.data.total;
              }
              _context7.next = 12;
              break;
            case 9:
              _context7.prev = 9;
              _context7.t0 = _context7["catch"](0);
              console.error("加载产品手册失败", _context7.t0);
            case 12:
              _context7.prev = 12;
              _this14.manualsLoading = false;
              return _context7.finish(12);
            case 15:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, null, [[0, 9, 12, 15]]);
    }))();
  },
  // 切换手册页码
  changeManualsPage: function changeManualsPage(page) {
    if (this.manualsLoading) return;
    if (page < 1 || page > Math.ceil(this.manualsTotal / this.manualsPageSize)) return;
    this.manualsPage = page;
    this.loadManuals();
  },
  // 修改为下载指定手册
  downloadManual: function downloadManual(manual) {
    var _this15 = this;
    if (!manual.manual || !manual.manual.fileId) {
      uni.showToast({
        title: "手册文件不存在",
        icon: "none"
      });
      return;
    }
    uni.showLoading({
      title: "正在获取链接..."
    });
    // 使用云函数获取下载链接
    wx.cloud.callContainer({
      config: {
        env: "prod-3gdwxhfn933cdfa7" // 微信云托管的环境ID
      },

      header: {
        "X-WX-SERVICE": "express-036x" // 服务名称
      },

      path: "/api/files/download",
      method: "POST",
      data: {
        file_list: [{
          fileid: manual.manual.fileId,
          max_age: 60 * 60
        }]
      }
    }).then(function (data) {
      if (!data.data.data.file_list.length || !data.data.data.file_list[0].download_url) {
        uni.hideLoading();
        uni.showToast({
          title: "获取下载链接失败",
          icon: "none"
        });
        return;
      }
      var downloadUrl = _this15.getUnifiedCloudUrl(data.data.data.file_list[0].download_url);
      var fileData = {
        url: downloadUrl,
        fileName: manual.manual.name,
        fileId: manual.manual.fileId
      };
      if (manual.type === "view") {
        // 更新加载提示为下载中
        uni.showLoading({
          title: "正在下载..."
        });
        _this15.handleFileDownload(fileData);
      } else {
        uni.hideLoading();
        uni.setClipboardData({
          data: downloadUrl,
          success: function success() {
            uni.showToast({
              title: "复制成功",
              icon: "none"
            });
          }
        });
      }
    }).catch(function (error) {
      uni.hideLoading();
      uni.showToast({
        title: "获取下载链接失败",
        icon: "none"
      });
    });
  }
}), _mixins$components$da);
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"]))

/***/ }),

/***/ 53:
/*!*****************************************************************************************************************!*\
  !*** /Users/xiaofeiwu/Documents/my-project/芯辰微/芯辰微小程序/pages/search/index.vue?vue&type=style&index=0&lang=scss& ***!
  \*****************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--8-oneOf-1-3!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../../../Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./index.vue?vue&type=style&index=0&lang=scss& */ 54);
/* harmony import */ var _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Applications_HBuilderX_app_Contents_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_style_index_0_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 54:
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!/Users/xiaofeiwu/Documents/my-project/芯辰微/芯辰微小程序/pages/search/index.vue?vue&type=style&index=0&lang=scss& ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[47,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/search/index.js.map