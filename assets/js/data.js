/*
 * Nguồn dữ liệu của bản phục dựng:
 * - Chuỗi mặn cực đại 10 trạm (1997–2016): Bảng 1, Báo cáo tổng kết 2020.
 * - Khối lượng CSDL: Bảng 2, Báo cáo tổng kết 2020.
 * - Tọa độ trạm, ranh huyện và 30 điểm công trình: hình học/điểm đại diện phục dựng.
 *   KHÔNG phải bản sao PostGIS nghiệp vụ và không dùng cho quyết định vận hành.
 */
window.TLBT_DATA = (() => {
  const metadata = {
    title: "WebGIS Hệ thống Thủy lợi Bến Tre",
    research: "Xây dựng ứng dụng hỗ trợ quản lý và khai thác công trình thủy lợi tỉnh Bến Tre ứng phó với biến đổi khí hậu",
    reportYear: 2020,
    displayCrs: "EPSG:4326",
    quality: "research-snapshot-with-reconstructed-geometry"
  };
  const years = Array.from({length:20},(_,i)=>1997+i);
  const salinityRows = {
    "An Thuận": [null,30.6,null,22.2,null,null,29,28,24.7,23.9,24.8,26.6,27.3,30,30,25.5,null,25.8,29.18,31.5],
    "Sơn Đốc": [4.2,6,7.2,4.1,10,9,10.3,17.2,24.1,13.7,14.5,8.5,11.8,17.6,17.6,13.1,null,null,15.78,27.4],
    "Mỹ Hóa": [null,6.8,5.7,1.8,1.6,4.7,3.4,8.7,11.1,3.4,null,null,null,null,null,null,null,null,2.8,12.4],
    "Bến Trại": [null,26.3,null,23.1,22.9,23.5,25.2,29.1,27.3,28.7,29.6,27.4,27.2,27.2,27.2,27.3,null,19,25.5,29.3],
    "Hương Mỹ": [2.3,7,10.8,9,10.3,9.2,6.7,12.5,11.3,6.4,9,7,10,8,8,8.3,null,null,18.88,16.6],
    "Bình Đại": [null,null,null,19.9,20.8,27.5,27,27.4,30.4,26.4,27.8,24.6,26.3,27.1,27.1,27.3,null,26.5,27.5,27.2],
    "Lộc Thuận": [10.8,13.8,10.7,10.7,13.1,16.4,15.2,17.5,21.2,18.1,19.3,14,21.8,18.3,18.3,14,null,14.5,18.88,17.5],
    "Giao Hòa": [null,null,null,null,null,5.6,3.5,10.1,11.1,4.4,null,null,null,null,null,null,null,null,null,null],
    "Mỹ Tho": [null,10,1.1,.8,1.3,2.3,.8,4,.7,1,null,1.2,.9,3.2,3.2,2,null,null,2.1,3.9],
    "An Định": [2.4,12.7,3.3,2.2,2.8,1.8,.7,.8,3.5,null,null,1.8,0,2.9,2.9,3.1,null,null,5.1,null]
  };
  const stations = [
    ["An Thuận",106.526,9.874,"Sông Hàm Luông"],["Sơn Đốc",106.347,10.043,"Sông Hàm Luông"],
    ["Mỹ Hóa",106.323,10.222,"Sông Hàm Luông"],["Bến Trại",106.438,9.771,"Sông Cổ Chiên"],
    ["Hương Mỹ",106.278,9.860,"Sông Cổ Chiên"],["Bình Đại",106.695,10.188,"Sông Tiền"],
    ["Lộc Thuận",106.585,10.245,"Sông Tiền"],["Giao Hòa",106.322,10.283,"Sông Tiền"],
    ["Mỹ Tho",106.360,10.335,"Sông Tiền"],["An Định",106.160,10.183,"Sông Tiền"]
  ].map((s,i)=>({id:`ST-${String(i+1).padStart(2,"0")}`,name:s[0],lon:s[1],lat:s[2],river:s[3],values:salinityRows[s[0]],source:"Bảng 1 · Báo cáo tổng kết 2020",geometrySource:"Tọa độ tham chiếu phục dựng",quality:"Giá trị nghiên cứu / vị trí phục dựng"}));
  const districts={type:"FeatureCollection",features:[
    polygon("Chợ Lách",[[105.93,10.16],[106.00,10.30],[106.17,10.35],[106.18,10.22],[106.08,10.13]]),
    polygon("Châu Thành",[[106.17,10.35],[106.39,10.34],[106.43,10.23],[106.30,10.15],[106.18,10.22]]),
    polygon("TP. Bến Tre",[[106.30,10.29],[106.43,10.27],[106.42,10.17],[106.32,10.14],[106.27,10.21]]),
    polygon("Bình Đại",[[106.39,10.34],[106.62,10.30],[106.78,10.13],[106.69,10.00],[106.48,10.12],[106.43,10.23]]),
    polygon("Giồng Trôm",[[106.32,10.14],[106.48,10.12],[106.53,9.98],[106.39,9.93],[106.26,10.03]]),
    polygon("Ba Tri",[[106.48,10.12],[106.69,10.00],[106.78,9.88],[106.63,9.77],[106.50,9.85],[106.53,9.98]]),
    polygon("Mỏ Cày Bắc",[[106.08,10.13],[106.18,10.22],[106.30,10.15],[106.26,10.03],[106.12,9.99],[106.01,10.05]]),
    polygon("Mỏ Cày Nam",[[106.01,10.05],[106.12,9.99],[106.26,10.03],[106.39,9.93],[106.30,9.77],[106.12,9.78],[105.96,9.90]]),
    polygon("Thạnh Phú",[[106.30,9.77],[106.39,9.93],[106.50,9.85],[106.63,9.77],[106.48,9.66],[106.31,9.65]])
  ]};
  const facilityRows=[
    ["Cống Ba Lai","C-001","Cống cố định","Bình Đại",106.615,10.218,2002,"Đang vận hành",20,10,"Tên tham chiếu từ báo cáo; vị trí và thông số kỹ thuật trong bản này là phục dựng."],
    ["Cống Vàm Đồn","C-002","Cống cố định","Ba Tri",106.594,9.925,2004,"Đang vận hành",8,4,"Tên công trình xuất hiện trong ví dụ tìm kiếm của báo cáo; vị trí/thông số phục dựng."],
    ["Cống Vàm Nước Trong","C-003","Cống cố định","Mỏ Cày Nam",106.285,9.884,2010,"Theo dõi",6,3,"Tên công trình xuất hiện trong ví dụ tìm kiếm của báo cáo; vị trí/thông số phục dựng."],
    ["Cống Cầu Ván","C-004","Cống cố định","Thạnh Phú",106.451,9.775,2016,"Đang vận hành",10,5,"Điểm đại diện phục dựng."],
    ["Cống An Hóa","C-005","Cống cố định","Châu Thành",106.406,10.277,2008,"Đang vận hành",7.5,4,"Điểm đại diện phục dựng."],
    ["Cống Tân Phú","C-006","Cống tạm","Châu Thành",106.295,10.309,2013,"Theo dõi",1.2,1,"Điểm đại diện phục dựng."],
    ["Cống Phú Nhuận","C-007","Cống tạm","TP. Bến Tre",106.382,10.211,2011,"Bảo trì",1.5,1,"Điểm đại diện phục dựng."],
    ["Cống Bình Thắng","C-008","Cống cố định","Bình Đại",106.704,10.153,2017,"Đang vận hành",6,3,"Điểm đại diện phục dựng."],
    ["Cống Thừa Đức","C-009","Cống cố định","Bình Đại",106.742,10.069,2015,"Đang vận hành",4,2,"Điểm đại diện phục dựng."],
    ["Cống Bảo Thạnh","C-010","Cống tạm","Ba Tri",106.681,9.893,2012,"Theo dõi",1.2,1,"Điểm đại diện phục dựng."],
    ["Cống Tân Xuân","C-011","Cống tạm","Ba Tri",106.574,10.030,2010,"Đang vận hành",1.5,1,"Điểm đại diện phục dựng."],
    ["Cống Mỹ An","C-012","Cống cố định","Thạnh Phú",106.472,9.724,2014,"Bảo trì",5,2,"Điểm đại diện phục dựng."],
    ["Cống Giao Thạnh","C-013","Cống tạm","Thạnh Phú",106.390,9.688,2016,"Đang vận hành",1.2,1,"Điểm đại diện phục dựng."],
    ["Cống Định Thủy","C-014","Cống tạm","Mỏ Cày Nam",106.215,9.930,2009,"Đang vận hành",1.5,1,"Điểm đại diện phục dựng."],
    ["Cống Phước Hiệp","C-015","Cống tạm","Mỏ Cày Nam",106.173,9.834,2011,"Theo dõi",1.2,1,"Điểm đại diện phục dựng."],
    ["Cống Tân Thành Bình","C-016","Cống cố định","Mỏ Cày Bắc",106.246,10.111,2007,"Đang vận hành",5,2,"Điểm đại diện phục dựng."],
    ["Cống Nhuận Phú Tân","C-017","Cống tạm","Mỏ Cày Bắc",106.143,10.064,2013,"Đang vận hành",1,1,"Điểm đại diện phục dựng."],
    ["Cống Hòa Nghĩa","C-018","Cống tạm","Chợ Lách",106.111,10.188,2012,"Theo dõi",1,1,"Điểm đại diện phục dựng."],
    ["Cống Vĩnh Bình","C-019","Cống cố định","Chợ Lách",106.005,10.248,2006,"Đang vận hành",4,2,"Điểm đại diện phục dựng."],
    ["Trạm bơm Sơn Đông","TB-01","Trạm bơm","TP. Bến Tre",106.356,10.244,2018,"Đang vận hành",null,null,"Điểm đại diện phục dựng."],
    ["Trạm bơm Giồng Trôm","TB-02","Trạm bơm","Giồng Trôm",106.506,10.146,2018,"Đang vận hành",null,null,"Điểm đại diện phục dựng."],
    ["Đập tạm Thạnh Trị","D-01","Đập","Bình Đại",106.535,10.182,2019,"Theo dõi",null,null,"Điểm đại diện phục dựng."],
    ["Đập ngăn mặn An Hiệp","D-02","Đập","Ba Tri",106.543,9.971,2019,"Đang vận hành",null,null,"Điểm đại diện phục dựng."],
    ["Đập Cái Quao","D-03","Đập","Mỏ Cày Nam",106.330,9.822,2019,"Bảo trì",null,null,"Điểm đại diện phục dựng."],
    ["Kênh cấp 1 Ba Lai","K-01","Kênh","Bình Đại",106.552,10.261,2019,"Đang vận hành",null,null,"Điểm đại diện phục dựng."],
    ["Kênh cấp 1 Hàm Luông","K-02","Kênh","Giồng Trôm",106.430,10.063,2019,"Đang vận hành",null,null,"Điểm đại diện phục dựng."],
    ["Kênh cấp 1 Cổ Chiên","K-03","Kênh","Thạnh Phú",106.326,9.744,2019,"Đang vận hành",null,null,"Điểm đại diện phục dựng."],
    ["Điểm sạt lở Bình Thắng","SL-01","Điểm sạt lở","Bình Đại",106.730,10.126,2020,"Theo dõi",null,null,"Điểm thực địa minh họa phục dựng."],
    ["Điểm sạt lở Hàm Luông","SL-02","Điểm sạt lở","Ba Tri",106.605,9.842,2020,"Theo dõi",null,null,"Điểm thực địa minh họa phục dựng."],
    ["Điểm sạt lở Cổ Chiên","SL-03","Điểm sạt lở","Thạnh Phú",106.486,9.706,2020,"Theo dõi",null,null,"Điểm thực địa minh họa phục dựng."]
  ];
  const facilities=facilityRows.map((r,i)=>({id:`F-${String(i+1).padStart(3,"0")}`,name:r[0],code:r[1],type:r[2],district:r[3],lon:r[4],lat:r[5],yearBuilt:r[6],status:r[7],gateWidth:r[8],gateCount:r[9],note:r[10],source:"Mẫu phục dựng — không phải bản ghi PostGIS gốc",quality:"reconstructed",userRecord:false}));
  const inventory=[
    ["Cống cố định",29,148],["Trạm bơm",18,2],["Kênh cấp 1",20,65],["Kênh cấp 2, 3",20,1452],
    ["Đê bao",6,196],["Đập",9,14],["Cống tạm",27,1878],["Trạm đo thủy văn",5,31],
    ["Mực nước đỉnh triều/ngày",6,4605],["Độ mặn cao nhất/tháng",6,987],["Độ mặn cao nhất/ngày",6,5992],
    ["Ranh hành chính xã",6,164],["Ranh hành chính huyện",6,9],["Ranh hành chính tỉnh",4,1],
    ["Đường giao thông",5,5528],["Thủy hệ 2 nét",4,11671],["Thủy hệ 1 nét",4,1509],["Điểm địa danh",4,940],["Hiện trạng sử dụng đất 2015",4,41051]
  ];
  const provinceBoundary=[[9.66,106.31],[9.66,106.49],[9.77,106.63],[9.88,106.78],[10.13,106.78],[10.30,106.62],[10.35,106.39],[10.35,106.17],[10.30,106.00],[10.16,105.93],[9.90,105.96],[9.78,106.12]];
  const stats={fixedSluices:148,temporarySluices:1878,hydroStations:31,dailySalinityRows:5992,dailyWaterLevelRows:4605};
  function polygon(name,coords){return {type:"Feature",properties:{name,source:"Hình học khái quát phục dựng — không phải ranh pháp lý",quality:"reconstructed"},geometry:{type:"Polygon",coordinates:[[...coords,coords[0]]]}}}
  return {metadata,years,salinityRows,stations,districts,facilities,inventory,provinceBoundary,stats};
})();
