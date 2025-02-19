class ChatBot {
    constructor() {
        this.conversations = [];
        this.currentConversation = [];
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
        this.statusIndicator = document.getElementById('statusIndicator');

        // Event Listeners
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });
        this.sendButton.addEventListener('click', () => this.handleUserInput());
        this.newChatBtn.addEventListener('click', () => this.startNewChat());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Carregar conversas salvas
        this.loadConversations();
        this.startNewChat();
    }

    async handleUserInput() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // Adicionar mensagem do usuário
        this.addMessage(message, 'user');
        this.userInput.value = '';

        // Atualizar status
        this.updateStatus('Digitando...');

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
        const API_KEY = 'AIzaSyDUwzHXwR3k_guPc_Htc7RImAm6y-e_wFk';
        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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
                            - Gosta de brincar com emojis, mas de forma sarcástica 😏  
                            
                            Pergunta do usuário: ${message}  
                            
                            Responda em português, sendo sarcástico, sem se preocupar com a sensibilidade.  
                            Se a pergunta não for relevante, faça uma piada sobre isso.`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.8,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar resposta do bot');
            }

            const data = await response.json();

            if (data.candidates && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Resposta inválida da API');
            }
        } catch (error) {
            console.error('Erro:', error);
            return 'Aff... deu erro. Você quebrou alguma coisa. Tenta de novo, mas dessa vez faz direito! 🙄';
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
    }

    clearHistory() {
        this.conversations = [];
        this.currentConversation = [];
        this.chatOutput.innerHTML = '';
        this.conversationList.innerHTML = '';
        this.saveConversations();
    }

    updateStatus(text) {
        const statusText = this.statusIndicator.querySelector('.status-text');
        statusText.textContent = text;
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

// Inicializar o chatbot quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
});