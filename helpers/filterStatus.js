module.exports = (query) =>{
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
    if(query.status){
        const index = filterStatus.findIndex(item => item.status == query.status)
        filterStatus[index].class = "active"
    }
    else{
        const index = filterStatus.findIndex(item => item.status == "")
        filterStatus[index].class = "active"
    }
    return filterStatus


}