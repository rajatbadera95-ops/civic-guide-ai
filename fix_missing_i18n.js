const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(html);

// We need to find specific elements that were missed and add spans with data-i18n
// 1. Hero Title
$('.hero-title').html('<span data-i18n="hero_title_p1">Your Vote.</span> <span class="text-neon" data-i18n="hero_title_p2">Your Power.</span>');

// 2. Buttons
$('.btn-hero-primary').each((i, el) => {
    $(el).contents().filter(function() { return this.nodeType === 3 && this.nodeValue.trim() !== ''; }).wrap('<span data-i18n="btn_ask_ai"></span>');
});
$('.btn-hero-secondary').each((i, el) => {
    $(el).contents().filter(function() { return this.nodeType === 3 && this.nodeValue.trim() !== ''; }).wrap('<span data-i18n="btn_find_booth"></span>');
});

// 3. Stats section
$('.stat-card').each((i, el) => {
    const p1 = $(el).find('h3'); // wait, the number is inside an h3 or something? Let me verify structure
});

// Let's just do it directly on index.html using cheerio
// Looking at the html structure for stats:
$('.stat-card').each((i, el) => {
    // Actually the stat numbers don't need translation, just the text
    $(el).contents().each(function() {
        if(this.nodeType === 3 && this.nodeValue.trim() !== '') {
             $(this).wrap(`<span data-i18n="stat_text_misc_${i}"></span>`);
        }
    });
    const p = $(el).find('p');
    if (p.length) {
        if (!p.attr('data-i18n')) {
            p.html(`<span data-i18n="stat_desc_${i}">${p.html()}</span>`);
        }
    }
});

// 4. How to Vote
const h2_vote = $('#page-home .text-center h2');
if(h2_vote.text().includes('How to Vote')) {
    h2_vote.html('<span data-i18n="how_to_vote_title_1">How to Vote</span> <span class="text-neon" data-i18n="how_to_vote_title_2">Step by Step</span>');
}

const p_vote = $('#page-home .text-center p');
p_vote.each((i, el) => {
    if($(el).text().includes('Follow these 5 simple steps')) {
        $(el).html('<span data-i18n="how_to_vote_sub">Follow these 5 simple steps to exercise your democratic right</span>');
    }
});

// 5. Timeline steps
$('.timeline-step').each((i, el) => {
    const h4 = $(el).find('h4');
    const p = $(el).find('p');
    if (h4.length && !h4.attr('data-i18n') && h4.children().length===0) h4.attr('data-i18n', 'step_title_' + i);
    if (p.length && !p.attr('data-i18n') && p.children().length===0) p.attr('data-i18n', 'step_desc_' + i);
});

fs.writeFileSync('index.html', $.html());
console.log('index.html updated with new spans');
