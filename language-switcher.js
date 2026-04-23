// language-switcher.js

// Translations for different languages
const translations = {
    "en": {
        "greeting": "Hello! How can I assist you today?",
        "farewell": "Goodbye! Have a great day!"
    },
    "hi": {
        "greeting": "नमस्ते! मैं आपकी कैसे सहायता कर सकता हूँ?",
        "farewell": "अलविदा! आपका दिन शुभ हो!"
    },
    "bn": {
        "greeting": "হ্যালো! আমি আজ আপনাকে কীভাবে সাহায্য করতে পারি?",
        "farewell": "বিড়াল! আপনার দিন শুভ হোক!"
    },
    "ta": {
        "greeting": "வணக்கம்! நான் இன்று உங்களுக��கு எவ்வாறு உதவ வேண்டும்?",
        "farewell": "பிரியாவிடை! உங்கள் நாள் சிறந்தது!"
    },
    "te": {
        "greeting": "హలో! నేను నేడు మిమ్మల్ని ఎలా సహాయం చేయగలను?",
        "farewell": "స్వాగతం! మీ రోజు మంచి ఉండాలి!"
    },
    "mr": {
        "greeting": "नमस्कार! मी आज तुम्हाला कसे सहाय्य करू शकतो?",
        "farewell": "विदाई! तुमचा दिवस शुभ राहो!"
    }
};

// Function to switch languages
function switchLanguage(lang) {
    // Check if the selected language is supported
    if (translations[lang]) {
        // Store the selected language in localStorage
        localStorage.setItem('selectedLanguage', lang);

        // Update the UI accordingly
        updateUI(lang);
    }
}

// Function to update the UI based on selected language
function updateUI(lang) {
    // Example: Update greeting in chat interface
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
        greetingElement.innerText = translations[lang].greeting;
    }
}

// On page load, set the language based on localStorage
window.onload = function() {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en'; // Default to English
    switchLanguage(savedLanguage);
};

// Event listeners for language switch buttons (example)
document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));
document.getElementById('lang-hi').addEventListener('click', () => switchLanguage('hi'));
document.getElementById('lang-bn').addEventListener('click', () => switchLanguage('bn'));
document.getElementById('lang-ta').addEventListener('click', () => switchLanguage('ta'));
document.getElementById('lang-te').addEventListener('click', () => switchLanguage('te'));
document.getElementById('lang-mr').addEventListener('click', () => switchLanguage('mr'));