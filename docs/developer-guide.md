# ReadyToGo 开发文档

## 项目概述

ReadyToGo 是一款智能出行清单管理小程序，帮助用户准备旅行装备，确保不遗漏重要物品。

## 技术栈

- **框架**: UniApp (Vue3 + Composition API)
- **状态管理**: Pinia
- **样式**: SCSS + CSS 变量
- **测试**: Vitest
- **构建**: HBuilderX / CLI

## 目录结构

```
/Users/blair/ReadyToGo-wechat/
├── docs/                     # 文档
│   ├── design/              # 设计文档
│   ├── specs/               # 技术规范
│   ├── legal/               # 法律文档
│   └── *.md                 # 体验报告
├── src/
│   ├── components/          # 公共组件
│   ├── pages/              # 页面
│   │   ├── tab-*/          # Tab页面
│   │   ├── trip-*/         # 行程相关
│   │   ├── template-*/     # 模板相关
│   │   └── ...
│   ├── stores/             # Pinia Store
│   │   ├── trip.js         # 行程管理
│   │   ├── gear.js         # 装备库
│   │   ├── templates.js   # 模板管理
│   │   └── preset-templates.js # 预设模板
│   ├── utils/              # 工具函数
│   │   ├── storage.js     # 存储封装
│   │   ├── theme.js       # 主题管理
│   │   ├── validation.js  # 数据校验
│   │   ├── i18n.js        # 国际化
│   │   ├── analytics.js   # 数据分析
│   │   ├── offline.js     # 离线体验
│   │   ├── performance.js # 性能优化
│   │   ├── error-monitor.js # 错误监控
│   │   └── accessibility.js # 无障碍支持
│   ├── services/           # 服务层
│   ├── styles/            # 样式
│   ├── static/            # 静态资源
│   └── App.vue            # 入口
├── tests/
│   ├── unit/              # 单元测试
│   ├── integration/       # 集成测试
│   ├── e2e/              # E2E测试
│   └── mocks/            # 测试Mock
├── manifest.json          # 应用配置
├── pages.json            # 页面路由
└── vite.config.js        # 构建配置
```

## 核心模块

### 1. 行程管理 (Trip Store)

**文件**: `src/stores/trip.js`

**核心功能**:
- 创建行程（从模板/临时创建）
- 行程状态管理（准备中/打包中/已完成/已归档）
- 物品清单管理（出发/返程双清单）
- 找回率统计

**主要方法**:
```javascript
createTripFromTemplate(template, meta)  // 从模板创建行程
updateTripMeta(tripId, updates)        // 更新行程元数据
toggleItem(tripId, isReturn, itemId)  // 切换物品状态
archiveTrip(tripId)                    // 归档行程
itemsOf(tripId, isReturn)             // 获取物品列表
```

### 2. 装备库 (Gear Store)

**文件**: `src/stores/gear.js`

**核心功能**:
- 装备CRUD
- 分类管理
- 消耗品追踪
- 补货提醒

**主要方法**:
```javascript
addItem(item)                          // 添加装备
updateItem(id, updates)              // 更新装备
recordConsumableUsage(gearId)        // 记录消耗品使用
getRestockAlerts()                    // 获取补货提醒
```

### 3. 模板管理 (Templates Store)

**文件**: `src/stores/templates.js`

**核心功能**:
- 模板CRUD
- 预设模板导入
- 模板分享
- 社区模板

**主要方法**:
```javascript
addTemplate(name)                      // 创建模板
importPreset(presetId)                // 导入预设模板
exportTemplate(id)                   // 导出模板
getRecommendations(context)            // 获取推荐模板
```

### 4. 工具函数

#### 存储封装 (storage.js)
```javascript
get(key, defaultValue)                 // 获取存储
set(key, value)                      // 设置存储
remove(key)                          // 删除存储
```

#### 主题管理 (theme.js)
```javascript
useAutoThemeClass()                  // 自动主题组合式函数
toggleTheme()                        // 切换主题
```

#### 国际化 (i18n.js)
```javascript
t(key, params)                       // 翻译
setLocale(locale)                    // 设置语言
formatDate(date)                     // 格式化日期
```

## API 接口

### 行程相关

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `createTripFromTemplate` | `template, meta` | `Trip` | 创建行程 |
| `deleteTrip` | `tripId` | `void` | 删除行程 |
| `archiveTrip` | `tripId` | `void` | 归档行程 |
| `toggleItem` | `tripId, isReturn, itemId` | `void` | 切换物品状态 |
| `itemsOf` | `tripId, isReturn` | `Item[]` | 获取物品列表 |

### 装备相关

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `addItem` | `item` | `Item` | 添加装备 |
| `updateItem` | `id, updates` | `void` | 更新装备 |
| `deleteItem` | `id` | `void` | 删除装备 |
| `recordConsumableUsage` | `gearId` | `void` | 记录消耗 |

### 模板相关

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `addTemplate` | `name` | `Template` | 创建模板 |
| `updateTemplate` | `id, updates` | `void` | 更新模板 |
| `deleteTemplate` | `id` | `void` | 删除模板 |
| `importPreset` | `presetId` | `Template` | 导入预设 |

## 开发规范

### 1. 代码规范

- 使用 Composition API
- 使用 `<script setup>` 语法
- 组件名使用 PascalCase
- 文件名使用 kebab-case

### 2. 样式规范

- 使用 CSS 变量
- 使用 BEM 命名
- 使用 rem/px 混合单位
- 深色/浅色模式支持

### 3. 测试规范

```javascript
describe('Feature', () => {
  beforeEach(() => {
    // 重置状态
  })
  
  it('should do something', () => {
    // 测试逻辑
  })
})
```

## 构建与部署

### 开发环境
```bash
npm install
npm run dev
```

### 测试
```bash
npm test              # 运行所有测试
npm test -- --watch  # 监听模式
```

### 构建
```bash
npm run build
```

### 发布
1. 在微信开发者工具中导入项目
2. 设置 AppID
3. 点击上传
4. 在微信公众平台提交审核

## 性能优化

### 已实施方案
- 分包加载 (subPackages)
- 预加载规则 (preloadRule)
- 图片懒加载
- 防抖节流
- 虚拟列表

### 监控指标
- 首屏时间 < 1s
- 页面切换 < 300ms
- 内存占用 < 50MB

## 安全规范

- 数据本地存储加密
- API 请求签名验证
- 敏感信息不落地
- XSS 防护

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 通过测试
5. 提交 PR

## 更新日志

### v1.0.0 (2024-03)
- 基础功能实现
- 行程/装备/模板管理

### v2.0.0 (2024-04)
- 性能优化
- 可访问性支持
- 国际化
- 数据分析

## 联系作者

- 邮箱: dev@readytogo.app
- GitHub: github.com/readytogo
