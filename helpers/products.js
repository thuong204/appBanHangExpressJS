module.exports.priceNewProduct = (product) =>{
    const priceNew =((product.price *(100-product.discountPercentage))/100).toFixed(0)

    let [integerPart, decimalPart] = priceNew.toString().split(".");
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    product.priceInter = decimalPart ? integerPart + "," + decimalPart : integerPart
    return priceNew;
}