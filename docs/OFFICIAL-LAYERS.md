# Bộ lớp Thủy lợi chính thức dùng trong WebGIS

WebGIS v3.0.0 sử dụng 9 lớp thuộc nhóm `thuy_loi` trong kho `webgis-vinhlong/layer`, được bốc tách từ cổng `https://hatang.vinhlong.gov.vn/map-thuy-loi`.

Snapshot nguồn được ghim tại commit:

`a93ebf004b04f79d90a199d22a139dab7479895c`

| Layer ID | Lớp | Hình học | Số đối tượng |
|---:|---|---|---:|
| 260 | Trạm khí tượng thủy văn | Point | 24 |
| 248 | Hệ thống trạm bơm | Point | 3 |
| 252 | Đập | Point | 3 |
| 261 | Cống các loại | Point | 53 |
| 245 | Trạm cấp nước tư nhân | Point | 11 |
| 249 | Kênh | LineString | 59 |
| 250 | Kè | LineString | 10 |
| 251 | Đê | LineString | 121 |
| 247 | Vị trí sạt lở | LineString | 37 |
| | **Tổng** | | **321** |

## Quy tắc dữ liệu

- Không tự điền thuộc tính còn trống; `null` hoặc chuỗi rỗng hiển thị là **Chưa cập nhật**.
- Truy vấn tìm kiếm chạy trên toàn bộ thuộc tính công khai, có chuẩn hóa tiếng Việt không dấu.
- Popup và drawer hiển thị toàn bộ trường thuộc tính gốc, cùng Layer ID, FID, kiểu hình học và tọa độ/tổng chiều dài hình học.
- Các file GeoJSON được tải qua jsDelivr theo commit đã ghim, không theo `main`, để tránh thay đổi dữ liệu ngầm.
- `layer_id`, `fid`, `label` và các trường nội bộ `_...` được coi là metadata kỹ thuật; FID vẫn được hiển thị ở chân popup.

## Ký hiệu

Mỗi lớp có màu và SVG riêng. Lớp điểm dùng marker biểu tượng; lớp tuyến dùng màu nét riêng và tooltip tên đối tượng khi rê chuột.
