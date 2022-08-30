const Database = require('./Database');

class DataModel {
  constructor(client) {
    this.database = new Database();
    this.client = client;
    this.guilds = new Map();
    this.users = new Map();
    this.reasons = new Map();
  }

  createSchema() {
    return this.database.exec(require('./schema.js'));
  }

  async getGuildsFromDatabase() {
    const guilds = new Map();
    const guildsArray = await this.database.all('SELECT id, name FROM Guild;');
    guildsArray.forEach(({id, name}) => guilds.set(id, {id, name}));
    return guilds;
  }

  getGuildsArrayFromDiscord() {
    return this.client.guilds.map(({id, name}) => ({
      id, name,
    }));
  }

  addGuildsArrayToDatabase(guildsArray) {
    const values = guildsArray.map(({id, name}) => `("${id}", "${name}")`);
    return this.database.run(`INSERT INTO Guild VALUES ${values.join(', ')};`);
  }

  async initializeGuilds() {
    this.guilds = await this.getGuildsFromDatabase();
    if (this.guilds.size > 0) {
      return;
    }
    const newGuildsArray = this.getGuildsArrayFromDiscord();
    if (newGuildsArray.length > 0) {
      console.info(`Got ${newGuildsArray.length} new guilds`);
      newGuildsArray.forEach(newGuild => {
        this.guilds.set(newGuild.id, newGuild);
      });
      await this.addGuildsArrayToDatabase(newGuildsArray);
    }
  }

  async getUsersFromDatabase() {
    const users = new Map();
    const usersArray = await this.database.all('SELECT id, name, discriminator, guildId FROM User;');
    usersArray.forEach(({id, name, discriminator, guildId}) => {
      users.set(id, {
        id,
        name,
        discriminator,
        guild: this.guilds.get(guildId),
      });
    });
    return users;
  }

  addUsersArrayToDatabase(usersArray) {
    const values = usersArray.map(
      ({id, name, discriminator, guild}) => `("${id}", "${name}", "${discriminator}", "${guild.id}")`
    );
    return this.database.run(`INSERT INTO User VALUES ${values.join(', ')};`);
  }

  async searchUsersArrayFromDiscord(guildId, query, limit) {
    if (!query || query.length < 1) {
      return [];
    }
    const clientGuild = this.client.guilds.find(({id}) => id === guildId);
    if (!clientGuild) {
      console.error(`Unable to search users - unknown guild id ${guildId}`);
      return [];
    }
    const clientMembers = await clientGuild.fetchMembers({
      query,
      limit,
      presences: false,
    });
    return clientMembers.map(({guild: {id: guildId}, user: {id, username, discriminator}}) => ({
      id,
      name: username,
      discriminator,
      guild: this.guilds.get(guildId),
    }));
  }

  async initializeUsers() {
    this.users = await this.getUsersFromDatabase();
  }

  async searchUsers(guildId, query, limit) {
    const usersArray = await this.searchUsersArrayFromDiscord(guildId, query, limit);
    if (usersArray.length === 0) {
      return Array.from(this.users.values());
    }
    const newUsersArray = usersArray.filter(({id}) => !this.users.has(id));
    if (newUsersArray.length > 0) {
      console.info(`Got ${newUsersArray.length} new users`);
      newUsersArray.forEach(newUser => {
        this.users.set(newUser.id, newUser);
      });
      await this.addUsersArrayToDatabase(newUsersArray);
    }
    return usersArray;
  }

  async getReasonsFromDatabase() {
    const reasons = new Map();
    const reasonsArray = await this.database.all('SELECT id, name, min, max FROM Reason;');
    reasonsArray.forEach((reason) => reasons.set(reason.id, reason));
    return reasons;
  }

  addReasonsArrayToDatabase(reasonsArray) {
    const values = reasonsArray.map(
      ({name, min, max}) => `("${name}", ${min}, ${max})`
    );
    return this.database.run(`INSERT INTO Reason(name, min, max) VALUES ${values.join(', ')};`);
  }

  async initializeReasons() {
    // temporary data
    await this.addReasonsArrayToDatabase([
      {name: 'Subject of the day', min: 1, max: 5},
      {name: 'Shared a link', min: 1, max: 5},
      {name: 'Looks like Mr. Spock', min: 3, max: 12},
    ]);
    this.reasons = await this.getReasonsFromDatabase();
  }

  getReasonsArray() {
    return Array.from(this.reasons.values());
  }

  async initialize() {
    await this.database.open();
    await this.createSchema();
    await this.initializeGuilds();
    await this.initializeUsers();
    return this.initializeReasons();
  }

  uninitialize() {
    return this.database.close();
  }
}

module.exports = DataModel;
