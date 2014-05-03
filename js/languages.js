oT.lang = {};

oT.lang.langs = {
    'en': 'English',
    'pirate': 'Pirate',
    'es': 'Español',
    'fr': 'Français'
}

oT.lang.setLang = function(lang){
    if (lang){
        localStorage.setItem('oTranscribe-language',lang);
        window.location.reload();
    }
}

oT.lang.applyLang = function(callback){
    var lang = localStorage.getItem('oTranscribe-language');
    if(lang) {
        document.webL10n.setLanguage(lang);
    } else {
        document.webL10n.setLanguage('en');
    }
}

oT.lang.togglePanel = function(){
    $('.language-picker').toggleClass('active');
    $('.language-title').toggleClass('active');
}

oT.lang.bide = function(){
    if (document.webL10n.getReadyState() === 'complete' ) {
        oT.lang.applyLang();
    } else {
        setTimeout(function(){
            oT.lang.bide();
        },50);
    }
}

window.oT.lang = oT.lang;