/**
 * Content Extractor - Infrastructure layer
 * Extracts post content from Facebook DOM elements
 */
window.ContentExtractor = class ContentExtractor {
    constructor() {
        this.LOG_TAG = "[CONTENT-EXTRACTOR]";
        this.DEFAULT_TARGET_CLASS = "xdj266r x14z9mp x1lziwak xzsf02u x1a2a7pz";
    }

    /**
     * Internal method to extract content from elements
     * @param {Element} container - Container element to search in
     * @param {string|NodeList} elements - CSS selector string or NodeList of elements
     * @param {Function|boolean} logger - Logger function or false to disable logging
     * @returns {string} Extracted text content
     */
    _extract(container, elements, logger = console.log) {
        if (!container || !elements) return '';

        const logFn = logger === false ? null : (typeof logger === 'function' ? logger : console.log);

        const nodeList = typeof elements === 'string'
            ? container.querySelectorAll(elements)
            : elements;

        if (!nodeList || nodeList.length === 0) {
            if (logFn) {
                logFn(`${this.LOG_TAG} No elements found with selector:`, elements);
            }
            return '';
        }

        const contents = Array.from(nodeList).map(el => {
            const text = el.textContent?.trim();
            return text || '';
        }).filter(text => text.length > 0);

        const result = contents.join(' ').trim();

        if (logFn) {
            if (result) {
                logFn(`${this.LOG_TAG} Found content:`, result.substring(0, 100) + (result.length > 100 ? '...' : ''));
            } else {
                logFn(`${this.LOG_TAG} No content found`);
            }
        }

        return result;
    }

    /**
     * Extract content from elements with default target class
     * @param {Element} buttonElement - Button element that was clicked
     * @param {Function|boolean} logger - Logger function or false to disable logging
     * @returns {string} Extracted content
     */
    extractContent(buttonElement, logger = console.log) {
        if (!buttonElement) return '';

        // Look for modal first, then fallback to button context
        const modalRoot = document.querySelector('.__my_modal_wrapper__');
        const container = modalRoot || buttonElement.closest?.('[role="article"], [data-ft], [data-testid*="post"]') || document;
        const selector = `.${this.DEFAULT_TARGET_CLASS.split(' ').join('.')}`;

        return this._extract(container, selector, logger);
    }

    /**
     * Extract content from elements with custom class
     * @param {Element} buttonElement - Button element that was clicked
     * @param {string} customClass - Custom CSS class to search for
     * @param {Function|boolean} logger - Logger function or false to disable logging
     * @returns {string} Extracted content
     */
    extractContentByClass(buttonElement, customClass, logger = console.log) {
        if (!buttonElement || !customClass) return '';

        const modalRoot = document.querySelector('.__my_modal_wrapper__');
        const container = modalRoot || buttonElement.closest?.('[role="article"], [data-ft], [data-testid*="post"]') || document;
        const selector = `.${customClass.split(' ').join('.')}`;

        return this._extract(container, selector, logger);
    }

    /**
     * Extract content from elements with custom selector
     * @param {Element} buttonElement - Button element that was clicked
     * @param {string} selector - Custom CSS selector
     * @param {Function|boolean} logger - Logger function or false to disable logging
     * @returns {string} Extracted content
     */
    extractContentBySelector(buttonElement, selector, logger = console.log) {
        if (!buttonElement || !selector) return '';

        const modalRoot = document.querySelector('.__my_modal_wrapper__');
        const container = modalRoot || buttonElement.closest?.('[role="article"], [data-ft], [data-testid*="post"]') || document;

        return this._extract(container, selector, logger);
    }

    /**
     * Extract all text content from a post container
     * @param {Element} buttonElement - Button element that was clicked
     * @param {Function|boolean} logger - Logger function or false to disable logging
     * @returns {string} All extracted text content
     */
    extractAllTextContent(buttonElement, logger = console.log) {
        if (!buttonElement) return '';

        const container = buttonElement.closest?.('[role="article"], [data-ft], [data-testid*="post"]');
        if (!container) return '';

        const logFn = logger === false ? null : (typeof logger === 'function' ? logger : console.log);

        // Get all text nodes, excluding buttons, links, and other interactive elements
        const textElements = container.querySelectorAll(
            'div:not([role="button"]):not([aria-label*="button"]), ' +
            'span:not([role="button"]):not([aria-label*="button"]), ' +
            'p, h1, h2, h3, h4, h5, h6'
        );

        const contents = Array.from(textElements)
            .map(el => el.textContent?.trim())
            .filter(text => text && text.length > 5) // Filter out very short text
            .filter(text => !text.match(/^(Like|Share|Comment|Repost|Thích|Chia sẻ|Bình luận|Đăng lại)$/i)); // Filter out action words

        const result = contents.join(' ').trim();

        if (logFn) {
            if (result) {
                logFn(`${this.LOG_TAG} Extracted all text content:`, result.substring(0, 200) + (result.length > 200 ? '...' : ''));
            } else {
                logFn(`${this.LOG_TAG} No text content found`);
            }
        }

        return result;
    }

    /**
     * Extract content with fallback strategies
     * @param {Element} buttonElement - Button element that was clicked
     * @param {Array<string>} selectors - Array of CSS selectors to try in order
     * @param {Function|boolean} logger - Logger function or false to disable logging
     * @returns {string} Extracted content using first successful selector
     */
    extractWithFallback(buttonElement, selectors = [], logger = console.log) {
        if (!buttonElement || !Array.isArray(selectors) || selectors.length === 0) {
            return this.extractContent(buttonElement, logger);
        }

        const container = buttonElement.closest?.('[role="article"], [data-ft], [data-testid*="post"]') || document;

        for (const selector of selectors) {
            const content = this._extract(container, selector, false);
            if (content) {
                if (logger !== false && typeof logger === 'function') {
                    logger(`${this.LOG_TAG} Success with selector: ${selector}`, content.substring(0, 100) + '...');
                }
                return content;
            }
        }

        // If no selectors worked, try extracting all text content
        return this.extractAllTextContent(buttonElement, logger);
    }
};