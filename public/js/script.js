const showAlert = document.querySelector("[show-alert]");
if (showAlert) {
  const closeAlert = document.querySelector("[close-alert]");
  const time = parseInt(showAlert.getAttribute("data-time"));
  setTimeout(() => {
    showAlert.classList.add("alert-hidden");
  }, time);
}

// increase quantity
// const buttonIncrease = document.querySelectorAll("[button-increase]")
// const buttonDecrease = document.querySelectorAll("[button-decrease]")
// buttonIncrease.forEach(button => {
//     const quantity = button.closest("div").querySelector("[value-quantity]")
//     button.addEventListener("click", () => {
//         quantity.value = parseInt(quantity.value) + 1
//     })
// })
// buttonDecrease.forEach(button => {
//     const quantity = button.closest("div").querySelector("[value-quantity]")
//     button.addEventListener("click", () => {
//         quantity.value = parseInt(quantity.value) - 1
//     })
// })
// const quantityProduct = document.querySelectorAll("[value-quantity]")
// quantityProduct.forEach(quantity => {
//     quantity.addEventListener("change" , () => {
//         const price = quantity.closest("td").querySelector("[price-new]")
//         const totalPrice = quantity.closest("td").querySelector("[total-price]")
//         console.log(price)
//         console.log(totalPrice)
//     })
// })

// document.addEventListener('DOMContentLoaded', function() {
//     // Function to update total price
//     function updateTotalPrice(row, pricePerUnit, newQuantity) {
//       const totalPriceElement = row.querySelector('[total-price]');
//       const newTotalPrice = pricePerUnit * newQuantity;

//       totalPriceElement.textContent = `${newTotalPrice}$`;
//       updateCartTotal();
//     }
//     function updateCartTotal() {
//         const totalCartElement = document.querySelector('[total-cart]');
//         const subTotalElement = document.querySelector('[sub-total]');
//         let totalCart = 0;

//         document.querySelectorAll('[total-price]').forEach(element => {
//           totalCart += parseFloat(element.textContent.replace('$', ''));
//         });

//         totalCartElement.textContent = `${totalCart}$`;
//         subTotalElement.textContent = `${totalCart}$`;
//       }

//     // Get all rows in the table
//     const rows = document.querySelectorAll('table[table-info] tbody tr');
//     console.log(rows)

//     rows.forEach(row => {
//       const decreaseButton = row.querySelector('[button-decrease]');
//       const increaseButton = row.querySelector('[button-increase]');
//       const quantityInput = row.querySelector('[value-quantity]');
//       const priceElement = row.querySelector('[price-new]');

//       const pricePerUnit = parseFloat(priceElement.textContent.replace('$', ''));

//       // Decrease quantity
//       decreaseButton.addEventListener('click', () => {
//         let currentQuantity = parseInt(quantityInput.value, 10);
//         if (currentQuantity > 1) {
//           currentQuantity -= 1;
//           quantityInput.value = currentQuantity;
//           updateTotalPrice(row, pricePerUnit, currentQuantity);
//         }
//       });

//       // Increase quantity
//       increaseButton.addEventListener('click', () => {
//         let currentQuantity = parseInt(quantityInput.value, 10);
//         currentQuantity += 1;
//         quantityInput.value = currentQuantity;
//         updateTotalPrice(row, pricePerUnit, currentQuantity);
//       });

//       // Handle direct input change
//       quantityInput.addEventListener('change', () => {
//         let currentQuantity = parseInt(quantityInput.value, 10);
//         if (isNaN(currentQuantity) || currentQuantity < 1) {
//           currentQuantity = 1;
//           quantityInput.value = currentQuantity;
//         }
//         updateTotalPrice(row, pricePerUnit, currentQuantity);
//       });
//     });
//   });

const rows = document.querySelectorAll(".button-add-quantity");
rows.forEach((row) => {
  const productId = row
    .closest("tr")
    .querySelector(".product-info")
    .getAttribute("product_id");
  const decreaseButton = row.querySelector("[button-decrease]");
  const increaseButton = row.querySelector("[button-increase]");
  const quantityInput = row.querySelector("[value-quantity]");
  const itemColor = row.closest("tr").querySelector("[item-color]");
  const color = itemColor.getAttribute("value");
  decreaseButton.addEventListener("click", () => {
    const quantity = parseInt(quantityInput.value) - 1;
    window.location.href = `/cart/update/${productId}?color=${color}&quantity=${quantity}`;
  });
  increaseButton.addEventListener("click", () => {
    const quantity = parseInt(quantityInput.value) + 1;
    window.location.href = `/cart/update/${productId}?color=${color}&quantity=${quantity}`;
  });
  quantityInput.addEventListener("change", () => {
    window.location.href = `/cart/update/${productId}?color=${color}&quantity=${quantityInput.value}`;
  });
});
// xu li gia

