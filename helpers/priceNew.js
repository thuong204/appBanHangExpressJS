module.exports =(products) =>{
    products.forEach(item =>{
        let price = item.price
        item.priceNew = (item.price*(100-item.discountPercentage)/100).toFixed(0)

        let [integerPart, decimalPart] = price.toString().split(".");
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        item.priceInter = decimalPart ? integerPart + "," + decimalPart : integerPart


        let [integerPartNew, decimalPartNew] = item.priceNew.toString().split(".");
        integerPartNew = integerPartNew.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        item.priceNew = decimalPartNew ? integerPartNew + "," + decimalPartNew : integerPartNew

    })


    return products
}