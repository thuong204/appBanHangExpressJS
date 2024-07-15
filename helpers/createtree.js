function createTree(arr, parentId =""){ 
    const tree =[]
    arr.forEach((item) => {
        if(item.parent_id === parentId){
            const newItem = item
            const children = createTree(arr, item.id)
            if(children.length>0){
                newItem.children = children
            }
            tree.push(newItem)
        }
    })
    return tree;
}
module.exports.createTree = (arr, parentId = "") => {
    const tree = createTree(arr, parentId="")
    return tree

}