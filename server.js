// Minimal static file server for Financial Cat Times + local article editor API.
// Usage: node server.js [--port 7100] [--host 127.0.0.1]  (PORT env also respected)
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const args = process.argv.slice(2);
function arg(name, fallback) {
    const i = args.indexOf('--' + name);
    if (i !== -1 && args[i + 1]) return args[i + 1];
    const eq = args.find(a => a.startsWith('--' + name + '='));
    if (eq) return eq.split('=')[1];
    return fallback;
}

const port = parseInt(arg('port', process.env.PORT || '7100'), 10);
const host = arg('host', process.env.HOST || '127.0.0.1');
const root = __dirname;

// ---------- Editor key ----------
// A random key lives in editor/.editor-key (never served over HTTP).
// It is printed here on first start so only the site owner can publish.
const KEY_FILE = path.join(root, 'editor', '.editor-key');
let editorKey;
try {
    editorKey = fs.readFileSync(KEY_FILE, 'utf8').trim();
} catch {
    editorKey = crypto.randomBytes(16).toString('hex');
    fs.mkdirSync(path.dirname(KEY_FILE), { recursive: true });
    fs.writeFileSync(KEY_FILE, editorKey);
}
console.log('Editor key (paste into the editor page to publish): ' + editorKey);

// Pages the editor is never allowed to overwrite.
const RESERVED = new Set(['index.html', 'markets.html', 'degens.html', 'technology.html',
    'memes.html', 'opinion.html', 'article-template.html']);

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

function sendJson(res, status, obj) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(obj));
}

function handleList(res) {
    const files = fs.readdirSync(root)
        .filter(f => /^[a-z0-9][a-z0-9-]*\.html$/i.test(f) && !RESERVED.has(f.toLowerCase()));
    const items = files.map(f => {
        let title = f;
        try {
            const m = fs.readFileSync(path.join(root, f), 'utf8').match(/<title>(.*?)\s*-\s*Financial Cat Times<\/title>/s);
            if (m) title = m[1].trim();
        } catch { }
        return { file: f, title };
    });
    sendJson(res, 200, items);
}

function handleSave(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk;
        if (body.length > 5 * 1024 * 1024) req.destroy(); // 5 MB cap
    });
    req.on('end', () => {
        let data;
        try { data = JSON.parse(body); } catch {
            return sendJson(res, 400, { error: 'Invalid JSON' });
        }
        if (!data.key || data.key !== editorKey) {
            return sendJson(res, 401, { error: 'Wrong editor key. It is printed in the server terminal.' });
        }
        const filename = String(data.filename || '').trim();
        if (!/^[a-z0-9][a-z0-9-]*\.html$/i.test(filename) || RESERVED.has(filename.toLowerCase())) {
            return sendJson(res, 400, { error: 'File name must be simple letters/numbers/dashes ending in .html, and cannot overwrite a core site page.' });
        }
        if (typeof data.html !== 'string' || !data.html.includes('<!DOCTYPE html>')) {
            return sendJson(res, 400, { error: 'Missing article HTML.' });
        }
        fs.writeFileSync(path.join(root, filename), data.html, 'utf8');
        sendJson(res, 200, { ok: true, file: filename });
    });
}

http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);

    // Editor API
    if (urlPath === '/__editor/list' && req.method === 'GET') return handleList(res);
    if (urlPath === '/__editor/save' && req.method === 'POST') return handleSave(req, res);

    // Static files
    let fileRel = urlPath === '/' ? '/index.html' : urlPath;
    const filePath = path.normalize(path.join(root, fileRel));
    if (!filePath.startsWith(root)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }
    // Directories resolve to their index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        fileRel = fileRel.replace(/\/?$/, '/index.html');
        return serveFile(path.join(filePath, 'index.html'));
    }
    serveFile(filePath);

    function serveFile(fp) {
    // Never serve dotfiles (.editor-key, .gitkeep, …)
    if (path.relative(root, fp).split(path.sep).some(seg => seg.startsWith('.'))) {
        res.writeHead(403);
        return res.end('Forbidden');
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Not found: ' + urlPath);
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
        res.end(data);
    });
    }
}).listen(port, host, () => {
    console.log(`Financial Cat Times dev server: http://${host}:${port}/`);
    console.log(`Article editor:                  http://${host}:${port}/editor/`);
});
