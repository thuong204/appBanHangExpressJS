module.exports = (query) =>{

    let objectSearch= {
        keyworld:""
    }
    if(query.keyworld){
        objectSearch.keyworld = query.keyworld
        const regex =  new RegExp(objectSearch.keyworld, "i")
        objectSearch.regex = regex
    }
    
    return objectSearch
}
