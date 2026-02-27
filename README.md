# 📸 Picture Taking

> 一个基于 Tampermonkey 的通用图片抓取工具  
> 支持全页面扫描、增量抓取、面板记忆、磁吸靠边、一键复制等功能。

---

## 🚀 Quick Install

### ✅ 一键安装（推荐）

👉 **[点击这里自动安装脚本](https://github.com/AllureLove98/picture-taking/raw/refs/heads/main/picture-taking.user.js)**

> 需要已安装 Tampermonkey / Violentmonkey 扩展  
> 点击后浏览器会自动弹出安装界面

---

## 🏠 GitHub Repository

📦 项目地址：

👉 https://github.com/AllureLove98/picture-taking

欢迎 Star ⭐

---

## ✨ Features

- 🔍 全页面图片扫描
- ♻️ 增量抓取（不会重复）
- 🧹 一键重置重新扫描
- 📋 一键复制所有图片链接
- 🖼 单图复制 & 点击放大
- 📌 悬浮按钮磁吸靠边
- 📐 面板尺寸记忆
- 📍 面板位置记忆
- ⚡ 轻量级，无外部依赖

---

## 📦 Installation

### 1️⃣ 安装浏览器扩展

| 浏览器 | 扩展 |
|--------|------|
| Chrome / Edge | Tampermonkey |
| Firefox | Tampermonkey / Violentmonkey |

---

### 2️⃣ 手动安装

1. 打开 Tampermonkey
2. 新建脚本
3. 粘贴 `.user.js` 文件内容
4. 保存

---

## 🚀 Usage

| 操作 | 说明 |
|------|------|
| 点击 📸 | 打开 / 关闭面板 |
| 🔍 扫描新图 | 增量抓取新增图片 |
| 🧹 彻底重置 | 清空缓存重新扫描 |
| 📋 一键复制 | 复制全部图片链接 |
| 复制地址 | 复制单个图片 |
| 点击图片 | 新窗口打开 |
| 拖动按钮 | 改变悬浮按钮位置 |

---

## 🧠 How It Works

脚本会遍历 DOM：

- `<img>`
- `<video poster>`
- `background-image`
- `:before`
- `:after`

并使用 `Set` 去重：

```js
let urlStore = new Set();
let processedRawUrls = new Set();
