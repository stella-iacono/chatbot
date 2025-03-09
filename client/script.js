import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector("#chat_container");


//loading dots
let loadInterval;

function loader(element) {
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';

        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300)
}

//type one letter at a time
function typeText(element, text) {
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20)
}

//unique id for each message

function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${-hexadecimalString}`;
}

//new chat stripe
function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
             <div class="chat">
                <div class="profile">
                 <img 
                    src="${isAi ? bot : user}"
                 />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
         </div>
        `
    );
}

//first bot message
async function fetchFirstMessage() {
    try {
        const response = await fetch('http://localhost:5000/first-message'); // Replace with your Render URL when deployed
        const data = await response.json();

        if (data && data.bot) {
            // Proceed with the first message if bot data is available
            chatContainer.innerHTML += chatStripe(true, data.bot);
        } else {
            // Handle the case when 'bot' message is missing
            console.error("No bot message in response.");
        }
    } catch (error) {
        console.error("Error fetching first message:", error);
    }
}

//handle user message submission

const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    //user's chat stripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

    form.reset();

    //bot's chat stripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueId);

    loader(messageDiv);



    //fetch data from backend (bots response) https://chatbot-zv2i.onrender.com/
    const response = await fetch('http://localhost:5000/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    });
    

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if(response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();

        typeText(messageDiv, parsedData);
    } else {
        const err = await response.text();

        messageDiv.innerHTML = "Something went wrong";

        alert(err);

    };

};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    };
});

//fetch first message
window.addEventListener("load", fetchFirstMessage) 

