"use strict";
const common_vendor = require("../common/vendor.js");
function get(key, def) {
  try {
    const raw = common_vendor.index.getStorageSync(key);
    return raw ? JSON.parse(raw) : def;
  } catch {
    return def;
  }
}
function set(key, val) {
  try {
    common_vendor.index.setStorageSync(key, JSON.stringify(val));
  } catch {
  }
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
const DEFAULTS = [
  { id: uid(), name: "商务出差", items: [
    { id: uid(), name: "身份证", group: "证件" },
    { id: uid(), name: "笔记本电脑", group: "电子" },
    { id: uid(), name: "充电器+适配器", group: "电子" },
    { id: uid(), name: "商务衬衫/正装", group: "服装" }
  ] },
  { id: uid(), name: "短途度假", items: [
    { id: uid(), name: "身份证", group: "证件" },
    { id: uid(), name: "防晒霜", group: "个人护理" },
    { id: uid(), name: "泳衣/拖鞋", group: "服装" },
    { id: uid(), name: "充电宝", group: "电子" }
  ] }
];
const useTemplateStore = common_vendor.defineStore("templates", {
  state: () => ({
    templates: get("templates", DEFAULTS)
  }),
  actions: {
    save() {
      set("templates", this.templates);
    },
    addTemplate(name) {
      const t = { id: uid(), name, items: [] };
      this.templates.unshift(t);
      this.save();
      return t;
    },
    removeTemplate(id) {
      this.templates = this.templates.filter((t) => t.id !== id);
      this.save();
    },
    renameTemplate(id, name) {
      const idx = this.templates.findIndex((t) => t.id === id);
      if (idx >= 0) {
        this.templates[idx].name = name;
        this.save();
      }
    },
    addItem(id, item) {
      const idx = this.templates.findIndex((t) => t.id === id);
      if (idx >= 0) {
        this.templates[idx].items.push({ id: uid(), name: item.name, group: item.group || "其他" });
        this.save();
      }
    },
    removeItem(id, itemId) {
      const idx = this.templates.findIndex((t) => t.id === id);
      if (idx >= 0) {
        this.templates[idx].items = this.templates[idx].items.filter((i) => i.id !== itemId);
        this.save();
      }
    },
    getById(id) {
      return this.templates.find((t) => t.id === id);
    },
    exportData() {
      return this.templates;
    },
    importData(data) {
      if (Array.isArray(data)) {
        this.templates = data;
        this.save();
      }
    }
  }
});
exports.useTemplateStore = useTemplateStore;
