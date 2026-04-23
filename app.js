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

/* =============== SLOGAN ROTATOR =============== */
const slogans = [
    "Your vote is your voice — use it.",
    "One vote can change the course of history.",
    "Don't let others decide your future for you.",
    "Democracy only works when YOU participate.",
    "The most powerful weapon is the right to vote.",
    "Every single vote counts — every. single. one.",
    "Great leaders are chosen by informed, active voters.",
];

let currentSlogan = 0;
let sloganTimer = null;

function initSloganRotator() {
    const dotsEl = document.getElementById('slogan-dots');
    const textEl = document.getElementById('slogan-text');
    if (!dotsEl || !textEl) return;

    // Build dot buttons
    dotsEl.innerHTML = '';
    slogans.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.className = 'slogan-dot' + (i === 0 ? ' active' : '');
        btn.onclick = () => goToSlogan(i);
        dotsEl.appendChild(btn);
    });

    // Auto-rotate every 4 seconds
    sloganTimer = setInterval(() => goToSlogan((currentSlogan + 1) % slogans.length), 4000);
}

function goToSlogan(index) {
    const textEl = document.getElementById('slogan-text');
    const dots   = document.querySelectorAll('.slogan-dot');
    if (!textEl) return;

    // Fade out
    textEl.classList.add('fade-out');

    setTimeout(() => {
        currentSlogan = index;
        textEl.textContent = slogans[currentSlogan];
        textEl.classList.remove('fade-out');
        textEl.classList.add('fade-in');

        // Update dots
        dots.forEach((d, i) => d.classList.toggle('active', i === currentSlogan));

        // Fade in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                textEl.classList.remove('fade-in');
            });
        });

        // Reset auto-timer on manual click
        if (sloganTimer) { clearInterval(sloganTimer); }
        sloganTimer = setInterval(() => goToSlogan((currentSlogan + 1) % slogans.length), 4000);
    }, 500);
}

// Init on page load
document.addEventListener('DOMContentLoaded', initSloganRotator);



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

/* ==============================================
   ELIGIBILITY WIZARD
============================================== */
const wizardReasons = {
    1: "You must be a citizen of India to vote. Non-citizens are not eligible under Article 326 of the Constitution.",
    2: "You must be at least 18 years old on the qualifying date (January 1st of the year of revision of the electoral roll).",
    3: "You must be ordinarily resident in the constituency where you wish to register. Persons without a fixed address may still apply under special provisions.",
    4: "Persons declared of unsound mind by a competent court are disqualified under Section 16 of the Representation of the People Act, 1950.",
    5: "Persons serving a prison sentence of 2 or more years are disqualified from voting during that period under Section 11A of the RPA."
};

let currentWizardStep = 1;

function wizardNext(step, answer) {
    const disqualified = (step === 1 && !answer) || (step === 2 && !answer) ||
                         (step === 3 && !answer) || (step === 4 && answer)  ||
                         (step === 5 && answer);

    if (disqualified) {
        showWizardResult(false, wizardReasons[step]);
        return;
    }

    if (step < 5) {
        const nextStep = step + 1;
        document.getElementById('estep-' + step).classList.remove('active');
        document.getElementById('estep-' + nextStep).classList.add('active');
        document.getElementById('wizard-progress-bar').style.width = (nextStep * 20) + '%';
        currentWizardStep = nextStep;
    } else {
        showWizardResult(true);
    }
}

function showWizardResult(eligible, reason) {
    document.getElementById('estep-' + currentWizardStep).classList.remove('active');
    document.getElementById('estep-result').classList.add('active');
    document.getElementById('wizard-progress-bar').style.width = '100%';
    if (eligible) {
        document.getElementById('result-eligible').classList.remove('d-none');
        document.getElementById('result-not-eligible').classList.add('d-none');
    } else {
        document.getElementById('result-not-eligible').classList.remove('d-none');
        document.getElementById('result-eligible').classList.add('d-none');
        document.getElementById('result-reason').textContent = reason;
    }
}

function wizardReset() {
    for (let i = 1; i <= 5; i++) document.getElementById('estep-' + i).classList.remove('active');
    document.getElementById('estep-result').classList.remove('active');
    document.getElementById('result-eligible').classList.add('d-none');
    document.getElementById('result-not-eligible').classList.add('d-none');
    document.getElementById('wizard-progress-bar').style.width = '20%';
    currentWizardStep = 1;
    document.getElementById('estep-1').classList.add('active');
}

