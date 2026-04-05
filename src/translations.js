const Translations = {
    en: {
        "vcm.export.center_for_entity": "Center for entity",
        "vcm.export.textures_prefix": "Texture's name prefix",
        "vcm.export": "Export VCM Model"
    },
    ru: {
        "vcm.export.center_for_entity": "Центрировать для сущности",
        "vcm.export.textures_prefix": "Префикс названиям текстур",
        "vcm.export": "Экспортировать VCM Модель"
    }
}

export default function() {
    for(let lang in Translations)
        Language.addTranslations(lang, Translations[lang])
}