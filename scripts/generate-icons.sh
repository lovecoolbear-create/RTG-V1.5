#!/bin/bash

# ReadyToGo 图标生成脚本
# 使用 ImageMagick 或 Inkscape 从 SVG 源文件生成所有平台所需图标

# 配置
SOURCE_SVG="./src/assets/logo/logo_icon.svg"
OUTPUT_DIR="./src/assets/icons"
BRAND_COLOR1="#76abff"
BRAND_COLOR2="#34d399"

echo "🎨 ReadyToGo 图标生成工具"
echo "=========================="
echo ""

# 检查依赖
if ! command -v convert &> /dev/null; then
    echo "⚠️  未安装 ImageMagick，请安装:"
    echo "   Mac: brew install imagemagick"
    echo "   Linux: sudo apt-get install imagemagick"
    echo ""
    echo "或使用在线工具:"
    echo "   https://icon.kitchen"
    echo "   https://appicon.co"
    exit 1
fi

# 创建输出目录
echo "📁 创建输出目录..."
mkdir -p "$OUTPUT_DIR/ios"
mkdir -p "$OUTPUT_DIR/android"
mkdir -p "$OUTPUT_DIR/wechat"

# 微信小程序图标
echo ""
echo "📱 生成微信小程序图标..."
convert "$SOURCE_SVG" -resize 81x81   "$OUTPUT_DIR/wechat/logo-81.png"
convert "$SOURCE_SVG" -resize 108x108 "$OUTPUT_DIR/wechat/logo-108.png"
convert "$SOURCE_SVG" -resize 144x144 "$OUTPUT_DIR/wechat/logo-144.png"
convert "$SOURCE_SVG" -resize 300x300 "$OUTPUT_DIR/wechat/logo-300.png"
echo "   ✓ logo-81.png (普通屏)"
echo "   ✓ logo-108.png (高清屏)"
echo "   ✓ logo-144.png (超高清)"
echo "   ✓ logo-300.png (卡券广告)"

# iOS 图标
echo ""
echo "🍎 生成 iOS 图标..."
convert "$SOURCE_SVG" -resize 1024x1024 -background "$BRAND_COLOR1" -gravity center -extent 1024x1024 "$OUTPUT_DIR/ios/icon-1024.png"
convert "$SOURCE_SVG" -resize 180x180 "$OUTPUT_DIR/ios/icon-180.png"
convert "$SOURCE_SVG" -resize 120x120 "$OUTPUT_DIR/ios/icon-120.png"
convert "$SOURCE_SVG" -resize 167x167 "$OUTPUT_DIR/ios/icon-167.png"
convert "$SOURCE_SVG" -resize 152x152 "$OUTPUT_DIR/ios/icon-152.png"
echo "   ✓ icon-1024.png (App Store)"
echo "   ✓ icon-180.png (iPhone @3x)"
echo "   ✓ icon-120.png (iPhone @2x)"
echo "   ✓ icon-167.png (iPad Pro @2x)"
echo "   ✓ icon-152.png (iPad @2x)"

# Android 图标
echo ""
echo "🤖 生成 Android 图标..."
convert "$SOURCE_SVG" -resize 512x512 -background "$BRAND_COLOR1" -gravity center -extent 512x512 "$OUTPUT_DIR/android/icon-512.png"
convert "$SOURCE_SVG" -resize 192x192 "$OUTPUT_DIR/android/icon-192.png"
convert "$SOURCE_SVG" -resize 144x144 "$OUTPUT_DIR/android/icon-144.png"
convert "$SOURCE_SVG" -resize 96x96 "$OUTPUT_DIR/android/icon-96.png"
convert "$SOURCE_SVG" -resize 72x72 "$OUTPUT_DIR/android/icon-72.png"
convert "$SOURCE_SVG" -resize 48x48 "$OUTPUT_DIR/android/icon-48.png"
echo "   ✓ icon-512.png (Google Play)"
echo "   ✓ icon-192.png (xxxhdpi)"
echo "   ✓ icon-144.png (xxhdpi)"
echo "   ✓ icon-96.png (xhdpi)"
echo "   ✓ icon-72.png (hdpi)"
echo "   ✓ icon-48.png (mdpi)"

# 生成启动页背景
echo ""
echo "🎬 生成启动页资源..."
mkdir -p "./src/assets/splash/ios"

# 生成渐变背景图
convert -size 750x1334 "gradient:#040a16-#071020" "./src/assets/splash/splash-bg.png"
echo "   ✓ splash-bg.png (启动页背景)"

echo ""
echo "=========================="
echo "✅ 所有图标生成完成！"
echo ""
echo "📋 输出目录:"
echo "   $OUTPUT_DIR"
echo ""
echo "🔔 提示:"
echo "   1. iOS 图标已添加圆角蒙版背景色"
echo "   2. Android 512px 图标已扩展为安全区域"
echo "   3. 请检查生成的图标是否符合品牌规范"
echo ""
echo "🚀 下一步:"
echo "   1. 使用设计工具优化图标细节"
echo "   2. 运行微信开发者工具预览"
echo "   3. 测试 iOS/Android 真机显示效果"
