/*
 * Cấu hình tích hợp production. Bản GitHub Pages mặc định KHÔNG gọi backend cũ.
 * Khi có GeoServer/API mới, sao chép cấu hình này và bật enabled=true.
 */
window.TLBT_CONFIG = {
  mode: "static-research",
  backend: {
    enabled: false,
    apiBase: "",
    geoserverWms: "",
    geoserverWfs: "",
    workspace: ""
  }
};
