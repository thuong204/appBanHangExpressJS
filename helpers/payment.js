const { PayOS } = require("@payos/node");

/** URL gốc của app: localhost tự nhận, production dùng BASE_URL trong .env */
function getAppBaseUrl(req) {
  const host = req.get("host") || "";
  const isLocal =
    host.includes("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("192.168.");

  if (isLocal) {
    return `${req.protocol}://${host}`;
  }

  const fromEnv = process.env.BASE_URL?.trim().replace(/\/$/, "");
  return fromEnv || `${req.protocol}://${host}`;
}

function createPayOSClient() {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  if (!clientId || !apiKey || !checksumKey) {
    throw new Error(
      "Thiếu cấu hình payOS. Thêm PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY vào file .env"
    );
  }

  return new PayOS({ clientId, apiKey, checksumKey });
}

function generateOrderCode() {
  return Number(String(Date.now()).slice(-9));
}

async function createPayOSPayment({
  orderCode,
  amount,
  description,
  returnUrl,
  cancelUrl,
}) {
  const payos = createPayOSClient();
  const paymentLink = await payos.paymentRequests.create({
    orderCode,
    amount: Math.round(amount),
    description: String(description).slice(0, 25),
    returnUrl,
    cancelUrl,
  });

  return {
    provider: "payos",
    orderCode,
    paymentLinkId: paymentLink.paymentLinkId,
    checkoutUrl: paymentLink.checkoutUrl,
    qrCode: paymentLink.qrCode,
    image: `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(paymentLink.qrCode)}`,
    information: {
      addInfo: description,
      amount: Math.round(amount),
      accountName: paymentLink.accountName || "payOS",
      accountNo: paymentLink.accountNumber || "",
    },
  };
}

async function checkPayOSPayment(orderCode) {
  const payos = createPayOSClient();
  const info = await payos.paymentRequests.get(Number(orderCode));
  return info?.status === "PAID";
}

async function verifyPayOSWebhook(body) {
  const payos = createPayOSClient();
  return payos.webhooks.verify(body);
}

module.exports = {
  getAppBaseUrl,
  createPayOSPayment,
  checkPayOSPayment,
  verifyPayOSWebhook,
  generateOrderCode,
};
