document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chatForm');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const conversationHistory = document.getElementById('conversationHistory');

    // Handle sample questions
    document.querySelectorAll('.sample-question').forEach(question => {
        question.addEventListener('click', function(e) {
            e.preventDefault();
            userInput.value = this.textContent;
            chatForm.dispatchEvent(new Event('submit'));
        });
    });

    // Handle chat form submission
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessage('user', message);
        
        // Clear input
        userInput.value = '';

        try {
            // Show typing indicator
            addMessage('assistant', 'Thinking...', 'typing-message');

            // Send message to backend
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            // Remove typing indicator
            document.querySelector('.typing-message')?.remove();

            if (data.error) {
                throw new Error(data.error);
            }

            // Add assistant's response
            addMessage('assistant', data.response);

            // Add to conversation history
            addToHistory(message);

        } catch (error) {
            // Remove typing indicator
            document.querySelector('.typing-message')?.remove();
            
            // Show error message
            addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
            console.error('Error:', error);
        }
    });

    function addMessage(type, content, className = '') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type} ${className}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addToHistory(message) {
        const li = document.createElement('li');
        li.textContent = message.length > 30 ? message.substring(0, 30) + '...' : message;
        li.title = message;
        
        // Add click handler to reload the question
        li.addEventListener('click', function() {
            userInput.value = message;
            chatForm.dispatchEvent(new Event('submit'));
        });
        
        // Add to history
        conversationHistory.insertBefore(li, conversationHistory.firstChild);
        
        // Keep only last 10 conversations
        if (conversationHistory.children.length > 10) {
            conversationHistory.removeChild(conversationHistory.lastChild);
        }
    }
});
