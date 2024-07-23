module.exports =(products) =>{
    products.forEach(item =>{
        item.priceNew = (item.price*(100-item.discountPercentage)/100).toFixed(0)
    })
    return products
}