/**
 * Media slot fallbacks and helpers for Financial Cat Times.
 *
 * Media slots are plain <img> tags (class="slot-img", "top-story-img",
 * "article-hero-image", "article-figure-image"). GIFs work in <img> as-is.
 * For video, use <video class="slot-img" src="..." autoplay muted loop playsinline>.
 * If an image file is missing, a friendly "drop your file here" placeholder
 * is shown instead of a broken-image icon.
 */
window.CatImages = {
    placeholderSvg(category) {
        const gradients = {
            crypto: ['#2d1b4e', '#8B4513', '#CD853F'],
            community: ['#1a1a2e', '#16213e', '#2c3e50'],
            default: ['#990F3D', '#262A33', '#FFD700']
        };
        const g = gradients[category] || gradients.default;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
            <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${g[0]}"/>
                <stop offset="50%" style="stop-color:${g[1]}"/>
                <stop offset="100%" style="stop-color:${g[2]}"/>
            </linearGradient></defs>
            <rect width="800" height="450" fill="url(#g)"/>
            <text x="400" y="230" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="Georgia,serif" font-size="48">🐱</text>
            <text x="400" y="280" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-family="sans-serif" font-size="14">Drop an image or GIF into the images/ folder and update the src</text>
        </svg>`;
        return 'data:image/svg+xml,' + encodeURIComponent(svg);
    },

    applyFallbacks(root) {
        const scope = root || document;
        const selector = 'img.slot-img, img.top-story-img, img.list-article-img, img.article-hero-image, img.article-figure-image, .article-hero img, .article-figure img, .editors-picks-image img';
        scope.querySelectorAll(selector).forEach(img => {
            if (img.dataset.fallbackApplied) return;
            img.dataset.fallbackApplied = '1';
            const swap = () => {
                img.classList.add('img-fallback');
                img.src = window.CatImages.placeholderSvg('default');
            };
            // Handle images that already failed before this script ran
            if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
                swap();
                return;
            }
            img.addEventListener('error', function onErr() {
                img.removeEventListener('error', onErr);
                swap();
            });
        });
    }
};

// Backwards-compatible alias (write.js and older pages reference GyattImages)
window.GyattImages = window.CatImages;

document.addEventListener('DOMContentLoaded', () => {
    window.CatImages.applyFallbacks();
});
