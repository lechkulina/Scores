const SettingId = {
  PointsAnnouncementsChannelId: 'PointsAnnouncementsChannelId',
  ContestsAnnouncementsChannelId: 'ContestsAnnouncementsChannelId',
  PreferredLocale: 'PreferredLocale',
  UseGuildLocale: 'UseGuildLocale',
  RecentlyGivenPointsLimit: 'RecentPointsLimit',
  DateInputFormat: 'DateInputFormat',
  DateAndTimeInputFormat: 'DateAndTimeInputFormat',
  DateOutputFormat: 'DateOutputFormat',
  DateAndTimeOutputFormat: 'DateAndTimeOutputFormat',
  MinNameLength: 'MinNameLength',
  MaxNameLength: 'MaxNameLength',
  MinDescriptionLength: 'MinDescriptionLength',
  MaxDescriptionLength: 'MaxDescriptionLength',
  MinUrlLength: 'MinUrlLength',
  MaxUrlLength: 'MaxUrlLength',
  TasksRunInterval: 'TasksRunInterval',
}

const defaultSettings = {
  [SettingId.PointsAnnouncementsChannelId]: '1017504421200023592', // TODO remove this test settting
  [SettingId.ContestsAnnouncementsChannelId]: '1017504421200023592', // TODO remove this test settting
  [SettingId.PreferredLocale]: 'pl', // TODO change to en
  [SettingId.UseGuildLocale]: false, // TODO change to en
  [SettingId.RecentlyGivenPointsLimit]: 30,
  [SettingId.DateInputFormat]: 'DD.MM.YYYY',
  [SettingId.DateAndTimeInputFormat]: 'DD.MM.YYYY HH:mm',
  [SettingId.DateOutputFormat]: 'DD.MM.YYYY',
  [SettingId.DateAndTimeOutputFormat]: 'DD.MM.YYYY HH:mm',
  [SettingId.MinNameLength]: 3,
  [SettingId.MaxNameLength]: 200,
  [SettingId.MinDescriptionLength]: 10,
  [SettingId.MaxDescriptionLength]: 2000,
  [SettingId.MinUrlLength]: 3,
  [SettingId.MaxUrlLength]: 2000,
  [SettingId.TasksRunInterval]: 2000,
};

class Settings {
  constructor(dataModel) {
    this.dataModel = dataModel;
    this.cache = new Map();
  }

  serialize() {
    const serializedCache = Array.from(this.cache.entries())
      .map(([id, value]) => ({
        id,
        value: `${value}`,
        type: typeof value,
      }));
    return this.dataModel.setSettings(serializedCache);
  }

  deserializeValue(value, type) {
    switch(type) {
      case 'boolean':
        return value === 'true';
      case 'number':
        return Number(value);
      default:
        return value;
    }
  };

  async deserialize() {
    const serializedCache = await this.dataModel.getSettings();
    this.cache = serializedCache.reduce((result, {id, value, type}) => {
      result.set(id, this.deserializeValue(value, type));
      return result;
    }, new Map());
  }

  setDefaults() {
    Object.keys(defaultSettings).forEach(id => {
      const value = defaultSettings[id];
      this.cache.set(id, value);
    });
  }

  async initialize() {
    await this.deserialize();
    console.info(`Found ${this.cache.size} serialized settings`);
    if (this.cache.size === 0) {
      console.info(`Initializing settings with the default ones`);
      this.setDefaults();
      await this.serialize();
    }
  }

  get(id) {
    return this.cache.get(id);
  }

  set(id, value) {
    this.cache.set(id, value);
    return this.serialize();
  }
}

module.exports = {
  SettingId,
  Settings,
};
