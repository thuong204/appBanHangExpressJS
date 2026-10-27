const path = require("path")

// Dữ liệu 34 tỉnh/thành và phường/xã sau sáp nhập (01/07/2025),
// nguồn provinces.open-api.vn/api/v2. File cũng được trang đặt hàng tải về.
const PROVINCES = require(path.join(__dirname, "../public/data/vn-address.json"))

/** Tra tên tỉnh và phường/xã theo mã; trả về null nếu mã không hợp lệ */
module.exports.resolve = (provinceCode, wardCode) => {
    const province = PROVINCES.find(p => String(p.code) === String(provinceCode))
    if (!province) return null
    const ward = province.wards.find(([code]) => String(code) === String(wardCode))
    if (!ward) return null
    return { province: province.name, provinceCode: province.code, ward: ward[1], wardCode: ward[0] }
}

/** Toạ độ hợp lệ trong khung lãnh thổ Việt Nam (kể cả biển đảo), ngược lại null */
module.exports.parseLocation = (lat, lng) => {
    const la = Number(lat)
    const ln = Number(lng)
    if (!Number.isFinite(la) || !Number.isFinite(ln)) return null
    if (la < 7 || la > 24 || ln < 101 || ln > 118) return null
    return { lat: Math.round(la * 1e6) / 1e6, lng: Math.round(ln * 1e6) / 1e6 }
}