const boxschecked = document.querySelectorAll("[checkedOrder]");
const totalCart = document.querySelector("[total-cart]");
const subTotal = document.querySelector("[sub-total]");
if (boxschecked && totalCart && subTotal) {
  let total = 0;
  boxschecked.forEach((box) => {
    box.addEventListener("change", () => {
      if (box.checked) {
        const price = parseFloat(box.getAttribute("priceitem"));
        total += price;
        box.setAttribute("name", "selectedProduct");
      } else {
        const price = parseFloat(box.getAttribute("priceitem"));
        console.log(price);
        total -= price;
        box.removeAttribute("name");
      }
      let [integerPart, decimalPart] = total.toString().split(".");
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      totalPrice = decimalPart ? integerPart + "," + decimalPart : integerPart;
      totalCart.textContent = totalPrice + "đ";
      subTotal.textContent = totalPrice + "đ";
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const showMoreButton = document.getElementById("show-more");
  const descriptionText = document.querySelector(
    ".card-text.text-description.card-hide"
  );

  if (showMoreButton) {
    showMoreButton.addEventListener("click", function () {
      descriptionText.classList.toggle("card-hide");

      if (descriptionText.classList.contains("card-hide")) {
        showMoreButton.textContent = "Xem thêm";
      } else {
        showMoreButton.textContent = "Ẩn bớt";
      }
    });
  }
});

let currentImageIndex = 0;
const dataImageElement = document.querySelector("[data-image]");
const mainThumbnail = document.getElementById("main-thumbnail");

// Ensure the data-images attribute is not empty
if (dataImageElement) {
  const images = JSON.parse(dataImageElement.getAttribute("data-image"));
  images.unshift(mainThumbnail.getAttribute("src"));

  if (images && images.length > 0) {
    const prevButton = document.querySelector(".btn-prev");
    const nextButton = document.querySelector(".btn-next");
    const thumbnails = document.querySelectorAll(".list-img-detail");

    // Function to update the main image's src
    const updateMainImage = (index) => {
      mainThumbnail.src = images[index];
    };

    // Handle the "Previous" button click
    prevButton.addEventListener("click", () => {
      currentImageIndex =
        currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
      updateMainImage(currentImageIndex);
    });

    // Handle the "Next" button click
    nextButton.addEventListener("click", () => {
      currentImageIndex =
        currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
      updateMainImage(currentImageIndex);
    });

    // Handle thumbnail clicks
    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener("click", () => {
        currentImageIndex = index;
        updateMainImage(currentImageIndex);
      });
    });
  } else {
    console.log("No images found in data-images.");
  }
} else {
  console.log("Data images element not found.");
}

//xu li item detail selected
const itemTitle = document.querySelector(".single-item-detail-title");
if (itemTitle) {
  const title = itemTitle.getAttribute("data-title");
  const slug = itemTitle.getAttribute("data-slug");
  const storages = document.querySelectorAll("li[data-storage]");
  storages.forEach((storage) => {
    const data = storage.getAttribute("data-storage");
    if (title.includes(data)) {
      storage.classList.add("selected");
    }
    storage.addEventListener("click", () => {
      const storageSelected = document.querySelector(
        ".list-item-storage .selected"
      );
      storageSelected.classList.remove("selected");

      storage.classList.add("selected");
    });
  });
  const colors = document.querySelectorAll("li[data-color]");
  colors.forEach((color) => {
    const colorSelected = document.querySelector("li[data-color]");
    const inputColor = document.querySelector("#color-input");

    if (colorSelected) {
      colorSelected.classList.add("selected");
      inputColor.setAttribute(
        "value",
        colorSelected.getAttribute("data-color")
      );
    }
    color.addEventListener("click", () => {
      const colorSelected = document.querySelector(
        ".list-item-color .selected"
      );
      colorSelected.classList.remove("selected");
      color.classList.add("selected");

      const colorSelectedNew = document.querySelector(
        ".list-item-color .selected"
      );
      inputColor.setAttribute(
        "value",
        colorSelectedNew.getAttribute("data-color")
      );
    });
  });
}

(function initProductDetailPage() {
  const section = document.querySelector(".product-detail");
  if (!section) return;

  const mainImg = section.querySelector("#main-thumbnail");
  const thumbs = section.querySelectorAll(".thumbnail-item .thumbnail-img");
  const prevBtn = section.querySelector(".btn-control.prev");
  const nextBtn = section.querySelector(".btn-control.next");

  if (mainImg && thumbs.length) {
    const images = Array.from(thumbs).map((img) => img.getAttribute("src"));
    let index = 0;

    const setActive = (i) => {
      index = i;
      mainImg.src = images[i];
      section.querySelectorAll(".thumbnail-item").forEach((el, idx) => {
        el.classList.toggle("active", idx === i);
      });
    };

    section.querySelectorAll(".thumbnail-item").forEach((item, idx) => {
      item.addEventListener("click", () => setActive(idx));
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        setActive(index === 0 ? images.length - 1 : index - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        setActive(index === images.length - 1 ? 0 : index + 1);
      });
    }
  }

  const colorInput = section.querySelector("#color-input");
  const colorBtns = section.querySelectorAll(".color-btn");
  if (colorInput && colorBtns.length) {
    const active = section.querySelector(".color-btn.active") || colorBtns[0];
    if (active) colorInput.value = active.getAttribute("data-color") || "";
    colorBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        colorBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        colorInput.value = btn.getAttribute("data-color") || "";
      });
    });
  }

  const qtyInput = section.querySelector("#quantity");
  const decBtn = section.querySelector(".quantity-btn.decrease");
  const incBtn = section.querySelector(".quantity-btn.increase");
  if (qtyInput) {
    const max = parseInt(qtyInput.getAttribute("max"), 10) || 99;
    const min = parseInt(qtyInput.getAttribute("min"), 10) || 1;
    if (decBtn) {
      decBtn.addEventListener("click", () => {
        qtyInput.value = Math.max(min, parseInt(qtyInput.value, 10) - 1 || min);
      });
    }
    if (incBtn) {
      incBtn.addEventListener("click", () => {
        qtyInput.value = Math.min(max, parseInt(qtyInput.value, 10) + 1 || min);
      });
    }
  }
})();

