/* ===================================================
   CHAT PANEL — jQuery ready block
=================================================== */
$(document).ready(function () {

    const $chatHistory     = $('#chat-history');
    const $chatForm        = $('#chat-form');
    const $userInput       = $('#user-input');
    const $typingIndicator = $('#typing-indicator');
    const $langSelect      = $('#language-select');
    const $micBtn          = $('#mic-btn');
    const $micStatus       = $('#mic-status');

    /* --- Countdown Timer (Nov 5, 2026) --- */
    const targetDate = new Date('2026-11-05T00:00:00');
    function updateCountdown() {
        const diff = targetDate - new Date();
        if (diff <= 0) { $('#cd-days,#cd-hours,#cd-mins,#cd-secs').text('00'); return; }
        $('#cd-days').text(String(Math.floor(diff/86400000)).padStart(2,'0'));
        $('#cd-hours').text(String(Math.floor((diff%86400000)/3600000)).padStart(2,'0'));
        $('#cd-mins').text(String(Math.floor((diff%3600000)/60000)).padStart(2,'0'));
        $('#cd-secs').text(String(Math.floor((diff%60000)/1000)).padStart(2,'0'));
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    /* --- Helpers --- */
    function scrollToBottom() { $chatHistory.scrollTop($chatHistory[0].scrollHeight); }

    function escapeHtml(s) {
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
    }

    function appendUserMessage(text) {
        $chatHistory.append(`
            <div class="message user-message d-flex flex-column align-items-end mb-3">
                <div class="message-bubble py-2 px-3 rounded-4 text-dark">${escapeHtml(text)}</div>
            </div>`);
        scrollToBottom();
    }

    function appendBotMessage(text) {
        const fmt = escapeHtml(text)
            .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
            .replace(/\*(.*?)\*/g,'<em>$1</em>')
            .replace(/\n/g,'<br>');
        $chatHistory.append(`
            <div class="message bot-message d-flex flex-column align-items-start mb-3">
                <div class="message-bubble py-2 px-3 rounded-4 shadow-sm text-white">${fmt}</div>
            </div>`);
        scrollToBottom();
    }

    /* --- Send Message --- */
    function sendMessage(text) {
        if (!text || !text.trim()) return;
        const lang = $langSelect.val() || 'English';
        appendUserMessage(text);
        $userInput.val('');
        $typingIndicator.removeClass('d-none').addClass('d-flex');
        scrollToBottom();

        fetch('https://civic-guide-ai.onrender.com/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, language: lang })
        })
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => { $typingIndicator.removeClass('d-flex').addClass('d-none'); appendBotMessage(data.reply); })
        .catch(() => { $typingIndicator.removeClass('d-flex').addClass('d-none'); appendBotMessage("Sorry, I'm having trouble connecting to the server. Please check your connection or wait a moment."); });
    }

    $chatForm.on('submit', e => { e.preventDefault(); sendMessage($userInput.val().trim()); });
    $('.quick-pill').on('click', function () { sendMessage($(this).data('query')); });

    /* --- Voice-to-Text --- */
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { $micBtn.hide(); }
    else {
        const rec = new SR();
        rec.continuous = false; rec.interimResults = false;
        let listening = false;
        const langMap = { English:'en-IN', Hindi:'hi-IN', Bengali:'bn-IN', Tamil:'ta-IN', Telugu:'te-IN', Marathi:'mr-IN' };

        $micBtn.on('click', () => { if (listening) rec.stop(); else { rec.lang = langMap[$langSelect.val()]||'en-IN'; rec.start(); } });
        rec.onstart  = () => { listening=true;  $micBtn.addClass('listening');    $micStatus.removeClass('d-none'); };
        rec.onend    = () => { listening=false; $micBtn.removeClass('listening'); $micStatus.addClass('d-none'); };
        rec.onerror  = e => { listening=false; $micBtn.removeClass('listening'); $micStatus.addClass('d-none'); if(e.error!=='no-speech') appendBotMessage('Mic error: '+e.error); };
        rec.onresult = e => { const t=e.results[0][0].transcript; $userInput.val(t); sendMessage(t); };
    }
});

