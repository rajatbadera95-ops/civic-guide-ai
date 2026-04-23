const fs = require('fs');
const cheerio = require('cheerio');
const { translate } = require('@vitalets/google-translate-api');

async function run() {
    const html = fs.readFileSync('index.html', 'utf8');
    const $ = cheerio.load(html);
    
    // Load existing translations
    let code = fs.readFileSync('i18n_data.js', 'utf8');
    let jsonStr = code.replace('const translations = ', '').trim();
    if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
    const translations = JSON.parse(jsonStr);

    let newKeys = {};

    $('[data-i18n]').each((i, el) => {
        const key = $(el).attr('data-i18n');
        const text = $(el).text().trim();
        if (key && text && !translations.English[key]) {
            newKeys[key] = text;
        }
    });

    console.log(`Found ${Object.keys(newKeys).length} NEW strings to translate.`);
    if (Object.keys(newKeys).length === 0) return;

    Object.assign(translations.English, newKeys);

    const languages = {
        Hindi: 'hi',
        Bengali: 'bn',
        Tamil: 'ta',
        Telugu: 'te',
        Marathi: 'mr'
    };

    for (const [langName, langCode] of Object.entries(languages)) {
        console.log(`Translating to ${langName}...`);
        const keys = Object.keys(newKeys);
        for (let i = 0; i < keys.length; i += 10) {
            const batch = keys.slice(i, i + 10);
            const textsToTranslate = batch.map(k => newKeys[k]);
            
            try {
                const joinedText = textsToTranslate.join(' ||| ');
                const res = await translate(joinedText, { to: langCode });
                const translatedParts = res.text.split(' ||| ');
                
                batch.forEach((k, idx) => {
                    translations[langName][k] = translatedParts[idx] ? translatedParts[idx].trim() : newKeys[k];
                });
            } catch (err) {
                console.error(`Translation error for ${langName}:`, err.message);
                batch.forEach((k) => {
                    translations[langName][k] = newKeys[k];
                });
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    fs.writeFileSync('i18n_data.js', 'const translations = ' + JSON.stringify(translations, null, 2) + ';');
    console.log('Done appending new translations!');
}

run();
