"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_templates = require("../../stores/templates.js");
if (!Array) {
  const _easycom_uni_swipe_action_item2 = common_vendor.resolveComponent("uni-swipe-action-item");
  const _easycom_uni_swipe_action2 = common_vendor.resolveComponent("uni-swipe-action");
  (_easycom_uni_swipe_action_item2 + _easycom_uni_swipe_action2)();
}
const _easycom_uni_swipe_action_item = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-swipe-action-item/uni-swipe-action-item.js";
const _easycom_uni_swipe_action = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-swipe-action/uni-swipe-action.js";
if (!Math) {
  (_easycom_uni_swipe_action_item + _easycom_uni_swipe_action)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const store = stores_templates.useTemplateStore();
    const templates = common_vendor.computed(() => store.templates);
    const rightOptions = [{ text: "删除", style: { backgroundColor: "#f43f5e", color: "#fff" } }];
    function create() {
      common_vendor.index.showModal({
        title: "新建模板",
        editable: true,
        placeholderText: "输入模板名称",
        success: (res) => {
          var _a;
          if (res.confirm) {
            const t = store.addTemplate(((_a = res.content) == null ? void 0 : _a.trim()) || "未命名模板");
            common_vendor.index.navigateTo({ url: `/pages/template-edit/index?id=${t.id}` });
          }
        }
      });
    }
    function onSwipe(t) {
      common_vendor.index.showModal({
        title: "确认删除模板？",
        success: (res) => {
          if (res.confirm) {
            store.removeTemplate(t.id);
          }
        }
      });
    }
    function open(t) {
      common_vendor.index.navigateTo({ url: `/pages/template-edit/index?id=${t.id}` });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(create),
        b: templates.value.length === 0
      }, templates.value.length === 0 ? {} : {}, {
        c: common_vendor.f(templates.value, (t, k0, i0) => {
          return {
            a: common_vendor.t(t.name),
            b: common_vendor.t(t.items.length),
            c: common_vendor.o(($event) => open(t), t.id),
            d: t.id,
            e: common_vendor.o(($event) => onSwipe(t), t.id),
            f: "31e6bb0e-1-" + i0 + ",31e6bb0e-0"
          };
        }),
        d: common_vendor.p({
          ["right-options"]: rightOptions
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-31e6bb0e"]]);
wx.createPage(MiniProgramPage);
