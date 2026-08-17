# Mô hình dữ liệu WebGIS Thủy lợi Vĩnh Long v4

## 1. Mục tiêu

V4 chuyển dự án từ một WebGIS đặt tên theo một khu vực lịch sử sang **WebGIS Thủy lợi Vĩnh Long** cho tỉnh Vĩnh Long mới, đồng thời giữ nguyên nguồn gốc và chất lượng của từng bộ dữ liệu.

Nguyên tắc quan trọng nhất là **không cộng gộp các con số khác bản chất**.

## 2. Nguồn A — snapshot hạ tầng 321 feature

Nguồn kỹ thuật:

- Portal: `https://hatang.vinhlong.gov.vn/map-thuy-loi`
- Kho bốc tách: `webgis-vinhlong/layer`
- Nhóm: `thuy_loi`
- CRS: `EPSG:4326`
- Commit ghim: `a93ebf004b04f79d90a199d22a139dab7479895c`

Danh mục:

| ID | Lớp | Feature |
|---:|---|---:|
| 260 | Trạm khí tượng thủy văn | 24 |
| 248 | Hệ thống trạm bơm | 3 |
| 252 | Đập | 3 |
| 261 | Cống các loại | 53 |
| 245 | Trạm cấp nước tư nhân | 11 |
| 249 | Kênh | 59 |
| 250 | Kè | 10 |
| 251 | Đê | 121 |
| 247 | Vị trí sạt lở | 37 |
| | **Tổng** | **321** |

Đây là **feature count** của GeoJSON.

## 3. Nguồn B — nghiên cứu Bến Tre 2020

Nguồn này phục hồi logic nghiên cứu và khối lượng CSDL của đề tài Bến Tre. Các số sau là **số dòng/bản ghi trong CSDL**, không phải feature count của Nguồn A:

- Cống cố định: 148
- Trạm bơm: 2
- Kênh cấp 1: 65
- Kênh cấp 2, 3: 1.452
- Đê bao: 196
- Đập: 14
- Cống tạm: 1.878
- Trạm đo thủy văn: 31
- Mực nước đỉnh triều/ngày: 4.605
- Độ mặn cao nhất/tháng: 987
- Độ mặn cao nhất/ngày: 5.992

Lớp trình bày hiện có:

- 10 trạm chuỗi mặn 1997–2016;
- 30 điểm công trình đại diện phục dựng;
- ranh khu vực nghiên cứu khái quát phục dựng.

Các hình học phục dựng phải luôn gắn cảnh báo chất lượng và không được dùng thay thế dữ liệu PostGIS nghiệp vụ.

## 4. Nguồn C — Trà Vinh

V4 chuẩn bị cấu trúc vùng nhưng không tự tạo dataset. Khi có dữ liệu tương đương, nên bổ sung theo cùng hợp đồng dữ liệu:

```js
{
  region: "tra-vinh",
  source: "...",
  snapshot: "...",
  layers: [
    { id, name, geometry, count, url, fields }
  ]
}
```

## 5. Phạm vi hành chính tỉnh Vĩnh Long mới

Năm 2025, tỉnh Vĩnh Long mới được hình thành từ toàn bộ diện tích tự nhiên và dân số của ba tỉnh Vĩnh Long, Bến Tre và Trà Vinh. WebGIS dùng cấu trúc vùng lịch sử để quản lý nguồn, nhưng không thay đổi địa danh gốc trong dữ liệu nếu chưa có bảng chuyển đổi được kiểm chứng.

## 6. Quy tắc hiển thị

1. `null`, `undefined`, chuỗi rỗng → **Chưa cập nhật**.
2. Không suy diễn năm, kết cấu, công suất, diện tích hoặc hiện trạng.
3. Search index giữ nhãn nguồn.
4. Popup và drawer luôn chỉ ra nguồn dữ liệu.
5. Feature count snapshot và row count nghiên cứu hiển thị ở hai vùng thống kê riêng.
6. Hình học phục dựng phải dùng ký hiệu/màu riêng và cảnh báo rõ.
7. Không gán một snapshot cho vùng lịch sử chỉ dựa trên tên dự án; phân vùng phải dựa vào thuộc tính/geometry hoặc bảng ánh xạ có kiểm chứng.

## 7. Hướng nâng cấp tiếp theo

- Bổ sung snapshot chuyên đề Trà Vinh nếu có nguồn được kiểm chứng.
- Thay hình học Bến Tre phục dựng bằng GeoJSON/PostGIS gốc.
- Bổ sung ảnh, bản vẽ, hồ sơ sửa chữa, lịch sử bảo trì.
- Tích hợp quan trắc mặn/mực nước tự động qua API.
- Chuyển từ GitHub Pages snapshot sang API + GeoServer + PostgreSQL/PostGIS khi triển khai nghiệp vụ.