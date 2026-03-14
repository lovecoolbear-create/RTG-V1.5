"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_gear = require("../../stores/gear.js");
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
    const store = stores_gear.useGearStore();
    const items = common_vendor.computed(() => store.items);
    const rightOptions = [{ text: "删除", style: { backgroundColor: "#f43f5e", color: "#fff" } }];
    function add() {
      common_vendor.index.showModal({
        title: "添加装备",
        editable: true,
        placeholderText: "名称,分组,是否消耗品(0/1)",
        success: (res) => {
          if (res.confirm) {
            const raw = (res.content || "").split(",");
            const name = (raw[0] || "").trim() || "未命名";
            const group = (raw[1] || "").trim() || "其他";
            const consumable = (raw[2] || "").trim() === "1";
            store.add(name, group, consumable);
          }
        }
      });
    }
    function toggle(id) {
      store.toggleConsumable(id);
    }
    function remove(id) {
      store.remove(id);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(add),
        b: items.value.length === 0
      }, items.value.length === 0 ? {} : {}, {
        c: common_vendor.f(items.value, (i, k0, i0) => {
          return {
            a: common_vendor.t(i.name),
            b: common_vendor.t(i.group || "其他"),
            c: i.isConsumable,
            d: common_vendor.o(($event) => toggle(i.id), i.id),
            e: i.id,
            f: common_vendor.o(($event) => remove(i.id), i.id),
            g: "bbd5203c-1-" + i0 + ",bbd5203c-0"
          };
        }),
        d: common_vendor.p({
          ["right-options"]: rightOptions
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bbd5203c"]]);
wx.createPage(MiniProgramPage);
