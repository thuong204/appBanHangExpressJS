const Product = require("../../models/product.model")
module.exports.index = async (req, res) => {
    let filterStatus =[
        {
            name:"Tất cả",
            status:"",
            class:""
        },
        {
            name:"Hoat động",
            status:"active",
            class:""
        },  {
            name:"Dừng hoạt động",
            status:"inactive",
            class:""
        }
    ]
    // màu xanh hoạt động
    if(req.query.status){
        const index = filterStatus.findIndex(item => item.status == req.query.status)
        filterStatus[index].class = "active"
    }
    else{
        const index = filterStatus.findIndex(item => item.status == "")
        filterStatus[index].class = "active"
    }
    let find = {
        delete: false
    }

    if(req.query.status)
        find.status = req.query.status
    const  products =  await Product.find(find)
    res.render("admin/pages/products/index",{
        pageTitle:"Manage Products",
        products: products,
        filterStatus: filterStatus
    })
 };