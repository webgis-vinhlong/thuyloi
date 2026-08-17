# 🌊 WebGIS Thủy lợi Vĩnh Long

WebGIS chuyên đề phục vụ tra cứu, trực quan hóa và truy vấn dữ liệu thủy lợi của **tỉnh Vĩnh Long mới**. Phiên bản **v4.0.0** tổ chức lại hệ thống theo mô hình nhiều nguồn dữ liệu, trong đó dữ liệu bản đồ nghiệp vụ và khối lượng CSDL nghiên cứu được tách rõ để không cộng gộp sai bản chất.

> Trang WebGIS: `https://webgis-vinhlong.github.io/thuyloi/`

## Phạm vi hành chính

Theo Nghị quyết số **202/2025/QH15**, toàn bộ diện tích tự nhiên và quy mô dân số của ba tỉnh **Bến Tre, Trà Vinh và Vĩnh Long** được sắp xếp thành tỉnh mới có tên là **tỉnh Vĩnh Long**. Nghị quyết **1687/NQ-UBTVQH15** tiếp tục sắp xếp các đơn vị hành chính cấp xã của tỉnh Vĩnh Long năm 2025.

Vì vậy tên dự án được chuẩn hóa thành:

> **WebGIS Thủy lợi Vĩnh Long**

Hệ thống có thể mở rộng dữ liệu theo ba vùng lịch sử: **Vĩnh Long · Bến Tre · Trà Vinh**, nhưng luôn giữ nguyên địa danh và nguồn gốc của từng bộ dữ liệu.

## 1. Snapshot hạ tầng: 321 đối tượng / 9 lớp

