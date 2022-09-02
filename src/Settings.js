class StringConverter {
  static to(value) { return value; }
  static from(value) { return value; }
}

class NumberConverter {
  static to(value) { return parseInt(value); }
  static from(value) { return `${value}` }
}

class BooleanConverter {
  static to(value) { return value === 'true'; }
  static from(value) { return value ? 'true' : 'false';}
}

const converters = {
  publicChannelId: StringConverter,
  preferredLocale: StringConverter,
  useGuildLocale: BooleanConverter,
  recentPointsLimit: NumberConverter,
};

class Settings {
  constructor(dataModel) {
    this.dataModel = dataModel;
    this.cache = new Map();
  }

  async initialize() {
    // temporary settings
    return Promise.all([
      this.set('publicChannelId', '1014636769989369938'),
      this.set('preferredLocale', 'pl'),
      this.set('useGuildLocale', false),
      this.set('recentPointsLimit', 6),
    ]);
  }

  async get(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const converter = converters[key];
    if (!converter) {
      console.error(`Failed to get setting ${key} - unknown setting`);
      return;
    }
    try {
      const value = await this.dataModel.getSetting(key);
      if (typeof value === 'undefined') {
        console.error(`Failed to get setting ${key} - it has no value`);
        return;
      }
      const converted = converter.to(value);
      this.cache.set(key, converted);
      return converted;
    } catch(error) {
      console.error(`Failed to get setting ${key} - got error ${error.message}`);
    }
  }

  async set(key, value) {
    const converter = converters[key];
    if (!converter) {
      console.error(`Failed to set setting ${key} - unknown setting`);
      return;
    }
    try {
      const converted = converter.from(value);
      await this.dataModel.setSetting(key, converted);
      this.cache.set(key, value);
    } catch(error) {
      console.error(`Failed to set setting ${key} - got error ${error.message}`);
    }
  }
}

module.exports = Settings;
