const API_KEY = 'your_openrouter_api_key';
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('userInput');
const modelSelector = document.getElementById('modelSelector');
const sidebar= document.querySelector('.sidebar');

let chats= JSON.parse(localStorage.getItem('chats')) || {};
let currentChatId= localStorage.getItem('currentChat') || createNewChat();
let selectedModel= localStorage.getItem('selectedModel') || modelSelector.value;

modelSelector.value= selectedModel;

renderSidebar();
loadChat(currentChatId);

modelSelector.addEventListener('change', (e) => {
    selectedModel= e.target.value;
    localStorage.setItem('selectedModel', selectedModel);
});

function createNewChat() {
    const newId= 'chat_'+Date.now();
    chats[newId]=[];
    localStorage.setItem('chats', JSON.stringify(chats));
    localStorage.setItem('currentChat', newId);
    currentChatId= newId;
    renderSidebar();
    clearChatWindow();
    return newId;
};

function renderSidebar() {
    sidebar.innerHTML= `<div class ="heading"> LLM Models </div>`;
    sidebar.appendChild(modelSelector);

    const chatList= document.createElement('div');
    chatList.className= 'chat-list';

    const newChatBtn= document.createElement('button');
    newChatBtn.textContent= '+ New Chat';
    newChatBtn.onclick= createNewChat;
    chatList.appendChild(newChatBtn);

    Object.keys(chats).forEach(chatId =>{
        const chatBtn = document.createElement('button');
        chatBtn.textContent= chatId;

        if (chatId=== currentChatId) {
            chatBtn.classList.add('active');
        }

        chatBtn.onclick =() =>{
            currentChatId= chatId;
            localStorage.setItem('currentChat', currentChatId);
            loadChat(currentChatId);
            renderSidebar();
        };
        chatList.appendChild(chatBtn);
    });

    sidebar.appendChild(chatList);
};

function loadChat(chatId) {
    clearChatWindow();
    chatHistory= chats[chatId] || [];
    chatHistory.forEach(renderMessage);
};

function clearChatWindow() {
    chatWindow.innerHTML= '';
    chatWindow.appendChild(chatForm);
};

let controller;
document.getElementById('stop-btn')?.remove();
const stopBtn= document.createElement('button');
stopBtn.id= 'stop-btn';
stopBtn.textContent= 'Stop';
stopBtn.addEventListener('click', () => {
    controller?.abort();
});
document.body.appendChild(stopBtn);


chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    const userMsg = {
        role: 'user',
        content: message
    };
    chats[currentChatId].push(userMsg);
    renderMessage(userMsg);
    userInput.value = '';

    const assistantMsg = {
        role: 'assistant',
        content: ''
    }
    chats[currentChatId].push(assistantMsg);
    const assistantBubble = renderMessage(assistantMsg, true);

    localStorage.setItem('chats', JSON.stringify(chats));
    controller= new AbortController();

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: chats[currentChatId],
                stream: true
            }),
            signal: controller.signal
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        let done = false;
        let responseText = '';

        while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;

            const chunkValue = decoder.decode(value);
            const lines= chunkValue.split('\n').filter(line => line.trim().startsWith('data:'));
           
            for (const line of lines){
                const data= line.replace('data: ', '').trim();
                if (data === '[DONE]') {
                    break;
                }
                try{
                    const json = JSON.parse(data);
                    const content = json.choices?.[0]?.delta?.content;
                    if(content) {
                        responseText += content;
                        assistantMsg.content = responseText;
                        assistantBubble.textContent = responseText;
                    }
                }catch (error) {
                        console.error('Error parsing response:', error);
                    }
            }
        }
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    } catch (error) {
        console.error('Error fetching response:', error);
        assistantBubble.textContent = 'Error fetching response. Please try again.';
    }
});


function renderMessage(message, isLive = false) {
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', message.role);
    bubble.textContent = message.content;
    chatWindow.insertBefore(bubble, chatForm);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return isLive ? bubble : null;
}
    
