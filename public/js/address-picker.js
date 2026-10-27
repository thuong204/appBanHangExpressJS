// Chọn địa chỉ giao hàng: Tỉnh/Thành → Phường/Xã → địa chỉ chi tiết, kèm bản đồ Google nhúng (không cần API key).
// Bản đồ dùng hl=vi, gl=VN để hiển thị đúng chủ quyền Hoàng Sa, Trường Sa.
// Bản đồ chỉ để xem, tự cập nhật theo địa chỉ khách nhập.
(function initAddressPicker() {
  const root = document.querySelector("[data-address-picker]");
  if (!root) return;

  const provinceSelect = root.querySelector("#provinceCode");
  const wardSelect = root.querySelector("#wardCode");
  const detailInput = root.querySelector("#addressDetail");
  const mapFrame = root.querySelector("#delivery-map");

  const byName = (a, b) => a.localeCompare(b, "vi");
  let provinces = [];

  const fillSelect = (select, placeholder, items) => {
    select.innerHTML = "";
    select.append(new Option(placeholder, ""));
    items.forEach(([value, label]) => select.append(new Option(label, value)));
  };

  // ---- Bản đồ nhúng ----
  const showOnMap = (query, zoom) => {
    if (!mapFrame) return;
    const params = new URLSearchParams({ q: query, hl: "vi", gl: "VN", z: String(zoom), output: "embed" });
    const src = `https://maps.google.com/maps?${params}`;
    if (mapFrame.src !== src) mapFrame.src = src;
  };

  const currentProvince = () => provinces.find((p) => String(p.code) === provinceSelect.value);
  const currentWard = () => (wardSelect.value ? wardSelect.selectedOptions[0]?.textContent : "");

  // Hiện địa chỉ khách đang nhập, chi tiết nhất có thể
  const updateMapFromAddress = () => {
    const province = currentProvince();
    if (!province) return showOnMap("Việt Nam", 5);
    const ward = currentWard();
    const detail = detailInput.value.trim();
    const parts = [detail, ward, province.name, "Việt Nam"].filter(Boolean);
    showOnMap(parts.join(", "), detail ? 17 : ward ? 15 : 11);
  };

  // ---- Tỉnh / Phường / Địa chỉ chi tiết ----
  provinceSelect.addEventListener("change", () => {
    const province = currentProvince();
    if (!province) {
      fillSelect(wardSelect, "Chọn tỉnh/thành trước", []);
      wardSelect.disabled = true;
    } else {
      const wards = [...province.wards].sort((a, b) => byName(a[1], b[1]));
      fillSelect(wardSelect, `Chọn phường/xã (${wards.length})`, wards);
      wardSelect.disabled = false;
    }
    updateMapFromAddress();
  });

  wardSelect.addEventListener("change", () => {
    updateMapFromAddress();
    if (wardSelect.value) detailInput.focus();
  });

  let typingTimer = null;
  detailInput.addEventListener("input", () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(updateMapFromAddress, 800);
  });

  // ---- Gợi ý địa chỉ chi tiết (Photon, dữ liệu OpenStreetMap, không cần key) ----
  const PHOTON = "https://photon.komoot.io/api/";
  const listEl = root.querySelector("#address-suggestions");
  const areaCenters = new Map(); // "Phường X, Tỉnh Y" -> {lat, lon}
  let suggestions = [];
  let activeIndex = -1;
  let suggestTimer = null;
  let suggestAbort = null;

  const photon = async (params, signal) => {
    // lang=default: luôn trả tên địa phương (tiếng Việt), không theo ngôn ngữ trình duyệt
    const query = new URLSearchParams({ limit: "6", lang: "default", ...params });
    const response = await fetch(`${PHOTON}?${query}`, { signal });
    if (!response.ok) throw new Error(`Photon ${response.status}`);
    return (await response.json()).features || [];
  };

  // Toạ độ phường/xã (hoặc tỉnh) đang chọn để ưu tiên gợi ý gần khu vực đó
  const areaCenter = async () => {
    const province = currentProvince();
    if (!province) return null;
    const area = [currentWard(), province.name].filter(Boolean).join(", ");
    if (!areaCenters.has(area)) {
      const [hit] = await photon({ q: `${area}, Việt Nam`, limit: "1" }).catch(() => []);
      areaCenters.set(area, hit ? { lat: hit.geometry.coordinates[1], lon: hit.geometry.coordinates[0] } : null);
    }
    return areaCenters.get(area);
  };

  const describe = (feature) => {
    const p = feature.properties || {};
    const main = [p.housenumber, p.name || p.street].filter(Boolean).join(" ");
    const sub = [p.name && p.street && p.name !== p.street ? p.street : "", p.district, p.city || p.county, p.state]
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .join(", ");
    return { main, sub };
  };

  const closeSuggestions = () => {
    suggestions = [];
    activeIndex = -1;
    listEl.hidden = true;
    listEl.innerHTML = "";
    detailInput.setAttribute("aria-expanded", "false");
    detailInput.removeAttribute("aria-activedescendant");
  };

  const highlight = (index) => {
    activeIndex = index;
    [...listEl.querySelectorAll("[role=option]")].forEach((el, i) => {
      el.classList.toggle("active", i === index);
      el.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    if (index >= 0) detailInput.setAttribute("aria-activedescendant", `address-option-${index}`);
  };

  const choose = (index) => {
    const item = suggestions[index];
    if (!item) return;
    detailInput.value = item.main;
    closeSuggestions();
    updateMapFromAddress();
  };

  const renderSuggestions = () => {
    listEl.innerHTML = "";
    suggestions.forEach((item, i) => {
      const li = document.createElement("li");
      li.id = `address-option-${i}`;
      li.setAttribute("role", "option");
      const main = document.createElement("strong");
      main.textContent = item.main;
      const sub = document.createElement("small");
      sub.textContent = item.sub;
      li.append(main, sub);
      // mousedown thay vì click để chọn trước khi ô nhập mất focus
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        choose(i);
      });
      listEl.append(li);
    });
    const credit = document.createElement("li");
    credit.className = "address-suggest-credit";
    credit.textContent = "Gợi ý từ dữ liệu © OpenStreetMap";
    listEl.append(credit);
    listEl.hidden = false;
    detailInput.setAttribute("aria-expanded", "true");
    highlight(-1);
  };

  const fetchSuggestions = async () => {
    const text = detailInput.value.trim();
    if (text.length < 3) return closeSuggestions();
    if (suggestAbort) suggestAbort.abort();
    suggestAbort = new AbortController();
    try {
      const center = await areaCenter();
      const features = await photon(
        { q: text, ...(center ? { lat: center.lat, lon: center.lon } : {}) },
        suggestAbort.signal
      );
      const seen = new Set();
      suggestions = features
        .filter((f) => (f.properties || {}).countrycode === "VN")
        .map(describe)
        .filter((item) => item.main && !seen.has(item.main + item.sub) && seen.add(item.main + item.sub));
      if (detailInput.value.trim() !== text) return; // khách đã gõ tiếp
      suggestions.length ? renderSuggestions() : closeSuggestions();
    } catch (err) {
      if (err.name !== "AbortError") closeSuggestions();
    }
  };

  detailInput.addEventListener("input", () => {
    clearTimeout(suggestTimer);
    suggestTimer = setTimeout(fetchSuggestions, 300);
  });

  detailInput.addEventListener("keydown", (e) => {
    if (listEl.hidden || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      highlight((activeIndex + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      highlight(activeIndex <= 0 ? suggestions.length - 1 : activeIndex - 1);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault(); // chọn gợi ý, không gửi form
      choose(activeIndex);
    } else if (e.key === "Escape") {
      closeSuggestions();
    }
  });

  detailInput.addEventListener("blur", () => setTimeout(closeSuggestions, 150));

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
