$(document).ready(function () {

    /* ===================================================
       ELEMENTS
    =================================================== */
    const $chatHistory     = $('#chat-history');
    const $chatForm        = $('#chat-form');
    const $userInput       = $('#user-input');
    const $typingIndicator = $('#typing-indicator');
    const $langSelect      = $('#language-select');
    const $micBtn          = $('#mic-btn');
    const $micStatus       = $('#mic-status');

    /* ===================================================
       COUNTDOWN TIMER  (Target: November 5, 2026)
    =================================================== */
    const targetDate = new Date('2026-11-05T00:00:00');

    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            $('#cd-days, #cd-hours, #cd-mins, #cd-secs').text('00');
            return;
        }

        const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs  = Math.floor((diff % (1000 * 60)) / 1000);

        $('#cd-days').text(String(days).padStart(2, '0'));
        $('#cd-hours').text(String(hours).padStart(2, '0'));
        $('#cd-mins').text(String(mins).padStart(2, '0'));
        $('#cd-secs').text(String(secs).padStart(2, '0'));
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    /* ===================================================
       HELPER FUNCTIONS
    =================================================== */
    function scrollToBottom() {
        $chatHistory.scrollTop($chatHistory[0].scrollHeight);
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g,  '&amp;')
            .replace(/</g,  '&lt;')
            .replace(/>/g,  '&gt;')
            .replace(/"/g,  '&quot;')
            .replace(/'/g,  '&#039;');
    }

    function appendUserMessage(text) {
        const html = `
            <div class="message user-message d-flex flex-column align-items-end mb-3">
                <div class="message-bubble py-2 px-3 rounded-4 text-dark">
                    ${escapeHtml(text)}
                </div>
            </div>`;
        $chatHistory.append(html);
        scrollToBottom();
    }

    function appendBotMessage(text) {
        const formatted = escapeHtml(text)
            .replace(/\*\*(.*?)\*\*/g,  '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g,      '<em>$1</em>')
            .replace(/\n/g,             '<br>');
        const html = `
            <div class="message bot-message d-flex flex-column align-items-start mb-3">
                <div class="message-bubble py-2 px-3 rounded-4 shadow-sm text-white">
                    ${formatted}
                </div>
            </div>`;
        $chatHistory.append(html);
        scrollToBottom();
    }

    /* ===================================================
       SEND MESSAGE  (used by form submit AND quick pills)
    =================================================== */
    function sendMessage(text) {
        if (!text || !text.trim()) return;

        const selectedLang = $langSelect.val() || 'English';

        appendUserMessage(text);
        $userInput.val('');
        $typingIndicator.removeClass('d-none').addClass('d-flex');
        scrollToBottom();

        fetch('https://civic-guide-ai.onrender.com/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, language: selectedLang })
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
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
    }

    /* ===================================================
       FORM SUBMISSION
    =================================================== */
    $chatForm.on('submit', function (e) {
        e.preventDefault();
        sendMessage($userInput.val().trim());
    });

    /* ===================================================
       QUICK ASK PILLS
    =================================================== */
    $('.quick-pill').on('click', function () {
        const query = $(this).data('query');
        sendMessage(query);
    });

    /* ===================================================
       VOICE-TO-TEXT (Microphone)
    =================================================== */
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        // Browser does not support – hide mic button gracefully
        $micBtn.hide();
    } else {
        const recognition = new SpeechRecognition();
        recognition.continuous   = false;
        recognition.interimResults = false;

        let isListening = false;

        $micBtn.on('click', function () {
            if (isListening) {
                recognition.stop();
            } else {
                // Update language for recognition
                const langMap = {
                    'English': 'en-IN',
                    'Hindi':   'hi-IN',
                    'Bengali': 'bn-IN',
                    'Tamil':   'ta-IN',
                    'Telugu':  'te-IN',
                    'Marathi': 'mr-IN'
                };
                recognition.lang = langMap[$langSelect.val()] || 'en-IN';
                recognition.start();
            }
        });

        recognition.onstart = function () {
            isListening = true;
            $micBtn.addClass('listening');
            $micStatus.removeClass('d-none');
        };

        recognition.onend = function () {
            isListening = false;
            $micBtn.removeClass('listening');
            $micStatus.addClass('d-none');
        };

        recognition.onerror = function (e) {
            isListening = false;
            $micBtn.removeClass('listening');
            $micStatus.addClass('d-none');
            if (e.error !== 'no-speech') {
                appendBotMessage('Microphone error: ' + e.error + '. Please allow mic access and try again.');
            }
        };

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            $userInput.val(transcript);
            sendMessage(transcript);
        };
    }
});
