# Facebook Repost Extension - Module Architecture

## Tổng quan

Extension này đã được tái cấu trúc thành các module riêng biệt để dễ bảo trì và mở rộng.

## Cấu trúc file

### 1. `post-id-extractor.js`
**Chức năng**: Lấy Post ID từ Facebook
- `extractPostId(buttonElement)`: Lấy post ID từ button được click
- Hỗ trợ nhiều cách lấy ID: data-ft, URL, permalink, etc.

### 2. `content-extractor.js`
**Chức năng**: Lấy nội dung từ các thẻ HTML
- `extractContent(buttonElement)`: Lấy nội dung từ class mặc định
- `extractContentByClass(buttonElement, customClass)`: Lấy nội dung từ class tùy chỉnh
- `extractContentBySelector(buttonElement, selector)`: Lấy nội dung từ selector tùy chỉnh

### 3. `api-manager.js` (có sẵn)
**Chức năng**: Quản lý API calls thông qua chrome.runtime.sendMessage
- `sendMessage(type, payload)`: Gửi message đến service worker
- `getApiToken()`: Lấy API token từ storage
- Tích hợp với hệ thống API hiện có

### 4. `repost-handler.js`
**Chức năng**: Kết hợp tất cả các module
- `handleRepostClick(buttonElement)`: Xử lý click repost cơ bản
- `handleRepostWithCustomContent(buttonElement, customClass)`: Xử lý với class tùy chỉnh
- `handleRepostWithCustomSelector(buttonElement, selector)`: Xử lý với selector tùy chỉnh

### 5. `repost.js` (đã cập nhật)
**Chức năng**: UI và event handling
- Đã được làm gọn, chỉ còn logic UI
- Sử dụng RepostHandler để xử lý logic

## Cách sử dụng

### Cấu hình cơ bản
```javascript
// Khởi tạo handler (không cần config)
const repostHandler = new RepostHandler();

// Xử lý repost
const result = await repostHandler.handleRepostClick(buttonElement);
```

### Sử dụng với class tùy chỉnh
```javascript
// Lấy nội dung từ class khác
const result = await repostHandler.handleRepostWithCustomContent(
    buttonElement, 
    "your-custom-class"
);
```

### Sử dụng với selector tùy chỉnh
```javascript
// Lấy nội dung từ selector CSS
const result = await repostHandler.handleRepostWithCustomSelector(
    buttonElement, 
    "div[data-testid='post-content']"
);
```

### Test connection
```javascript
// Kiểm tra kết nối API
const isConnected = await repostHandler.testConnection();
console.log('API connected:', isConnected);
```

## Cấu hình API

### Endpoints được thêm vào service_worker.js
- `POST /v1/repost` - Gửi data repost
- `GET /v1/health` - Test connection

### API Token
- Sử dụng API token từ storage (thông qua `ApiManager.getApiToken()`)
- Token được lưu trong extension storage

## Data format

### Input data
```javascript
{
    postId: "123456789",
    content: "Nội dung của post...",
    timestamp: "2024-01-01T12:00:00.000Z",
    url: "https://facebook.com/...",
    userAgent: "Mozilla/5.0...",
    // additionalData nếu có
}
```

### API Response
```javascript
{
    success: true,
    data: {
        // Response từ server
    }
}
```

## Lợi ích của kiến trúc mới

1. **Tách biệt trách nhiệm**: Mỗi module có một chức năng cụ thể
2. **Dễ bảo trì**: Code ngắn gọn, dễ hiểu
3. **Dễ mở rộng**: Có thể thêm tính năng mới dễ dàng
4. **Tái sử dụng**: Các module có thể dùng ở nhiều nơi
5. **Test dễ dàng**: Có thể test từng module riêng biệt

## Troubleshooting

### Không lấy được Post ID
- Kiểm tra console log của PostIdExtractor
- Facebook có thể đã thay đổi cấu trúc HTML

### Không lấy được nội dung
- Kiểm tra class name có đúng không
- Thử dùng `extractContentBySelector` với selector khác

### API không gửi được
- Kiểm tra URL và endpoint
- Kiểm tra network tab trong DevTools
- Thử `testConnection()` để kiểm tra kết nối