/* ==============================================
   ELECTION TIMELINE
============================================== */
const elections = [
    { year:'1951', seats:489, winner:'Indian National Congress', party:'INC', won:364, pm:'Jawaharlal Nehru', turnout:'45.7%', fact:'India\'s first ever General Election spanning 5 months. 173 million voters. Nehru\'s Congress wins a historic majority.' },
    { year:'1957', seats:494, winner:'Indian National Congress', party:'INC', won:371, pm:'Jawaharlal Nehru', turnout:'47.7%', fact:'Congress consolidates power. Communist Party becomes the largest opposition with 27 seats.' },
    { year:'1962', seats:494, winner:'Indian National Congress', party:'INC', won:361, pm:'Jawaharlal Nehru', turnout:'55.4%', fact:'Congress wins again, but loses ground. Months later, the Sino-Indian War dents Nehru\'s prestige.' },
    { year:'1967', seats:520, winner:'Indian National Congress', party:'INC', won:283, pm:'Indira Gandhi', turnout:'61.3%', fact:'Congress loses majority in 8 states. Indira Gandhi becomes PM. The era of dominant one-party rule begins to fade.' },
    { year:'1971', seats:518, winner:'Indian National Congress', party:'INC', won:352, pm:'Indira Gandhi', turnout:'55.3%', fact:'Indira\'s "Garibi Hatao" (Remove Poverty) campaign wins a landslide. Bangladesh Liberation War follows the same year.' },
    { year:'1977', seats:542, winner:'Janata Party', party:'JP', won:295, pm:'Morarji Desai', turnout:'60.5%', fact:'First non-Congress government. Emergency period backlash sweeps Congress out. Indira Gandhi loses her own seat.' },
    { year:'1980', seats:542, winner:'Indian National Congress', party:'INC', won:353, pm:'Indira Gandhi', turnout:'57.0%', fact:'Indira Gandhi makes a dramatic comeback. Janata Party collapses due to internal conflict.' },
    { year:'1984', seats:542, winner:'Indian National Congress', party:'INC', won:414, pm:'Rajiv Gandhi', turnout:'64.1%', fact:'Sympathy wave after Indira Gandhi\'s assassination. Congress wins its largest ever majority — 414 seats.' },
    { year:'1989', seats:543, winner:'Janata Dal', party:'JD', won:143, pm:'VP Singh', turnout:'62.0%', fact:'VP Singh\'s anti-corruption wave defeats Congress. Coalition politics begins in India.' },
    { year:'1991', seats:543, winner:'Indian National Congress', party:'INC', won:244, pm:'PV Narasimha Rao', turnout:'57.0%', fact:'Rajiv Gandhi assassinated mid-campaign. Economic liberalisation begins under Rao and Manmohan Singh.' },
    { year:'1996', seats:543, winner:'Bharatiya Janata Party', party:'BJP', won:161, pm:'HD Deve Gowda', turnout:'58.0%', fact:'Hung parliament. Vajpayee\'s BJP forms govt but resigns after 13 days. United Front coalition takes over.' },
    { year:'1998', seats:543, winner:'Bharatiya Janata Party', party:'BJP', won:182, pm:'Atal Bihari Vajpayee', turnout:'62.0%', fact:'BJP-led NDA forms government. India conducts Pokhran-II nuclear tests shortly after.' },
    { year:'1999', seats:543, winner:'Bharatiya Janata Party', party:'BJP', won:182, pm:'Atal Bihari Vajpayee', turnout:'60.0%', fact:'NDA wins a full term after Congress withdraws support from Vajpayee\'s government. Kargil War context shapes voter mood.' },
    { year:'2004', seats:543, winner:'Indian National Congress', party:'INC', won:145, pm:'Manmohan Singh', turnout:'58.1%', fact:'Shock result — BJP\'s "India Shining" campaign backfires. UPA coalition formed. Manmohan Singh becomes PM.' },
    { year:'2009', seats:543, winner:'Indian National Congress', party:'INC', won:206, pm:'Manmohan Singh', turnout:'58.2%', fact:'UPA returns to power. Congress wins 206 seats — its best since 1991. Mumbai 26/11 aftermath shapes the campaign.' },
    { year:'2014', seats:543, winner:'Bharatiya Janata Party', party:'BJP', won:282, pm:'Narendra Modi', turnout:'66.4%', fact:'Modi wave sweeps India. BJP wins an outright majority alone — first party to do so since 1984. Record 66.4% turnout.' },
    { year:'2019', seats:543, winner:'Bharatiya Janata Party', party:'BJP', won:303, pm:'Narendra Modi', turnout:'67.4%', fact:'BJP improves to 303 seats. Highest ever turnout at 67.4%. Pulwama-Balakot tensions dominate the campaign.' },
    { year:'2024', seats:543, winner:'Bharatiya Janata Party', party:'BJP', won:240, pm:'Narendra Modi', turnout:'66.3%', fact:'BJP loses outright majority, wins 240. NDA coalition forms government. Opposition INDIA bloc performs better than expected.' },
];

