const i18next = require('i18next');
const {SettingId} = require('./Settings');

const namespace = 'main';
const fallbackLanguage = 'en';

class TranslatorsFactory {
  constructor(settings) {
    this.settings = settings;
  }

  getPreferredLocale(interaction) {
    const preferredLocale = this.settings.get(SettingId.PreferredLocale);
    const useGuildLocale = this.settings.get(SettingId.UseGuildLocale);
    const guild = interaction?.channel.guild;
    if (useGuildLocale && guild?.preferredLocale) {
      return guild.preferredLocale;
    }
    return preferredLocale;
  }

  async initialize() {
    const preferredLocale = this.getPreferredLocale();
    await i18next.init({
      ns: namespace,
      defaultNS: namespace,
      fallbackNS: namespace,
      lng: preferredLocale,
      fallbackLng: fallbackLanguage,
      resources: require('./locales/resources'),
    });
  }

  getTranslator(interaction) {
    if (!interaction) {
      return i18next.t;
    }
    const preferredLocale = this.getPreferredLocale(interaction);
    return i18next.getFixedT(preferredLocale);
  }
}

module.exports = TranslatorsFactory;
