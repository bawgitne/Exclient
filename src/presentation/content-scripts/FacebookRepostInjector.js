/**
 * Facebook Repost Injector - Presentation layer
 */
window.FacebookRepostInjector = class FacebookRepostInjector {
    constructor() {
        this.targetClasses = [
            "x9f619", "x1ja2u2z", "x78zum5", "x2lah0s", "x1n2onr6", "x1qughib",
            "x1qjc9v5", "xozqiw3", "x1q0g3np", "xjkvuk6", "x1iorvi4", "x11lt19s",
            "xe9ewy2", "x4cne27", "xifccgj"
        ];
        this.markAttribute = "data-fb-injected-share";
        this.observer = null;

        // Initialize services
        this.facebookExtractor = new window.FacebookDataExtractor();
        this.contentExtractor = new window.ContentExtractor();

        this.init();
    }

    init() {
        this.scanAndInject(document);
        this.createObserver();
        this.startObserving();
    }

    hasAllClasses(element, classes) {
        if (!element || !element.classList || !Array.isArray(classes)) {
            return false;
        }
        return classes.every(className => element.classList.contains(className));
    }

    createRepostButton() {
        const button = document.createElement('div');
        button.className = 'x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x193iq5w xeuugli x1r8uery x1iyjqo2 xs83m0k x14vy60q xyiysdx x10b6aqq x1yrsyyn';
        button.setAttribute(this.markAttribute, '1');
        button.innerHTML = this.getRepostButtonHTML();

        this.attachButtonHandlers(button);
        return button;
    }

    getRepostButtonHTML() {
        return `
            <div aria-label="Là nút đăng lại đó hiểu chưa bà"
                 class="x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xc5r6h4 xqeqjp1 x1phubyo x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xdl72j9 x2lah0s x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak x2lwn1j xeuugli xexx8yu xyri2b x18d9i69 x1c1uobl x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1fmog5m xu25z0z x140muxe xo1y3bh x3nfvp2 x1q0g3np x87ps6o x1lku1pv x1a2a7pz"
                 role="button" tabindex="0">
                <div class="x9f619 x1ja2u2z x78zum5 x1n2onr6 x1r8uery x1iyjqo2 xs83m0k xeuugli xl56j7k x6s0dn4 xozqiw3 x1q0g3np xpdmqnj x1g0dm76 xexx8yu x1lxpwgx x165d6jo x4cne27 xifccgj xn3w4p2 xuxw1ft">
                    <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x11lfxj5 x135b78x x10b6aqq x1yrsyyn">
                        <i data-visualcompletion="css-img" class="x1b0d499 x1d69dk1"
                           style="background-image:url('https://static.xx.fbcdn.net/rsrc.php/v4/y5/r/lwE5nTQ9s_K.png?_nc_eui2=AeGgD6HRr7P8OqfaFOL9qhoBDBtomacO-zkMG2iZpw77OY0MIgZYVG2UyzZSokD6kxhGT-blbf1VG1vc4BLiJrN1');
                                  background-position:0 -715px;background-size:auto;width:20px;height:20px;background-repeat:no-repeat;display:inline-block"></i>
                    </div>
                    <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x11lfxj5 x135b78x x10b6aqq x1yrsyyn">
                        <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x1f6kntn xvq8zen x1s688f xi81zsa" dir="auto">
                            <span data-ad-rendering-role="share_button">Đăng lại</span>
                        </span>
                    </div>
                </div>
                <div class="x1ey2m1c xtijo5x x1o0tod xg01cxk x47corl x10l6tqk x13vifvy x1ebt8du x19991ni x1dhq9h x1fmog5m xu25z0z x140muxe xo1y3bh"
                     role="none" data-visualcompletion="ignore" style="border-radius: 4px; inset: 0px; transition: all 0.2s ease-in-out;"></div>
            </div>
        `;
    }

    attachButtonHandlers(button) {
        const repostButton = button.querySelector('[role="button"]');
        if (repostButton) {
            repostButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleRepostClick(e);
            });

            this.attachHoverEffects(repostButton);
        }
    }

    attachHoverEffects(button) {
        const hoverDiv = button.querySelector('.x1ey2m1c.xtijo5x.x1o0tod.xg01cxk.x47corl.x10l6tqk.x13vifvy.x1ebt8du.x19991ni.x1dhq9h.x1fmog5m.xu25z0z.x140muxe.xo1y3bh');
        if (hoverDiv) {
            button.addEventListener('mouseenter', () => {
                hoverDiv.className = 'x1ey2m1c xtijo5x x1o0tod x47corl x10l6tqk x13vifvy x19991ni x1dhq9h x1fmog5m xu25z0z x140muxe xo1y3bh x1hc1fzr x1mq3mr6 x1wpzbip';
            });

            button.addEventListener('mouseleave', () => {
                hoverDiv.className = 'x1ey2m1c xtijo5x x1o0tod xg01cxk x47corl x10l6tqk x13vifvy x1ebt8du x19991ni x1dhq9h x1fmog5m xu25z0z x140muxe xo1y3bh';
            });
        }
    }

    handleRepostClick(event) {
        console.log('[Facebook Repost Injector] Repost button clicked!');
        this.handleRepost(event.target);
    }

    async handleRepost(buttonElement) {
        if (!buttonElement) {
            console.error('[Facebook Repost Injector] No button element provided');
            return null;
        }

        try {
            console.log('[Facebook Repost Injector] Processing repost click...');

            // Extract post ID using FacebookDataExtractor
            const postId = this.facebookExtractor.extractPostId(buttonElement);

            // Extract content using ContentExtractor
            const content = this.contentExtractor.extractContent(buttonElement);

            console.log('[Facebook Repost Injector] Extracted data:', { postId, content: content?.substring(0, 100) + '...' });

            // Create data for API
            const apiData = {
                postId: postId || null,
                content: content || '',
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            };

            console.log('[Facebook Repost Injector] Created API data:', apiData);

            // Send repost via Chrome extension messaging
            const result = await this.sendRepost(apiData);

            if (result && !result.error) {
                console.log('[Facebook Repost Injector] Repost successful:', result);
                this.showSuccessNotification();
                return result;
            } else {
                console.error('[Facebook Repost Injector] Repost failed:', result?.error);
                this.showErrorNotification(result?.error);
                return null;
            }

        } catch (error) {
            console.error('[Facebook Repost Injector] Error handling repost:', error);
            this.showErrorNotification(error.message);
            return null;
        }
    }

    async handleRepostWithCustomContent(buttonElement, customClass) {
        if (!buttonElement) {
            console.error('[Facebook Repost Injector] No button element provided');
            return null;
        }

        try {
            console.log('[Facebook Repost Injector] Processing repost with custom content...');

            // Extract post ID
            const postId = this.facebookExtractor.extractPostId(buttonElement);

            // Extract content with custom class
            const content = this.contentExtractor.extractContentByClass(buttonElement, customClass);

            // Send repost
            const result = await this.sendRepost({
                postId: postId || null,
                content: content || '',
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });

            if (result && !result.error) {
                console.log('[Facebook Repost Injector] Repost with custom content successful:', result);
                this.showSuccessNotification();
                return result;
            } else {
                console.error('[Facebook Repost Injector] Repost with custom content failed:', result?.error);
                this.showErrorNotification(result?.error);
                return null;
            }

        } catch (error) {
            console.error('[Facebook Repost Injector] Error handling repost with custom content:', error);
            this.showErrorNotification(error.message);
            return null;
        }
    }

    async handleRepostWithCustomSelector(buttonElement, selector) {
        if (!buttonElement) {
            console.error('[Facebook Repost Injector] No button element provided');
            return null;
        }

        try {
            console.log('[Facebook Repost Injector] Processing repost with custom selector...');

            // Extract post ID
            const postId = this.facebookExtractor.extractPostId(buttonElement);

            // Extract content with custom selector
            const content = this.contentExtractor.extractContentBySelector(buttonElement, selector);

            // Send repost
            const result = await this.sendRepost({
                postId: postId || null,
                content: content || '',
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });

            if (result && !result.error) {
                console.log('[Facebook Repost Injector] Repost with custom selector successful:', result);
                this.showSuccessNotification();
                return result;
            } else {
                console.error('[Facebook Repost Injector] Repost with custom selector failed:', result?.error);
                this.showErrorNotification(result?.error);
                return null;
            }

        } catch (error) {
            console.error('[Facebook Repost Injector] Error handling repost with custom selector:', error);
            this.showErrorNotification(error.message);
            return null;
        }
    }

    async sendRepost(apiData) {
        return await new Promise((resolve) => {
            chrome.runtime.sendMessage({
                type: 'SEND_REPOST',
                payload: apiData
            }, (response) => {
                if (chrome.runtime && chrome.runtime.lastError) {
                    resolve({ error: chrome.runtime.lastError.message });
                    return;
                }
                resolve(response);
            });
        });
    }

    async testConnection() {
        try {
            const result = await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    type: 'TEST_CONNECTION',
                    payload: {}
                }, (response) => {
                    if (chrome.runtime && chrome.runtime.lastError) {
                        resolve({ error: chrome.runtime.lastError.message });
                        return;
                    }
                    resolve(response);
                });
            });

            return result && !result.error;
        } catch (error) {
            console.error('[Facebook Repost Injector] Connection test error:', error);
            return false;
        }
    }

    showSuccessNotification() {
        // Create a simple success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            animation: fadeInOut 3s ease-in-out;
        `;
        notification.textContent = '✅ Repost thành công!';

        // Add CSS animation
        if (!document.getElementById('repost-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'repost-notification-styles';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-20px); }
                    20%, 80% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remove notification after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    showErrorNotification(errorMessage) {
        // Create a simple error notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            animation: fadeInOut 4s ease-in-out;
            max-width: 300px;
        `;
        notification.textContent = `❌ Repost thất bại: ${errorMessage || 'Lỗi không xác định'}`;

        document.body.appendChild(notification);

        // Remove notification after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }

    injectInto(element) {
        if (!element || element.querySelector(`[${this.markAttribute}]`)) {
            return;
        }

        try {
            const repostButton = this.createRepostButton();
            element.insertAdjacentElement('beforeend', repostButton);
        } catch (error) {
            console.warn('[Facebook Repost Injector] Injection failed:', error);
        }
    }

    scanAndInject(root = document) {
        try {
            const candidates = root.querySelectorAll('div');
            for (const element of candidates) {
                if (this.hasAllClasses(element, this.targetClasses)) {
                    this.injectInto(element);
                }
            }
        } catch (error) {
            console.warn('[Facebook Repost Injector] Scan failed:', error);
        }
    }

    createObserver() {
        try {
            this.observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType !== 1) return;

                        if (node.matches && this.hasAllClasses(node, this.targetClasses)) {
                            this.injectInto(node);
                        }

                        this.scanAndInject(node);
                    });
                }
            });
        } catch (error) {
            console.warn('[Facebook Repost Injector] Observer creation failed:', error);
        }
    }

    startObserving() {
        if (this.observer) {
            this.observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        }
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
};