Nguồn: [`webgis-vinhlong/layer`](https://github.com/webgis-vinhlong/layer), nhóm `thuy_loi`, bốc tách từ `https://hatang.vinhlong.gov.vn/map-thuy-loi`.

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

Snapshot được ghim ở commit:

```text
a93ebf004b04f79d90a199d22a139dab7479895c
```

WebGIS tải GeoJSON theo đúng commit này để tránh thay đổi ngầm khi kho `layer` cập nhật.

### Nguyên tắc

- Giữ nguyên thuộc tính công khai theo từng feature.
- Không tự bổ sung giá trị `null`/rỗng; giao diện hiển thị **“Chưa cập nhật”**.
- Popup sinh động theo schema thực tế của từng lớp.
- Hình học Point/LineString giữ nguyên theo snapshot nguồn.
- Không tự đổi tên địa danh gốc theo vùng lịch sử nếu chưa có bảng ánh xạ được kiểm chứng.

## 2. Khu vực Bến Tre: CSDL nghiên cứu 2020

Dữ liệu nghiên cứu được khôi phục từ báo cáo **“Xây dựng ứng dụng hỗ trợ quản lý và khai thác công trình thủy lợi tỉnh Bến Tre ứng phó với biến đổi khí hậu”**.

Khối lượng CSDL cốt lõi theo **Bảng 2**:

| Dữ liệu | Số dòng / bản ghi |
|---|---:|
| Cống cố định | **148** |
| Trạm bơm | **2** |
| Kênh cấp 1 | **65** |
| Kênh cấp 2, 3 | **1.452** |
| Đê bao | **196** |
| Đập | **14** |
| Cống tạm | **1.878** |
| Trạm đo thủy văn | **31** |
| Mực nước đỉnh triều theo ngày | **4.605** |
| Độ mặn cao nhất theo tháng | **987** |
| Độ mặn cao nhất theo ngày | **5.992** |

Ngoài ra repository giữ:

- chuỗi độ mặn cực đại của **10 trạm**, giai đoạn **1997–2016**;
- **30 điểm công trình** đại diện phục dựng để minh họa giao diện;
- ranh khu vực nghiên cứu dạng khái quát phục dựng.

### Cảnh báo nhất quán dữ liệu

Các con số **148, 1.878, 1.452, 5.992...** là số dòng/bản ghi của CSDL nghiên cứu Bến Tre. Chúng **không phải** số đối tượng GeoJSON của bộ snapshot 321.

Do đó v4 hiển thị hai hệ số liệu riêng biệt:

```text
Snapshot hạ tầng: 321 feature / 9 lớp
                ≠
CSDL nghiên cứu Bến Tre: số dòng theo Bảng 2
```

Hệ thống không cộng hai nhóm này thành một “tổng số công trình”.

## 3. Khu vực Trà Vinh

Kiến trúc v4 đã chuẩn bị vùng tích hợp riêng cho dữ liệu Trà Vinh. Nếu chưa có snapshot GeoJSON/PostGIS tương đương trong nguồn hiện tại, giao diện chỉ hiển thị trạng thái **chờ lớp riêng** và không tự sinh hoặc gán dữ liệu từ vùng khác.

## Chức năng WebGIS v4.0.0

- Tên dự án thống nhất: **WebGIS Thủy lợi Vĩnh Long**.
- Hiển thị 9 lớp snapshot với ký hiệu SVG và màu riêng.
- Bật/tắt độc lập các overlay nghiên cứu Bến Tre.
- Popup chi tiết toàn bộ trường thuộc tính của snapshot 321.
- Drawer chi tiết có nguồn, Layer ID, FID, hình học và tọa độ.
- Truy vấn không dấu liên nguồn; kết quả luôn có nhãn **Snapshot 321** hoặc **Bến Tre 2020**.
- Bảng khối lượng CSDL nghiên cứu Bến Tre đúng Bảng 2.
- Thanh thời gian xâm nhập mặn 1997–2016 cho 10 trạm nghiên cứu.
- Chỉ báo số trạm có dữ liệu, số trạm ≥4 g/L và giá trị lớn nhất theo năm.
- Sparkline chuỗi mặn trong popup/drawer trạm.
- OpenStreetMap, Esri World Imagery và CARTO Light.
- GPS, đo khoảng cách, sao chép tọa độ, toàn màn hình.
- Responsive desktop/tablet/mobile.
- PWA/service worker v4.

## Kiến trúc dữ liệu

```text
WebGIS Thủy lợi Vĩnh Long
│
├── Nguồn A · Snapshot hạ tầng 321
│   └── jsDelivr → webgis-vinhlong/layer@<pinned-commit>/data/geojson/*.geojson
│
├── Nguồn B · Nghiên cứu Bến Tre 2020
│   ├── Khối lượng CSDL Bảng 2
│   ├── Chuỗi mặn 10 trạm 1997–2016
│   └── Hình học tham chiếu phục dựng
│
└── Nguồn C · Trà Vinh
    └── vùng mở rộng, chỉ nạp khi có dataset được kiểm chứng
```

Kiến trúc sản xuất dài hạn:

```text
Leaflet / Browser
      ↓
HTTPS API + GeoServer
      ↓
PostgreSQL/PostGIS + GeoTIFF + hồ sơ kỹ thuật
```

## Cấu trúc v4

```text
thuyloi/
├── index.html
├── assets/
│   ├── css/
│   │   ├── app-v3.css
│   │   └── app-v4.css
│   └── js/
│       ├── layer-catalog.js
│       ├── data.js
│       └── app-v4.js
├── docs/
│   ├── OFFICIAL-LAYERS.md
│   └── V4-DATA-MODEL.md
├── manifest.webmanifest
└── service-worker-v4.js
```

## Chạy cục bộ

```bash
python -m http.server 8080
```

Mở `http://localhost:8080/`.

## Nguồn pháp lý / hành chính

- Nghị quyết 202/2025/QH15 về sắp xếp đơn vị hành chính cấp tỉnh.
- Nghị quyết 1687/NQ-UBTVQH15 về sắp xếp các đơn vị hành chính cấp xã của tỉnh Vĩnh Long năm 2025.

## Phát triển

**Long Ngo / webgis-vinhlong**  
Mã nguồn mở phục vụ nghiên cứu, WebGIS và dữ liệu không gian.