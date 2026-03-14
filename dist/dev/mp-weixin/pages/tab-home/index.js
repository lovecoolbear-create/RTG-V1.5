"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_trip = require("../../stores/trip.js");
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
    const store = stores_trip.useTripStore();
    const { ongoing, toArchive, sourceBuckets } = common_vendor.storeToRefs(store);
    const tab = common_vendor.ref(0);
    const sourceFilter = common_vendor.ref("all");
    const toArchiveCount = common_vendor.computed(() => filteredToArchive.value.length);
    const int = (n) => Math.round(n);
    const rightOptions = [
      {
        text: "归档",
        style: {
          backgroundColor: "#f43f5e",
          color: "#fff"
        }
      }
    ];
    const filteredOngoing = common_vendor.computed(() => {
      const key = sourceFilter.value;
      if (!sourceBuckets.value[key])
        return ongoing.value;
      const set = new Set(sourceBuckets.value[key].map((t) => t.id));
      return ongoing.value.filter((t) => set.has(t.id));
    });
    const filteredToArchive = common_vendor.computed(() => {
      const key = sourceFilter.value;
      if (!sourceBuckets.value[key])
        return toArchive.value;
      const set = new Set(sourceBuckets.value[key].map((t) => t.id));
      return toArchive.value.filter((t) => set.has(t.id));
    });
    function progress(t) {
      return store.progress(t);
    }
    function onCreate() {
      common_vendor.index.navigateTo({ url: "/src/pages/template-selector/index" });
    }
    function openChecklist(t, isReturn) {
      const mode = isReturn ? "return" : "departure";
      if (isReturn) {
        common_vendor.index.navigateTo({ url: `/src/pages/trip-checklist/index?id=${t.id}&mode=${mode}` });
      } else {
        common_vendor.index.navigateTo({ url: `/src/pages/trip-checklist/index?id=${t.id}&mode=${mode}` });
      }
    }
    function startReturn(t) {
      store.startReturnIfNeeded(t.id);
      common_vendor.index.navigateTo({ url: `/src/pages/trip-checklist/index?id=${t.id}&mode=return` });
    }
    function depart(t) {
      store.depart(t.id);
      common_vendor.index.showToast({ title: "已出发", icon: "none" });
    }
    function archive(t) {
      store.archiveTrip(t.id);
      common_vendor.index.showToast({ title: "已归档", icon: "none" });
    }
    function onSwipeClick(t) {
      archive(t);
    }
    function editTrip(t) {
      common_vendor.index.navigateTo({ url: `/src/pages/trip-edit/index?id=${t.id}` });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: tab.value === 0 ? 1 : "",
        b: common_vendor.o(($event) => tab.value = 0),
        c: toArchiveCount.value
      }, toArchiveCount.value ? {
        d: common_vendor.t(toArchiveCount.value)
      } : {}, {
        e: tab.value === 1 ? 1 : "",
        f: common_vendor.o(($event) => tab.value = 1),
        g: sourceFilter.value === "all" ? 1 : "",
        h: common_vendor.o(($event) => sourceFilter.value = "all"),
        i: sourceFilter.value === "template" ? 1 : "",
        j: common_vendor.o(($event) => sourceFilter.value = "template"),
        k: sourceFilter.value === "temporary" ? 1 : "",
        l: common_vendor.o(($event) => sourceFilter.value = "temporary"),
        m: common_vendor.o(onCreate),
        n: tab.value === 0
      }, tab.value === 0 ? common_vendor.e({
        o: filteredOngoing.value.length === 0
      }, filteredOngoing.value.length === 0 ? {} : {}, {
        p: common_vendor.f(filteredOngoing.value, (t, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(t.title),
            b: t.source
          }, t.source ? {
            c: common_vendor.t(t.source)
          } : {}, {
            d: common_vendor.t(t.time),
            e: common_vendor.o(($event) => editTrip(t), t.id),
            f: common_vendor.t(int(progress(t) * 100)),
            g: common_vendor.o(($event) => openChecklist(t, false), t.id),
            h: t.status === "packed"
          }, t.status === "packed" ? {
            i: common_vendor.o(($event) => openChecklist(t, false), t.id),
            j: common_vendor.o(($event) => depart(t), t.id)
          } : t.status === "departed" ? {
            l: common_vendor.o(($event) => startReturn(t), t.id)
          } : {}, {
            k: t.status === "departed",
            m: t.id
          });
        })
      }) : common_vendor.e({
        q: filteredToArchive.value.length === 0
      }, filteredToArchive.value.length === 0 ? {} : {
        r: common_vendor.t(filteredToArchive.value.length)
      }, {
        s: common_vendor.f(filteredToArchive.value, (t, k0, i0) => {
          return {
            a: common_vendor.t(t.title),
            b: common_vendor.t(int(progress(t) * 100)),
            c: common_vendor.o(($event) => openChecklist(t, true), t.id),
            d: t.id,
            e: common_vendor.o(($event) => onSwipeClick(t), t.id),
            f: "b153d3ad-1-" + i0 + ",b153d3ad-0"
          };
        }),
        t: common_vendor.p({
          ["right-options"]: rightOptions
        })
      }));
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b153d3ad"]]);
wx.createPage(MiniProgramPage);
