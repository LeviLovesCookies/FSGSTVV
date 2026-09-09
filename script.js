// ===== Financial Cat Times - Main JavaScript =====

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== Ticker Duplication for Seamless Scroll =====
    const tickerContent = document.getElementById('tickerContent');
    if (tickerContent) {
        const clone = tickerContent.innerHTML;
        tickerContent.innerHTML += clone;
    }

    // ===== Breaking News Rotation =====
    const breakingMessages = [
        'CAT5000 surges 420% after anonymous "catfluencer" posts a single blep on X — analysts divided — ',
        'BREAKING: Chonk Index hits all-time high of 4,200.69 — Treats Futures up 69.4% — ',
        'JUST IN: CAT5000 community votes to rename "blockchain" to "chonkchain" — proposal passes 9 lives to 0 — ',
        'ALERT: Whale wallet (literally a very large cat) moves 420B CAT5000 tokens — community says "still not selling" — ',
        'UPDATE: CAT5000 whitepaper now the most downloaded PDF in crypto history, mostly by cats sitting on keyboards — '
    ];

    let breakingIndex = 0;
    const breakingText = document.getElementById('breakingText');
    
    if (breakingText) {
        setInterval(() => {
            breakingIndex = (breakingIndex + 1) % breakingMessages.length;
            breakingText.style.opacity = 0;
            setTimeout(() => {
                breakingText.textContent = breakingMessages[breakingIndex];
                breakingText.style.opacity = 1;
            }, 500);
        }, 6000);
    }

    // ===== Live Price Simulator =====
    function simulatePrice() {
        const priceElements = document.querySelectorAll('.ticker-price');
        priceElements.forEach(el => {
            if (el.textContent.includes('$')) {
                const currentText = el.textContent;
                // Tiny random fluctuation for visual effect
                const fluctuation = (Math.random() - 0.5) * 0.000001;
                // Just add a subtle animation
                el.style.transition = 'color 0.3s';
                if (Math.random() > 0.5) {
                    el.style.color = '#00FF88';
                    setTimeout(() => { el.style.color = '#FFF'; }, 300);
                }
            }
        });
    }

    setInterval(simulatePrice, 3000);

    // ===== Market Data Bar Animation =====
    const marketValues = document.querySelectorAll('.market-value');
    marketValues.forEach(val => {
        setInterval(() => {
            val.style.transition = 'transform 0.2s';
            val.style.transform = 'scale(1.02)';
            setTimeout(() => {
                val.style.transform = 'scale(1)';
            }, 200);
        }, 5000 + Math.random() * 3000);
    });

    // ===== Smooth scroll for anchor links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ===== Navigation Active State =====
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else if (currentPage.includes('article') && href === 'index.html') {
            // Keep HOME active for article pages
        }
    });

    // ===== Reading Time Calculator (for article pages) =====
    const articleBody = document.querySelector('.article-body');
    if (articleBody) {
        const text = articleBody.textContent;
        const wordCount = text.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);
        const readingTimeEl = document.querySelector('.reading-time');
        if (readingTimeEl) {
            readingTimeEl.textContent = `${readingTime} min read`;
        }
    }

    // ===== Copy Contract Address =====
    const copyButtons = document.querySelectorAll('.copy-address');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const address = this.getAttribute('data-address') || 'CAT5000...ContractAddress';
            navigator.clipboard.writeText(address).then(() => {
                const originalText = this.textContent;
                this.textContent = '✓ Copied!';
                this.style.background = '#00D4AA';
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = '';
                }, 2000);
            }).catch(() => {
                // Fallback
                const textarea = document.createElement('textarea');
                textarea.value = address;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                this.textContent = '✓ Copied!';
                setTimeout(() => { this.textContent = 'Copy Address'; }, 2000);
            });
        });
    });

    console.log('🐈 Financial Cat Times loaded successfully. WAGMI.');
});