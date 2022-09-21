const i18next = require('i18next');

const namespace = 'main';
const fallbackLanguage = 'en';

class TranslatorsFactory {
  constructor(settings) {
    this.settings = settings;
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

  async initialize() {
    const preferredLocale = await this.getPreferredLocale();
    await i18next.init({
      ns: namespace,
      defaultNS: namespace,
      fallbackNS: namespace,
      lng: preferredLocale,
      fallbackLng: fallbackLanguage,
      resources: require('./locales/resources'),
    });
  }

  async getTranslator(interaction) {
    if (!interaction) {
      return i18next.t;
    }
    const preferredLocale = await this.getPreferredLocale(interaction);
    return i18next.getFixedT(preferredLocale);
  }
}

module.exports = TranslatorsFactory;
