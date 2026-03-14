"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_trip = require("../../stores/trip.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const store = stores_trip.useTripStore();
    const archived = common_vendor.computed(() => store.trips.filter((t) => t.status === "archived"));
    const archivedSorted = common_vendor.computed(
      () => [...archived.value].sort((a, b) => (b.completionDate || 0) - (a.completionDate || 0))
    );
    const int = (n) => Math.round(n);
    const dateText = (ts) => {
      try {
        const d = new Date(ts);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      } catch {
        return "";
      }
    };
    function open(t) {
      common_vendor.index.navigateTo({ url: `/src/pages/history-detail/index?id=${t.id}` });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: archived.value.length === 0
      }, archived.value.length === 0 ? {} : {}, {
        b: common_vendor.f(archivedSorted.value, (t, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(t.title),
            b: typeof t.recoveryRate === "number"
          }, typeof t.recoveryRate === "number" ? {
            c: common_vendor.t(int(t.recoveryRate * 100))
          } : {}, {
            d: common_vendor.t(t.time || "时间未设置"),
            e: t.completionDate
          }, t.completionDate ? {
            f: common_vendor.t(dateText(t.completionDate))
          } : {}, {
            g: t.id,
            h: common_vendor.o(($event) => open(t), t.id)
          });
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1ce8646d"]]);
wx.createPage(MiniProgramPage);
