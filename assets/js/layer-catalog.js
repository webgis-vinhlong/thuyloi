window.TL_LAYER_CATALOG = {
  version: "4.0.0",
  project: "WebGIS Thủy lợi Vĩnh Long",
  datasetLabel: "Snapshot hạ tầng · thuy_loi",
  sourceRepo: "webgis-vinhlong/layer",
  sourceCommit: "a93ebf004b04f79d90a199d22a139dab7479895c",
  sourcePortal: "https://hatang.vinhlong.gov.vn/map-thuy-loi",
  totalFeatures: 321,
  coordinateSystem: "EPSG:4326",
  layers: [
    {id:260,key:"kttv",name:"Trạm khí tượng thủy văn",count:24,geometry:"Point",color:"#0b74b5",icon:"kttv",file:"260.geojson"},
    {id:248,key:"tram-bom",name:"Hệ thống trạm bơm",count:3,geometry:"Point",color:"#5b5bd6",icon:"pump",file:"248.geojson"},
    {id:252,key:"dap",name:"Đập",count:3,geometry:"Point",color:"#7c5b32",icon:"dam",file:"252.geojson"},
    {id:261,key:"cong",name:"Cống các loại",count:53,geometry:"Point",color:"#e36b2c",icon:"gate",file:"261.geojson"},
    {id:245,key:"cap-nuoc",name:"Trạm cấp nước tư nhân",count:11,geometry:"Point",color:"#00a6a6",icon:"water",file:"245.geojson"},
    {id:249,key:"kenh",name:"Kênh",count:59,geometry:"LineString",color:"#1689c9",icon:"canal",file:"249.geojson"},
    {id:250,key:"ke",name:"Kè",count:10,geometry:"LineString",color:"#4f7f6f",icon:"revetment",file:"250.geojson"},
    {id:251,key:"de",name:"Đê",count:121,geometry:"LineString",color:"#8b6b3f",icon:"levee",file:"251.geojson"},
    {id:247,key:"sat-lo",name:"Vị trí sạt lở",count:37,geometry:"LineString",color:"#c53b45",icon:"landslide",file:"247.geojson"}
  ].map(layer => ({
    ...layer,
    url: `https://cdn.jsdelivr.net/gh/webgis-vinhlong/layer@a93ebf004b04f79d90a199d22a139dab7479895c/data/geojson/${layer.file}`
  }))
};