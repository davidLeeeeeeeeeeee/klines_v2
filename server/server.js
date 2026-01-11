'use strict';

require('dotenv').config();

const express = require('express');
const https = require('https');

const PORT = Number(process.env.PORT || 3000);
const POLL_MS = Number(process.env.POLL_MS || 120000); // 120秒（2分钟），避免请求过于频繁

// 使用 CryptoCompare 免费 API，无需 token
const CRYPTOCOMPARE_API = 'https://min-api.cryptocompare.com/data/v2/news/';

// 支持的币种列表（去掉 USDT 后缀）
const SUPPORTED_COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'HYPE', 'XRP', 'DOGE', 'ZEC', 'ADA'];

const app = express();

// ---- In-memory cache ----
let lastFetchAt = null;
let lastError = null;

// 用 Map 去重（key = post.id）
const postsById = new Map(); // id -> normalized post
let latestList = []; // sorted newest first, for fast response

// 按币种分类的缓存
const postsByCoin = new Map(); // coin -> [posts]
SUPPORTED_COINS.forEach(coin => postsByCoin.set(coin, []));

// 辅助函数：发起 HTTPS GET 请求
function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function normalizePost(item) {
    // 将 CryptoCompare 新闻格式转换为统一格式
    return {
        id: item.id || item.guid,
        title: item.title,
        url: item.url,
        published_at: new Date(item.published_on * 1000).toISOString(), // Unix timestamp 转 ISO
        created_at: new Date(item.published_on * 1000).toISOString(),
        domain: item.source || 'Unknown',
        source: {
            title: item.source_info?.name || item.source || 'Unknown',
            domain: item.source || 'Unknown',
            img: item.source_info?.img
        },
        currencies: item.categories ? item.categories.split('|').map(c => ({ code: c, title: c })) : [],
        thumb: item.imageurl,
        description: item.body ? item.body.substring(0, 300) + '...' : '',
        tags: item.tags,
        upvotes: item.upvotes || 0,
        downvotes: item.downvotes || 0,
        raw: item,
    };
}

function rebuildLatestList() {
    // 按 published_at / created_at 排序
    const arr = Array.from(postsById.values());
    arr.sort((a, b) => {
        const ta = Date.parse(a.published_at || a.created_at || 0) || 0;
        const tb = Date.parse(b.published_at || b.created_at || 0) || 0;
        return tb - ta;
    });
    // 只保留最近 200 条，避免内存无限增长
    latestList = arr.slice(0, 200);

    // 按币种分类，每个币种只保留最新 5 条
    SUPPORTED_COINS.forEach(coin => {
        const coinPosts = arr.filter(post => {
            const categories = post.currencies?.map(c => c.code) || [];
            return categories.includes(coin);
        });
        postsByCoin.set(coin, coinPosts.slice(0, 5)); // 每个币种最多保留 5 条
    });
}

// 延迟函数，避免请求过快
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchCryptoNewsOnce() {
    try {
        lastError = null;

        console.log('Fetching crypto news from CryptoCompare...');

        // 将所有币种拼接成一个请求，减少 API 调用次数
        // CryptoCompare 支持多个 categories，用 | 分隔
        const categories = SUPPORTED_COINS.join('|');

        // 一次性获取所有币种的新闻
        const newsData = await httpsGet(`${CRYPTOCOMPARE_API}?lang=EN&categories=${categories}`);

        if (newsData.Type !== 100) {
            throw new Error(`API Error: ${newsData.Message}`);
        }

        const items = newsData.Data || [];
        let changed = false;

        console.log(`Received ${items.length} news items for ${SUPPORTED_COINS.length} coins`);

        for (const item of items) {
            if (!item?.id) continue;

            if (!postsById.has(item.id)) {
                postsById.set(item.id, normalizePost(item));
                changed = true;
            }
        }

        if (changed) rebuildLatestList();
        lastFetchAt = new Date().toISOString();

        // 显示每个币种的新闻数量
        const coinCounts = {};
        SUPPORTED_COINS.forEach(coin => {
            coinCounts[coin] = postsByCoin.get(coin)?.length || 0;
        });

        console.log(`✓ Total cached: ${postsById.size} | By coin:`, coinCounts);
    } catch (err) {
        // 简单容错：记录错误并继续下一轮
        lastError = {
            message: err?.message || String(err),
            at: new Date().toISOString(),
        };
        console.error('✗ Fetch error:', err.message);
    }
}

