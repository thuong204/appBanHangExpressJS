// Button Status 
const buttonsStatus = document.querySelectorAll("[button-status]")
if (buttonsStatus.length > 0) {
    let url = new URL(window.location.href)
    buttonsStatus.forEach(button => {
        button.addEventListener("click", () => {
            const status = button.getAttribute("button-status")
            button.classList.add("active")
            if (status) {
                url.searchParams.set("status", status)
            }
            else {
                url.searchParams.delete("status")

            }
            window.location.href = url.href
        })
    })
}
// Form search
const formSearch = document.querySelector("#form-search")
if (formSearch) {
    let url = new URL(window.location.href)
    formSearch.addEventListener("submit", (e) => {
        e.preventDefault();
        const keyworld = e.target.elements.keyworld.value
        if (keyworld) {
            url.searchParams.set("keyworld", keyworld)
        }
        else {
            url.searchParams.delete("keyworld")
        }
        window.location.href = url.href
    })
}
// Pagination
const buttonPagination = document.querySelectorAll("[button-pagination]")
if (buttonPagination) {
    let url = new URL(window.location.href)
    buttonPagination.forEach(button => {
        button.addEventListener("click", () => {
            const page = button.getAttribute("button-pagination")
            button.classList.add("active")
            if (page) {
                url.searchParams.set("page", page)
            }
            else {
                url.searchParams.delete("page")

            }
            window.location.href = url.href
        })
    })

}
//end pagination
//Checkbox multi
const checkboxMulti = document.querySelector("[checkbox-multi]")
if (checkboxMulti) {
    const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']")
    const inputsid = checkboxMulti.querySelectorAll("input[name='id']")
    inputCheckAll.addEventListener("click", () => {
        if (inputCheckAll.checked) {
            inputsid.forEach(input => {
                input.checked = true
            })

        } else {
            inputsid.forEach(input => {
                input.checked = false
            })

        }
    });

    let cnt = 0
    inputsid.forEach(input => {
        input.addEventListener("click", () => {
            const countChecked = checkboxMulti.querySelectorAll(
                "input[name='id']:checked"
            ).length

            if (countChecked == inputsid.length) {
                inputCheckAll.checked = true
            }
            else {
                inputCheckAll.checked = false
            }
        })
    })
}
//End checkbox multi

//Form change multi

const formchangeMulti = document.querySelector("[form-change-multi]")
if (formchangeMulti) {
    formchangeMulti.addEventListener("submit", (e) => {
        e.preventDefault()
        const checkboxMulti = document.querySelector("[checkbox-multi]")
        const inputChecked = checkboxMulti.querySelectorAll(
            "input[name='id']:checked"
        )

        const typeChange = e.target.elements.type.value;
        if (typeChange == "delete-all") {
            const isConfirm = confirm("Bạn có chắc muốn xóa những sản phẩm này")
            if (!isConfirm) {
                return;
            }
        }
        if (inputChecked.length > 0) {
            let ids = [];
            const inputIds = formchangeMulti.querySelector("input[name='ids']")
            inputChecked.forEach(input => {
                const id = input.value
                if (typeChange == "change-position") {
                    const position = input.closest("tr").querySelector("input[name='position']").value
                    console.log(`${id} - ${position}`)
                    ids.push(`${id}-${position}`)
                }
                else {
                    ids.push(id)
                }

            })

            inputIds.value=ids.join(", ")
            formchangeMulti.submit()
        }
        else {
            alert("Vui lòng chọn ít nhất một bản ghi")
        }

    })
}
//end form change multi

//Delete item
const buttonDelete = document.querySelectorAll(("[button-delete]"))
if (buttonDelete) {
    buttonDelete.forEach(button => {
        const formDeleteItem = document.querySelector("#form-delete-item")
        const path = formDeleteItem.getAttribute("data-path")
        button.addEventListener("click", () => {
            const isConfirm = confirm("Bạn có chắc muốn xóa sản phẩm này")
            if (isConfirm) {
                const idDelete = button.getAttribute("data-id")
                const action = `${path}/${idDelete}?_method=DELETE`
                formDeleteItem.action = action
                formDeleteItem.submit()
            }
        })
    })
}
//Show alert
const showAlert = document.querySelector("[show-alert]")
if(showAlert){
     const closeAlert = document.querySelector("[close-alert]")
    const time = parseInt(showAlert.getAttribute("data-time"))
    setTimeout(()=>{
        showAlert.classList.add("alert-hidden")
    },time)
    closeAlert.addEventListener8("click",()=>{
        showAlert.classList.add("alert-hidden")

    })

}
//End show alert

//Upload image
const uploadImage = document.querySelector("[upload-image]")
if(uploadImage){
    const uploadImageInput = document.querySelector("[upload-image-input]")
    const uploadImagePreview = document.querySelector("[upload-image-preview]")
    uploadImageInput.addEventListener("change",(e) =>{
        const file = e.target.files[0]
        if(file){
            uploadImagePreview.src = URL.createObjectURL(file)
        }
    })
}

