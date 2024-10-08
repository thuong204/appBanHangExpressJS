var socket = io()

//file upload preview
const upload = new FileUploadWithPreview.FileUploadWithPreview('my-unique-id', {
    multiple: true,
    maxFileCount: 6
});

const form = document.getElementById("form-send")
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault()
        const images = upload.cachedFileArray || []
        const content = e.target.elements.content.value
        if (content || images.length > 0) {
            socket.emit('CLIENT_SEND_MESSAGE',
                {
                    content: content,
                    images: images

                });
            e.target.elements.content.value = "";
            upload.resetPreviewPanel()
        }


    })
}

socket.on('SERVER_RETURN_MESSAGE', (data) => {
    const userId = document.querySelector("[myId]")
    const message = document.querySelector(".chat-messages")
    const div = document.createElement("div")
    const boxTyping = document.querySelector(".inner-list-typing")
    let htmlFullName = "";
    let htmlContent = "";
    let htmlImages = "";
    if (data.sender == userId.getAttribute("myId")) {
        div.classList.add("sender")
        if (data.content) {
            htmlContent = ` <div class="message-bubble">${data.content}</div>`
        }
        if (data.images.length > 0) {
            htmlImages += ` <div class="inner-images">`;
            for (const image of data.images) {
                htmlImages += `<img src= "${image}">`;

            }
            htmlImages += '</div>';

        }
        div.innerHTML = `
        ${htmlFullName}
        ${htmlContent}
        ${htmlImages} 
        `
        message.insertBefore(div, boxTyping)
    }

    message.scrollTop = message.scrollHeight

    const boxImages = div.querySelector(".inner-images");
    if (boxImages) {
        const gallery = new Viewer(boxImages);

    }
})

var timeOut
const showTyping = () => {
    socket.emit("CLIENT_SEND_TYPING", "show")
    clearTimeout(timeOut)
    timeOut = setTimeout(() => {
        socket.emit("CLIENT_SEND_TYPING", "hidden")
    }, 3000)
}



const emojiPicker = document.querySelector("emoji-picker")
const button = document.querySelector('.btn-icon')
const tooltip = document.querySelector('.tooltip')
const inputChat = document.querySelector("[input-chat]")
import * as Popper from 'https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js'
if (button) {
    Popper.createPopper(button, tooltip)
    button.onclick = () => {
        tooltip.classList.toggle('shown')
    }
}
if (emojiPicker) {
    emojiPicker.addEventListener("emoji-click", (event) => {
        const icon = event.detail.unicode
        inputChat.value = inputChat.value + icon

        const end = inputChat.value.length
        inputChat.setSelectionRange(end, end)
        inputChat.focus()
        showTyping()

    })
}
if (inputChat) {
    inputChat.addEventListener("keyup", () => {
        showTyping()
    })

}


// //Server return typing
// const elementListTyping = document.querySelector(".inner-list-typing")
// if (elementListTyping) {
//     socket.on("SERVER_RETURN_TYPING", (data) => {
//         if (data.type == "show") {
//             const existTyping = document.querySelector(`[user-id= "${data.userId}"]`)
//             if (!existTyping) {
//                 const boxTyping = document.createElement("div")
//                 boxTyping.classList.add("box-typing")
//                 boxTyping.setAttribute("user-id", data.userId)

//                 boxTyping.innerHTML = `
//                     <div>${data.fullName}</div>
//                     <div class="inner-dots">
//                         <span></span> 
//                         <span></span> 
//                         <span></span>
//                     </div>`

//                 elementListTyping.appendChild(boxTyping)
//             }
//         }
//         else {
//             const boxTypingRemove = elementListTyping.querySelector(`[user-id = "${data.userId}"]`)
//             if (boxTypingRemove) {
//                 elementListTyping.removeChild(boxTypingRemove)
//             }
//         }

//     })
// }

//Preview image
const chat = document.querySelector(".card-body .chat-messages")
if (chat) {
    const gallery = new Viewer(chat);
}
//End Preview image
