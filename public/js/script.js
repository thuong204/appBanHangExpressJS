

const showAlert = document.querySelector("[show-alert]")
if (showAlert) {
    const closeAlert = document.querySelector("[close-alert]")
    const time = parseInt(showAlert.getAttribute("data-time"))
    setTimeout(() => {
        showAlert.classList.add("alert-hidden")
    }, time)
    closeAlert.addEventListener("click", () => {
        showAlert.classList.add("alert-hidden")

    })

}

// increase quantity
const buttonIncrease = document.querySelector("[button-increase]")
const buttonDecrease = document.querySelector("[button-decrease]")
const quantity = document.querySelector("[value-quantity]")
buttonIncrease.addEventListener("click", () => {
    quantity.value = parseInt(quantity.value) + 1
})
buttonDecrease.addEventListener("click", () => {
    if (quantity.value > 1) {
        quantity.value = parseInt(quantity.value) - 1
    }
})
