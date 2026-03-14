"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_trip = require("../../stores/trip.js");
const stores_templates = require("../../stores/templates.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const tripStore = stores_trip.useTripStore();
    const tplStore = stores_templates.useTemplateStore();
    const templates = common_vendor.computed(() => tplStore.templates);
    function select(tpl) {
      const trip = tripStore.createTripFromTemplate(tpl);
      common_vendor.index.navigateTo({ url: `/src/pages/trip-checklist/index?id=${trip.id}&mode=departure` });
    }
    function createTemp() {
      common_vendor.index.showModal({
        title: "新建临时行程",
        editable: true,
        placeholderText: "输入行程标题，例如：今晚加班",
        success: (res) => {
          if (res.confirm) {
            const title = (res.content || "").trim() || "临时行程";
            const trip = tripStore.createTemporaryTrip(title);
            common_vendor.index.navigateTo({ url: `/src/pages/trip-checklist/index?id=${trip.id}&mode=departure` });
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(createTemp),
        b: common_vendor.f(templates.value, (tpl, k0, i0) => {
          return {
            a: common_vendor.t(tpl.name),
            b: common_vendor.t(tpl.items.length),
            c: tpl.id || tpl.name,
            d: common_vendor.o(($event) => select(tpl), tpl.id || tpl.name)
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6d0a8a27"]]);
wx.createPage(MiniProgramPage);