// ---- Poll loop with drift-safe scheduling ----
let timer = null;
async function startPolling() {
    // 先立即抓一次
    await fetchCryptoNewsOnce();

    // 再循环
    timer = setInterval(fetchCryptoNewsOnce, POLL_MS);
    timer.unref?.(); // 允许进程在无其他事件时退出（可选）
}

startPolling().catch((e) => {
    console.error('Failed to start polling:', e);
    process.exit(1);
});

// ---- HTTP APIs ----

// 健康检查/状态
app.get('/health', (req, res) => {
    res.json({
        ok: true,
        lastFetchAt,
        pollMs: POLL_MS,
        cached: latestList.length,
        lastError,
    });
});

// 取所有新闻（最多 5 条）
app.get('/latest', (req, res) => {
    const limit = Math.max(1, Math.min(5, Number(req.query.limit || 5)));
    res.json({
        lastFetchAt,
        count: Math.min(limit, latestList.length),
        items: latestList.slice(0, limit),
    });
});

// 取 BTC 最新新闻（最多 5 条）- 保持向后兼容
app.get('/btc/latest', (req, res) => {
    const limit = Math.max(1, Math.min(5, Number(req.query.limit || 5)));
    const btcPosts = postsByCoin.get('BTC') || [];
    res.json({
        coin: 'BTC',
        lastFetchAt,
        count: Math.min(limit, btcPosts.length),
        items: btcPosts.slice(0, limit),
    });
});

// 按币种查询新闻（最多 5 条）
app.get('/coin/:symbol/latest', (req, res) => {
    const symbol = req.params.symbol.toUpperCase().replace('USDT', ''); // 支持 ETHUSDT 或 ETH
    const limit = Math.max(1, Math.min(5, Number(req.query.limit || 5)));

    if (!SUPPORTED_COINS.includes(symbol)) {
        return res.status(400).json({
            error: 'Unsupported coin',
            supported: SUPPORTED_COINS,
        });
    }

    const coinPosts = postsByCoin.get(symbol) || [];
    res.json({
        coin: symbol,
        lastFetchAt,
        count: Math.min(limit, coinPosts.length),
        items: coinPosts.slice(0, limit),
    });
});

// 可选：SSE 推送（客户端连上后，每次出现新 id，就推送）
const sseClients = new Set();

app.get('/btc/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    // 发送一次当前快照
    res.write(`event: snapshot\n`);
    res.write(`data: ${JSON.stringify({ lastFetchAt, items: latestList.slice(0, 20) })}\n\n`);

    const client = { res, lastSeenIds: new Set(latestList.slice(0, 200).map(x => x.id)) };
    sseClients.add(client);

    req.on('close', () => {
        sseClients.delete(client);
    });
});

// 每次重建列表后，尝试推 SSE（简单做法：在 rebuildLatestList 后推；这里用一个 hook）
const _rebuildLatestList = rebuildLatestList;
rebuildLatestList = function patchedRebuild() {
    _rebuildLatestList();

    // 找到“新出现的 id”，推给 SSE 客户端
    for (const client of sseClients) {
        const newly = [];
        for (const item of latestList.slice(0, 50)) {
            if (!client.lastSeenIds.has(item.id)) {
                client.lastSeenIds.add(item.id);
                newly.push(item);
            }
        }
        if (newly.length > 0) {
            client.res.write(`event: new\n`);
            client.res.write(`data: ${JSON.stringify({ at: new Date().toISOString(), items: newly })}\n\n`);
        }
    }
};

app.listen(PORT, () => {
    console.log(`\n🚀 Crypto News Server listening on http://127.0.0.1:${PORT}`);
    console.log(`\n📡 Available APIs (max 5 items per request):`);
    console.log(`   GET  /health                          - Server health check`);
    console.log(`   GET  /latest?limit=5                  - All latest news (max 5)`);
    console.log(`   GET  /btc/latest?limit=5              - BTC news (max 5)`);
    console.log(`   GET  /coin/:symbol/latest?limit=5     - News by coin (max 5)`);
    console.log(`   GET  /btc/stream                      - SSE stream (legacy)`);
    console.log(`\n💰 Supported coins: ${SUPPORTED_COINS.join(', ')}`);
    console.log(`📦 Cache: 5 latest news per coin`);
    console.log(`⏱️  Poll interval: ${POLL_MS / 1000}s\n`);
});
