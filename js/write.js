/**
 * Financial Cat Times Article Writer
 */
(function () {
    const fields = {
        category: document.getElementById('field-category'),
        title: document.getElementById('field-title'),
        author: document.getElementById('field-author'),
        date: document.getElementById('field-date'),
        heroSrc: document.getElementById('field-hero-src'),
        heroAlt: document.getElementById('field-hero-alt'),
        heroCaption: document.getElementById('field-hero-caption'),
        body: document.getElementById('field-body'),
        tags: document.getElementById('field-tags'),
        filename: document.getElementById('field-filename'),
        related: document.getElementById('field-related')
    };

    const preview = document.getElementById('preview-article');
    const heroDrop = document.getElementById('hero-drop');
    const heroPreview = document.getElementById('hero-preview');
    const statusEl = document.getElementById('writer-status');

    const CATEGORIES = {
        'crypto-markets': 'CRYPTO MARKETS',
        'institutional': 'INSTITUTIONAL FINANCE',
        'regulatory': 'REGULATORY',
        'macro': 'MACRO ANALYSIS',
        'technology-cat': 'TECHNOLOGY',
        'breaking-report': 'BREAKING REPORT',
        'opinion': 'OPINION',
        'memes': 'MEMES'
    };

    function setStatus(msg, type) {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.className = 'writer-status' + (type ? ' ' + type : '');
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function slugify(text) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
    }

    function insertAtCursor(textarea, snippet) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = textarea.value.slice(0, start);
        const after = textarea.value.slice(end);
        textarea.value = before + snippet + after;
        textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
        textarea.focus();
        updatePreview();
    }

    function imageFigureHtml(src, alt, caption, wide) {
        const cls = wide ? ' article-figure-wide' : '';
        const cap = caption
            ? `\n    <figcaption>${escapeHtml(caption)}</figcaption>`
            : '';
        return `<figure class="article-figure${cls}">
    <img src="${escapeHtml(src)}" alt="${escapeHtml(alt || '')}" class="article-figure-image" loading="lazy">
${cap}
</figure>`;
    }

    function heroHtml() {
        const src = fields.heroSrc.value.trim();
        if (!src) return '';
        const alt = escapeHtml(fields.heroAlt.value.trim() || fields.title.value.trim());
        const caption = fields.heroCaption.value.trim();
        if (caption) {
            return `<figure class="article-hero">
    <img src="${escapeHtml(src)}" alt="${alt}" class="article-hero-image">
    <figcaption>${escapeHtml(caption)}</figcaption>
</figure>`;
        }
        return `<div class="article-hero">
    <img src="${escapeHtml(src)}" alt="${alt}" class="article-hero-image">
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
            return `                <a href="${escapeHtml(url.trim())}">${escapeHtml(title)}</a>`;
        }).join('\n');
        return `
        <div class="related-articles">
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

    function buildArticleHtml(forDownload) {
        const catKey = fields.category.value;
        const catLabel = CATEGORIES[catKey] || catKey.toUpperCase();
        const title = fields.title.value.trim() || 'Untitled Article';
        const author = fields.author.value.trim() || 'Editorial Desk';
        const date = formatDate(fields.date.value.trim());
        const body = fields.body.value.trim();

        if (forDownload) {
            const fname = fields.filename.value.trim() || slugify(title) || 'new-article';
            const safeName = fname.endsWith('.html') ? fname : fname + '.html';

            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} - Financial Cat Times</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <div id="site-breaking"></div>
    <div id="site-header"></div>
    <div id="site-nav"></div>

    <div class="article-page">
        <a href="index.html" class="back-link">← Back to Financial Cat Times</a>

        <span class="article-category ${catKey}">${catLabel}</span>
        <h1>${escapeHtml(title)}</h1>

        <div class="article-meta">
            <span class="author">By ${escapeHtml(author)}</span>
            <span>|</span>
            <span>${escapeHtml(date)}</span>
            <span>|</span>
            <span class="reading-time">— min read</span>
        </div>

        ${heroHtml()}

        <div class="article-body">
${body.split('\n').map(line => '            ' + line).join('\n')}
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
    <script src="script.js"><\/script>
</body>
</html>`;
        }

        return `
        <a href="index.html" class="back-link preview-only">← Back to Financial Cat Times</a>
        <span class="article-category ${catKey}">${escapeHtml(catLabel)}</span>
        <h1>${escapeHtml(title)}</h1>
        <div class="article-meta">
            <span class="author">By ${escapeHtml(author)}</span>
            <span>|</span>
            <span>${escapeHtml(date)}</span>
            <span>|</span>
            <span class="reading-time">— min read</span>
        </div>
        ${heroHtml()}
        <div class="article-body">${body}</div>
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

        if (window.GyattImages) window.GyattImages.applyFallbacks(preview);
    }

    function updateHeroPreview() {
        const src = fields.heroSrc.value.trim();
        if (!src) {
            heroPreview.innerHTML = '<span class="hero-drop-hint">Drop an image here or paste a path below</span>';
            heroPreview.classList.remove('has-image');
            return;
        }
        heroPreview.innerHTML = `<img src="${escapeHtml(src)}" alt="Hero preview">`;
        heroPreview.classList.add('has-image');
    }

    Object.values(fields).forEach(el => {
        if (el) el.addEventListener('input', () => {
            updatePreview();
            if (el === fields.heroSrc) updateHeroPreview();
        });
    });

    document.querySelectorAll('[data-insert]').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.insert;
            const snippets = {
                p: '<p>Your paragraph here.</p>\n\n',
                h2: '<h2>Section Heading</h2>\n\n',
                quote: '<blockquote>"Your quote here."<br><br>— Attribution</blockquote>\n\n',
                pullquote: '<div class="pullquote">"A bold pull quote goes here."</div>\n\n',
                list: '<p>• <strong>First point:</strong> Description</p>\n<p>• <strong>Second point:</strong> Description</p>\n\n',
                cta: '<div class="article-inline-cta">\n    <p><strong>Want more CAT?</strong> Follow the story on X.</p>\n</div>\n\n'
            };
            insertAtCursor(fields.body, snippets[type] || '');
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

    document.getElementById('btn-use-hero-path')?.addEventListener('click', () => {
        const suggested = fields.heroSrc.value.trim() || 'images/' + (slugify(fields.title.value) || 'hero') + '.png';
        insertAtCursor(fields.body, imageFigureHtml(suggested, fields.heroAlt.value.trim(), '', false) + '\n\n');
    });

    function handleFile(file, targetField) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (targetField === 'hero') {
                heroPreview.innerHTML = `<img src="${reader.result}" alt="Preview">`;
                heroPreview.classList.add('has-image');
                const suggested = 'images/' + file.name.replace(/\s+/g, '-').toLowerCase();
                if (!fields.heroSrc.value.trim()) {
                    fields.heroSrc.value = suggested;
                    fields.heroSrc.dispatchEvent(new Event('input'));
                }
                setStatus(`Preview loaded. Save file as ${suggested} in your images/ folder.`, 'success');
            }
        };
        reader.readAsDataURL(file);
    }

    ['dragenter', 'dragover'].forEach(evt => {
        heroDrop?.addEventListener(evt, e => {
            e.preventDefault();
            heroDrop.classList.add('drag-over');
        });
    });
    ['dragleave', 'drop'].forEach(evt => {
        heroDrop?.addEventListener(evt, e => {
            e.preventDefault();
            heroDrop.classList.remove('drag-over');
        });
    });
    heroDrop?.addEventListener('drop', e => {
        const file = e.dataTransfer?.files?.[0];
        handleFile(file, 'hero');
    });
    document.getElementById('hero-file-input')?.addEventListener('change', e => {
        handleFile(e.target.files?.[0], 'hero');
    });

    document.getElementById('btn-download')?.addEventListener('click', () => {
        const html = buildArticleHtml(true);
        const fname = (fields.filename.value.trim() || slugify(fields.title.value) || 'new-article');
        const safeName = fname.endsWith('.html') ? fname : fname + '.html';
        const blob = new Blob([html], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = safeName;
        a.click();
        URL.revokeObjectURL(a.href);
        setStatus(`Downloaded ${safeName}. Drop images in images/ folder, then open the file.`, 'success');
    });

    document.getElementById('btn-copy-body')?.addEventListener('click', () => {
        navigator.clipboard.writeText(fields.body.value).then(() => {
            setStatus('Article body HTML copied to clipboard.', 'success');
        }).catch(() => setStatus('Could not copy — select and copy manually.', 'error'));
    });

    document.getElementById('btn-copy-full')?.addEventListener('click', () => {
        navigator.clipboard.writeText(buildArticleHtml(true)).then(() => {
            setStatus('Full article HTML copied to clipboard.', 'success');
        }).catch(() => setStatus('Could not copy — use Download instead.', 'error'));
    });

    document.getElementById('btn-clear')?.addEventListener('click', () => {
        if (!confirm('Clear all fields?')) return;
        Object.values(fields).forEach(el => { if (el) el.value = ''; });
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
        fields.heroCaption.value = 'Optional caption for the hero image';
        fields.body.value = `<p><strong>Lead paragraph with the key news.</strong> Follow with context and the most important details in the first few sentences.</p>

<p>Second paragraph expanding on the story. Keep paragraphs short for readability.</p>

<blockquote>"A memorable quote from a source."<br><br>— Name, Title</blockquote>

<h2>Section Heading</h2>

<p>Body text for this section. You can add inline images anywhere:</p>

<figure class="article-figure">
    <img src="images/example-chart.png" alt="Chart showing CAT5000 price action" class="article-figure-image" loading="lazy">
    <figcaption>CAT5000 price action over the last 24 hours</figcaption>
</figure>

<div class="pullquote">"A bold statement that breaks up the text."</div>

<p>Closing thoughts and forward-looking statements.</p>

<p><em>Byline note. Author bio or additional reporting credits.</em></p>`;
        fields.tags.value = 'CAT5000, Memecoin, Solana';
        fields.filename.value = 'article-new';
        fields.related.value = 'article1.html|Related headline one\narticle2.html|Related headline two';
        fields.category.dispatchEvent(new Event('input'));
        updateHeroPreview();
        updatePreview();
        setStatus('Template loaded — edit and export when ready.', 'success');
    });

    if (fields.date && !fields.date.value) {
        fields.date.value = new Date().toISOString().slice(0, 10);
    }

    updateHeroPreview();
    updatePreview();
})();