function renderTimeline() {
    const container = document.getElementById('h-timeline');
    if (!container || container.innerHTML) return;
    const maxSeats = Math.max(...elections.map(e => e.won));
    container.innerHTML = elections.map((e, i) => {
        const h = Math.round((e.won / maxSeats) * 100) + 20;
        return `<div class="h-election" onclick="showTimelineDetail(${i})">
            <div class="h-bar" style="height:${h}px"></div>
            <div class="h-dot"></div>
            <div class="h-year">${e.year}</div>
            <div class="h-seats">${e.won}/${e.seats}</div>
        </div>`;
    }).join('');
}

function showTimelineDetail(index) {
    const e = elections[index];
    document.querySelectorAll('.h-election').forEach((el, i) => el.classList.toggle('selected', i === index));
    const detail = document.getElementById('timeline-detail');
    detail.innerHTML = `
        <div class="td-grid">
            <div class="td-name">${e.year} — ${e.winner} <span class="td-party">${e.party}</span></div>
            <div class="td-cell"><div class="td-label">Prime Minister</div><div class="td-val">${e.pm}</div></div>
            <div class="td-cell"><div class="td-label">Seats Won</div><div class="td-val neon">${e.won} / ${e.seats}</div></div>
            <div class="td-cell"><div class="td-label">Voter Turnout</div><div class="td-val">${e.turnout}</div></div>
            <div class="td-cell" style="grid-column:1/-1;text-align:left"><div class="td-label">Key Fact</div><div style="font-size:0.85rem;color:var(--text);line-height:1.6">${e.fact}</div></div>
        </div>`;
}

// Render when timeline page is navigated to
const _navOrig = window.navigate;
window.navigate = function(page) {
    _navOrig(page);
    if (page === 'timeline') { renderTimeline(); }
    if (page === 'results')  { renderResultsTable(''); }
    if (page === 'glossary') { renderGlossary(); }
};

/* ==============================================
   CONSTITUENCY LOOKUP
============================================== */
const constituencyData = {
    '110': { name:'New Delhi', state:'Delhi',           mp:'Bansuri Swaraj (BJP)',      lok:'New Delhi',           vid:'Chandni Chowk' },
    '400': { name:'Mumbai South', state:'Maharashtra',  mp:'Arvind Sawant (SS-UBT)',   lok:'Mumbai South',        vid:'Malabar Hill' },
    '700': { name:'Kolkata North', state:'West Bengal',  mp:'Sudip Bandopadhyay (TMC)',  lok:'Kolkata North',       vid:'Jorasanko' },
    '600': { name:'Chennai Central', state:'Tamil Nadu', mp:'Dayanidhi Maran (DMK)',    lok:'Chennai Central',     vid:'Thousand Lights' },
    '500': { name:'Secunderabad', state:'Telangana',    mp:'G Kishan Reddy (BJP)',     lok:'Secunderabad',        vid:'Secunderabad Cantonment' },
    '560': { name:'Bangalore South', state:'Karnataka',  mp:'Tejasvi Surya (BJP)',      lok:'Bangalore South',     vid:'Jayanagar' },
    '380': { name:'Ahmedabad East', state:'Gujarat',    mp:'Hasmukhbhai Patel (BJP)',  lok:'Ahmedabad East',      vid:'Maninagar' },
    '302': { name:'Jaipur', state:'Rajasthan',          mp:'Manju Sharma (BJP)',       lok:'Jaipur',              vid:'Civil Lines' },
    '226': { name:'Lucknow', state:'Uttar Pradesh',     mp:'Rajnath Singh (BJP)',      lok:'Lucknow',             vid:'Lucknow Cantonment' },
    '411': { name:'Pune', state:'Maharashtra',          mp:'Murlidhar Mohol (BJP)',    lok:'Pune',                vid:'Kasba Peth' },
    '440': { name:'Nagpur', state:'Maharashtra',        mp:'Nitin Gadkari (BJP)',      lok:'Nagpur',              vid:'Nagpur South West' },
    '248': { name:'Dehradun', state:'Uttarakhand',      mp:'Anil Baluni (BJP)',        lok:'Tehri Garhwal',       vid:'Rajpur Road' },
    '641': { name:'Coimbatore', state:'Tamil Nadu',     mp:'K Subbarayan (CPI)',       lok:'Coimbatore',          vid:'Coimbatore North' },
    '462': { name:'Bhopal', state:'Madhya Pradesh',     mp:'Alok Sharma (BJP)',        lok:'Bhopal',              vid:'Huzur' },
    '160': { name:'Chandigarh', state:'Punjab',         mp:'Kirron Kher (BJP)',        lok:'Chandigarh',          vid:'Sector 8' },
};

