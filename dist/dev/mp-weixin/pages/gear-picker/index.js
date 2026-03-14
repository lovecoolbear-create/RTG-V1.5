"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_gear = require("../../stores/gear.js");
const stores_templates = require("../../stores/templates.js");
const stores_trip = require("../../stores/trip.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const gear = stores_gear.useGearStore();
    const templates = stores_templates.useTemplateStore();
    const trips = stores_trip.useTripStore();
    const target = common_vendor.ref("template");
    const id = common_vendor.ref("");
    const isReturn = common_vendor.ref(false);
    const q = common_vendor.ref("");
    const sel = common_vendor.ref(/* @__PURE__ */ new Set());
    common_vendor.onLoad((options) => {
      target.value = (options == null ? void 0 : options.target) || "template";
      id.value = (options == null ? void 0 : options.id) || "";
      isReturn.value = (options == null ? void 0 : options.isReturn) === "1";
    });
    const filtered = common_vendor.computed(() => {
      const kw = q.value.trim();
      if (!kw)
        return gear.items;
      return gear.items.filter((i) => i.name.includes(kw) || (i.group || "").includes(kw));
    });
    function toggle(itemId) {
      if (sel.value.has(itemId))
        sel.value.delete(itemId);
      else
        sel.value.add(itemId);
    }
    function confirm() {
      const chosen = gear.items.filter((i) => sel.value.has(i.id)).map((i) => ({
        name: i.name,
        group: i.group || "其他",
        isConsumable: !!i.isConsumable
      }));
      if (target.value === "template") {
        for (const it of chosen)
          templates.addItem(id.value, it);
        common_vendor.index.showToast({ title: "已添加到模板", icon: "none" });
        common_vendor.index.navigateBack();
      } else {
        trips.addItemsToTrip(id.value, isReturn.value, chosen);
        common_vendor.index.showToast({ title: "已添加到清单", icon: "none" });
        common_vendor.index.navigateBack();
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: q.value,
        b: common_vendor.o(($event) => q.value = $event.detail.value),
        c: filtered.value.length === 0
      }, filtered.value.length === 0 ? {} : {}, {
        d: common_vendor.f(filtered.value, (i, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(i.name),
            b: common_vendor.t(i.group || "其他"),
            c: i.isConsumable
          }, i.isConsumable ? {} : {}, {
            d: sel.value.has(i.id),
            e: i.id,
            f: common_vendor.o(($event) => toggle(i.id), i.id)
          });
        }),
        e: common_vendor.t(sel.value.size),
        f: sel.value.size === 0,
        g: common_vendor.o(confirm)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d14a36cd"]]);
wx.createPage(MiniProgramPage);
