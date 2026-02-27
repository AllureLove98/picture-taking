// ==UserScript==
// @name         图片抓取器
// @namespace    http://tampermonkey.net/
// @version      15.0
// @description  支持面板拉伸记忆、磁吸靠边、一键复制
// @author       Ryota_Aoik
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    let urlStore = new Set();
    // 专门存储已经处理过的原始URL，防止重复请求API
    let processedRawUrls = new Set();

    // --- 核心提取逻辑 ---
    async function extractUrls() {
        const all = document.querySelectorAll('*');
        const tasks = [];

        all.forEach(el => {
            const getBg = (node, pseudo) => {
                const style = window.getComputedStyle(node, pseudo);
                const bg = style.backgroundImage;
                if (bg && bg !== 'none' && bg.includes('url')) {
                    const match = bg.match(/url\(['"]?([^'"]+)['"]?\)/);
                    return match ? match[1] : null;
                }
                return null;
            };

            const foundUrls = [
                getBg(el, null),
                getBg(el, ':before'),
                getBg(el, ':after'),
                (el.tagName === 'IMG' ? el.currentSrc : null),
                (el.tagName === 'VIDEO' ? el.poster : null)
            ];

            foundUrls.forEach(url => {
                if (url && !processedRawUrls.has(url)) {
                    processedRawUrls.add(url);
                    // 对于可能是API的地址，尝试获取其实际指向（这里简单处理，直接加入Store）
                    // 如果URL包含随机接口特征，这里可以做特殊处理
                    urlStore.add(url);
                }
            });
        });
        return Promise.all(tasks);
    }

    async function fallbackCopy(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return await navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.cssText = "position:fixed;left:-9999px;top:0;";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return Promise.resolve();
        }
    }

    // --- 样式注入 ---
    const style = document.createElement('style');
    style.textContent = `
        #img-fetcher-main { position: fixed; z-index: 999999; transition: left 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28), right 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
        .fetcher-trigger {
            width: 50px; height: 50px; background: #1e88e5; color: white; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; cursor: move;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2); font-size: 24px; user-select: none;
            border: 2px solid white; opacity: 0.8; transition: all 0.2s;
        }
        .fetcher-trigger:hover { opacity: 1; transform: scale(1.1); box-shadow: 0 0 15px rgba(30, 136, 229, 0.6); }

        .universal-panel {
            position: fixed; z-index: 1000000; background: #ffffff;
            border-radius: 12px; display: none; flex-direction: column;
            box-shadow: 0 10px 50px rgba(0,0,0,0.3); border: 1px solid #ddd;
            overflow: hidden; resize: both; min-width: 400px; min-height: 400px;
        }
        .panel-header { padding: 12px 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #fdfdfd; }
        .header-left { display: flex; align-items: center; gap: 8px; }
        .panel-body { flex: 1; overflow-y: auto; padding: 15px; background: #f5f7f9; }

        .copy-section { background: white; padding: 12px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e0e6ed; }
        .url-textarea { width: 100%; height: 80px; border: 1px solid #dcdfe6; border-radius: 4px; padding: 8px; font-family: monospace; font-size: 11px; resize: none; box-sizing: border-box; }
        .btn-copy-all { width: 100%; margin-top: 8px; padding: 8px; background: #67c23a; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }

        .btn-icon { padding: 6px 10px; border-radius: 4px; border: 1px solid #dcdfe6; background: white; cursor: pointer; font-size: 13px; }
        .btn-icon:hover { background: #ecf5ff; border-color: #b3d8ff; color: #409eff; }
        .btn-danger:hover { background: #fef0f0; border-color: #fbc4c4; color: #f56c6c; }

        .image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
        .image-card { border: 1px solid #e6ebf5; border-radius: 8px; overflow: hidden; background: white; display: flex; flex-direction: column; }
        .image-card img { width: 100%; height: 110px; object-fit: contain; background: #f9f9f9; cursor: zoom-in; }
        .card-ops { padding: 6px; border-top: 1px solid #f2f6fc; }

        .close-x { font-size: 22px; cursor: pointer; color: #909399; }
        .close-x:hover { color: #f56c6c; }
    `;
    document.head.appendChild(style);

    // --- 初始化及记忆 ---
    const container = document.createElement('div');
    container.id = 'img-fetcher-main';
    const savedPos = JSON.parse(localStorage.getItem('img-fetcher-pos') || '{"bottom":"50px","right":"10px"}');
    Object.assign(container.style, savedPos);

    const trigger = document.createElement('div');
    trigger.className = 'fetcher-trigger';
    trigger.innerHTML = '📸';
    container.appendChild(trigger);
    document.body.appendChild(container);

    const panel = document.createElement('div');
    panel.className = 'universal-panel';
    const savedSize = JSON.parse(localStorage.getItem('img-fetcher-size') || '{"width":"600px","height":"500px","top":"10%","left":"20%"}');
    Object.assign(panel.style, savedSize);
    document.body.appendChild(panel);

    // --- 磁吸逻辑 ---
    let isDragging = false;
    trigger.addEventListener('mousedown', (e) => {
        isDragging = false;
        let startX = e.clientX, startY = e.clientY;
        const rect = container.getBoundingClientRect();
        let sRight = window.innerWidth - rect.right, sBottom = window.innerHeight - rect.bottom;
        const move = (ev) => {
            isDragging = true;
            container.style.right = (sRight + (startX - ev.clientX)) + 'px';
            container.style.bottom = (sBottom + (startY - ev.clientY)) + 'px';
            container.style.left = 'auto';
        };
        const up = () => {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
            if (container.getBoundingClientRect().left + container.offsetWidth/2 < window.innerWidth / 2) {
                container.style.right = 'auto'; container.style.left = '0px';
            } else {
                container.style.left = 'auto'; container.style.right = '0px';
            }
            localStorage.setItem('img-fetcher-pos', JSON.stringify({
                bottom: container.style.bottom, right: container.style.right, left: container.style.left
            }));
        };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    });

    const observer = new MutationObserver(() => {
        localStorage.setItem('img-fetcher-size', JSON.stringify({
            width: panel.style.width, height: panel.style.height, top: panel.style.top, left: panel.style.left
        }));
    });
    observer.observe(panel, { attributes: true, attributeFilter: ['style'] });

    // --- 渲染逻辑 ---
    function updateDisplay() {
        const list = Array.from(urlStore);
        const countTxt = panel.querySelector('#count-txt');
        if(countTxt) countTxt.innerText = `已捕获: ${list.length} 张`;
        const urlBox = panel.querySelector('#url-box');
        if(urlBox) urlBox.value = list.join('\n');

        const grid = panel.querySelector('#fetcher-grid');
        if(!grid) return;
        grid.innerHTML = '';
        list.forEach(url => {
            const card = document.createElement('div');
            card.className = 'image-card';
            card.innerHTML = `
                <img src="${url}" referrerpolicy="no-referrer" loading="lazy">
                <div class="card-ops">
                    <button class="btn-icon copy-single" data-url="${url}" style="width:100%; font-size:11px;">复制地址</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // --- UI 构造 ---
    trigger.addEventListener('click', async () => {
        if (isDragging) return;
        if (panel.style.display === 'flex') { panel.style.display = 'none'; return; }

        // 如果是空的才执行第一次抓取
        if (urlStore.size === 0) await extractUrls();

        panel.innerHTML = `
            <div class="panel-header">
                <div class="header-left">
                    <span id="count-txt" style="font-weight:bold; color:#606266; font-size:12px;"></span>
                    <button class="btn-icon" id="btn-scan" title="🔍 增量扫描：仅抓取网页上新出现的图，不会改变已捕获的API随机图。">🔍 扫描新图</button>
                    <button class="btn-icon btn-danger" id="btn-reset" title="🧹 彻底重置：清空列表并重新从网页抓取（会导致API随机图刷新）。">🧹 彻底重置</button>
                </div>
                <div class="header-left">
                    <button class="btn-icon" id="btn-reload" title="🔄 刷新网页">🔄 刷新网页</button>
                    <span class="close-x" id="btn-close">&times;</span>
                </div>
            </div>
            <div class="panel-body">
                <div class="copy-section">
                    <textarea id="url-box" class="url-textarea" readonly></textarea>
                    <button id="btn-copy-all" class="btn-copy-all">📋 一键复制所有链接</button>
                </div>
                <div class="image-grid" id="fetcher-grid"></div>
            </div>
        `;

        updateDisplay();
        panel.style.display = 'flex';
    });

    panel.addEventListener('click', async (e) => {
        const id = e.target.id;
        if (id === 'btn-close') panel.style.display = 'none';

        if (id === 'btn-scan') {
            await extractUrls();
            updateDisplay();
            const originalText = e.target.innerText;
            e.target.innerText = '✅ 已扫描';
            setTimeout(() => e.target.innerText = originalText, 800);
        }

        if (id === 'btn-reset') {
            if(confirm('确定要彻底重置吗？API随机图将会重新获取。')) {
                urlStore.clear();
                processedRawUrls.clear();
                await extractUrls();
                updateDisplay();
            }
        }

        if (id === 'btn-copy-all') {
            const list = Array.from(urlStore).join('\n');
            if(!list) return;
            await fallbackCopy(list);
            const oldText = e.target.innerText;
            e.target.innerText = '✅ 复制成功！';
            setTimeout(() => e.target.innerText = oldText, 1500);
        }

        if (id === 'btn-reload') window.location.reload();

        if (e.target.classList.contains('copy-single')) {
            const url = e.target.getAttribute('data-url');
            await fallbackCopy(url);
            const oldText = e.target.innerText;
            e.target.innerText = '已复制';
            setTimeout(() => e.target.innerText = oldText, 800);
        }

        if (e.target.tagName === 'IMG') window.open(e.target.src, '_blank');
    });

})();
