// permission
const tablePermission = document.querySelector("[table-permission]")
if (tablePermission) {
    const buttonSubmit = document.querySelector("[button-submit]")
    buttonSubmit.addEventListener("click", () => {
        let permissions = []
        const rows = tablePermission.querySelectorAll("[data-name]")
        rows.forEach(row => {
            const name = row.getAttribute("data-name")
            const inputs = row.querySelectorAll("input")
            if (name == "id") {
                inputs.forEach(input => {
                    const id = input.value
                    permissions.push({
                        id: id,
                        permissions: []
                    })
                })
            }
            else {
                inputs.forEach((input, index) => {
                    console.log(name)
                    const inputChecked = input.checked
                    if (inputChecked) {
                        permissions[index].permissions.push(name)
                    }
                })
            }
        })
        if(permissions.length>0){
            const formChangePermissions = document.querySelector("#form-change-permissions")
            const inputPermission = formChangePermissions.querySelector("input[name='permissions']")
            inputPermission.value= JSON.stringify(permissions)
            formChangePermissions.submit()

        }

    })

}
//end permission


//permission default

const dataRecords = document.querySelector("[data-records]")
if(dataRecords){
    const records = JSON.parse(dataRecords.getAttribute("data-records"))
    const tablePermission = document.querySelector("[table-permission]")
    records.forEach((record,index) =>{
        const permissions= record.permissions
        permissions.forEach(permission =>{
            const row = tablePermission.querySelector(`tr[data-name = "${permission}"]`)
            const inputChecked = row.querySelectorAll("input")[index]
            inputChecked.checked= true
        })
    })

}
//end permission default