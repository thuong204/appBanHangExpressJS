const moment = require("moment");

/** Múi giờ Việt Nam (GMT+7) */
const VN_UTC_OFFSET = 7;

function toVN(dateLocal) {
  if (dateLocal == null || dateLocal === "") return null;
  const m = moment(dateLocal);
  if (!m.isValid()) return null;
  return m.utcOffset(VN_UTC_OFFSET);
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
