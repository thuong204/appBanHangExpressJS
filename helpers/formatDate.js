const moment = require("moment");

/** Múi giờ Việt Nam (GMT+7) */
const VN_UTC_OFFSET = 7;

const LEGACY_FORMATS = [
  "M/D/YYYY, h:mm:ss A",
  "D/M/YYYY, h:mm:ss A",
  "DD/MM/YYYY, h:mm:ss A",
  "DD/MM/YYYY HH:mm:ss",
  moment.ISO_8601,
];

function toVN(dateLocal) {
  if (dateLocal == null || dateLocal === "") return null;

  // Date / timestamp MongoDB → instant UTC
  if (dateLocal instanceof Date) {
    return moment.utc(dateLocal.getTime()).utcOffset(VN_UTC_OFFSET);
  }
  if (typeof dateLocal === "number") {
    return moment.utc(dateLocal).utcOffset(VN_UTC_OFFSET);
  }

  const str = String(dateLocal).trim();
  if (!str) return null;

  // ISO có Z hoặc dạng 2026-05-27T04:12:05.000Z
  if (/^\d{4}-\d{2}-\d{2}T/.test(str) || str.endsWith("Z")) {
    const iso = moment.utc(str);
    if (iso.isValid()) return iso.utcOffset(VN_UTC_OFFSET);
  }

  // Chuỗi locale cũ từ toLocaleString()
  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const first = Number(slashMatch[1]);
    const second = Number(slashMatch[2]);
    if (first > 12) {
      // D/M/YYYY — giờ Việt Nam đã đúng trên chuỗi (vd: 27/5/2026, 11:12:05 AM)
      const vnLocal = moment(str, LEGACY_FORMATS, true);
      if (vnLocal.isValid()) {
        return vnLocal.utcOffset(VN_UTC_OFFSET, true);
      }
    }
    // M/D/YYYY — chuỗi en-US từ server UTC (vd: 5/27/2026, 4:12:05 AM → 11:12 VN)
    const enUtc = moment.utc(str, LEGACY_FORMATS, true);
    if (enUtc.isValid()) {
      return enUtc.utcOffset(VN_UTC_OFFSET);
    }
  }

  const fallback = moment.utc(str);
  return fallback.isValid() ? fallback.utcOffset(VN_UTC_OFFSET) : null;
}

/** DD/MM/YYYY HH:mm:ss (GMT+7) */
module.exports = (dateLocal) => {
  const m = toVN(dateLocal);
  if (!m) return "";
  return m.format("DD/MM/YYYY HH:mm:ss");
};

module.exports.dateOnly = (dateLocal) => {
  const m = toVN(dateLocal);
  if (!m) return "";
  return m.format("DD/MM/YYYY");
};

module.exports.timeOnly = (dateLocal) => {
  const m = toVN(dateLocal);
  if (!m) return "";
  return m.format("HH:mm:ss");
};
