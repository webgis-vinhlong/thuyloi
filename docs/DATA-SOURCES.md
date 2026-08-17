# Nguồn dữ liệu và nhãn chất lượng

| Nhóm | Nội dung trong bản WebGIS | Nguồn | Mức dùng |
|---|---|---|---|
| Độ mặn lịch sử | 10 trạm × 20 năm (1997–2016), giữ `null` khi thiếu | Bảng 1, báo cáo 2020 | Nghiên cứu |
| Khối lượng CSDL | Cống, trạm bơm, kênh, đê, đập, trạm thủy văn, mực nước, độ mặn, hành chính, giao thông, thủy hệ… | Bảng 2, báo cáo 2020 | Nghiên cứu |
| Vị trí trạm trên WebGIS | Tọa độ tham chiếu để vẽ bản đồ/IDW | Phục dựng | Minh họa |
| 9 huyện/thành phố | Polygon khái quát | Phục dựng | Minh họa |
| 30 điểm công trình | Điểm và một số thuộc tính mẫu | Phục dựng; một số tên tham chiếu từ báo cáo | Minh họa |
| Dữ liệu người dùng nhập | GeoJSON/CSV hoặc biểu mẫu | Trình duyệt người dùng | Cục bộ |

## Quy tắc hiển thị

1. Không đổi số liệu bảng nghiên cứu để “làm đẹp” chuỗi.
2. Giá trị thiếu được giữ là `null`.
3. Bề mặt IDW chỉ được ghi là **IDW minh họa**, vì vị trí trạm trong gói không phải lớp trạm chính thức.
4. Không dùng polygon huyện phục dựng làm ranh pháp lý.
5. Khi nạp dữ liệu chính thức, ghi rõ nguồn, thời gian, CRS và ngày cập nhật.

## Khoảng thời gian được báo cáo

Báo cáo mô tả các tập dữ liệu chính: mực nước theo ngày 2015–2017; độ mặn cao nhất theo tháng 2011–2018; độ mặn theo ngày/đợt 2019–2020; công trình đến năm 2019. Bản WebGIS này hiện đóng gói trực tiếp chuỗi Bảng 1 và khối lượng Bảng 2; các chuỗi đầy đủ khác cần file dữ liệu gốc để tích hợp.
