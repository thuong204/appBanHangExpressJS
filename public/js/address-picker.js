// Chọn địa chỉ giao hàng: Tỉnh/Thành → Phường/Xã → địa chỉ chi tiết + ghim trên bản đồ (Leaflet/OSM)
(function initAddressPicker() {
  const root = document.querySelector("[data-address-picker]");
  if (!root) return;

  const provinceSelect = root.querySelector("#provinceCode");
  const wardSelect = root.querySelector("#wardCode");
  const detailInput = root.querySelector("#addressDetail");
  const latInput = root.querySelector("#lat");
  const lngInput = root.querySelector("#lng");
  const statusEl = root.querySelector("[data-map-status]");
  const locateBtn = root.querySelector("[data-locate-me]");
  const mapEl = root.querySelector("#delivery-map");

  const NOMINATIM = "https://nominatim.openstreetmap.org";
  const byName = (a, b) => a.localeCompare(b, "vi");
  let provinces = [];

  const setStatus = (text) => {
    if (statusEl) statusEl.textContent = text;
  };

  const fillSelect = (select, placeholder, items) => {
    select.innerHTML = "";
    select.append(new Option(placeholder, ""));
    items.forEach(([value, label]) => select.append(new Option(label, value)));
  };

  // ---- Nominatim: tối đa 1 request/giây theo chính sách sử dụng ----
  let lastRequest = 0;
  const nominatim = async (path, params) => {
    const wait = Math.max(0, lastRequest + 1100 - Date.now());
    if (wait) await new Promise((r) => setTimeout(r, wait));
    lastRequest = Date.now();
    const query = new URLSearchParams({ format: "jsonv2", "accept-language": "vi", ...params });
    const response = await fetch(`${NOMINATIM}/${path}?${query}`);
    if (!response.ok) throw new Error(`Nominatim ${response.status}`);
    return response.json();
  };

  const searchArea = async (text) => {
    try {
      const results = await nominatim("search", { q: text, countrycodes: "vn", limit: 1 });
      return results[0] || null;
    } catch (err) {
      console.warn("searchArea:", err);
      return null;
    }
  };

  // ---- Bản đồ ----
  const hasLeaflet = typeof window.L !== "undefined" && mapEl;
  let map = null;
  let marker = null;

  if (hasLeaflet) {
    map = L.map(mapEl, { scrollWheelZoom: false }).setView([16.2, 107.0], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    map.on("click", (e) => placeMarker(e.latlng, { lookup: true }));
  } else if (mapEl) {
    mapEl.closest(".map-picker").hidden = true;
  }

  const describeAddress = (data) => {
    const a = (data && data.address) || {};
    const street = [a.house_number, a.road].filter(Boolean).join(" ");
    return { street, label: data && data.display_name ? data.display_name : "" };
  };

  let reverseTimer = null;
  const reverseLookup = (latlng) => {
    clearTimeout(reverseTimer);
    reverseTimer = setTimeout(async () => {
      setStatus("Đang xác định địa chỉ...");
      try {
        const data = await nominatim("reverse", { lat: latlng.lat, lon: latlng.lng, zoom: 18 });
        const { street, label } = describeAddress(data);
        setStatus(label ? `Vị trí đã ghim: ${label}` : "Đã ghim vị trí giao hàng.");
        // Chỉ gợi ý khi khách chưa tự nhập địa chỉ chi tiết
        if (street && !detailInput.value.trim()) {
          detailInput.value = street;
        }
      } catch (err) {
        setStatus("Đã ghim vị trí giao hàng.");
      }
    }, 400);
  };

  function placeMarker(latlng, { lookup = false, zoom } = {}) {
    if (!map) return;
    if (!marker) {
      marker = L.marker(latlng, { draggable: true, autoPan: true }).addTo(map);
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        savePosition(pos);
        reverseLookup(pos);
      });
    } else {
      marker.setLatLng(latlng);
    }
    if (zoom) map.setView(latlng, zoom);
    savePosition(latlng);
    if (lookup) reverseLookup(latlng);
  }

  function savePosition(latlng) {
    latInput.value = latlng.lat.toFixed(6);
    lngInput.value = latlng.lng.toFixed(6);
  }

  const flyToArea = async (text, zoom) => {
    if (!map) return;
    const place = await searchArea(text);
    // Chỉ di chuyển khung nhìn; không tự đặt ghim vì tâm phường/xã không phải điểm giao
    if (place && !marker) {
      map.setView([Number(place.lat), Number(place.lon)], zoom);
    }
  };

  // ---- Tỉnh / Phường ----
  const currentProvince = () => provinces.find((p) => String(p.code) === provinceSelect.value);

  provinceSelect.addEventListener("change", () => {
    const province = currentProvince();
    if (!province) {
      fillSelect(wardSelect, "Chọn tỉnh/thành trước", []);
      wardSelect.disabled = true;
      return;
    }
    const wards = [...province.wards].sort((a, b) => byName(a[1], b[1]));
    fillSelect(wardSelect, `Chọn phường/xã (${wards.length})`, wards);
    wardSelect.disabled = false;
    flyToArea(`${province.name}, Việt Nam`, 10);
  });

  wardSelect.addEventListener("change", () => {
    const province = currentProvince();
    const wardName = wardSelect.selectedOptions[0]?.textContent;
    if (province && wardSelect.value) {
      flyToArea(`${wardName}, ${province.name}, Việt Nam`, 15);
      detailInput.focus();
    }
  });

  // ---- Vị trí hiện tại ----
  const GEO_ERRORS = {
    1: "Trình duyệt đang chặn quyền vị trí. Bấm biểu tượng ổ khoá cạnh thanh địa chỉ → Vị trí → Cho phép, rồi thử lại.",
    2: "Thiết bị không xác định được vị trí (máy tính thường không có GPS). Hãy bật định vị hoặc chạm vào bản đồ để ghim.",
    3: "Lấy vị trí quá lâu. Hãy thử lại hoặc chạm vào bản đồ để ghim.",
  };

  const getPosition = (options) =>
    new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, options));

  const locate = async () => {
    try {
      // Thử GPS chính xác cao trước; máy không có GPS thì lùi về định vị qua mạng
      return await getPosition({ enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });
    } catch (err) {
      if (err.code === 1) throw err;
      return getPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
    }
  };

  if (locateBtn) {
    if (!navigator.geolocation || !map) {
      locateBtn.hidden = true;
    } else {
      locateBtn.addEventListener("click", async () => {
        // Trình duyệt chỉ cho dùng GPS trên HTTPS hoặc localhost
        if (!window.isSecureContext) {
          setStatus("Định vị chỉ hoạt động khi website chạy HTTPS. Bạn hãy chạm vào bản đồ để ghim vị trí.");
          return;
        }
        locateBtn.disabled = true;
        setStatus("Đang lấy vị trí của bạn...");
        try {
          const pos = await locate();
          placeMarker(L.latLng(pos.coords.latitude, pos.coords.longitude), { lookup: true, zoom: 17 });
        } catch (err) {
          console.warn("geolocation error:", err.code, err.message);
          setStatus(GEO_ERRORS[err.code] || "Không lấy được vị trí. Hãy chạm vào bản đồ để ghim.");
        } finally {
          locateBtn.disabled = false;
        }
      });
    }
  }

  // ---- Tải dữ liệu tỉnh/xã ----
  fetch(root.dataset.source)
    .then((r) => r.json())
    .then((data) => {
      provinces = data;
      fillSelect(
        provinceSelect,
        "Chọn tỉnh/thành phố",
        [...data].sort((a, b) => byName(a.name, b.name)).map((p) => [p.code, p.name])
      );
    })
    .catch(() => {
      fillSelect(provinceSelect, "Không tải được danh sách, vui lòng tải lại trang", []);
    });
})();
