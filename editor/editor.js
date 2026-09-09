/**
 * Financial Cat Times Article Editor
 * Lives in editor/ — publishes articles directly to the site folder via the
 * local dev server (POST /__editor/save, guarded by the editor key).
 */
(function () {
    const fields = {
        category: document.getElementById('field-category'),
        categoryLabel: document.getElementById('field-category-label'),
        title: document.getElementById('field-title'),
        author: document.getElementById('field-author'),
        date: document.getElementById('field-date'),
        heroSrc: document.getElementById('field-hero-src'),
        heroAlt: document.getElementById('field-hero-alt'),
        heroCaption: document.getElementById('field-hero-caption'),
        body: document.getElementById('field-body'),
        tags: document.getElementById('field-tags'),
        filename: document.getElementById('field-filename'),
        related: document.getElementById('field-related'),
        key: document.getElementById('field-key'),
        rememberKey: document.getElementById('field-remember-key')
    };

    const preview = document.getElementById('preview-article');
    const heroDrop = document.getElementById('hero-drop');
    const heroPreview = document.getElementById('hero-preview');
    const statusEl = document.getElementById('writer-status');
    const existingSelect = document.getElementById('field-existing');

    const CATEGORIES = {
        'crypto-markets': 'CRYPTO MARKETS',
        'institutional': 'INSTITUTIONAL FINANCE',
        'regulatory': 'REGULATORY',
        'macro': 'MACRO ANALYSIS',
        'technology-cat': 'TECHNOLOGY',
        'breaking-report': 'BREAKING REPORT',
        'plain': ''
    };

    function setStatus(msg, type) {
        if (!statusEl) return;
        statusEl.innerHTML = msg;
        statusEl.className = 'writer-status' + (type ? ' ' + type : '');
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function slugify(text) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
    }

    // Image paths are stored root-relative (images/x.png). For the live
    // preview inside editor/, rewrite them so they resolve.
    function previewSrc(src) {
        if (/^(https?:|data:|\/|\.\.)/.test(src)) return src;
        return '../' + src;
    }

    function insertAtCursor(textarea, snippet) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.slice(0, start) + snippet + textarea.value.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
        textarea.focus();
        updatePreview();
    }

    function imageFigureHtml(src, alt, caption, wide) {
        const cls = wide ? ' article-figure-wide' : '';
        const cap = caption ? `\n            <figcaption>${escapeHtml(caption)}</figcaption>` : '';
        return `<figure class="article-figure${cls}">
            <img src="${escapeHtml(src)}" alt="${escapeHtml(alt || '')}" class="article-figure-image" loading="lazy">${cap}
        </figure>`;
    }

    function categoryInfo() {
        const key = fields.category.value;
        const label = fields.categoryLabel.value.trim() || CATEGORIES[key] || 'NEWS';
        const cls = key === 'plain' ? 'article-category' : 'article-category ' + key;
        return { cls, label };
    }

    function heroHtml(forPreview) {
        const src = fields.heroSrc.value.trim();
        if (!src) return '';
        const shown = forPreview ? previewSrc(src) : src;
        const alt = escapeHtml(fields.heroAlt.value.trim() || fields.title.value.trim());
        const caption = fields.heroCaption.value.trim();
        if (caption) {
            return `<figure class="article-hero">
            <img src="${escapeHtml(shown)}" alt="${alt}" class="article-hero-image">
            <figcaption>${escapeHtml(caption)}</figcaption>
        </figure>`;
        }
        return `<div class="article-hero">
            <img src="${escapeHtml(shown)}" alt="${alt}" class="article-hero-image">
        </div>`;
    }

    function tagsHtml() {
        const tags = fields.tags.value.split(',').map(t => t.trim()).filter(Boolean);
        if (!tags.length) return '';
        return `<div class="article-tags">
${tags.map(t => `            <span class="article-tag">${escapeHtml(t)}</span>`).join('\n')}
        </div>`;
    }

    function relatedHtml() {
        const lines = fields.related.value.split('\n').map(l => l.trim()).filter(Boolean);
        if (!lines.length) return '';
        const links = lines.map(line => {
            const [url, ...titleParts] = line.split('|');
            const title = (titleParts.join('|') || url).trim();
            return `            <a href="${escapeHtml(url.trim())}">${escapeHtml(title)}</a>`;
        }).join('\n');
        return `<div class="related-articles">
            <h3>Related Articles</h3>
            <div class="related-list">
${links}
            </div>
        </div>`;
    }

    function formatDate(val) {
        if (!val) return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const d = new Date(val.includes('T') ? val : val + 'T12:00:00');
        if (Number.isNaN(d.getTime())) return val;
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function bodyForPreview(body) {
        // rewrite root-relative image paths for preview only
        return body.replace(/src="(?!https?:|data:|\/|\.\.)([^"]+)"/g, 'src="../$1"');
    }

    function metaHtml(date) {
        const author = fields.author.value.trim() || 'Editorial Desk';
        return `<div class="article-meta">
            <span class="author">By ${escapeHtml(author)}</span>
            <span>|</span>
            <span>${escapeHtml(date)}</span>
            <span>|</span>
            <span class="reading-time">— min read</span>
        </div>`;
    }

    function buildArticleHtml(forDownload) {
        const cat = categoryInfo();
        const title = fields.title.value.trim() || 'Untitled Article';
        const date = formatDate(fields.date.value.trim());
        const body = fields.body.value.trim();

        if (forDownload) {
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} - Financial Cat Times</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <div id="site-breaking"></div>
    <div id="site-header"></div>
    <div id="site-nav"></div>

    <div class="article-page">
        <a href="index.html" class="back-link">&larr; Back to Financial Cat Times</a>

        <span class="${cat.cls}">${escapeHtml(cat.label)}</span>
        <h1>${escapeHtml(title)}</h1>

        ${metaHtml(date)}

        ${heroHtml(false)}

        <div class="article-body">
${body.split('\n').map(line => line.trim() ? '            ' + line : '').join('\n')}
        </div>

        <div class="article-cta">
            <h3>🐟 Ready to Ape Into CAT5000? 🐟</h3>
            <div class="cta-buttons">
                <a href="https://dexscreener.com" target="_blank" class="cta-btn dex">📊 DexScreener</a>
                <a href="https://twitter.com/CAT__COIN" target="_blank" class="cta-btn twitter-cta">𝕏 Follow on X</a>
            </div>
        </div>

        ${tagsHtml()}

        ${relatedHtml()}
    </div>

    <div id="site-footer"></div>
    <script src="js/layout.js"><\/script>
    <script src="js/images.js"><\/script>
    <script src="script.js"><\/script>
</body>
</html>
`;
        }

        return `
        <a href="#" class="back-link preview-only">&larr; Back to Financial Cat Times</a>
        <span class="${cat.cls}">${escapeHtml(cat.label)}</span>
        <h1>${escapeHtml(title)}</h1>
        ${metaHtml(date)}
        ${heroHtml(true)}
        <div class="article-body">${bodyForPreview(body)}</div>
        ${tagsHtml()}`;
    }

    function updatePreview() {
        if (!preview) return;
        preview.innerHTML = buildArticleHtml(false);
        const bodyEl = preview.querySelector('.article-body');
        if (bodyEl) {
            const words = bodyEl.textContent.trim().split(/\s+/).filter(Boolean).length;
            const mins = Math.max(1, Math.ceil(words / 200));
            const rt = preview.querySelector('.reading-time');
            if (rt) rt.textContent = mins + ' min read';
        }
    }

    function updateHeroPreview() {
        const src = fields.heroSrc.value.trim();
        if (!src) {
            heroPreview.innerHTML = '<span class="hero-drop-hint">Drop an image here or paste a path below</span>';
            heroPreview.classList.remove('has-image');
            return;
        }
        heroPreview.innerHTML = `<img src="${escapeHtml(previewSrc(src))}" alt="Hero preview">`;
        heroPreview.classList.add('has-image');
    }

    Object.values(fields).forEach(el => {
        if (el && el.addEventListener) el.addEventListener('input', () => {
            updatePreview();
            if (el === fields.heroSrc) updateHeroPreview();
        });
    });

    document.querySelectorAll('[data-insert]').forEach(btn => {
        btn.addEventListener('click', () => {
            const snippets = {
                p: '<p>Your paragraph here.</p>\n\n',
                h2: '<h2>Section Heading</h2>\n\n',
                quote: '<blockquote>"Your quote here."<br><br>— Attribution</blockquote>\n\n',
                pullquote: '<div class="pullquote">"A bold pull quote goes here."</div>\n\n',
                list: '<p>• <strong>First point:</strong> Description</p>\n<p>• <strong>Second point:</strong> Description</p>\n\n',
                cta: '<div class="article-inline-cta">\n    <p><strong>Want more CAT?</strong> Follow the story on X.</p>\n</div>\n\n'
            };
            insertAtCursor(fields.body, snippets[btn.dataset.insert] || '');
        });
    });

    document.getElementById('btn-insert-image')?.addEventListener('click', () => {
        const src = document.getElementById('inline-img-src').value.trim() || 'images/your-image.png';
        const alt = document.getElementById('inline-img-alt').value.trim() || 'Image description';
        const caption = document.getElementById('inline-img-caption').value.trim();
        const wide = document.getElementById('inline-img-wide').checked;
        insertAtCursor(fields.body, imageFigureHtml(src, alt, caption, wide) + '\n\n');
        setStatus('Image block inserted into article body.', 'success');
    });

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
            heroPreview.innerHTML = `<img src="${reader.result}" alt="Preview">`;
            heroPreview.classList.add('has-image');
            const suggested = 'images/' + file.name.replace(/\s+/g, '-').toLowerCase();
            if (!fields.heroSrc.value.trim()) {
                fields.heroSrc.value = suggested;
                fields.heroSrc.dispatchEvent(new Event('input'));
            }
            setStatus(`Preview loaded. Now save that image as ${suggested} in the images/ folder.`, 'success');
        };
        reader.readAsDataURL(file);
    }

    ['dragenter', 'dragover'].forEach(evt => heroDrop?.addEventListener(evt, e => {
        e.preventDefault();
        heroDrop.classList.add('drag-over');
    }));
    ['dragleave', 'drop'].forEach(evt => heroDrop?.addEventListener(evt, e => {
        e.preventDefault();
        heroDrop.classList.remove('drag-over');
    }));
    heroDrop?.addEventListener('drop', e => handleFile(e.dataTransfer?.files?.[0]));
    document.getElementById('hero-file-input')?.addEventListener('change', e => handleFile(e.target.files?.[0]));

    // ---------- Editor key ----------
    const KEY_STORAGE = 'fct-editor-key';
    const savedKey = localStorage.getItem(KEY_STORAGE);
    if (savedKey) fields.key.value = savedKey;
    fields.key.addEventListener('input', () => {
        if (fields.rememberKey.checked) localStorage.setItem(KEY_STORAGE, fields.key.value);
    });

    // ---------- Publish ----------
    document.getElementById('btn-publish')?.addEventListener('click', async () => {
        const fname = (fields.filename.value.trim() || slugify(fields.title.value) || 'new-article');
        const safeName = fname.endsWith('.html') ? fname : fname + '.html';
        if (!fields.title.value.trim()) {
            setStatus('Add a headline before publishing.', 'error');
            return;
        }
        if (!fields.key.value.trim()) {
            setStatus('Enter your editor key (printed in the terminal when the server starts).', 'error');
            return;
        }
        setStatus('Publishing…');
        try {
            const res = await fetch('/__editor/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: fields.key.value.trim(), filename: safeName, html: buildArticleHtml(true) })
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.ok) {
                setStatus(`✅ Published <a href="../${escapeHtml(safeName)}" target="_blank" class="saved-link">${escapeHtml(safeName)}</a> — open it, then link it from the homepage or a section page.`, 'success');
            } else {
                setStatus('Publish failed: ' + (data.error || res.statusText), 'error');
            }
        } catch (err) {
            setStatus('Publish failed — is the local server running (npm run dev)? Use Download HTML as a fallback.', 'error');
        }
    });

    // ---------- Download fallback ----------
    document.getElementById('btn-download')?.addEventListener('click', () => {
        const fname = (fields.filename.value.trim() || slugify(fields.title.value) || 'new-article');
        const safeName = fname.endsWith('.html') ? fname : fname + '.html';
        const blob = new Blob([buildArticleHtml(true)], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = safeName;
        a.click();
        URL.revokeObjectURL(a.href);
        setStatus(`Downloaded ${safeName} — move it into the site folder to publish manually.`, 'success');
    });

    // ---------- Load existing articles ----------
    async function refreshList() {
        try {
            const res = await fetch('/__editor/list');
            const items = await res.json();
            existingSelect.innerHTML = '<option value="">— choose an article to edit —</option>' +
                items.map(a => `<option value="${escapeHtml(a.file)}">${escapeHtml(a.file)} — ${escapeHtml(a.title)}</option>`).join('');
        } catch {
            existingSelect.innerHTML = '<option value="">List unavailable (server not running?)</option>';
        }
    }

    function dedentBody(inner) {
        const lines = inner.split('\n');
        const nonempty = lines.filter(l => l.trim());
        if (!nonempty.length) return inner;
        const min = Math.min(...nonempty.map(l => l.length - l.trimStart().length));
        return lines.map(l => l.trim() ? l.slice(min) : '').join('\n').trim();
    }

    async function loadExisting(file) {
        const res = await fetch('../' + file);
        if (!res.ok) throw new Error('not found');
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        const catEl = doc.querySelector('.article-category');
        if (catEl) {
            const cls = (catEl.className.match(/crypto-markets|institutional|regulatory|macro|technology-cat|breaking-report/) || ['plain'])[0];
            fields.category.value = cls;
            fields.categoryLabel.value = CATEGORIES[cls] === catEl.textContent.trim() ? '' : catEl.textContent.trim();
        }
        fields.title.value = doc.querySelector('.article-page h1')?.textContent.trim() || '';
        const metaSpans = [...doc.querySelectorAll('.article-meta span')].map(s => s.textContent.trim());
        const authorSpan = doc.querySelector('.article-meta .author');
        fields.author.value = authorSpan ? authorSpan.textContent.replace(/^By\s+/, '').trim() : '';
        const dateSpan = metaSpans.find(t => t !== '|' && !/min read/.test(t) && !t.startsWith('By '));
        if (dateSpan) {
            const d = new Date(dateSpan);
            if (!Number.isNaN(d.getTime())) fields.date.value = d.toISOString().slice(0, 10);
        }
        const heroImg = doc.querySelector('.article-hero img');
        fields.heroSrc.value = heroImg?.getAttribute('src') || '';
        fields.heroAlt.value = heroImg?.getAttribute('alt') || '';
        fields.heroCaption.value = doc.querySelector('.article-hero figcaption')?.textContent.trim() || '';
        fields.body.value = dedentBody(doc.querySelector('.article-body')?.innerHTML || '');
        fields.tags.value = [...doc.querySelectorAll('.article-tag')].map(t => t.textContent.trim()).join(', ');
        fields.related.value = [...doc.querySelectorAll('.related-list a')]
            .map(a => `${a.getAttribute('href')} | ${a.textContent.trim()}`).join('\n');
        fields.filename.value = file.replace(/\.html$/, '');
        updateHeroPreview();
        updatePreview();
    }

    document.getElementById('btn-load-existing')?.addEventListener('click', async () => {
        const file = existingSelect.value;
        if (!file) {
            setStatus('Pick an article from the dropdown first.', 'error');
            return;
        }
        try {
            await loadExisting(file);
            setStatus(`Loaded ${file} — edit away, then Publish to overwrite it.`, 'success');
        } catch {
            setStatus('Could not load ' + file, 'error');
        }
    });

    document.getElementById('btn-clear')?.addEventListener('click', () => {
        if (!confirm('Clear all fields?')) return;
        ['categoryLabel', 'title', 'author', 'heroSrc', 'heroAlt', 'heroCaption', 'body', 'tags', 'filename', 'related']
            .forEach(k => { fields[k].value = ''; });
        fields.category.value = 'crypto-markets';
        fields.date.value = new Date().toISOString().slice(0, 10);
        updateHeroPreview();
        updatePreview();
        setStatus('Form cleared.', '');
    });

    document.getElementById('btn-load-template')?.addEventListener('click', () => {
        fields.title.value = 'Your Headline Goes Here';
        fields.author.value = 'Chad Coinsworth';
        fields.heroSrc.value = 'images/your-hero-image.png';
        fields.heroAlt.value = 'Describe the hero image';
        fields.heroCaption.value = '';
        fields.body.value = `<p><strong>Lead paragraph with the key news.</strong> Follow with context and the most important details in the first few sentences.</p>

<p>Second paragraph expanding on the story. Keep paragraphs short for readability.</p>

<blockquote>"A memorable quote from a source."<br><br>— Name, Title</blockquote>

<h2>Section Heading</h2>

<p>Body text for this section. You can add inline images anywhere with the insert tool below.</p>

<div class="pullquote">"A bold statement that breaks up the text."</div>

<p>Closing thoughts and forward-looking statements.</p>

<p><em>Byline note. Author bio or additional reporting credits.</em></p>`;
        fields.tags.value = 'CAT5000, Memecoin';
        fields.filename.value = '';
        fields.related.value = 'article1.html | CAT5000 becomes the world\'s first memecoin backed by confidence';
        updateHeroPreview();
        updatePreview();
        setStatus('Template loaded — edit and publish when ready.', 'success');
    });

    if (fields.date && !fields.date.value) {
        fields.date.value = new Date().toISOString().slice(0, 10);
    }

    refreshList();
    updateHeroPreview();
    updatePreview();
})();