(function initPayOSPayment() {
  const paymentCard = document.getElementById("paymentcard");
  const paymentDelivery = document.getElementById("paymentdelivery");
  const buttonOrder = document.querySelector("[button-order]");
  const qrModalEl = document.getElementById("qrModal");
  const qrDataEl = document.getElementById("qr-payment-data");
  const payosOrderCodeInput = document.getElementById("payosOrderCode");

  if (!paymentCard || !qrModalEl || !buttonOrder || !qrDataEl) {
    return;
  }

  let isSuccess = false;
  let pollInterval = null;

  let payload;
  try {
    payload = JSON.parse(qrDataEl.textContent.trim());
  } catch (err) {
    console.error("payOS data invalid:", err);
    return;
  }

  const order = payload.qr;
  const orderCode = order?.orderCode;

  if (!orderCode) {
    console.error("Missing payOS orderCode");
    return;
  }

  const qrModal = bootstrap.Modal.getOrCreateInstance(qrModalEl);
  const successModalEl = document.getElementById("paymentSuccessModal");
  const successModal = successModalEl
    ? bootstrap.Modal.getOrCreateInstance(successModalEl)
    : null;

  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  };

  const showPaymentSuccess = () => {
    if (isSuccess) return;
    isSuccess = true;
    stopPolling();

    const qrInstance = bootstrap.Modal.getInstance(qrModalEl);
    if (qrInstance) qrInstance.hide();

    document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    if (successModal) successModal.show();
    if (payosOrderCodeInput) payosOrderCodeInput.value = orderCode;

    if (paymentDelivery) paymentDelivery.disabled = true;
    paymentCard.checked = true;
    buttonOrder.disabled = false;

    const cardLabel = document.querySelector('label[for="paymentcard"]');
    if (cardLabel && !cardLabel.querySelector(".payment-ok")) {
      const span = document.createElement("span");
      span.className = "payment-ok";
      span.style.color = "green";
      span.textContent = " (Đã thanh toán)";
      cardLabel.appendChild(span);
    }
  };

  const checkPaid = async () => {
    if (isSuccess) return;
    try {
      const response = await fetch(
        `/cart/check-payment?orderCode=${encodeURIComponent(orderCode)}`
      );
      const data = await response.json();
      if (data.paid) showPaymentSuccess();
    } catch (err) {
      console.error("checkPaid:", err);
    }
  };

  const startPolling = () => {
    if (pollInterval || isSuccess) return;
    checkPaid();
    pollInterval = setInterval(checkPaid, 3000);
  };

  paymentCard.addEventListener("change", () => {
    if (paymentCard.checked && !isSuccess) {
      buttonOrder.disabled = true;
      qrModal.show();
      startPolling();
    }
  });

  paymentDelivery.addEventListener("change", () => {
    if (paymentDelivery.checked) {
      buttonOrder.disabled = false;
      stopPolling();
    }
  });

  if (payload.payosPaid) {
    showPaymentSuccess();
  }
})();

