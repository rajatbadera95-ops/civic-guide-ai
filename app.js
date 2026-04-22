/* =========================================
   CIVIC GUIDE AI — app.js  v3.0
========================================= */

/* =============== NAVIGATION =============== */
function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    const link = document.getElementById('nav-' + page);
    if (link) link.classList.add('active');
    document.getElementById('nav-links').classList.remove('open');
    window.scrollTo(0, 0);
}

function toggleMobileNav() {
    document.getElementById('nav-links').classList.toggle('open');
}

window.addEventListener('scroll', () => {
    document.getElementById('main-nav').classList.toggle('scrolled', window.scrollY > 10);
});

/* =============== THEME TOGGLE =============== */
let isDayTheme = false;

function toggleTheme() {
    isDayTheme = !isDayTheme;
    document.body.classList.toggle('day-theme', isDayTheme);
    const icon = document.getElementById('theme-icon');
    icon.className = isDayTheme ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    localStorage.setItem('civicTheme', isDayTheme ? 'day' : 'night');
}

// Restore saved theme
(function() {
    if (localStorage.getItem('civicTheme') === 'day') {
        isDayTheme = true;
        document.body.classList.add('day-theme');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.className = 'bi bi-sun-fill';
    }
})();

/* =============== VOTER ID WIDGET =============== */
function voterIdAnswer(hasId) {
    document.getElementById('vid-question').classList.add('d-none');
    if (hasId) {
        document.getElementById('vid-yes').classList.remove('d-none');
    } else {
        document.getElementById('vid-no').classList.remove('d-none');
    }
}

function voterIdReset() {
    document.getElementById('vid-question').classList.remove('d-none');
    document.getElementById('vid-yes').classList.add('d-none');
    document.getElementById('vid-no').classList.add('d-none');
}



/* =============== COUNTDOWN TIMER =============== */
const targetDate = new Date('2026-11-05T00:00:00');

function updateCountdown() {
    const diff = targetDate - new Date();
    if (diff <= 0) {
        ['cd-days', 'cd-hours', 'cd-mins'].forEach(id => document.getElementById(id).textContent = '00');
        return;
    }
    document.getElementById('cd-days').textContent  = String(Math.floor(diff / 86400000)).padStart(3, '0');
    document.getElementById('cd-hours').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
    document.getElementById('cd-mins').textContent  = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 60000); // update every minute in nav

/* =============== PARTICLES (Hero) =============== */
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 4 + 2;
        p.style.cssText = `
            width:${size}px; height:${size}px;
            left:${Math.random()*100}%;
            animation-duration:${8 + Math.random()*14}s;
            animation-delay:${Math.random()*10}s;
            opacity:${0.05 + Math.random()*0.15};
        `;
        container.appendChild(p);
    }
}
createParticles();

/* =============== STAT COUNTER ANIMATION =============== */
function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(el => {
        const target = parseInt(el.dataset.target);
        const duration = 1800;
        const start = Date.now();
        const tick = () => {
            const progress = Math.min((Date.now() - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = Math.floor(eased * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString();
        };
        tick();
    });
}

// Run counter animation when home page is first shown
let countersRan = false;
const homeObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !countersRan) {
        countersRan = true;
        animateCounters();
    }
}, { threshold: 0.2 });
const statsSection = document.querySelector('.stats-section');
if (statsSection) homeObserver.observe(statsSection);

// Also run when navigating to home
const _origNavigate = navigate;
window.navigate = function(page) {
    _origNavigate(page);
    if (page === 'home' && !countersRan) {
        countersRan = true;
        setTimeout(animateCounters, 300);
    }
    if (page === 'glossary') renderGlossary();
};

// Run on first load
setTimeout(() => { if (!countersRan) { countersRan = true; animateCounters(); } }, 600);