function lookupConstituency() {
    const pin = document.getElementById('const-pin').value.trim();
    const result = document.getElementById('const-result');
    if (!/^\d{6}$/.test(pin)) {
        result.innerHTML = '<p class="text-danger small">⚠️ Please enter a valid 6-digit PIN code.</p>';
        return;
    }
    const prefix = pin.substring(0, 3);
    const data = constituencyData[prefix];
    if (data) {
        result.innerHTML = `<div class="const-card">
            <div class="const-name">${data.name} Constituency</div>
            <div class="const-meta">📍 ${data.state} &nbsp;·&nbsp; Lok Sabha: <strong>${data.lok}</strong> &nbsp;·&nbsp; Vidhan Sabha: <strong>${data.vid}</strong></div>
            <div class="const-mp"><i class="bi bi-person-fill me-1"></i>Current MP: ${data.mp}</div>
        </div>`;
    } else {
        result.innerHTML = `<div class="const-card">
            <div class="const-name">Constituency Found</div>
            <div class="const-meta">PIN: ${pin} — For precise constituency details, visit the official ECI portal.</div>
            <div class="const-mp"><a href="https://voters.eci.gov.in/" target="_blank" class="vid-link mt-2" style="display:inline-flex;width:auto"><i class="bi bi-box-arrow-up-right me-1"></i>Check on ECI Portal</a></div>
        </div>`;
    }
}

/* ==============================================
   ELECTION RESULTS HISTORY
============================================== */
const electionResults = [
    { constituency:'Lucknow',          state:'UP',          winner:'Rajnath Singh',     party:'BJP', votes:'697,558', margin:'341,801', year:'2024' },
    { constituency:'Lucknow',          state:'UP',          winner:'Rajnath Singh',     party:'BJP', votes:'632,000', margin:'247,080', year:'2019' },
    { constituency:'Varanasi',         state:'UP',          winner:'Narendra Modi',     party:'BJP', votes:'612,970', margin:'152,513', year:'2024' },
    { constituency:'Varanasi',         state:'UP',          winner:'Narendra Modi',     party:'BJP', votes:'674,664', margin:'479,505', year:'2019' },
    { constituency:'New Delhi',        state:'Delhi',       winner:'Bansuri Swaraj',    party:'BJP', votes:'445,550', margin:'78,370',  year:'2024' },
    { constituency:'New Delhi',        state:'Delhi',       winner:'Meenakshi Lekhi',   party:'BJP', votes:'389,472', margin:'107,028', year:'2019' },
    { constituency:'Mumbai South',     state:'Maharashtra', winner:'Arvind Sawant',     party:'SS-UBT', votes:'346,222', margin:'8,924', year:'2024' },
    { constituency:'Kolkata North',    state:'WB',          winner:'Sudip Bandopadhyay',party:'TMC', votes:'552,892', margin:'222,523', year:'2019' },
    { constituency:'Hyderabad',        state:'Telangana',   winner:'Asaduddin Owaisi',  party:'AIMIM', votes:'519,000', margin:'338,087', year:'2024' },
    { constituency:'Hyderabad',        state:'Telangana',   winner:'Asaduddin Owaisi',  party:'AIMIM', votes:'517,471', margin:'282,186', year:'2019' },
    { constituency:'Bangalore South',  state:'Karnataka',   winner:'Tejasvi Surya',     party:'BJP', votes:'840,395', margin:'331,192', year:'2024' },
    { constituency:'Bangalore South',  state:'Karnataka',   winner:'Tejasvi Surya',     party:'BJP', votes:'712,757', margin:'331,192', year:'2019' },
    { constituency:'Pune',             state:'Maharashtra', winner:'Murlidhar Mohol',   party:'BJP', votes:'524,622', margin:'102,742', year:'2024' },
    { constituency:'Chennai Central',  state:'TN',          winner:'Dayanidhi Maran',   party:'DMK', votes:'424,100', margin:'157,469', year:'2019' },
    { constituency:'Nagpur',           state:'Maharashtra', winner:'Nitin Gadkari',     party:'BJP', votes:'697,000', margin:'335,584', year:'2024' },
    { constituency:'Nagpur',           state:'Maharashtra', winner:'Nitin Gadkari',     party:'BJP', votes:'660,221', margin:'216,189', year:'2019' },
];