// const countdownElement = document.getElementById('countdown');
// if (countdownElement) {
//     let timeLeft = 300;

//     const countdownInterval = setInterval(() => {
//         let minutes = Math.floor(timeLeft / 60);
//         let seconds = timeLeft % 60;

//         seconds = seconds < 10 ? '0' + seconds : seconds;

//         countdownElement.textContent = `${minutes}:${seconds}`;

//         if (timeLeft <= 0) {
//             clearInterval(countdownInterval);
//             countdownElement.textContent = 'Payment time expired.';
//             alert('The payment time has expired.');
//         }
//         timeLeft--;
//     }, 1000);
// }

// // Hàm kiểm tra trạng thái thanh toán
// const checkPaymentStatus = (orderId) => {
//     fetch(`/check-payment-status?orderId=${orderId}`)
//         .then(response => response.json())
//         .then(data => {
//             if (data.status === 'Paid') {
//                 alert('Payment successful!');
//                 // Chuyển hướng đến trang xác nhận thanh toán thành công
//                 window.location.href = '/payment-success';
//             } else {
//                 console.log('Waiting for payment...');
//             }
//         })
//         .catch(err => console.error(err));
// };

// // Kiểm tra mỗi 5 giây
// setInterval(() => checkPaymentStatus('orderId123'), 5000);

// Thêm vào cuối file views/clients/partials/footer.pug

//chat box

// ... existing code ...

//chat box

