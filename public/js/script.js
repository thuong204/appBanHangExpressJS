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
let isSuccess = false;
document.addEventListener("DOMContentLoaded", function () {
  const paymentCard = document.getElementById("paymentcard");
  const qrModal = new bootstrap.Modal(document.getElementById("qrModal"));

  const dataOrder = document.querySelector("[data-order]");
  const orderData = dataOrder.getAttribute("data-order");
  const order = JSON.parse(orderData);

  // Event listener for payment card option
  paymentCard.addEventListener("change", () => {
    if (paymentCard.checked && isSuccess == false) {
      qrModal.show();
    }
    setTimeout(() => {
      setInterval(() => {
        checkPaid(
          order.information.addInfo,
          parseInt(order.information.amount)
        );
      }, 4000);
    }, 3000);
  });
});
const checkPaid = async (contentOrder, priceOrder) => {
  try {
    if (isSuccess) {
      return;
    } else {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxgzCZpFs-LabRitVmKZ3f-dpCzuWE8OAvPpyUqKSkWTFBTO0V7ATAmQAGj63uKh0bI/exec"
      );
      const data = await response.json();
      const lastPaid = data.data[data.data.length - 1];
      const price = lastPaid["Giá trị"];
      const content = lastPaid["Mô tả"];
      if (price >= priceOrder && content.includes(contentOrder)) {
        const qrModal = new bootstrap.Modal(document.getElementById("qrModal"));
        const qrModalElement = document.getElementById("qrModal");
        qrModalElement.style.display = "none";
        qrModalElement.classList.remove("fade", "show");
        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) {
          backdrop.remove();
        }
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";

        var paymentModal = new bootstrap.Modal(
          document.getElementById("paymentSuccessModal")
        );
        paymentModal.show();
        document.getElementById("paymentdelivery").disabled = true;
        document.getElementById("paymentcard").checked = true;

        buttonOrder.disabled = false;
        var cardLabel = document.querySelector('label[for="paymentcard"]');
        cardLabel.innerHTML +=
          ' <span style="color: green;">(Thành công)</span>';
        isSuccess = true;
      }
    }
  } catch (err) {
    console.log("Lỗi");
    console.log(err);
    return;
  }
};
const paymentCard = document.getElementById("paymentcard");
const paymentDelivery = document.getElementById("paymentdelivery");
const buttonOrder = document.querySelector("[button-order]");
if (paymentCard && paymentDelivery) {
  paymentCard.addEventListener("change", () => {
    if (paymentCard.checked) {
      buttonOrder.disabled = true;
      if (isSuccess) {
        buttonOrder.disabled = false;
      }
    }
  });
  paymentDelivery.addEventListener("change", () => {
    if (paymentDelivery.checked) {
      buttonOrder.disabled = false;
    }
  });
}

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
  const chatbotInput = chatbotForm.querySelector("input");
  const chatbotMessages = document.querySelector(".chatbot-messages");
  const chatbotBody = document.querySelector(".chatbot-body");

  // Generate a unique session ID for this chat session
  const sessionId = "session_" + Math.random().toString(36).substring(2, 15);

  // Hàm tạo tin nhắn
  function createMessage(content, isUser = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message-chat ${isUser ? "user" : "bot"}`;
    messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${content}</p>
                </div>
            `;
    return messageDiv;
  }

  // Hàm thêm tin nhắn vào chat
  function addMessage(content, isUser = false) {
    const message = createMessage(content, isUser);
    chatbotMessages.appendChild(message);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
  }

  // Hàm xử lý tin nhắn thông qua API Gemini
  async function sendMessageToAPI(message) {
    try {
      // Hiển thị trạng thái đang gõ
      const typingIndicator = createMessage("...", false);
      chatbotMessages.appendChild(typingIndicator);
      chatbotBody.scrollTop = chatbotBody.scrollHeight;

      // Gọi API
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          sessionId: sessionId,
        }),
      });

      // Xoá dấu hiệu đang gõ
      chatbotMessages.removeChild(typingIndicator);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể kết nối đến chat bot");
      }

      const data = await response.json();
      addMessage(data.response);
    } catch (error) {
      console.error("Chatbot error:", error);
      addMessage(
        "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau hoặc liên hệ hotline 1900 1234."
      );
    }
  }

  // Xử lý sự kiện click vào nút chat
  chatbotButton.addEventListener("click", function () {
    chatbotContainer.classList.toggle("active");
    if (chatbotContainer.classList.contains("active")) {
      chatbotInput.focus();
    }
  });

  // Xử lý sự kiện đóng chat
  chatbotClose.addEventListener("click", function () {
    chatbotContainer.classList.remove("active");
  });

  // Xử lý form gửi tin nhắn
  chatbotForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const message = chatbotInput.value.trim();
    console.log(message);

    if (!message) {
      // Don't submit empty messages
      return;
    }

    // Thêm tin nhắn của user
    addMessage(message, true);

    // Gửi tin nhắn đến API
    sendMessageToAPI(message);

    // Xóa nội dung input
    chatbotInput.value = "";
  });

  // Thêm tin nhắn chào mừng khi mở chat
  chatbotButton.addEventListener("click", function () {
    if (
      chatbotContainer.classList.contains("active") &&
      chatbotMessages.children.length === 0
    ) {
      setTimeout(() => {
        addMessage(
          "Xin chào! Tôi là trợ lý ảo của cửa hàng Vô Thường. Tôi có thể giúp gì cho bạn?"
        );
      }, 300);
    }
  });

  // Xử lý phím Enter
  chatbotInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatbotForm.dispatchEvent(new Event("submit"));
    }
  });
});
