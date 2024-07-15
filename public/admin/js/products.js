

//change status
const buttonChangeStatus = document.querySelectorAll("[button-change-status]")
if(buttonChangeStatus.length > 0){
    const formChangeStatus = document.querySelector("#form-change-status")
    const path = formChangeStatus.getAttribute('data-path')
    let url  = new URL(window.location.href)

    buttonChangeStatus.forEach(button =>{
        button.addEventListener("click",()=>{
            const statusCurrent =  button.getAttribute("data-status")
            const id =  button.getAttribute("data-id")

            let statusChange = statusCurrent == "active" ? "inactive" : "active";

            const action = path + `${statusChange}/${id}?_method=PATCH`
            formChangeStatus.action = action

            formChangeStatus.submit();

        })
    })
}

