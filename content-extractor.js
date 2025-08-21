// ====== Content Extractor ======
class ContentExtractor {
    constructor() {
        this.LOG_TAG = "[CONTENT-EXTRACTOR]";
        this.TARGET_CLASS = "xdj266r x14z9mp x1lziwak xzsf02u x1a2a7pz";
    }

    // Lấy nội dung từ thẻ có class được chỉ định
    extractContent(buttonElement) {
        if (!buttonElement) return '';

        const modalRoot = document.querySelector('.__my_modal_wrapper__');
        const container = modalRoot;

        // Tìm tất cả thẻ có class này
        const elements = container.querySelectorAll(`.${this.TARGET_CLASS.split(' ').join('.')}`);

        if (elements.length > 0) {
            // Lấy nội dung text từ tất cả thẻ tìm được
            const contents = Array.from(elements).map(el => {
                const text = el.textContent?.trim();
                return text || '';
            }).filter(text => text.length > 0);

            const result = contents.join(' ').trim();

            if (result) {
                console.log(`${this.LOG_TAG} Found content:`, result.substring(0, 100) + (result.length > 100 ? '...' : ''));
            } else {
                console.log(`${this.LOG_TAG} No content found`);
            }

            return result;
        }

        console.log(`${this.LOG_TAG} No elements found with class:`, this.TARGET_CLASS);
        return '';
    }

    // Lấy nội dung từ class tùy chỉnh
    extractContentByClass(buttonElement, customClass) {
        if (!buttonElement || !customClass) return '';

        const modalRoot = document.querySelector('.__my_modal_wrapper__');
        const container = modalRoot || buttonElement.closest?.('[role="article"], [data-ft], [data-testid*="post"]') || document;

        // Tìm tất cả thẻ có class này
        const elements = container.querySelectorAll(`.${customClass.split(' ').join('.')}`);

        if (elements.length > 0) {
            // Lấy nội dung text từ tất cả thẻ tìm được
            const contents = Array.from(elements).map(el => {
                const text = el.textContent?.trim();
                return text || '';
            }).filter(text => text.length > 0);

            const result = contents.join(' ').trim();

            if (result) {
                console.log(`${this.LOG_TAG} Found content with custom class:`, result.substring(0, 100) + (result.length > 100 ? '...' : ''));
            }

            return result;
        }

        return '';
    }

    // Lấy nội dung từ selector tùy chỉnh
    extractContentBySelector(buttonElement, selector) {
        if (!buttonElement || !selector) return '';

        const modalRoot = document.querySelector('.__my_modal_wrapper__');
        const container = modalRoot || buttonElement.closest?.('[role="article"], [data-ft], [data-testid*="post"]') || document;

        // Tìm tất cả thẻ theo selector
        const elements = container.querySelectorAll(selector);

        if (elements.length > 0) {
            // Lấy nội dung text từ tất cả thẻ tìm được
            const contents = Array.from(elements).map(el => {
                const text = el.textContent?.trim();
                return text || '';
            }).filter(text => text.length > 0);

            const result = contents.join(' ').trim();

            if (result) {
                console.log(`${this.LOG_TAG} Found content with selector:`, result.substring(0, 100) + (result.length > 100 ? '...' : ''));
            }

            return result;
        }

        return '';
    }
}

// Export để sử dụng ở file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentExtractor;
} else {
    window.ContentExtractor = ContentExtractor;
}