/* ===================================================
   TAB SWITCHING
=================================================== */
function switchTab(tab) {
    const isChat = (tab === 'chat');
    document.getElementById('panel-chat').classList.toggle('d-none', !isChat);
    document.getElementById('panel-locator').classList.toggle('d-none', isChat);
    document.getElementById('tab-chat').classList.toggle('active', isChat);
    document.getElementById('tab-locator').classList.toggle('active', !isChat);
}

/* ===================================================
   POLLING BOOTH LOCATOR
=================================================== */
const stateLinks = {
    'Andhra Pradesh': 'https://ceoandhra.nic.in',
    'Assam':          'https://ceoassam.nic.in',
    'Bihar':          'https://ceobihar.nic.in',
    'Delhi':          'https://ceodelhi.gov.in',
    'Gujarat':        'https://ceo.gujarat.gov.in',
    'Karnataka':      'https://ceokarnataka.kar.nic.in',
    'Kerala':         'https://www.ceo.kerala.gov.in',
    'Madhya Pradesh': 'https://ceomponline.com',
    'Maharashtra':    'https://ceo.maharashtra.gov.in',
    'Punjab':         'https://ceopunjab.nic.in',
    'Rajasthan':      'https://ceorajasthan.nic.in',
    'Tamil Nadu':     'https://www.elections.tn.gov.in',
    'Telangana':      'https://ceotelangana.nic.in',
    'Uttar Pradesh':  'https://ceouttarpradesh.nic.in',
    'West Bengal':    'https://ceowestbengal.nic.in',
};

const mockBooths = [
    { name: 'Government Primary School',       address: 'Ward No. 4, Main Road',                dist: '0.3 km' },
    { name: 'Municipal Community Hall',         address: 'Sector B, Near Bus Stand',             dist: '0.7 km' },
    { name: 'Town High School – Block A',       address: 'MG Road, Opposite Park',               dist: '1.1 km' },
    { name: 'Panchayat Bhavan',                 address: 'Village Center, Gram Panchayat Office', dist: '1.6 km' },
    { name: 'District Sports Complex – Hall 2', address: 'Sports Colony, East Wing',             dist: '2.0 km' },
];

function locateBooth() {
    const state   = document.getElementById('state-select').value;
    const pin     = document.getElementById('pin-input').value.trim();
    const err     = document.getElementById('locator-error');
    const results = document.getElementById('booth-results');

    if (!state || !/^\d{6}$/.test(pin)) { err.classList.remove('d-none'); return; }
    err.classList.add('d-none');

    const offLink  = stateLinks[state] || '#';
    const mapQuery = `https://www.google.com/maps/search/polling+booth+near+${pin}`;

    let html = `<p class="locator-summary">
        Showing <span>${mockBooths.length} booths</span> near PIN <span>${pin}</span> in <span>${state}</span>
        &nbsp;·&nbsp;
        <a href="${offLink}" target="_blank" class="text-neon-cyan text-decoration-none small">Official ${state} Election Portal ↗</a>
    </p>`;

    mockBooths.forEach((b, i) => {
        html += `
        <div class="booth-card">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                    <div class="booth-name"><i class="bi bi-building me-1 text-neon-cyan"></i>${b.name}</div>
                    <div class="booth-meta mt-1"><i class="bi bi-geo-alt me-1"></i>${b.address} &nbsp;|&nbsp; Booth No. ${100 + i}</div>
                </div>
                <span class="booth-distance">${b.dist}</span>
            </div>
            <div class="d-flex gap-2 mt-2">
                <a href="${mapQuery}" target="_blank" class="btn btn-map"><i class="bi bi-map me-1"></i>View on Map</a>
                <a href="${offLink}"  target="_blank" class="btn btn-map"><i class="bi bi-box-arrow-up-right me-1"></i>Official Portal</a>
            </div>
        </div>`;
    });

    document.getElementById('locator-empty').classList.add('d-none');
    results.innerHTML = html;
}