/* =============== GLOSSARY DATA & RENDER =============== */
const glossaryTerms = [
    { abbr: 'EVM', term: 'Electronic Voting Machine', def: 'A standalone electronic device used in Indian elections to record votes. It consists of a Control Unit (for the polling officer) and a Balloting Unit (for the voter). Results are stored in a microchip and cannot be tampered with remotely.' },
    { abbr: 'VVPAT', term: 'Voter Verified Paper Audit Trail', def: 'A device attached to EVMs that prints a paper slip showing the candidate and symbol you voted for. The slip is displayed for 7 seconds then drops into a sealed box, allowing you to verify your vote was cast correctly.' },
    { abbr: 'NOTA', term: 'None of the Above', def: 'An option introduced in 2013 by the Supreme Court that lets voters reject all candidates on the ballot. NOTA votes are counted officially but a candidate with fewer NOTA votes than a rival still wins.' },
    { abbr: 'EPIC', term: 'Electors\' Photo Identity Card', def: 'Commonly called the Voter ID card. Issued by the Election Commission of India, it serves as the primary proof of identity and residence for casting votes at polling booths.' },
    { abbr: 'Form 6', term: 'Voter Registration Application', def: 'The official form used to register as a new voter or to transfer your registration to a new constituency. It can be submitted online at voters.eci.gov.in or in person at your local Electoral Registration Officer\'s office.' },
    { abbr: 'BLO', term: 'Booth Level Officer', def: 'A government official responsible for maintaining the electoral roll for a specific polling booth. They conduct door-to-door verification and assist citizens in registering, updating, or deleting entries from the voter list.' },
    { abbr: 'ERO', term: 'Electoral Registration Officer', def: 'An officer appointed by the state government, responsible for preparing and revising the electoral rolls for a constituency. Citizens can submit Form 6/7/8 applications to the ERO.' },
    { abbr: 'FPTP', term: 'First Past the Post', def: 'India\'s electoral system for Lok Sabha and Vidhan Sabha elections. The candidate who receives the highest number of votes in a constituency wins, even if they don\'t get an absolute majority (>50%).' },
    { abbr: 'MCC', term: 'Model Code of Conduct', def: 'A set of guidelines issued by the Election Commission of India once an election is announced. It restricts ruling parties from using government resources or making policy announcements for electoral advantage until results are declared.' },
    { abbr: 'Affidavit', term: 'Candidate Declaration Form', def: 'A sworn statement that every election candidate must file with the returning officer, disclosing their criminal record (if any), assets and liabilities, and educational qualifications. Citizens have the right to access this information.' },
    { abbr: 'Lok Sabha', term: 'House of the People', def: 'The lower house of India\'s Parliament, directly elected by citizens. It has 543 constituencies across India. The government is formed by the party (or coalition) commanding a majority (272+ seats) in the Lok Sabha.' },
    { abbr: 'Rajya Sabha', term: 'Council of States', def: 'The upper house of India\'s Parliament. Its members are elected by the elected members of State Legislative Assemblies and Union Territories. It cannot be dissolved and represents the interests of states in Parliament.' },
    { abbr: 'Postal Ballot', term: 'Absentee Voting by Mail', def: 'A facility allowing certain categories of voters (senior citizens aged 85+, persons with disabilities, essential service workers, overseas electors) to cast their vote by post, without visiting a polling booth.' },
    { abbr: 'Delimitation', term: 'Redrawing of Constituency Boundaries', def: 'The process of redrawing the boundaries of parliamentary and assembly constituencies to reflect population changes from the latest Census. Conducted by the Delimitation Commission, an independent body.' },
    { abbr: 'Turnout', term: 'Voter Participation Rate', def: 'The percentage of registered voters who actually cast valid votes in an election. India\'s 2024 Lok Sabha election recorded approximately 66.3% turnout, with the highest ever being 67.4% in 2019.' },
    { abbr: 'Tendered Vote', term: 'Challenged Identity Vote', def: 'If someone arrives at a polling booth to find that another person has already voted in their name, they can cast a "Tendered Vote" on a separate ballot. These are counted separately only if the margin of victory is smaller than the number of tendered votes.' },
    { abbr: 'Anti-Defection', term: 'Tenth Schedule of the Constitution', def: 'A constitutional provision that disqualifies an elected representative from Parliament or a Legislature if they vote against their party\'s directive or voluntarily give up party membership without valid reasons.' },
    { abbr: 'By-Election', term: 'Mid-Term Constituency Election', def: 'An election held for a single seat in Parliament or a State Legislature when it becomes vacant due to death, resignation, or disqualification of the sitting member, outside the schedule of general elections.' },
    { abbr: 'Return Officer', term: 'Constituency Election Administrator', def: 'An officer appointed by the Election Commission to oversee and administer the election process within a specific constituency, including accepting nominations, scrutinizing papers, and declaring results.' },
    { abbr: 'Exit Poll', term: 'Post-Vote Survey', def: 'A survey conducted by media organizations immediately after voters have cast their ballots (but before official counting begins) to predict election results. Exit polls are prohibited from being published until after voting has ended in all phases.' },
];