const partyClasses = { BJP:'bjp', INC:'inc', TMC:'tmc', DMK:'dmk', SP:'sp', AIMIM:'aimim', 'SS-UBT':'other' };

function renderResultsTable(filter) {
    const wrap = document.getElementById('results-table-wrap');
    if (!wrap) return;
    const filtered = filter
        ? electionResults.filter(r => r.constituency.toLowerCase().includes(filter) || r.state.toLowerCase().includes(filter) || r.winner.toLowerCase().includes(filter))
        : electionResults;

    if (!filtered.length) { wrap.innerHTML = '<p class="text-muted text-center py-4">No results found.</p>'; return; }

    const pc = r => `<span class="party-badge party-${partyClasses[r.party]||'other'}">${r.party}</span>`;
    wrap.innerHTML = `<div style="overflow-x:auto"><table class="results-table">
        <thead><tr><th>Year</th><th>Constituency</th><th>State</th><th>Winner</th><th>Party</th><th>Votes</th><th>Margin</th></tr></thead>
        <tbody>${filtered.map(r => `<tr>
            <td><strong>${r.year}</strong></td>
            <td>${r.constituency}</td>
            <td>${r.state}</td>
            <td>${r.winner}</td>
            <td>${pc(r)}</td>
            <td>${r.votes}</td>
            <td style="color:var(--neon)">${r.margin}</td>
        </tr>`).join('')}</tbody>
    </table></div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    const rs = document.getElementById('results-search');
    if (rs) rs.addEventListener('input', e => renderResultsTable(e.target.value.trim().toLowerCase()));
});

/* ==============================================
   VOTER PLEDGE + CONFETTI
============================================== */
let pledgeDone = false;

function takePledge() {
    if (pledgeDone) return;
    pledgeDone = true;
    document.getElementById('pledge-btn-wrap').classList.add('d-none');
    document.getElementById('pledge-done').classList.remove('d-none');
    // Increment counter
    const el = document.getElementById('pledge-count');
    const current = parseInt(el.textContent.replace(/,/g,''));
    el.textContent = (current + 1).toLocaleString();
    // Fire confetti
    fireConfetti();
}

function resetPledge() {
    pledgeDone = false;
    document.getElementById('pledge-btn-wrap').classList.remove('d-none');
    document.getElementById('pledge-done').classList.add('d-none');
}

function fireConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ['#00ffcc','#b300ff','#ff4d6d','#ffa500','#4fa3e0','#23a455','#ffffff'];
    const pieces = Array.from({length: 120}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        r: Math.random() * 6 + 3,
        d: Math.random() * 1.5 + 0.5,
        c: colors[Math.floor(Math.random() * colors.length)],
        t: Math.random() * Math.PI * 2,
        ts: (Math.random() - 0.5) * 0.1,
    }));

    let frame = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.c;
            ctx.globalAlpha = Math.max(0, 1 - frame / 180);
            ctx.fill();
            p.y += p.d * 3;
            p.x += Math.sin(p.t) * 1.5;
            p.t += p.ts;
        });
        frame++;
        if (frame < 200) requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    draw();
}

// Hook into DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Init results table
    renderResultsTable('');
});
