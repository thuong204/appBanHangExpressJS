

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
    decreaseButton.addEventListener("click",() =>{
        const quantity = parseInt(quantityInput.value)-1
        window.location.href =`/cart/update/${productId}/${quantity}`

    })
    increaseButton.addEventListener("click",() =>{
        const quantity = parseInt(quantityInput.value)+1
        window.location.href =`/cart/update/${productId}/${quantity}`

    })
    quantityInput.addEventListener("change",() =>{
        window.location.href =`/cart/update/${productId}/${quantityInput.value}`

    })
    
})
document.addEventListener("DOMContentLoaded", function() {
    const showMoreButton = document.getElementById("show-more");
    const descriptionText = document.querySelector(".card-text.text-description.card-hide");

    showMoreButton.addEventListener("click", function() {
        descriptionText.classList.toggle("card-hide");
        
        if (descriptionText.classList.contains("card-hide")) {
            showMoreButton.textContent = "Xem thêm";
        } else {
            showMoreButton.textContent = "Ẩn bớt";
        }
    });
});