let glossaryRendered = false;

function renderGlossary(filter = '') {
    const grid = document.getElementById('glossary-grid');
    if (!grid) return;

    const filtered = filter
        ? glossaryTerms.filter(t =>
            t.abbr.toLowerCase().includes(filter) ||
            t.term.toLowerCase().includes(filter) ||
            t.def.toLowerCase().includes(filter))
        : glossaryTerms;

    if (!filtered.length) {
        grid.innerHTML = `<div class="glossary-none"><i class="bi bi-search" style="font-size:2rem;opacity:0.3;display:block;margin-bottom:12px;"></i>No terms match "<strong>${filter}</strong>"</div>`;
        return;
    }

    grid.innerHTML = filtered.map(t => `
        <div class="glossary-card">
            <div class="glossary-term">${t.term}</div>
            <div class="glossary-abbr">${t.abbr}</div>
            <p class="glossary-def">${t.def}</p>
        </div>
    `).join('');
}

// Glossary search
document.addEventListener('DOMContentLoaded', () => {
    const searchEl = document.getElementById('glossary-search');
    if (searchEl) {
        searchEl.addEventListener('input', e => renderGlossary(e.target.value.trim().toLowerCase()));
    }
});

/* =============== CHAT — JQUERY BLOCK =============== */
$(document).ready(function () {
    const $chatHistory     = $('#chat-history');
    const $chatForm        = $('#chat-form');
    const $userInput       = $('#user-input');
    const $typingIndicator = $('#typing-indicator');
    const $langSelect      = $('#language-select');
    const $micBtn          = $('#mic-btn');
    const $micStatus       = $('#mic-status');

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

    function sendMessage(text) {
        if (!text || !text.trim()) return;
        const lang = $langSelect.val() || 'English';
        appendUserMessage(text);
        $userInput.val('');
        $typingIndicator.removeClass('d-none').addClass('d-flex');
        scrollToBottom();

        fetch('https://civic-guide-ai.onrender.com/chat', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ message: text, language: lang })
        })
        .then(r  => { if (!r.ok) throw new Error(); return r.json(); })
        .then(d  => { $typingIndicator.removeClass('d-flex').addClass('d-none'); appendBotMessage(d.reply); })
        .catch(() => {
            $typingIndicator.removeClass('d-flex').addClass('d-none');
            appendBotMessage("Sorry, I'm having trouble connecting to the server. Please check your connection or wait a moment.");
        });
    }

    $chatForm.on('submit', e => { e.preventDefault(); sendMessage($userInput.val().trim()); });
    $('.quick-pill').on('click', function () { sendMessage($(this).data('query')); });

    /* Voice-to-Text */
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
        rec.onerror  = e => { listening=false;  $micBtn.removeClass('listening'); $micStatus.addClass('d-none'); if(e.error!=='no-speech') appendBotMessage('Mic error: '+e.error); };
        rec.onresult = e => { const t = e.results[0][0].transcript; $userInput.val(t); sendMessage(t); };
    }
});

/* =============== POLLING BOOTH LOCATOR =============== */
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
        <a href="${offLink}" target="_blank" class="text-neon-cyan text-decoration-none small" style="color:var(--neon)">Official ${state} Portal ↗</a>
    </p>`;

    mockBooths.forEach((b, i) => {
        html += `
        <div class="booth-card">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                    <div class="booth-name"><i class="bi bi-building me-1" style="color:var(--neon)"></i>${b.name}</div>
                    <div class="booth-meta mt-1"><i class="bi bi-geo-alt me-1"></i>${b.address} &nbsp;|&nbsp; Booth No. ${100 + i}</div>
                </div>
                <span class="booth-distance">${b.dist}</span>
            </div>
            <div class="d-flex gap-2 mt-2 flex-wrap">
                <a href="${mapQuery}" target="_blank" class="btn-map"><i class="bi bi-map me-1"></i>View on Map</a>
                <a href="${offLink}"  target="_blank" class="btn-map"><i class="bi bi-box-arrow-up-right me-1"></i>Official Portal</a>
            </div>
        </div>`;
    });

    document.getElementById('locator-empty').classList.add('d-none');
    results.innerHTML = html;
}
