import translations from '../assets/plugin/translations.json'

export default function() {
    for(let lang in translations)
        Language.addTranslations(lang, translations[lang])
}