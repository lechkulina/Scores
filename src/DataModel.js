const Database = require('./Database');

class DataModel {
  constructor(client) {
    this.database = new Database();
    this.client = client;
    this.reasonsCache = new Map();
  }

  createSchema() {
    return this.database.exec(require('./schema.js'));
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
      SET name = "${name}",
          min = ${min},
          max = ${max}
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
      SET points = ${points},
          reasonId = ${reasonId}
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

  addGuild(id, name) {
    return this.database.run(`
      INSERT OR REPLACE INTO Guild(id, name)
      VALUES ("${id}", "${name}");
    `);
  }

  grantUserPermission(userId, commandId) {
    return this.database.run(`
      INSERT OR REPLACE INTO UserPermission(userId, commandId)
      VALUES ("${userId}", "${commandId}");
    `);
  }

  revokeUserPermission(userId, commandId) {
    return this.database.run(`
      DELETE FROM UserPermission
      WHERE userId = "${userId}" AND commandId = "${commandId}";
    `);
  }

  async isAllowed(userId, roleIds, commandId) {
    return await this.database.get(`
      SELECT 1 AS allowed
      FROM UserPermission AS U, RolePermission AS R
      WHERE (U.userId = "${userId}" AND U.commandId = "${commandId}")
        OR (R.roleId IN (${roleIds.map(roldId => `"${roldId}"`).join(', ')}) AND R.commandId = "${commandId}")
    `) ? true : false;
  }

  getCommandsWithPermissions(userId, roleIds) {
    return this.database.all(`
      SELECT Command.id AS id, Command.description AS description, IFNULL((
        SELECT 1
        FROM UserPermission AS U, RolePermission AS R
        WHERE (U.userId = "${userId}" AND U.commandId = Command.id)
          OR (R.roleId IN (${roleIds.map(roldId => `"${roldId}"`).join(', ')}) AND R.commandId = Command.id)
      ), 0) AS allowed
      FROM Command;
    `);
  }

  addContest(guildId, name, description, activeBeginDate, activeEndDate, votingBeginDate, votingEndDate) {
    return this.database.run(`
      INSERT OR REPLACE INTO Contest(name, description, activeBeginDate, activeEndDate, votingBeginDate, votingEndDate, guildId)
      VALUES ("${name}", "${description}", ${activeBeginDate}, ${activeEndDate}, ${votingBeginDate}, ${votingEndDate}, "${guildId}");
    `);
  }

  getContestsNames(guildId) {
    return this.database.all(`
      SELECT id, name
      FROM Contest
      WHERE guildId = "${guildId}";
    `);
  }

  getContest(guildId, contestId) {
    return this.database.get(`
      SELECT id, name, description, activeBeginDate, activeEndDate, votingBeginDate, votingEndDate
      FROM Contest
      WHERE id = "${contestId}" AND guildId = "${guildId}";
    `);
  }

  changeContest(guildId, contestId, name, description, activeBeginDate, activeEndDate, votingBeginDate, votingEndDate) {
    return this.database.run(`
      UPDATE Contest
      SET name = "${name}",
          description = "${description}",
          activeBeginDate = ${activeBeginDate},
          activeEndDate = ${activeEndDate},
          votingBeginDate = ${votingBeginDate},
          votingEndDate = ${votingEndDate}
      WHERE id = "${contestId}" AND guildId = "${guildId}";
    `);
  }

  removeContest(guildId, contestId) {
    return this.database.run(`
      DELETE FROM Contest
      WHERE id = ${contestId} AND guildId = "${guildId}";
    `);
  }

  async initialize() {
    await this.database.open();
    await this.createSchema();
  }

  uninitialize() {
    return this.database.close();
  }
}

module.exports = DataModel;
