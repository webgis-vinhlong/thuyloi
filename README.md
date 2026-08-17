# WebGIS Hệ thống Thủy lợi Bến Tre

Bản phục dựng WebGIS quản lý và khai thác công trình thủy lợi tỉnh Bến Tre, được tổ chức lại từ ba nguồn:

1. mã phục dựng/dở dang do tác giả cung cấp;
2. giao diện WebGIS gốc tại `webgis-vinhlong/webgis-vinhlong.github.io` (tham khảo cấu trúc UI/UX);
3. báo cáo nghiên cứu **“Xây dựng ứng dụng hỗ trợ quản lý và khai thác công trình thủy lợi tỉnh Bến Tre ứng phó với biến đổi khí hậu”** (2020).

## Mục tiêu của bản này

- Chạy trực tiếp trên GitHub Pages, không cần backend để xem dữ liệu nghiên cứu đã đóng gói.
- Giữ đúng tinh thần kiến trúc 3 tầng của nghiên cứu: **Presentation → Logic/Services → Data**.
- Không giả mạo backend cũ: API PHP được phục hồi từ bundle nhưng không được gọi trong bản public.
- Phân biệt rõ **số liệu nghiên cứu** và **hình học/điểm mẫu phục dựng**.
- Chuẩn bị sẵn đường nâng cấp tới GeoServer + PostgreSQL/PostGIS khi có dữ liệu gốc.

## Chức năng

- Bản đồ Leaflet responsive cho desktop/mobile (Leaflet 1.9.4 qua jsDelivr trên bản GitHub Pages).
- Nền trắng, OpenStreetMap và ảnh vệ tinh Esri.
- Lớp công trình, trạm thủy văn, ranh huyện phục dựng và bề mặt IDW minh họa.
- Tìm kiếm không dấu theo tên, mã, loại, địa bàn và trạng thái.
- Chuỗi mặn cực đại 10 trạm giai đoạn 1997–2016; biểu đồ theo trạm và năm.
- Chỉ báo nhanh số trạm có dữ liệu, số trạm ≥ 4 g/L và giá trị lớn nhất theo năm.
- Thống kê khối lượng CSDL theo Bảng 2 của báo cáo.
- Đo khoảng cách, GPS, thêm/sửa/xóa điểm cục bộ.
- Nhập GeoJSON/CSV; xuất GeoJSON/CSV; sao lưu `localStorage`.

## Chạy

Có thể mở `index.html` trực tiếp. Để kiểm thử gần với GitHub Pages:

```bash
python -m http.server 8080
```

Sau đó mở `http://localhost:8080`.

## Dữ liệu và độ tin cậy

### Dữ liệu nghiên cứu

- Chuỗi độ mặn cực đại 10 trạm, 1997–2016: Bảng 1 của báo cáo.
- Khối lượng các nhóm dữ liệu: Bảng 2 của báo cáo, gồm 148 cống cố định, 1.878 cống tạm, 31 trạm thủy văn, 4.605 bản ghi mực nước đỉnh triều/ngày, 987 bản ghi mặn cao nhất/tháng, 5.992 bản ghi mặn cao nhất/ngày và các lớp nền liên quan.

### Dữ liệu phục dựng

Toàn bộ tọa độ trạm trong bản trình diễn, ranh 9 huyện/thành phố và 30 điểm công trình là **dữ liệu đại diện để phục dựng giao diện**. Chúng không phải dump PostgreSQL/PostGIS của đề tài và không được dùng cho vận hành công trình.

## Kiến trúc production đề xuất

```text
Browser / Leaflet
       │ HTTP(S), JSON, OGC WMS/WFS/WCS
       ▼
API service + GeoServer
       │ SQL / PostGIS
       ▼
PostgreSQL/PostGIS + GeoTIFF + file attachments
```

Bản GitHub Pages hiện tại tương ứng với **tầng trình bày** và một snapshot dữ liệu nghiên cứu. Xem `docs/ARCHITECTURE.md` và `docs/DATA-SOURCES.md`.

## Cấu hình backend mới

`assets/js/config.js` mặc định:

```js
window.TLBT_CONFIG = {
  mode: "static-research",
  backend: { enabled: false, apiBase: "", geoserverWms: "", geoserverWfs: "", workspace: "" }
};
```

Chỉ bật backend sau khi có dịch vụ HTTPS mới, CORS phù hợp, xác thực/token, RBAC và log thay đổi.

## Cấu trúc

```text
index.html
assets/
  css/app.css
  js/app.js
  js/config.js
  js/data.js
docs/
  ARCHITECTURE.md
  DATA-SOURCES.md
NOTICE.md
```

## Lưu ý

Bản phục dựng này là lớp khai thác/giới thiệu dữ liệu nghiên cứu. Nó không tuyên bố khôi phục toàn bộ CSDL, ảnh/tài liệu kỹ thuật, cấu hình GeoServer hay PHP server-side của hệ thống gốc.
