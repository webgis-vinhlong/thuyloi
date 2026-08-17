# Kiến trúc WebGIS Thủy lợi Bến Tre

## 1. Kiến trúc nghiên cứu gốc

Báo cáo năm 2020 mô tả hệ thống theo mô hình client–server và WebGIS 3 tầng:

- **Tầng trình bày:** HTML, CSS, JavaScript, Leaflet và các thư viện giao diện/biểu đồ.
- **Tầng xử lý logic:** Apache HTTP Server + PHP cho dữ liệu phi không gian; Apache Tomcat + GeoServer cho dịch vụ không gian OGC.
- **Tầng dữ liệu:** PostgreSQL/PostGIS cho vector/thuộc tính; file system/GeoTIFF cho raster.

Các dịch vụ không gian được định hướng qua WMS, WFS, WCS/WMTS; mô-đun trạm quan trắc và dữ liệu bên thứ ba (khí tượng, ảnh vệ tinh, bản đồ nền) kết nối ở phía dịch vụ.

## 2. Kiến trúc bản GitHub Pages

```text
GitHub Pages
└── index.html
    ├── Leaflet
    ├── assets/js/data.js      snapshot nghiên cứu + hình học phục dựng
    ├── assets/js/app.js       map/search/chart/IDW/local CRUD/import-export
    └── localStorage           dữ liệu người dùng nhập trên trình duyệt
```

Mục đích của chế độ này là giữ WebGIS xem được lâu dài ngay cả khi backend cũ không còn hoạt động.

## 3. Kiến trúc production nên nâng cấp

```text
[Public WebGIS]       [Management UI]        [Field/Mobile]
       \                    |                    /
        \------ HTTPS API Gateway / Auth -------/
                         |
              +----------+-----------+
              |                      |
          REST/JSON               GeoServer
              |                WMS/WFS/WCS
              +----------+-----------+
                         |
                 PostgreSQL/PostGIS
                         |
            GeoTIFF / images / documents
```

### Nguyên tắc

- Không gọi lại API PHP cũ trong trang public.
- Không nhúng tài khoản, mật khẩu, cookie hoặc khóa quản trị vào JavaScript.
- Dùng HTTPS, token ngắn hạn, RBAC và audit log cho ghi dữ liệu.
- Cấp dịch vụ địa lý qua chuẩn OGC khi phù hợp; GeoJSON cho dữ liệu nhỏ/tương tác.
- Chuyển dữ liệu VN-2000 sang WGS84/EPSG:4326 ở bước xuất web hoặc khai báo CRS chính xác ở dịch vụ.
- Tách public read-only khỏi quản trị ghi dữ liệu.

## 4. Các bước để khôi phục đầy đủ

Cần bổ sung tối thiểu một trong các nguồn: dump PostgreSQL/PostGIS, GeoPackage/Shapefile gốc, GeoServer `data_dir`, thư mục GeoTIFF, ảnh/tài liệu công trình và mã server-side. Khi có dữ liệu này, thay các lớp phục dựng trong `data.js` bằng nguồn chính thức hoặc WFS/API mới.
