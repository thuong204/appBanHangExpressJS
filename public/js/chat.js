var socket = io()
const form = document.getElementById("form-send")
const input = form.querySelector("[message]")
const message = document.querySelector("chat-messages")
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault()
        const content = e.target.elements.content.value
        if (content) {
            socket.emit('CLIENT_SEND_MESSAGE', content);
            e.target.elements.content.value = ""
        }

    })
}

socket.on('SERVER_RETURN_MESSAGE', (data) => {
    const userId = document.querySelector("[myId]")
    const message = document.querySelector(".chat-messages")
    const div = document.createElement("div")
    div.classList.add("message-bubble")
    if (data.userId == userId.getAttribute("myId")) {
        div.classList.add("sender")
    }
    else {
        div.classList.add("receiver")
    }

    div.innerHTML = data.content
    message.appendChild(div)
})
