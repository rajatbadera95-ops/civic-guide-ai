const fs = require('fs');
const cheerio = require('cheerio');
const { translate } = require('@vitalets/google-translate-api');

async function run() {
    const html = fs.readFileSync('index.html', 'utf8');
    const $ = cheerio.load(html);
    
    // Elements to translate
    const selectors = [
        '.nav-link span', '.hero-title', '.hero-subtitle', '.btn-hero-primary', '.btn-hero-secondary',
        '.slogan-active', '.slogan-ticker-track span',
        '.quote-text', '.quote-attr', '.cta-content h3', '.cta-content p',
        '.pledge-title', '.pledge-sub', '.btn-pledge',
        '.text-muted', '.title-glow', '.step-num', '.step-q', '.step-hint',
        '.step-btn', '.result-actions a', '.result-actions button',
        '.wizard-result h3', '.wizard-result p', '.timeline-scroll-hint',
        '.glassmorphism h5', '.glassmorphism p', 'label', 'th', 'td'
    ];

    let i18nKeys = {};
    let counter = 1;

    selectors.forEach(sel => {
        $(sel).each((i, el) => {
            const text = $(el).text().trim();
            if (text && !$(el).attr('data-i18n') && !$(el).find('*').length) {
                const key = 'auto_key_' + counter++;
                $(el).attr('data-i18n', key);
                i18nKeys[key] = text;
            } else if (text && !$(el).attr('data-i18n')) {
                // If it has children, we only want to translate if we can isolate text, but for simplicity, 
                // we'll try to just wrap its direct text nodes if possible, or just skip complex ones.
                // Actually, let's just do elements that don't have HTML inside for safety.
                if($(el).children().length === 0) {
                     const key = 'auto_key_' + counter++;
                     $(el).attr('data-i18n', key);
                     i18nKeys[key] = text;
                }
            }
        });
    });

    console.log(`Found ${Object.keys(i18nKeys).length} strings to translate.`);

    const languages = {
        Hindi: 'hi',
        Bengali: 'bn',
        Tamil: 'ta',
        Telugu: 'te',
        Marathi: 'mr'
    };

    const translations = {
        English: { ...i18nKeys }
    };

    for (const [langName, langCode] of Object.entries(languages)) {
        translations[langName] = {};
        console.log(`Translating to ${langName}...`);
        
        // We'll translate in batches to avoid overwhelming the API
        const keys = Object.keys(i18nKeys);
        for (let i = 0; i < keys.length; i += 10) {
            const batch = keys.slice(i, i + 10);
            const textsToTranslate = batch.map(k => i18nKeys[k]);
            
            try {
                // We join with a unique separator to translate in bulk
                const joinedText = textsToTranslate.join(' ||| ');
                const res = await translate(joinedText, { to: langCode });
                const translatedParts = res.text.split(' ||| ');
                
                batch.forEach((k, idx) => {
                    translations[langName][k] = translatedParts[idx] ? translatedParts[idx].trim() : i18nKeys[k];
                });
            } catch (err) {
                console.error(`Translation error for ${langName}:`, err.message);
                // Fallback to english on error
                batch.forEach((k) => {
                    translations[langName][k] = i18nKeys[k];
                });
            }
            
            // Sleep a bit
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    fs.writeFileSync('index.html', $.html());
    
    const jsContent = `const translations = ${JSON.stringify(translations, null, 2)};`;
    fs.writeFileSync('i18n_data.js', jsContent);
    console.log('Done!');
}

run();
