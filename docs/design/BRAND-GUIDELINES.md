# ReadyToGo 品牌视觉设计规范

> 版本：v1.0
> 日期：2025-04-01
> 目标：微信小程序 + App Store + 安卓商店

---

## 1. 品牌定位

### 品牌名称
**ReadyToGo** —— "轻松准备，立即出发"

### 品牌调性
- **可靠**：行程管理不容出错
- **轻盈**：出行本该轻松无忧
- **现代**：科技感设计，简洁高效

### 目标用户
- 户外爱好者（滑雪、徒步、露营）
- 商务出行人士
- 精致生活人群

---

## 2. Logo 设计规范

### 2.1 主 Logo（横向组合）

**构图**：图标 + 文字横向排列

**图标元素**：
- **核心图形**：简洁的行李箱轮廓
- **细节**：箱子上方一个 ✓ 对勾符号
- **寓意**：准备完成，随时可以出发

**色彩**：
- 深色背景：主色 #76abff（科技蓝）
- 浅色背景：主色 #059669（活力绿）
- 备选：渐变色 #76abff → #34d399

**字体**：
- ReadyToGo：SF Pro Display / PingFang SC Bold
- 字重：Bold
- 间距：字母间距 +0.02em

**尺寸比例**：
- 图标 : 文字 = 1 : 3
- 整体高度：144px（@2x）

### 2.2 简化版 Logo（纯图标）

用于：
- 应用图标
- 启动页中央
- 小尺寸 favicon

**规格**：
- 正方形构图
- 圆角 20%（iOS 规范）
- 背景：纯色或渐变
- 图标：白色或浅色的行李箱+✓

### 2.3 AI 生成提示词（供参考）

**主 Logo 提示词**：
```
A minimalist logo for a travel preparation app called "ReadyToGo". 
Features a clean suitcase silhouette with a checkmark symbol on top. 
Modern tech style, gradient colors from blue (#76abff) to green (#34d399). 
Simple geometric shapes, no text, white background, vector style, flat design.
```

**简化版图标提示词**：
```
App icon for "ReadyToGo", a minimalist suitcase with checkmark badge. 
Square format with 20% rounded corners. 
Gradient background blue to teal (#76abff to #34d399). 
White icon in center, flat design, clean lines, no shadows.
```

---

## 3. 应用图标规格

### 3.1 微信小程序

| 尺寸 | 用途 | 文件名 |
|------|------|--------|
| 81×81 | 普通屏幕 | logo.png |
| 108×108 | 高清屏幕 | logo@2x.png |
| 144×144 | 超高清 | logo@3x.png |
| 300×300 | 卡券、广告 | logo_large.png |

### 3.2 iOS App Store

| 尺寸 | 用途 | 要求 |
|------|------|------|
| 1024×1024 | App Store 展示 | 无边框，纯色背景 |
| 180×180 | iPhone 主屏幕 @3x | 圆角自动生成 |
| 120×120 | iPhone 主屏幕 @2x | - |
| 167×167 | iPad Pro @2x | - |
| 152×152 | iPad/iPad Mini @2x | - |

### 3.3 Android 应用商店

| 尺寸 | 用途 | 要求 |
|------|------|------|
| 512×512 | Google Play | 安全区域内（中心 384×384）|
| 192×192 | xxxhdpi | - |
| 144×144 | xxhdpi | - |
| 96×96 | xhdpi | - |
| 72×72 | hdpi | - |
| 48×48 | mdpi | - |

### 3.4 图标设计要点

1. **简洁可辨**：小尺寸下仍能识别
2. **避免文字**：图标内不要有文字
3. **纯色背景**：App Store 要求纯色，不要透明
4. **安全区域**：主要内容在中心 60% 区域

---

## 4. 启动页/引导页设计

### 4.1 启动页（Splash Screen）

**场景**：App 启动时显示 2-3 秒

**设计**：
- 背景：深色渐变（与小程序一致）
  - 色值：#040a16 → #071020
- 中央：简化版 Logo（行李箱+✓）
- 动画：Logo 从 80% 缩放到 100%，淡入效果
- 时长：2.5 秒后自动进入首页

**无文字版本**：
- 仅显示 Logo，不显示品牌名
- iOS 审核偏好（避免启动广告嫌疑）

### 4.2 引导页（Onboarding）- 可选

**场景**：首次使用的新用户

**页数**：3-4 页

**内容建议**：

**第 1 页：欢迎**
- 插图：行李箱准备出发的场景
- 标题："轻松准备，立即出发"
- 副标题：让每次出行都井井有条

**第 2 页：模板功能**
- 插图：清单模板展示
- 标题："丰富的出行模板"
- 副标题：户外、商务、生活场景全覆盖

**第 3 页：状态追踪**
- 插图：行程状态进度条
- 标题："实时掌握准备进度"
- 副标题：从计划到归档，全程陪伴

**第 4 页：开始**
- 插图：用户点击出发的场景
- 按钮："开始使用"

### 4.3 启动页 AI 生成提示词

**背景图**：
```
Abstract gradient background for mobile app splash screen.
Dark blue to dark teal gradient (#040a16 to #071020).
Subtle geometric shapes, soft glow effect.
Minimalist, modern, tech-inspired.
No text, no icons, 9:16 vertical ratio.
```

**引导页插图 1**：
```
A minimalist illustration of a travel suitcase with small items floating around it.
Items: sunglasses, passport, camera, phone.
Clean lines, flat design, blue and green color palette.
White/light background, friendly and inviting mood.
```

---

## 5. 品牌色彩系统

### 5.1 主色调

