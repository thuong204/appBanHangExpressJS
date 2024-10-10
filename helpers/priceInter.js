module.exports.priceInter = (totalPrice) =>{

    let [integerPart, decimalPart] = totalPrice.toString().split(".");
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    totalPrice = decimalPart ? integerPart + "," + decimalPart : integerPart
    return totalPrice;
}