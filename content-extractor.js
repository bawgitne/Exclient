// ====== Content Extractor ======
class ContentExtractor {
    constructor() {
        this.LOG_TAG = "[CONTENT-EXTRACTOR]";
        this.TARGET_CLASS = "xdj266r x14z9mp x1lziwak xzsf02u x1a2a7pz";
    }

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

    // Lấy nội dung từ thẻ có class được chỉ định
    extractContent(buttonElement, logger) {
        if (!buttonElement) return '';

        const modalRoot = document.querySelector('.__my_modal_wrapper__');
        const container = modalRoot;
        const selector = `.${this.TARGET_CLASS.split(' ').join('.')}`;

        return this._extract(container, selector, logger);
    }

    // Lấy nội dung từ class tùy chỉnh
    extractContentByClass(buttonElement, customClass, logger) {
        if (!buttonElement || !customClass) return '';

        const modalRoot = document.querySelector('.__my_modal_wrapper__');
        const container = modalRoot || buttonElement.closest?.('[role="article"], [data-ft], [data-testid*="post"]') || document;
        const selector = `.${customClass.split(' ').join('.')}`;

        return this._extract(container, selector, logger);
    }

    // Lấy nội dung từ selector tùy chỉnh
    extractContentBySelector(buttonElement, selector, logger) {
        if (!buttonElement || !selector) return '';

        const modalRoot = document.querySelector('.__my_modal_wrapper__');
        const container = modalRoot || buttonElement.closest?.('[role="article"], [data-ft], [data-testid*="post"]') || document;

        return this._extract(container, selector, logger);
    }
}

// Export để sử dụng ở file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentExtractor;
} else {
    window.ContentExtractor = ContentExtractor;
}
