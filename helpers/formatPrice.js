module.exports.formatPrice =(product) =>{
        product.priceNew = (product.price*(100-product.discountPercentage)/100).toFixed(0)

        let [integerPart, decimalPart] = product.price.toString().split(".");
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        product.priceInter = decimalPart ? integerPart + "," + decimalPart : integerPart


        let [integerPartNew, decimalPartNew] = product.priceNew.toString().split(".");
        integerPartNew = integerPartNew.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        product.priceNew = decimalPartNew ? integerPartNew + "," + decimalPartNew : integerPartNew
    return product
}