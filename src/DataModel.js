const Database = require('./Database');

class DataModel {
  constructor(client) {
    this.database = new Database();
    this.client = client;
    // guidlds, user and reasons are cached for autocompete
    this.guildsCache = new Map();
    this.usersCache = new Map();
    this.reasonsCache = new Map();
  }

  createSchema() {
    return this.database.exec(require('./schema.js'));
  }

  addGuildsToDatabase(guilds) {
    const values = guilds.map(({id, name}) => `("${id}", "${name}")`);
    return this.database.run(`INSERT INTO Guild VALUES ${values.join(', ')};`);
  }

  addGuildsToCache(guilds) {
    guilds.forEach(guild => this.guildsCache.set(guild.id, guild));
  }

  async getGuildsFromDatabase() {
    return await this.database.all('SELECT id, name FROM Guild;');
  }

  getGuildsFromDiscord() {
    return this.client.guilds.map(({id, name}) => ({
      id, name,
    }));
  }

  async initializeGuildsCache() {
    let guilds = await this.getGuildsFromDatabase();
    if (guilds.length > 0) {
      this.addGuildsToCache(guilds);
      return;
    }
    guilds = this.getGuildsFromDiscord();
    if (guilds.length > 0) {
      console.info(`Got ${guilds.length} new guilds`);
      this.addGuildsToCache(guilds);
      await this.addGuildsToDatabase(guilds);
    }
  }

  addUsersToDatabase(users) {
    const values = users.map(
      ({id, name, discriminator, guild}) => `("${id}", "${name}", "${discriminator}", "${guild.id}")`
    );
    return this.database.run(`INSERT INTO User VALUES ${values.join(', ')};`);
  }

  addUsersToCache(users) {
    users.forEach(user => this.usersCache.set(user.id, user));
  }

  async getUsersFromDatabase() {
    const items = await this.database.all('SELECT id, name, discriminator, guildId FROM User;');
    return items.map(({id, name, discriminator, guildId}) => ({
      id,
      name,
      discriminator,
      guild: this.guildsCache.get(guildId),
    }));
  }

  async searchUsersAtDiscord(guildId, query, limit) {
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
      guild: this.guildsCache.get(guildId),
    }));
  }

  async initializeUsersCache() {
    this.addUsersToCache(await this.getUsersFromDatabase());
  }

  getUsers() {
    return Array.from(this.usersCache.values());
  }

  getUser(userId) {
    return this.usersCache.get(userId);
  }

  async searchUsers(guildId, query, limit) {
    const users = await this.searchUsersAtDiscord(guildId, query, limit);
    if (users.length === 0) {
      return this.getUsers();
    }
    const newUsers = users.filter(({id}) => !this.usersCache.has(id));
    if (newUsers.length > 0) {
      console.info(`Got ${newUsers.length} new users`);
      this.addUsersToCache(newUsers);
      await this.addUsersToDatabase(newUsers);
    }
    return users;
  }

  addReasonsToDatabase(reasons) {
    const values = reasons.map(
      ({name, min, max}) => `("${name}", ${min}, ${max})`
    );
    return this.database.run(`INSERT INTO Reason(name, min, max) VALUES ${values.join(', ')};`);
  }

  addReasonsToCache(reasons) {
    reasons.forEach(reason => this.reasonsCache.set(reason.id, reason));
  }

  async getReasonsFromDatabase() {
    return await this.database.all('SELECT id, name, min, max FROM Reason;');
  }

  addReasonsToDatabase(reasons) {
    const values = reasons.map(
      ({name, min, max}) => `("${name}", ${min}, ${max})`
    );
    return this.database.run(`INSERT INTO Reason(name, min, max) VALUES ${values.join(', ')};`);
  }

  async initializeReasonsCache() {
    // temporary data
    await this.addReasonsToDatabase([
      {name: 'Subject of the day', min: 1, max: 5},
      {name: 'Shared a link', min: 1, max: 5},
      {name: 'Looks like Mr. Spock', min: 3, max: 12},
    ]);
    this.addReasonsToCache(await this.getReasonsFromDatabase());
  }

  getReasons() {
    return Array.from(this.reasonsCache.values());
  }

  getReason(reasonId) {
    return this.reasonsCache.get(reasonId);
  }
  
  addScores(scores) {
    const values = scores.map(
      ({points, user, reason, comment = ''}) => `(${points}, "${comment}", "${user.id}", ${reason.id})`
    );
    return this.database.run(`INSERT INTO Score(points, comment, userId, reasonId) VALUES ${values.join(', ')};`);
  }

  async initialize() {
    await this.database.open();
    await this.createSchema();
    await this.initializeGuildsCache();
    await this.initializeUsersCache();
    return this.initializeReasonsCache();
  }

  uninitialize() {
    return this.database.close();
  }
}

module.exports = DataModel;
