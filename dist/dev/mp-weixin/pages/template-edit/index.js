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
    const id = common_vendor.ref("");
    const tpl = common_vendor.ref(null);
    const name = common_vendor.ref("");
    const removeOption = [{ text: "移除", style: { backgroundColor: "#f43f5e", color: "#fff" } }];
    common_vendor.onLoad((options) => {
      var _a;
      id.value = (options == null ? void 0 : options.id) || "";
      tpl.value = store.getById(id.value);
      name.value = ((_a = tpl.value) == null ? void 0 : _a.name) || "";
    });
    function saveName() {
      store.renameTemplate(id.value, name.value.trim() || "未命名模板");
      tpl.value = store.getById(id.value);
      common_vendor.index.showToast({ title: "已保存", icon: "none" });
    }
    function addItem() {
      common_vendor.index.showModal({
        title: "添加物品",
        editable: true,
        placeholderText: "物品名,分组(可选)",
        success: (res) => {
          if (res.confirm) {
            const raw = (res.content || "").split(",");
            const item = { name: (raw[0] || "").trim() || "未命名", group: (raw[1] || "").trim() || "其他" };
            store.addItem(id.value, item);
            tpl.value = store.getById(id.value);
          }
        }
      });
    }
    function remove(itemId) {
      store.removeItem(id.value, itemId);
      tpl.value = store.getById(id.value);
    }
    function addFromGear() {
      common_vendor.index.navigateTo({ url: `/src/pages/gear-picker/index?target=template&id=${id.value}` });
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e;
      return common_vendor.e({
        a: name.value,
        b: common_vendor.o(($event) => name.value = $event.detail.value),
        c: common_vendor.o(saveName),
        d: common_vendor.o(addItem),
        e: common_vendor.o(addFromGear),
        f: ((_b = (_a = tpl.value) == null ? void 0 : _a.items) == null ? void 0 : _b.length) === 0
      }, ((_d = (_c = tpl.value) == null ? void 0 : _c.items) == null ? void 0 : _d.length) === 0 ? {} : {}, {
        g: common_vendor.f(((_e = tpl.value) == null ? void 0 : _e.items) || [], (it, k0, i0) => {
          return {
            a: common_vendor.t(it.name),
            b: common_vendor.t(it.group || "其他"),
            c: it.id,
            d: common_vendor.o(($event) => remove(it.id), it.id),
            e: "083d4bd8-1-" + i0 + ",083d4bd8-0"
          };
        }),
        h: common_vendor.p({
          ["right-options"]: removeOption
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-083d4bd8"]]);
wx.createPage(MiniProgramPage);
