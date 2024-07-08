const Product = require("../../models/product.model")
const filterStatusHelpers = require("../../helpers/filterStatus")
const searchHelpers = require("../../helpers/search")
const paginationHelpers = require("../../helpers/pagination")

module.exports.index = async (req, res) => {

    const filterStatus = filterStatusHelpers(req.query);
    let find = {
        delete: false
    }

    const objectSearch = searchHelpers(req.query)
    if(req.query.status){
        find.status = req.query.status
    }
    if(objectSearch.regex){
        find.title = objectSearch.regex
    }
    //Pagination
    const countProducts =  await Product.find(find).count()
    let objectPagination = paginationHelpers({
        currentPage:1,
        limitItems:4,
    },req.query,countProducts)

    
    //End pagination

       

    const  products =  await Product.find(find).limit(objectPagination.limitItems).skip(objectPagination.skip)
    res.render("admin/pages/products/index",{
        pageTitle:"Manage Products",
        products: products,
        filterStatus: filterStatus,
        keyworld: objectSearch.keyworld,
        pagination: objectPagination
    })
 };
 //ChangeStatus PATCH
 module.exports.changeStatus = async (req, res) =>{
    const status  = req.params.status
    const id = req.params.id

    await Product.updateOne({_id:id}, {status: status})


    res.redirect('back')
    
 } 

 //ChangeMulti PATCH
 module.exports.changeMulti = async (req, res) =>{
    const type = req.body.type
    const ids = req.body.ids.split(", ")

    switch(type){
        case "active":
            await Product.updateMany({
                _id: { $in: ids}},
                {
                status: "active"
            })

            break;
        case "inactive":
            await Product.updateMany({
                _id: { $in: ids}},
                {
                status: "inactive"
            })
            break;
        default: 
            break;
    }
    res.redirect("back")
    
 } 
//delete item
module.exports.deleteItem = async (req, res) =>{
    const id  = req.params.id
    await Product.deleteOne({_id: id})
    res.redirect("back")
}