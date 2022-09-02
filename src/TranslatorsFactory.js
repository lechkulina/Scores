const supportedTranslations = require('./Translations/supportedTranslations.js');

function getChildObject(object, path) {
  const pathParts = path.split('.');
  let current = object;
  while (pathParts.length > 0 || !current) {
    const key = pathParts.shift();
    current = current[key];
  }
  return current;
}

class TranslatorsFactory {
  constructor(settings) {
    this.settings = settings;
    this.translationsCache = new Map();
  }

  loadTranslations(locale) {
    if (this.translationsCache.has(locale)) {
      return this.translationsCache.get(locale);
    }
    const translations = (() => {
      // look for language and region
      if (supportedTranslations[locale]) {
        return supportedTranslations[locale]();
      }
      // look only for the language
      const localeParts = locale.split('-');
      const localeLanguage = localeParts[0];
      if (localeParts.length === 1) {
        return;
      }
      if (supportedTranslations[localeLanguage]) {
        return supportedTranslations[localeLanguage]();
      }
      // fallback to first available translations
      const firstSupportedLocale = Object.keys(supportedTranslations)[0];
      return supportedTranslations[firstSupportedLocale]();
    })();
    this.translationsCache.set(locale, translations);
    return translations;
  }

  async getPreferredLocale(interaction) {
    const preferredLocale = await this.settings.get('preferredLocale');
    const useGuildLocale = await this.settings.get('useGuildLocale');
    const guild = interaction?.channel.guild;
    if (useGuildLocale && guild?.preferredLocale) {
      return guild.preferredLocale;
    }
    return preferredLocale;
  }

  async createTranslator(interaction) {
    const preferredLocale = await this.getPreferredLocale(interaction);
    const translations = this.loadTranslations(preferredLocale);
    return (path, params = {}) => {
      const translation = getChildObject(translations, path);
      if (typeof translation === 'string') {
        return translation;
      }
      if (typeof translation === 'function') {
        return translation(params);
      }
      return '';
    };
  }
}

module.exports = TranslatorsFactory;
