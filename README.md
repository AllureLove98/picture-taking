<p align="center">
  <h1 align="center">📸 Picture Taking</h1>
</p>

<p align="center">
A universal image grabber userscript based on Tampermonkey.
<br>
支持全页面图片抓取 / 增量扫描 / UI记忆 / 磁吸停靠 / 一键复制
</p>

---

<p align="center">

<img src="https://img.shields.io/badge/version-15.0-blue" />
<img src="https://img.shields.io/github/stars/AllureLove98/picture-taking?style=flat" />
<img src="https://img.shields.io/github/forks/AllureLove98/picture-taking?style=flat" />
<img src="https://img.shields.io/github/license/AllureLove98/picture-taking" />

<br>

<img src="https://img.shields.io/greasyfork/dt/567730?label=GreasyFork%20Downloads" />
<img src="https://img.shields.io/greasyfork/rating-score/567730?label=Rating" />

</p>

---

## 🌏 Language | 语言

- 🇨🇳 中文  
- 🇺🇸 English

---

## 🚀 Online Install | 在线安装

### 🔥 GreasyFork (Recommended / 推荐)

👉 [Click To Install | 点击安装](https://update.greasyfork.org/scripts/567730/%E5%9B%BE%E7%89%87%E6%8A%93%E5%8F%96%E5%99%A8.user.js)

Requires:

- Tampermonkey
- Violentmonkey

---

## 🏠 Repository | 项目仓库

GitHub:

👉 https://github.com/AllureLove98/picture-taking

⭐ Star this project if you like it!

---

## ✨ Features | 功能

### 中文

- 🔍 全页面图片扫描
- ♻️ 增量抓取（避免重复）
- 🧹 一键重置扫描
- 📋 一键复制所有链接
- 🖼 点击放大图片
- 📌 磁吸式悬浮按钮
- 📐 面板尺寸记忆
- 📍 面板位置记忆

### English

- 🔍 Full page image scanning
- ♻️ Incremental capture
- 🧹 Reset scanning cache
- 📋 One-click copy all URLs
- 🖼 Click to zoom image
- 📌 Magnetic floating UI
- 📐 Panel size memory
- 📍 Panel position memory

---

## 📦 Installation | 安装步骤

### ① Install Extension | 安装扩展

| Browser | Extension |
|---|---|
| Chrome / Edge | Tampermonkey |
| Firefox | Tampermonkey / Violentmonkey |

---

### ② Install Script | 安装脚本

1. Open Tampermonkey
2. Create new script
3. Paste `.user.js` code
4. Save

Done ✅

---

## 🚀 Usage | 使用方法

| Action | Function |
|---|---|
| 📸 Click | Open / Close panel |
| 🔍 Scan | Increment scan |
| 🧹 Reset | Clear cache & rescan |
| 📋 Copy All | Copy all URLs |
| Click Image | Open in new tab |
| Drag Button | Move floating UI |

---

## 🧠 Technical Principle | 技术原理

Script scans DOM elements:

- `<img>`
- `<video poster>`
- `background-image`
- `:before`
- `:after`

Using Set for deduplication:

```js
let urlStore = new Set();
let processedRawUrls = new Set();
