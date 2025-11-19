// ===========================
// SISTEMA OMNICHANNEL - JAVASCRIPT
// ===========================

// ===========================
// UTILITÁRIOS
// ===========================

/**
 * Mostra notificação de sucesso
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            z-index: 2000;
            animation: slideIn 0.3s ease;
        }
        
        .notification-success {
            background-color: #10b981;
            color: white;
        }
        
        .notification-error {
            background-color: #ef4444;
            color: white;
        }
        
        .notification-info {
            background-color: #0ea5e9;
            color: white;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    
    if (!document.querySelector('style[data-notification]')) {
        style.setAttribute('data-notification', 'true');
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Formata data para formato brasileiro
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
}

/**
 * Formata hora
 */
function formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ===========================
// MODAIS
// ===========================

/**
 * Abre modal de nova conversa
 */
function openNewConversationDialog() {
    const dialog = document.getElementById('newConversationDialog');
    if (dialog) {
        dialog.classList.remove('hidden');
    }
}

/**
 * Fecha modal de nova conversa
 */
function closeNewConversationDialog() {
    const dialog = document.getElementById('newConversationDialog');
    if (dialog) {
        dialog.classList.add('hidden');
    }
}

/**
 * Cria nova conversa
 */
function createConversation() {
    const channel = document.getElementById('channel')?.value;
    const subject = document.getElementById('subject')?.value;
    const message = document.getElementById('message')?.value;
    
    if (!channel || !subject.trim()) {
        showNotification('Por favor, preencha todos os campos', 'error');
        return;
    }
    
    showNotification('Conversa criada com sucesso!', 'success');
    closeNewConversationDialog();
    
    // Limpar formulário
    document.getElementById('channel').value = '';
    document.getElementById('subject').value = '';
    document.getElementById('message').value = '';
}

/**
 * Abre conversa específica
 */
function openConversation(conversationId) {
    const dialog = document.getElementById('conversationDialog');
    if (dialog) {
        dialog.classList.remove('hidden');
    }
}

/**
 * Fecha conversa
 */
function closeConversationDialog() {
    const dialog = document.getElementById('conversationDialog');
    if (dialog) {
        dialog.classList.add('hidden');
    }
}

// ===========================
// ATENDENTE
// ===========================

/**
 * Seleciona conversa na sidebar
 */
function selectConversation(conversationId) {
    // Remove classe active de todos os items
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Adiciona classe active ao item clicado
    event.target.closest('.conversation-item')?.classList.add('active');
    
    showNotification(`Conversa ${conversationId} selecionada`, 'info');
}

/**
 * Usa resposta rápida
 */
function useQuickReply(replyText) {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.value = replyText;
        messageInput.focus();
    }
}

/**
 * Envia mensagem
 */
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput?.value.trim();
    
    if (!message) {
        showNotification('Digite uma mensagem', 'error');
        return;
    }
    
    // Simula envio
    const chatArea = document.querySelector('.chat-area');
    if (chatArea) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-sent';
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${escapeHtml(message)}</p>
                <span class="message-time">${formatTime(new Date())}</span>
            </div>
        `;
        chatArea.appendChild(messageDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
    }
    
    messageInput.value = '';
    showNotification('Mensagem enviada!', 'success');
}

/**
 * Marca conversa como resolvida
 */
function markAsResolved() {
    showNotification('Conversa marcada como resolvida!', 'success');
}

/**
 * Escapa caracteres HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===========================
// GERENTE
// ===========================

/**
 * Alterna entre abas
 */
function switchTab(tabName) {
    // Esconde todos os tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove classe active de todos os botões
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostra tab selecionado
    const tabElement = document.getElementById(tabName + 'Tab');
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Adiciona classe active ao botão clicado
    event.target.classList.add('active');
}

/**
 * Atribui conversa a atendente
 */
function assignConversation(conversationId) {
    showNotification(`Conversa ${conversationId} atribuída com sucesso!`, 'success');
}

// ===========================
// EVENT LISTENERS
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Fecha modais ao clicar fora deles
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // Fecha modais com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.add('hidden');
            });
        }
    });
    
    // Envia mensagem com Enter
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                sendMessage();
            }
        });
    });
    
    // Ativa primeira aba por padrão
    const firstTabButton = document.querySelector('.tab-button');
    if (firstTabButton) {
        firstTabButton.classList.add('active');
        const firstTabName = firstTabButton.textContent.match(/\((\d+)\)/)?.[0];
        if (firstTabName) {
            document.querySelector('.tab-content')?.classList.add('active');
        }
    }
});

// ===========================
// DADOS SIMULADOS
// ===========================

const mockData = {
    conversations: [
        {
            id: 1,
            patientName: 'João Silva',
            subject: 'Agendamento de Consulta',
            channel: 'whatsapp',
            status: 'in_progress',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            messages: [
                { sender: 'patient', text: 'Olá! Como posso ajudá-lo?', time: '14:20' },
                { sender: 'attendant', text: 'Gostaria de agendar uma consulta com o Dr. Silva', time: '14:25' },
            ]
        },
        {
            id: 2,
            patientName: 'Ana Costa',
            subject: 'Resultado de Exame',
            channel: 'email',
            status: 'resolved',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            id: 3,
            patientName: 'Pedro Oliveira',
            subject: 'Dúvida sobre Medicação',
            channel: 'instagram',
            status: 'open',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        }
    ],
    
    attendants: [
        { id: 1, name: 'Maria Santos', status: 'online', conversations: 12, rating: 4.8 },
        { id: 2, name: 'Carlos Silva', status: 'online', conversations: 10, rating: 4.6 },
        { id: 3, name: 'Juliana Costa', status: 'online', conversations: 9, rating: 4.9 },
        { id: 4, name: 'Roberto Mendes', status: 'online', conversations: 11, rating: 4.7 },
    ],
    
    quickReplies: [
        'Agendamento confirmado para terça-feira às 10:00',
        'Consulte nossa página de horários disponíveis',
        'Obrigada por entrar em contato! Em breve retornaremos',
        'Qual é a sua dúvida?',
        'Você pode enviar um comprovante?',
    ]
};

// ===========================
// EXPORTAR PARA GLOBAL
// ===========================

window.mockData = mockData;