document.addEventListener("DOMContentLoaded", function () {
  const chatbotButton = document.querySelector(".chatbot-button");
  const chatbotContainer = document.querySelector(".chatbot-container");
  const chatbotClose = document.querySelector(".chatbot-close");
  const chatbotForm = document.querySelector(".chatbot-form");
  if (!chatbotButton || !chatbotContainer || !chatbotClose || !chatbotForm) return;

  const chatbotInput = chatbotForm.querySelector("input");
  const chatbotMessages = document.querySelector(".chatbot-messages");
  const chatbotBody = document.querySelector(".chatbot-body");
  if (!chatbotInput || !chatbotMessages || !chatbotBody) return;

  const STORAGE_KEY_SESSION = "chatbot_session_id";
  const STORAGE_KEY_HISTORY = "chatbot_ui_history";
  const STORAGE_KEY_OPEN = "chatbot_open";
  const MAX_UI_HISTORY = 24;

  let sessionId = sessionStorage.getItem(STORAGE_KEY_SESSION);
  if (!sessionId) {
    sessionId = "session_" + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem(STORAGE_KEY_SESSION, sessionId);
  }

  let uiHistory = [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      uiHistory = Array.isArray(parsed) ? parsed : [];
    }
  } catch (_) {
    uiHistory = [];
  }

  let isSending = false;

  function persistChatbotState() {
    try {
      sessionStorage.setItem(STORAGE_KEY_SESSION, sessionId);
      sessionStorage.setItem(
        STORAGE_KEY_HISTORY,
        JSON.stringify(uiHistory.slice(-MAX_UI_HISTORY))
      );
      sessionStorage.setItem(
        STORAGE_KEY_OPEN,
        chatbotContainer.classList.contains("active") ? "1" : "0"
      );
    } catch (_) {
      /* quota / private mode */
    }
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function stripProductDetailPaths(text, suggestions) {
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return String(text || "");
    }
    let t = String(text || "");
    for (const s of suggestions) {
      const slug = s.slug;
      if (!slug) continue;
      const path = `/products/detail/${slug}`;
      const pathRe = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      t = t.replace(new RegExp(`\\s*:\\s*${pathRe}`, "gi"), "");
      t = t.replace(new RegExp(pathRe, "gi"), "");
    }
    return t
      .replace(/[ \t]+(\n|$)/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function renderInline(text) {
    const escaped = escapeHtml(text);
    const withHttps = escaped.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    return withHttps
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.+?)`/g, "<code>$1</code>");
  }

  function renderProductCards(suggestions) {
    if (!Array.isArray(suggestions) || suggestions.length === 0) return "";
    const cards = suggestions
      .map((s) => {
        const href = escapeHtml(s.href || "");
        const title = escapeHtml(s.title || "");
        const thumb = s.thumbnail
          ? `<img src="${escapeHtml(s.thumbnail)}" alt="" loading="lazy" decoding="async" />`
          : '<div class="chatbot-row-noimg" aria-hidden="true"><i class="fas fa-image"></i></div>';
        return (
          `<a class="chatbot-product-row" href="${href}">` +
          `<div class="chatbot-product-row__media">${thumb}</div>` +
          `<div class="chatbot-product-row__body">` +
          `<span class="chatbot-product-row__title">${title}</span>` +
          `<span class="chatbot-product-row__cta">Xem chi tiết <i class="fas fa-chevron-right"></i></span>` +
          `</div></a>`
        );
      })
      .join("");
    return `<div class="chatbot-product-list">${cards}</div>`;
  }

  function parseMarkdownToHtml(raw) {
    const src = String(raw || "").replace(/\r\n/g, "\n").trim();
    if (!src) return "<p>...</p>";

    const lines = src.split("\n");
    let i = 0;
    const out = [];

    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) {
        i += 1;
        continue;
      }

      if (/^\|.+\|$/.test(line) && i + 1 < lines.length && /^\|[-:\s|]+\|$/.test(lines[i + 1].trim())) {
        const tableLines = [];
        while (i < lines.length && /^\|.+\|$/.test(lines[i].trim())) {
          tableLines.push(lines[i].trim());
          i += 1;
        }

        if (tableLines.length >= 2) {
          const headers = tableLines[0]
            .split("|")
            .slice(1, -1)
            .map((c) => `<th>${renderInline(c.trim())}</th>`)
            .join("");
          const bodyRows = tableLines
            .slice(2)
            .map((row) => {
              const cols = row
                .split("|")
                .slice(1, -1)
                .map((c) => `<td>${renderInline(c.trim())}</td>`)
                .join("");
              return `<tr>${cols}</tr>`;
            })
            .join("");
          out.push(`<div class="chat-table-wrap"><table><thead><tr>${headers}</tr></thead><tbody>${bodyRows}</tbody></table></div>`);
          continue;
        }
      }

      if (/^###\s+/.test(line)) {
        out.push(`<h4>${renderInline(line.replace(/^###\s+/, ""))}</h4>`);
        i += 1;
        continue;
      }
      if (/^##\s+/.test(line)) {
        out.push(`<h3>${renderInline(line.replace(/^##\s+/, ""))}</h3>`);
        i += 1;
        continue;
      }
      if (/^#\s+/.test(line)) {
        out.push(`<h2>${renderInline(line.replace(/^#\s+/, ""))}</h2>`);
        i += 1;
        continue;
      }

      if (/^[-*]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          items.push(`<li>${renderInline(lines[i].trim().replace(/^[-*]\s+/, ""))}</li>`);
          i += 1;
        }
        out.push(`<ul>${items.join("")}</ul>`);
        continue;
      }

      const chunk = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^#\s+|^##\s+|^###\s+|^[-*]\s+|^\|.+\|$/.test(lines[i].trim())
      ) {
        chunk.push(lines[i].trim());
        i += 1;
      }
      out.push(`<p>${renderInline(chunk.join("<br>"))}</p>`);
    }

    return out.join("");
  }

  function scrollChatToBottom() {
    const el = chatbotBody;
    if (!el) return;
    const run = () => {
      el.scrollTop = el.scrollHeight;
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
    // Sau animation mở panel (~0.3s) và ảnh sản phẩm load muộn
    setTimeout(run, 320);
    setTimeout(run, 700);
  }

  function bindImagesScrollToBottom(container) {
    if (!container) return;
    container.querySelectorAll("img").forEach((img) => {
      if (img.complete) return;
      img.addEventListener("load", scrollChatToBottom, { once: true });
      img.addEventListener("error", scrollChatToBottom, { once: true });
    });
  }

  function createMessage(content, isUser = false, productSuggestions) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message-chat ${isUser ? "user" : "bot"}`;

    const wrapper = document.createElement("div");
    wrapper.className = "message-content";
    if (isUser) {
      wrapper.innerHTML = `<p>${escapeHtml(content)}</p>`;
    } else {
      const hasCards = Array.isArray(productSuggestions) && productSuggestions.length > 0;
      const bodyText = hasCards ? stripProductDetailPaths(content, productSuggestions) : content;
      const extras = hasCards ? renderProductCards(productSuggestions) : "";
      wrapper.innerHTML = parseMarkdownToHtml(bodyText) + extras;
    }
    messageDiv.appendChild(wrapper);
    bindImagesScrollToBottom(wrapper);
    return messageDiv;
  }

  function addMessage(content, isUser = false, productSuggestions, skipHistory = false) {
    const msg = createMessage(content, isUser, productSuggestions);
    chatbotMessages.appendChild(msg);
    scrollChatToBottom();
    if (!skipHistory) {
      const entry = {
        role: isUser ? "user" : "assistant",
        content: String(content || ""),
      };
      if (!isUser && Array.isArray(productSuggestions) && productSuggestions.length) {
        entry.productSuggestions = productSuggestions;
      }
      uiHistory.push(entry);
      if (uiHistory.length > MAX_UI_HISTORY) {
        uiHistory = uiHistory.slice(-MAX_UI_HISTORY);
      }
      persistChatbotState();
    }
  }

  uiHistory.forEach((h) => {
    if (h.role === "user") {
      addMessage(h.content, true, undefined, true);
    } else {
      addMessage(h.content, false, h.productSuggestions, true);
    }
  });

  scrollChatToBottom();

  if (sessionStorage.getItem(STORAGE_KEY_OPEN) === "1") {
    chatbotContainer.classList.add("active");
    if (chatbotMessages.children.length === 0) {
      addMessage("Xin chào! Mình là trợ lý AI của Vô Thường. Bạn cần tư vấn sản phẩm nào?");
    } else {
      scrollChatToBottom();
    }
  }

  function createTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "message-chat bot typing-message";
    indicator.innerHTML =
      '<div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
    return indicator;
  }

  async function sendMessageToAPI(message) {
    if (isSending) return;
    isSending = true;
    const typingIndicator = createTypingIndicator();
    chatbotMessages.appendChild(typingIndicator);
    scrollChatToBottom();
    chatbotInput.disabled = true;

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
      });

      if (!response.ok) {
        let errorMsg = "Không thể kết nối đến chatbot.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (_) {
          /* ignore parse error */
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      addMessage(
        data.response || "Mình chưa có dữ liệu phù hợp, bạn thử mô tả rõ hơn nhé.",
        false,
        data.productSuggestions
      );
    } catch (error) {
      console.error("Chatbot error:", error);
      addMessage("Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau hoặc gọi hotline 1900 1234.");
    } finally {
      if (typingIndicator.parentNode) typingIndicator.parentNode.removeChild(typingIndicator);
      chatbotInput.disabled = false;
      chatbotInput.focus();
      isSending = false;
    }
  }

  chatbotButton.addEventListener("click", function () {
    chatbotContainer.classList.toggle("active");
    persistChatbotState();
    if (chatbotContainer.classList.contains("active")) {
      chatbotInput.focus();
      if (chatbotMessages.children.length === 0) {
        addMessage("Xin chào! Mình là trợ lý AI của Vô Thường. Bạn cần tư vấn sản phẩm nào?");
      }
      scrollChatToBottom();
    }
  });

  chatbotClose.addEventListener("click", function () {
    chatbotContainer.classList.remove("active");
    persistChatbotState();
  });

  chatbotForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const message = chatbotInput.value.trim();
    if (!message || isSending) return;
    addMessage(message, true);
    chatbotInput.value = "";
    sendMessageToAPI(message);
  });

  chatbotInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatbotForm.dispatchEvent(new Event("submit"));
    }
  });
});
