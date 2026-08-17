# 🌊 WebGIS Hệ thống Thủy lợi Bến Tre

WebGIS chuyên đề phục vụ tra cứu, trực quan hóa và truy vấn dữ liệu công trình thủy lợi trên nền bản đồ Web. Phiên bản **v3.0.0** tiếp tục kế thừa bản phục dựng từ nghiên cứu WebGIS thủy lợi Bến Tre, đồng thời tích hợp bộ lớp `thuy_loi` đã bốc tách từ kho dữ liệu [`webgis-vinhlong/layer`](https://github.com/webgis-vinhlong/layer), nguồn gốc từ Cơ sở dữ liệu ngành Nông nghiệp và Môi trường – lĩnh vực Thủy lợi của tỉnh Vĩnh Long.

> Trang WebGIS: `https://webgis-vinhlong.github.io/thuyloi/`

## ✨ WebGIS v3.0.0

Bản v3 chuyển trọng tâm từ dữ liệu minh họa sang **321 đối tượng thuộc 9 lớp nghiệp vụ thực tế**:

| Lớp | Layer ID | Hình học | Số đối tượng |
|---|---:|---|---:|
| 🌦️ Trạm khí tượng thủy văn | 260 | Point | **24** |
| ⚙️ Hệ thống trạm bơm | 248 | Point | **3** |
| 🧱 Đập | 252 | Point | **3** |
| 🚪 Cống các loại | 261 | Point | **53** |
| 💧 Trạm cấp nước tư nhân | 245 | Point | **11** |
| 🌊 Kênh | 249 | LineString | **59** |
| 🛡️ Kè | 250 | LineString | **10** |
| 🏞️ Đê | 251 | LineString | **121** |
| ⚠️ Vị trí sạt lở | 247 | LineString | **37** |
| | | **Tổng** | **321** |

## 🔎 Chức năng chính

- Hiển thị đầy đủ 9 lớp Thủy lợi với **màu và SVG ký hiệu riêng** cho từng nhóm.
- Bật/tắt từng lớp hoặc toàn bộ lớp từ sidebar.
- Nền OpenStreetMap, Esri World Imagery và CARTO Light.
- **Truy vấn không dấu** trên tên công trình và toàn bộ trường thuộc tính công khai.
- Lọc kết quả theo lớp; chọn kết quả để zoom tới điểm/tuyến.
- Popup kiểu nghiệp vụ: tên đối tượng, nhóm lớp và **toàn bộ thuộc tính nguồn**.
- Drawer chi tiết chứa nguồn, Layer ID, FID, thuộc tính, loại hình học, tọa độ và chiều dài hình học tính từ geometry.
- Giá trị `null` hoặc chuỗi rỗng được ghi rõ **“Chưa cập nhật”**, không tự suy diễn dữ liệu.
- Tooltip tên đối tượng khi rê chuột trên điểm hoặc tuyến.
- GPS, toàn màn hình, sao chép tọa độ và đo khoảng cách nhiều điểm.
- Responsive cho desktop, tablet và mobile.
- PWA/service worker v3 có runtime cache cho tài nguyên bản đồ và snapshot GeoJSON.

## 🗃️ Nguồn dữ liệu

Nguồn dữ liệu nghiệp vụ:

- Portal: `https://hatang.vinhlong.gov.vn/map-thuy-loi`
- Kho bốc tách: `https://github.com/webgis-vinhlong/layer`
- Nhóm dữ liệu: `thuy_loi`
- CRS: `EPSG:4326`
- Snapshot nguồn được ghim ở commit:

```text
a93ebf004b04f79d90a199d22a139dab7479895c
```

WebGIS tải các GeoJSON qua jsDelivr **theo đúng commit** này, thay vì tải theo nhánh `main`, nhằm tránh thay đổi dữ liệu ngầm khi kho nguồn tiếp tục cập nhật.

Chi tiết mapping lớp và nguyên tắc dữ liệu: [`docs/OFFICIAL-LAYERS.md`](docs/OFFICIAL-LAYERS.md).

## 🧾 Ví dụ thuộc tính

Các schema được giữ nguyên theo từng lớp. Ví dụ:

- **Trạm khí tượng thủy văn:** Tên trạm, Loại trạm, Vị trí Km, Vận hành, Năm xây dựng, Ghi chú.
- **Trạm bơm:** Tên trạm, Vị trí, Số máy bơm, Công suất thiết kế/thực tế, Diện tích phục vụ, hiện trạng.
- **Cống:** Tên cống, Địa chỉ, Chiều dài, Chiều rộng dẫn nước, Kết cấu, Diện tích phục vụ, cao độ, năm xây dựng, tình trạng.
- **Kênh/Kè/Đê:** tên tuyến, địa chỉ, chiều dài, chiều rộng/kết cấu/phân cấp, năm xây dựng, tình trạng, ghi chú.
- **Sạt lở:** địa danh, tuyến sông/rạch, kích thước, diện tích, năm sạt lở, mức độ, điểm đầu/điểm cuối và ghi chú.

Popup không cố định một schema chung mà sinh bảng thuộc tính theo chính dữ liệu của từng feature, vì vậy các trường của nguồn không bị mất khi hiển thị.

## 🏗️ Kiến trúc

```text
GitHub Pages / Browser
        │
        ├── Leaflet 1.9.4
        ├── app-v3.js
        ├── layer-catalog.js
        │
        ├── OSM / Esri / CARTO basemap
        │
        └── jsDelivr CDN
              │
              └── webgis-vinhlong/layer@<pinned-commit>/data/geojson/*.geojson
```

Kiến trúc sản xuất dài hạn vẫn có thể nâng cấp sang:

```text
Leaflet / Browser → HTTPS API + GeoServer → PostgreSQL/PostGIS + GeoTIFF
```

## 📁 Cấu trúc liên quan v3

```text
thuyloi/
├── index.html
├── assets/
│   ├── css/
│   │   └── app-v3.css
│   └── js/
│       ├── layer-catalog.js
│       └── app-v3.js
├── docs/
│   └── OFFICIAL-LAYERS.md
├── service-worker-v3.js
└── manifest.webmanifest
```

Các file phục dựng v2 vẫn được giữ lại trong repository để bảo toàn lịch sử phát triển và dữ liệu nghiên cứu cũ, nhưng trang chính v3 không còn phụ thuộc vào các điểm công trình minh họa đó.

## ▶️ Chạy cục bộ

Không mở trực tiếp bằng `file://` nếu muốn kiểm thử đầy đủ fetch/PWA. Chạy một HTTP server:

```bash
python -m http.server 8080
```

Sau đó mở:

```text
http://localhost:8080/
```

## ⚖️ Lưu ý sử dụng dữ liệu

WebGIS này là lớp khai thác/trực quan hóa từ snapshot dữ liệu công khai. Dữ liệu trống không được tự bổ sung; việc xác nhận pháp lý, hiện trạng công trình, thiết kế kỹ thuật hoặc điều hành thủy lợi phải đối chiếu với cơ quan quản lý và hệ thống nguồn.

## 👤 Phát triển

**Long Ngo / webgis-vinhlong**  
Mã nguồn mở phục vụ nghiên cứu, WebGIS và dữ liệu không gian.
