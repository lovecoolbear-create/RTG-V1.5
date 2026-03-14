"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/tab-home/index.js";
  "./pages/tab-gear/index.js";
  "./pages/tab-templates/index.js";
  "./pages/tab-history/index.js";
  "./pages/tab-settings/index.js";
  "./pages/trip-checklist/index.js";
  "./pages/template-selector/index.js";
  "./pages/template-edit/index.js";
  "./pages/gear-picker/index.js";
  "./pages/history-detail/index.js";
  "./pages/trip-edit/index.js";
}
const _sfc_main = {
  onLaunch() {
  },
  onShow() {
  },
  onHide() {
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.use(common_vendor.createPinia());
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
