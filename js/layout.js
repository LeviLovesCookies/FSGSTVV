/**
 * Shared site chrome — inject header, nav, and footer from one place.
 * Usage: add <div id="site-header"></div> etc. and include this script.
 */
(function () {
    const page = window.location.pathname.split('/').pop() || 'index.html';

    const navItems = [
        { href: 'index.html', label: 'HOME' },
        { href: 'markets.html', label: 'MARKETS' },
        { href: 'degens.html', label: 'CAT CULTURE' },
        { href: 'technology.html', label: 'TECHNOLOGY' },
        { href: 'memes.html', label: 'MEMES' },
        { href: 'opinion.html', label: 'OPINION' },
        { href: 'editor/index.html', label: 'WRITE', editor: true }
    ];

    function isActive(href) {
        if (href === page) return true;
        if (page.startsWith('article') && href === 'index.html') return false;
        return false;
    }

    function navLink(item) {
        const cls = ['nav-link'];
        if (isActive(item.href)) cls.push('active');
        if (item.highlight) cls.push('highlight');
        if (item.editor) cls.push('editor-link');
        const target = item.external ? ' target="_blank" rel="noopener"' : '';
        return `<a href="${item.href}" class="${cls.join(' ')}"${target}>${item.label}</a>`;
    }

    const breakingBanner = `
    <div class="breaking-banner">
        <span class="breaking-label">BREAKING:</span>
        <span class="breaking-text" id="breakingText">CAT5000 surges 420% after anonymous "catfluencer" posts a single blep on X — analysts divided — </span>
        <a href="https://twitter.com/CAT__COIN" target="_blank" class="breaking-link">Follow @CAT__COIN →</a>
    </div>`;

    const header = `
    <header class="main-header">
        <div class="header-container">
            <div class="header-left">
                <p class="date-line">${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p class="tagline-small">All the news that's fit to purr — since 2024</p>
            </div>
            <div class="header-center">
                <h1 class="masthead"><a href="index.html"><span class="gyatt">Financial Cat</span> <span class="times">Times</span></a></h1>
                <p class="masthead-sub">CATS, CRYPTO & CAPITAL MARKETS</p>
            </div>
            <div class="header-right">
                <a href="editor/index.html" class="header-btn write-btn" title="Write a new article">✏ Write</a>
                <a href="https://twitter.com/CAT__COIN" target="_blank" class="header-btn twitter-btn">𝕏 Twitter</a>
            </div>
        </div>
    </header>`;

    const nav = `
    <nav class="main-nav">
        <div class="nav-container">${navItems.map(navLink).join('')}</div>
    </nav>`;

    const footer = `
    <footer class="main-footer">
        <div class="footer-container">
            <div class="footer-top">
                <div class="footer-brand">
                    <h2 class="footer-masthead"><span class="gyatt">Financial Cat</span> <span class="times">Times</span></h2>
                    <p>The world's most trusted source for feline financial intelligence</p>
                </div>
                <div class="footer-links">
                    <div class="footer-col">
                        <h5>Navigation</h5>
                        <a href="index.html">Home</a>
                        <a href="markets.html">Markets</a>
                        <a href="editor/index.html">Write Article</a>
                        <a href="opinion.html">Opinion</a>
                    </div>
                    <div class="footer-col">
                        <h5>Community</h5>
                        <a href="https://twitter.com/CAT__COIN" target="_blank">Twitter / X</a>
                        <a href="https://t.me/cat5000" target="_blank">Telegram</a>
                    </div>
                    <div class="footer-col">
                        <h5>Trade</h5>
                        <a href="https://dexscreener.com" target="_blank">DexScreener</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© 2024-2026 Financial Cat Times. Not financial advice. DYOR. NFA. WAGMI. 🐈</p>
                <div class="footer-socials">
                    <a href="https://twitter.com/CAT__COIN" target="_blank">𝕏</a>
                    <a href="https://t.me/cat5000" target="_blank">TG</a>
                </div>
            </div>
        </div>
    </footer>`;

    const slots = {
        'site-breaking': breakingBanner,
        'site-header': header,
        'site-nav': nav,
        'site-footer': footer
    };

    Object.entries(slots).forEach(([id, html]) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    });
})();
