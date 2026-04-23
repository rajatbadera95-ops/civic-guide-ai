const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(html);

let untranslated = [];
$('*').contents().each(function() {
    if (this.nodeType === 3) { // text node
        let text = $(this).text().trim();
        let parentTag = $(this).parent()[0].tagName.toLowerCase();
        
        if (text && text.length > 1 && !/^\W+$/.test(text) && parentTag !== 'script' && parentTag !== 'style') {
            let hasI18n = false;
            let current = $(this).parent();
            while (current.length && current[0].tagName.toLowerCase() !== 'html') {
                if (current.attr('data-i18n')) {
                    hasI18n = true;
                    break;
                }
                current = current.parent();
            }
            if (!hasI18n) {
                untranslated.push({ text: text, parent: parentTag, html: $(this).parent().html() });
            }
        }
    }
});

const ignoreList = ['d', 'h', 'm', 'EN', 'HI', 'BN', 'TA', 'TE', 'MR', '◆', '✅', '❌', '🗳️', '💡', '🔥', '🇮🇳', '🌟', '⚡', '🏛️', '🎉', '📍'];
const unique = [...new Set(untranslated.map(x => x.text))].filter(t => !/^\d+$/.test(t) && !ignoreList.includes(t));
console.log('Untranslated strings count: ' + unique.length);
console.log(unique);