| 名称 | 色值 | 用途 |
|------|------|------|
| 品牌蓝 | #76abff | Logo、主按钮、链接 |
| 品牌绿 | #34d399 | 成功状态、完成标记 |
| 深色背景 | #040a16 | 夜间模式背景 |
| 浅色背景 | #f8fbff | 日间模式背景 |

### 5.2 辅助色

| 名称 | 色值 | 用途 |
|------|------|------|
| 警告橙 | #f59e0b | 提醒、待办 |
| 错误红 | #ef4444 | 错误、删除 |
| 文字主色 | #f7fbff | 深色背景文字 |
| 文字次色 | #9bb0cb | 次要信息 |

### 5.3 渐变色

```css
/* 品牌渐变 */
background: linear-gradient(135deg, #76abff 0%, #34d399 100%);

/* 深色背景 */
background: linear-gradient(180deg, #040a16 0%, #071020 100%);

/* 浅色背景 */
background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
```

---

## 6. 字体规范

### 6.1 中文字体

**主字体**：PingFang SC（苹方）
- 标题：Bold (600)
- 正文：Regular (400)
- 轻量：Light (300)

**备用字体**：
- Source Han Sans（思源黑体）
- Noto Sans SC

### 6.2 英文字体

**主字体**：SF Pro Display
- 标题：Bold (700)
- 正文：Medium (500)

**备用字体**：
- Inter
- Roboto

### 6.3 字号规范

| 级别 | 尺寸 | 字重 | 用途 |
|------|------|------|------|
| H1 | 36rpx | Bold | 页面大标题 |
| H2 | 32rpx | Bold | 区块标题 |
| H3 | 28rpx | Medium | 卡片标题 |
| Body | 26rpx | Regular | 正文内容 |
| Small | 24rpx | Regular | 辅助说明 |
| Mini | 22rpx | Light | 标签、时间 |

---

## 7. 文件交付清单

### 7.1 Logo 文件

```
/assets/logo/
├── logo_main.svg          # 主 Logo 矢量源文件
├── logo_main_dark.png     # 深色背景版本 @1x/2x/3x
├── logo_main_light.png    # 浅色背景版本 @1x/2x/3x
├── logo_icon.svg          # 简化版图标源文件
├── logo_icon_square.png   # 方形图标（用于 App）
└── logo_favicon.png       # 16×16 / 32×32
```

### 7.2 图标文件

```
/assets/icons/
├── ios/
│   ├── icon-1024.png      # App Store
│   ├── icon-180.png       # iPhone @3x
│   ├── icon-120.png       # iPhone @2x
│   └── ...
├── android/
│   ├── icon-512.png       # Play Store
│   ├── icon-192.png       # xxxhdpi
│   └── ...
└── wechat/
    ├── logo-81.png
    ├── logo-108.png
    └── logo-144.png
```

### 7.3 启动页文件

```
/assets/splash/
├── splash_bg.png          # 启动页背景
├── splash_logo.svg        # 中央 Logo
└── splash_animation.json  # Lottie 动画（可选）
```

---

## 8. 技术实现备注

### 8.1 UniApp 配置

**manifest.json**：
```json
{
  "name": "ReadyToGo",
  "description": "轻松准备，立即出发",
  "versionName": "1.0.0",
  "versionCode": "100",
  "app-plus": {
    "splashscreen": {
      "android": {
        "hdpi": "assets/splash/splash.9.png",
        "xhdpi": "assets/splash/splash.9.png",
        "xxhdpi": "assets/splash/splash.9.png"
      },
      "ios": {
        "iphone": {
          "portrait": "assets/splash/ios/Default@2x.png"
        }
      }
    }
  },
  "mp-weixin": {
    "appid": "your-app-id",
    "setting": {
      "urlCheck": false
    }
  }
}
```

### 8.2 微信小程序配置

**project.config.json**：
```json
{
  "description": "项目配置文件",
  "packOptions": {
    "ignore": []
  },
  "setting": {
    "urlCheck": false,
    "es6": true
  },
  "compileType": "miniprogram",
  "libVersion": "2.19.4",
  "appid": "your-app-id",
  "projectname": "ReadyToGo",
  "debugOptions": {
    "hidedInDevtools": []
  }
}
```

---

## 9. 设计工具推荐

### Logo 设计
- **Figma**（推荐）：矢量设计，团队协作
- **Adobe Illustrator**：专业矢量软件
- **Sketch**：Mac 用户首选
- **Canva**：简单快速，有 AI 功能

### AI 生成
- **Midjourney**：高质量插图
- **DALL·E 3**：与 ChatGPT 集成
- **Stable Diffusion**：本地部署，免费
- **Canva AI**：简单好用

### 图标导出
- **IconKitchen**：一键生成多平台图标
- **App Icon Generator**：在线工具
- **Figma 插件**：
  - "App Icon Template"
  - "Export to Android/iOS"

---

## 10. 审核注意事项

### iOS App Store

1. **截图规范**：
   - 必须使用真实 iPhone 设备截图（不能是设计稿）
   - 不能包含状态栏时间/运营商信息
   - 截图内容必须与 App 功能一致

2. **启动页要求**：
   - 不能包含推广内容
   - 不能包含定价信息
   - 最好只显示 Logo

3. **元数据**：
   - 应用名称：ReadyToGo - 出行清单助手
   - 副标题：轻松准备，立即出发
   - 关键词：出行清单,旅行准备,packing list,行程管理

### 微信小程序

1. **类目选择**：
   - 工具 > 效率工具
   - 或 旅游 > 旅游工具

2. **隐私接口**：
   - 使用地理位置需申请权限
   - 需在设置中说明用途

---

**文档结束**

设计师/开发者可根据此规范执行，确保品牌一致性。
