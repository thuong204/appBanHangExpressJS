// Button Status 
const buttonsStatus = document.querySelectorAll("[button-status]")
if(buttonsStatus.length>0){
    let url = new URL(window.location.href)
    buttonsStatus.forEach(button =>{
        button.addEventListener("click",() =>{
            const status = button.getAttribute("button-status")
            button.classList.add("active")
            if(status){
                url.searchParams.set("status",status)
            }
            else{
                url.searchParams.delete("status")

            }
            window.location.href = url.href
        })
    })
}