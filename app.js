$(document).ready(function() {
    const $chatHistory = $('#chat-history');
    const $chatForm = $('#chat-form');
    const $userInput = $('#user-input');
    const $typingIndicator = $('#typing-indicator');

    // Function to scroll to the bottom of the chat history
    function scrollToBottom() {
        $chatHistory.scrollTop($chatHistory[0].scrollHeight);
    }

    // Function to append a user message
    function appendUserMessage(text) {
        const messageHtml = `
            <div class="message user-message d-flex flex-column align-items-end mb-3">
                <div class="message-bubble py-2 px-3 rounded-4 text-dark">
                    ${escapeHtml(text)}
                </div>
            </div>
        `;
        $chatHistory.append(messageHtml);
        scrollToBottom();
    }

    // Function to append a bot message
    function appendBotMessage(text) {
        // Simple regex to parse bold tags naturally from LLMs if needed later
        const formattedText = escapeHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        const messageHtml = `
            <div class="message bot-message d-flex flex-column align-items-start mb-3">
                <div class="message-bubble py-2 px-3 rounded-4 shadow-sm text-white">
                    ${formattedText}
                </div>
            </div>
        `;
        $chatHistory.append(messageHtml);
        scrollToBottom();
    }

    // Helper to prevent XSS
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Handle form submission
    $chatForm.on('submit', function(e) {
        e.preventDefault();
        
        const text = $userInput.val().trim();
        if (!text) return;

        // 1. Display User Message
        appendUserMessage(text);
        $userInput.val('');
        
        // 2. Show Typing Indicator
        $typingIndicator.removeClass('d-none').addClass('d-flex');
        scrollToBottom();

        // 3. Call the Python Backend
        fetch('http://localhost:8000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: text })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            $typingIndicator.removeClass('d-flex').addClass('d-none');
            appendBotMessage(data.reply);
        })
        .catch(error => {
            console.error('Error:', error);
            $typingIndicator.removeClass('d-flex').addClass('d-none');
            appendBotMessage("Sorry, I'm having trouble connecting to the server. Please check your connection or wait a moment.");
        });
    });
});
