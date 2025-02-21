class ChatBot {
    constructor() {
        this.conversations = [];
        this.currentConversation = [];
        this.isLoading = false;
        this.initialize();
    }

    initialize() {
        // Elementos DOM
        this.userInput = document.getElementById('userInput');
        this.chatOutput = document.getElementById('chatOutput');
        this.sendButton = document.getElementById('sendButton');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.conversationList = document.getElementById('conversationList');
        this.loadingAnimation = document.getElementById('loadingAnimation');
        this.statusIndicator = document.getElementById('statusIndicator');

        // Event Listeners
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isLoading) this.handleUserInput();
        });
        this.sendButton.addEventListener('click', () => {
            if (!this.isLoading) this.handleUserInput();
        });
        this.newChatBtn.addEventListener('click', () => this.startNewChat());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Carregar conversas salvas
        this.loadConversations();
        
        // Show welcome screen if no conversation exists
        if (this.currentConversation.length === 0 && this.conversations.length === 0) {
            this.showWelcomeScreen();
        } else {
            this.hideWelcomeScreen();
        }
        this.startNewChat();
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.loadingAnimation.style.display = loading ? 'block' : 'none';
        this.sendButton.disabled = loading;
        this.userInput.disabled = loading;
    }

    async handleUserInput() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // Hide welcome screen on first message
        this.hideWelcomeScreen();

        // Add user message
        this.addMessage(message, 'user');
        this.userInput.value = '';

        // Atualizar status
        this.updateStatus('Digitando...');
        this.chatOutput.scrollTop = this.chatOutput.scrollHeight;

        try {
            // Simular resposta do bot (substitua isso pela chamada real à API do Gemini)
            const response = await this.getBotResponse(message);
            this.addMessage(response, 'bot');
        } catch (error) {
            console.error('Erro:', error);
            this.addMessage('Desculpe, ocorreu um erro ao processar sua mensagem.', 'bot');
        }

        this.updateStatus('Online');
        this.saveConversations();
    }

    addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = message;
        this.chatOutput.appendChild(messageDiv);
        this.chatOutput.scrollTop = this.chatOutput.scrollHeight;

        this.currentConversation.push({ sender, message });
    }

    async getBotResponse(message) {
        const API_KEY = 'API';
        const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

        console.log('Sending request to API:', API_URL);
        try {
            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Você é um amigo grosso e mal-educado.  
                            Você sempre faz piadas sobre tudo e não tem papas na língua.  
                            Seu objetivo é responder de forma sarcástica e engraçada, sem se preocupar com a sensibilidade dos outros.  
                            
                            Algumas características da sua personalidade:  
                            - Fala de forma direta e muitas vezes rude  
                            - Faz piadas sobre as perguntas dos usuários, mesmo que sejam sérias  
                            - Usa sarcasmo e ironia em suas respostas  
                            - Não hesita em dar respostas curtas e desdenhosas
                            
                            Pergunta do usuário: ${message}  
                            
                            Responda em português, sendo sarcástico, sem se preocupar com a sensibilidade.  
                            Se a pergunta não for relevante, faça uma piada sobre isso.`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.9,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            console.log('API Response Status:', response.status);
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(`Erro na API: ${errorData.error?.message || 'Erro desconhecido'}`);
            }

            const data = await response.json();
            console.log('API Response Data:', data);

            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.error('Invalid API Response Structure:', data);
                throw new Error('Formato de resposta inválido');
            }
        } catch (error) {
            console.error('Error details:', error);
            return 'Ops, deu um erro aqui! Você tem talento pra quebrar as coisas, hein? 😅 Tenta de novo!';
        }
    }

    addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        // Create message content container
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (sender === 'bot') {
            // Add avatar for bot messages
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'ai-avatar';
            const avatarImg = document.createElement('img');
            avatarImg.src = 'assets/logo.png';
            avatarImg.alt = 'AI Avatar';
            avatarDiv.appendChild(avatarImg);
            messageDiv.appendChild(avatarDiv);
        }
        
        // Format message text with markdown-like syntax
        const formattedMessage = this.formatMessage(message);
        contentDiv.innerHTML = formattedMessage;
        
        messageDiv.appendChild(contentDiv);
        this.chatOutput.appendChild(messageDiv);
        this.chatOutput.scrollTop = this.chatOutput.scrollHeight;

        this.currentConversation.push({ sender, message });
    }

    formatMessage(message) {
        // Convert URLs to clickable links
        message = message.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        // Convert emojis to larger size
        message = message.replace(
            /([\u{1F300}-\u{1F9FF}])/gu,
            '<span class="emoji">$1</span>'
        );
        
        // Add line breaks
        message = message.replace(/\n/g, '<br>');
        
        return message;
    }

    showWelcomeScreen() {
        const welcomeScreen = document.querySelector('.welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.style.display = 'flex';
        }
    }

    hideWelcomeScreen() {
        const welcomeScreen = document.querySelector('.welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.style.display = 'none';
        }
    }

    startNewChat() {
        if (this.currentConversation.length > 0) {
            this.conversations.push([...this.currentConversation]);
            this.updateConversationList();
        }
        this.currentConversation = [];
        this.chatOutput.innerHTML = '';
        this.saveConversations();
        
        // Show welcome screen for new chat
        this.showWelcomeScreen();
    }

    clearHistory() {
        this.conversations = [];
        this.currentConversation = [];
        this.chatOutput.innerHTML = '';
        this.conversationList.innerHTML = '';
        this.saveConversations();
        
        // Show welcome screen after clearing history
        this.showWelcomeScreen();
    }

    updateStatus(newStatus) {
        const statusElement = document.querySelector('.status-selector'); // Substitua '.status-selector' pelo seletor correto
        if (statusElement) {
            statusElement.textContent = newStatus;
        } else {
            console.error('Elemento de status não encontrado!');
        }
    }

    updateConversationList() {
        this.conversationList.innerHTML = '';
        this.conversations.forEach((conv, index) => {
            const li = document.createElement('li');
            li.textContent = `Conversa ${index + 1}`;
            li.addEventListener('click', () => this.loadConversation(index));
            this.conversationList.appendChild(li);
        });
    }

    loadConversation(index) {
        this.currentConversation = [];
        this.chatOutput.innerHTML = '';

        this.conversations[index].forEach(msg => {
            this.addMessage(msg.message, msg.sender);
        });
    }

    saveConversations() {
        localStorage.setItem('chatHistory', JSON.stringify({
            conversations: this.conversations,
            currentConversation: this.currentConversation
        }));
    }

    loadConversations() {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            const data = JSON.parse(saved);
            this.conversations = data.conversations;
            this.currentConversation = data.currentConversation;
            this.updateConversationList();
        }
    }
}

// Theme Switching
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Modal Handling
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const themeToggle = document.getElementById('themeToggle');
const closeButtons = document.querySelectorAll('.close');

loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

signupBtn.addEventListener('click', () => {
    signupModal.style.display = 'block';
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        loginModal.style.display = 'none';
        signupModal.style.display = 'none';
    });
});

window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target === signupModal) {
        signupModal.style.display = 'none';
    }
});

themeToggle.addEventListener('click', toggleTheme);

// Form Handling
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Add your login logic here
    loginModal.style.display = 'none';
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Add your signup logic here
    signupModal.style.display = 'none';
});

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    new ChatBot();
    initTheme();
});
