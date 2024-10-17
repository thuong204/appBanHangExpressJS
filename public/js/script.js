

const showAlert = document.querySelector("[show-alert]")
if (showAlert) {
    const closeAlert = document.querySelector("[close-alert]")
    const time = parseInt(showAlert.getAttribute("data-time"))
    setTimeout(() => {
        showAlert.classList.add("alert-hidden")
    }, time)

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

const rows = document.querySelectorAll(".button-add-quantity")
rows.forEach(row => {
    const productId = row.closest("tr").querySelector(".product-info").getAttribute("product_id")
    const decreaseButton = row.querySelector('[button-decrease]');
    const increaseButton = row.querySelector('[button-increase]');
    const quantityInput = row.querySelector('[value-quantity]');
    const itemColor = row.closest('tr').querySelector("[item-color]");
    const color = itemColor.getAttribute("value");
    decreaseButton.addEventListener("click", () => {
        const quantity = parseInt(quantityInput.value) - 1
        window.location.href = `/cart/update/${productId}?color=${color}&quantity=${quantity}`;

    })
    increaseButton.addEventListener("click", () => {
        const quantity = parseInt(quantityInput.value) + 1
        window.location.href = `/cart/update/${productId}?color=${color}&quantity=${quantity}`;
    })
    quantityInput.addEventListener("change", () => {
        window.location.href = `/cart/update/${productId}?color=${color}&quantity=${quantityInput.value}`;
    })

})
// xu li gia 

const boxschecked = document.querySelectorAll("[checkedOrder]")
const totalCart = document.querySelector("[total-cart]")
const subTotal = document.querySelector("[sub-total]")
if (boxschecked && totalCart && subTotal) {
    let total = 0
    boxschecked.forEach(box => {
        box.addEventListener("change", () => {
            if (box.checked) {
                const price = parseFloat(box.getAttribute("priceitem"))
                total += price
                box.setAttribute("name", "selectedProduct")

            }
            else {
                const price = parseFloat(box.getAttribute("priceitem"))
                console.log(price)
                total -= price
                box.removeAttribute("name")
            }
            let [integerPart, decimalPart] = total.toString().split(".");
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            totalPrice = decimalPart ? integerPart + "," + decimalPart : integerPart
            totalCart.textContent = totalPrice + 'đ'
            subTotal.textContent = totalPrice + 'đ'
        })
    })
}





document.addEventListener("DOMContentLoaded", function () {
    const showMoreButton = document.getElementById("show-more");
    const descriptionText = document.querySelector(".card-text.text-description.card-hide");

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
const mainThumbnail = document.getElementById('main-thumbnail');

// Ensure the data-images attribute is not empty
if (dataImageElement) {
    const images = JSON.parse(dataImageElement.getAttribute("data-image"))
    images.unshift(mainThumbnail.getAttribute("src"));

    if (images && images.length > 0) {
        const prevButton = document.querySelector('.btn-prev');
        const nextButton = document.querySelector('.btn-next');
        const thumbnails = document.querySelectorAll('.list-img-detail');


        // Function to update the main image's src
        const updateMainImage = (index) => {
            mainThumbnail.src = images[index];
        };

        // Handle the "Previous" button click
        prevButton.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex === 0) ? images.length - 1 : currentImageIndex - 1;
            updateMainImage(currentImageIndex);
        });

        // Handle the "Next" button click
        nextButton.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex === images.length - 1) ? 0 : currentImageIndex + 1;
            updateMainImage(currentImageIndex);
        });

        // Handle thumbnail clicks
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => {

                currentImageIndex = index;
                updateMainImage(currentImageIndex);


            });
        });
    } else {
        console.log('No images found in data-images.');
    }
} else {
    console.log('Data images element not found.');
}

//xu li item detail selected
const itemTitle = document.querySelector(".single-item-detail-title")
if (itemTitle) {
    const title = itemTitle.getAttribute("data-title")
    const slug = itemTitle.getAttribute("data-slug")
    const storages = document.querySelectorAll("li[data-storage]")
    storages.forEach(storage => {
        const data = storage.getAttribute("data-storage")
        if (title.includes(data)) {
            storage.classList.add("selected")
        }
        storage.addEventListener("click", () => {
            const storageSelected = document.querySelector(".list-item-storage .selected")
            storageSelected.classList.remove("selected")

            storage.classList.add("selected")

        })
    }
    )
    const colors = document.querySelectorAll("li[data-color]")
    colors.forEach(color => {
        const colorSelected = document.querySelector("li[data-color]")
        const inputColor = document.querySelector("#color-input")

        if (colorSelected) {
            colorSelected.classList.add("selected")
            inputColor.setAttribute("value", colorSelected.getAttribute("data-color"))

        }
        color.addEventListener("click", () => {
            const colorSelected = document.querySelector(".list-item-color .selected")
            colorSelected.classList.remove("selected")
            color.classList.add("selected")

            const colorSelectedNew = document.querySelector(".list-item-color .selected")
            inputColor.setAttribute("value", colorSelectedNew.getAttribute("data-color"))


        })
    }
    )


}
const paymentCard = document.getElementById('paymentcard');
const paymentDelivery = document.getElementById('paymentdelivery')
const buttonOrder = document.querySelector("[button-order]")
if (paymentCard && paymentDelivery) {
    paymentCard.addEventListener("change", () => {
        if (paymentCard.checked) {
            buttonOrder.disabled = true;
        }
    })
    paymentDelivery.addEventListener("change", () => {
        if (paymentDelivery.checked) {
            buttonOrder.disabled = false;
        }
    })

}
document.addEventListener("DOMContentLoaded", function () {
    const paymentCard = document.getElementById("paymentcard");
    const qrModal = new bootstrap.Modal(document.getElementById('qrModal'));

    const dataOrder = document.querySelector("[data-order]")
    const orderData = dataOrder.getAttribute("data-order");
    const order = JSON.parse(orderData);


    // Event listener for payment card option
    paymentCard.addEventListener("change", () => {
        if (paymentCard.checked) {
            qrModal.show();
        }
        setTimeout(()=>{
             setInterval(() => {
            checkPaid(order.information.addInfo, parseInt(order.information.amount));
        }, 5000)
        },10000)
       
    });
});
let isSuccess = false
const checkPaid = async (contentOrder, priceOrder) => {
    try {
        if (isSuccess) {
            return;
        } else {
            const response = await fetch("https://script.google.com/macros/s/AKfycbxgzCZpFs-LabRitVmKZ3f-dpCzuWE8OAvPpyUqKSkWTFBTO0V7ATAmQAGj63uKh0bI/exec")
            const data = await response.json();
            const lastPaid = data.data[data.data.length - 1]
            const price = lastPaid["Giá trị"]
            const content = lastPaid["Mô tả"]
            if (price >= priceOrder && content.includes(contentOrder)) {
                alert("Thanh toán thành công")
                buttonOrder.disabled = false;

                isSuccess= true
            }
            else{
                alert("Thanh toán thất bại")
            }
        }


    }
    catch (err) {
        console.log("Lỗi")
        console.log(err)
    }
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










