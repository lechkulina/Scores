const Database = require('./Database');

class DataModel {
  constructor(client) {
    this.database = new Database();
    this.client = client;
    // guidlds, user and reasons are cached for autocompete
    this.guildsCache = new Map();
    this.usersCache = new Map();
    this.reasonsCache = new Map();
    this.commandsInfo = new Map();
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

  getGuildsFromDatabase() {
    return this.database.all('SELECT id, name FROM Guild;');
  }

  getGuildsFromDiscord() {
    return this.client.guilds.map(({id, name}) => ({
      id, name,
    }));
  }

  async initializeGuildsCache() {
    this.getGuildsFromDiscord();
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

  async addNewUsers(users) {
    const newUsers = users.filter(({id}) => !this.usersCache.has(id));
    if (newUsers.length === 0) {
      return;
    }
    console.info(`Got ${newUsers.length} new users`);
    this.addUsersToCache(newUsers);
    return this.addUsersToDatabase(newUsers);
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

  async addInteractionAuthor(commandInteraction) {
    if (!commandInteraction?.member) {
      return;
    }
    const {guild: {id: guildId}, user: {id, username, discriminator}} = commandInteraction.member;
    return this.addNewUsers([{
      id,
      name: username,
      discriminator,
      guild: this.guildsCache.get(guildId),
    }]);
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
    await this.addNewUsers(users);
    return users;
  }

  async addReason(name, min, max) {
    await this.database.run(`
      INSERT INTO Reason(name, min, max)
      VALUES ("${name}", ${min}, ${max});
    `);
    this.reasonsCache.clear();
  }

  async removeReason(reasonId) {
    await this.database.run(`
      DELETE FROM Reason
      WHERE id = ${reasonId};
    `);
    this.reasonsCache.delete(reasonId);
  }

  async changeReason(reasonId, name, min, max) {
    await this.database.run(`
      UPDATE Reason
      SET name = "${name}", min = ${min}, max = ${max}
      WHERE id = ${reasonId};
    `);
    this.reasonsCache.clear();
  }

  async getReasons() {
    if (this.reasonsCache.size > 0) {
      return Array.from(this.reasonsCache.values());
    }
    const reasons = await this.database.all(`
      SELECT id, name, min, max
      FROM Reason;
    `);
    reasons.forEach(reason => this.reasonsCache.set(reason.id, reason));
    return reasons;
  }

  async getReason(reasonId) {
    if (this.reasonsCache.size > 0) {
      return this.reasonsCache.get(reasonId);
    }
    const reason = await this.database.get(`
      SELECT id, name, min, max
      FROM Reason
      WHERE id = ${reasonId};
    `);
    if (reason) {
      this.reasonsCache.set(reason.id, reason);
    }
    return reason;
  }
  
  addPoints(points, userId, giverId, reasonId) {
    return this.database.run(`
      INSERT INTO Points(points, userId, giverId, reasonId)
      VALUES (${points}, "${userId}", "${giverId}", ${reasonId});
    `);
  }

  removePoints(pointsId) {
    return this.database.run(`
      DELETE FROM Points
      WHERE id = ${pointsId};
    `);
  }

  changePoints(pointsId, points, reasonId) {
    return this.database.run(`
      UPDATE Points
      SET points = ${points}, reasonId = ${reasonId}
      WHERE id = ${pointsId};
    `);
  }

  getPointsSummary(userId) {
    return this.database.get(`
      SELECT SUM(points) AS points, COUNT(1) as pointsCount, MIN(acquireDate) AS minAcquireDate, MAX(acquireDate) AS maxAcquireDate
      FROM (
        SELECT points, acquireDate
        FROM Points
        WHERE userId = "${userId}"
      );
    `);
  }

  getRecentPoints(userId, limit) {
    return this.database.all(`
      SELECT Points.points as points, Points.acquireDate as acquireDate, Giver.name AS giverName, Reason.name AS reasonName
      FROM Points
      INNER JOIN User AS Giver ON Giver.id = giverId
      INNER JOIN Reason ON Reason.id = Points.reasonId
      WHERE Points.userId = "${userId}"
      ORDER BY Points.acquireDate DESC
      LIMIT ${limit};
    `);
  }

  getRankingPositions(userId) {
    return this.database.all(`
      SELECT COUNT(sumPointsPerReason) + 1 as rankingPosition, SUM(D.points) as points, Reason.name AS reasonName
      FROM Points as D
      INNER JOIN Reason ON Reason.id = D.reasonId
      LEFT JOIN (
        SELECT SUM(B.points) as sumPointsPerReason, B.userId, B.reasonId, (
            SELECT SUM(A.points)
            FROM Points AS A
            WHERE A.userId = "${userId}" AND A.reasonId = B.reasonId
          ) as userPoints
          FROM Points AS B
          GROUP BY B.userId, B.reasonId
          HAVING sumPointsPerReason > userPoints
      ) AS C ON C.reasonId = D.reasonId
      WHERE D.userId = "${userId}"
      GROUP BY D.reasonId
      ORDER BY rankingPosition ASC;
    `);
  }

  getRecentlyGivenPoints(userId, giverId, limit) {
    return this.database.all(`
      SELECT Points.id, Points.points as points, Points.acquireDate as acquireDate, Reason.name AS reasonName
      FROM Points
      INNER JOIN Reason ON Reason.id = Points.reasonId
      WHERE Points.userId = "${userId}" AND Points.giverId = ${giverId}
      ORDER BY Points.acquireDate DESC
      LIMIT ${limit};
    `);
  }

  getPoints(pointsId) {
    return this.database.get(`
      SELECT Points.id AS id, Points.points as points, Points.acquireDate as acquireDate, Giver.name AS giverName, Reason.name AS reasonName
      FROM Points
      INNER JOIN User AS Giver ON Giver.id = giverId
      INNER JOIN Reason ON Reason.id = Points.reasonId
      WHERE Points.id="${pointsId}"
    `);
  }

  setSetting(key, value) {
    return this.database.run(`
      INSERT OR REPLACE INTO Settings(key, value)
      VALUES ("${key}", "${value}");
    `);
  }

  async getSetting(key) {
    return await this.database.get(`
      SELECT value
      FROM Settings
      WHERE key="${key}"
      LIMIT 1;
    `)?.value;
  }

  addCommand(id, description) {
    return this.database.run(`
      INSERT OR REPLACE INTO Command(id, description)
      VALUES ("${id}", "${description}");
    `);
  }

  getCommands() {
    return this.database.all(`
      SELECT Command.id AS id, Command.description AS description
      FROM Command;
    `);
  }

  addRole(id, name, guildId) {
    return this.database.run(`
      INSERT OR REPLACE INTO Role(id, name, guildId)
      VALUES ("${id}", "${name}", "${guildId}");
    `);
  }

  grantRolePermission(roleId, commandId) {
    return this.database.run(`
      INSERT OR REPLACE INTO RolePermission(roleId, commandId)
      VALUES ("${roleId}", "${commandId}");
    `);
  }

  revokeRolePermission(roleId, commandId) {
    return this.database.run(`
      DELETE FROM RolePermission
      WHERE roleId = "${roleId}" AND commandId = "${commandId}";
    `);
  }

  addUser(id, name, discriminator, guildId) {
    return this.database.run(`
      INSERT OR REPLACE INTO User(id, name, discriminator, guildId)
      VALUES ("${id}", "${name}", "${discriminator}", "${guildId}");
    `);
  }

  grantUserPermission(userId, commandId) {
    return this.database.run(`
      INSERT OR REPLACE INTO UserPermission(userId, commandId)
      VALUES ("${userId}", "${commandId}");
    `);
  }

  async initialize() {
    return Promise.all([
      this.database.open(),
      this.createSchema(),
      this.initializeGuildsCache(),
      this.initializeUsersCache(),
    ]);
  }

  uninitialize() {
    return this.database.close();
  }
}

module.exports = DataModel;
