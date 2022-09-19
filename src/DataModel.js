const Database = require('./Database');
const EventEmitter = require('events');

const DataModelEvents = {
  onContestAdded: 'onContestAdded',
  onContestChanged: 'onContestChanged',
  onContestRemoved: 'onContestRemoved',
  onContestAnnouncementAdded: 'onContestAnnouncementAdded',
  onContestAnnouncementRemoved: 'onContestAnnouncementRemoved',
  onMessageAdded: 'onMessageAdded',
  onMessageChanged: 'onMessageChanged',
  onMessagesRemoved: 'onMessagesRemoved',
  onContestEntrySubmitted: 'onContestEntrySubmitted',
}

const ContestState = {
  Any: 'Any',
  ReadyToSubmitEntries: 'ReadyToSubmitEntries',
};

class DataModel extends EventEmitter {
  constructor() {
    super();
    this.database = new Database();
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

  async addContest(name, description, announcementsThreshold, activeBeginDate, activeEndDate, votingBeginDate, votingEndDate, guildId) {
    await this.database.exec(`
      PRAGMA temp_store = 2;
      BEGIN TRANSACTION;
        INSERT INTO Contest(name, description, announcementsThreshold, activeBeginDate, activeEndDate, votingBeginDate, votingEndDate, guildId)
        VALUES ("${name}", "${description}", ${announcementsThreshold}, ${activeBeginDate}, ${activeEndDate}, ${votingBeginDate}, ${votingEndDate}, "${guildId}");

        CREATE TEMP TABLE Variables AS SELECT last_insert_rowid() as contestId;

        INSERT INTO ContestVoteCategories(contestId, contestVoteCategoryId)
        SELECT Variables.contestId, ContestVoteCategory.id
        FROM ContestVoteCategory, Variables
        WHERE ContestVoteCategory.useByDefault = 1 AND guildId = "${guildId}";

        DROP TABLE Variables;
      COMMIT;
    `);
    this.emit(DataModelEvents.onContestAdded, guildId);
  }

  async changeContest(contestId, name, description, announcementsThreshold, activeBeginDate, activeEndDate, votingBeginDate, votingEndDate) {
    await this.database.run(`
      UPDATE Contest
      SET name = "${name}",
          description = "${description}",
          announcementsThreshold = "${announcementsThreshold}",
          activeBeginDate = ${activeBeginDate},
          activeEndDate = ${activeEndDate},
          votingBeginDate = ${votingBeginDate},
          votingEndDate = ${votingEndDate}
      WHERE id = ${contestId};
    `);
    this.emit(DataModelEvents.onContestChanged, contestId);
  }

  async removeContest(contestId) {
    await this.database.run(`
      DELETE FROM Contest
      WHERE id = ${contestId};
    `);
    this.emit(DataModelEvents.onContestRemoved, contestId);
  }

  getContestWhereClause(guildId, contestState) {
    const clause = [];
    const now = Date.now();
    if (guildId) {
      clause.push(`guildId = "${guildId}"`);
    }
    if (contestState === ContestState.ReadyToSubmitEntries) {
      clause.push(`activeBeginDate >= ${now}`);
      clause.push(`${now} < votingBeginDate`);
    }
    return clause.length > 0 ? `WHERE ${clause.join(' AND ')}` : '';
  }

  getContestsNames(guildId, contestState) {
    return this.database.all(
      [
        'SELECT id, name',
        'FROM Contest',
        this.getContestWhereClause(guildId, contestState)
      ]
      .join('\n')
      .concat(';')
    );
  }

  getContests(guildId, contestState) {
    return this.database.all(
      [
        'SELECT id, name, description, announcementsThreshold, activeBeginDate, activeEndDate, votingBeginDate, votingEndDate, guildId',
        'FROM Contest',
        this.getContestWhereClause(guildId, contestState)
      ]
      .join('\n')
      .concat(';')
    );
  }

  getContest(contestId) {
    return this.database.get(`
      SELECT id, name, description, announcementsThreshold, activeBeginDate, activeEndDate, votingBeginDate, votingEndDate, guildId
      FROM Contest
      WHERE id = ${contestId};
    `);
  }

  async addContestAnnouncement(type, contestId, messageId) {
    await this.database.run(`
      INSERT INTO ContestAnnouncement(type, contestId, messageId)
      VALUES (${type}, ${contestId}, "${messageId}");
    `);
    this.emit(DataModelEvents.onContestAnnouncementAdded, contestId);
  }

  async removeContestAnnouncements(contestAnnouncementsIds) {
    if (contestAnnouncementsIds.length === 0) {
      return;
    }
    const contestAnnouncementsIdsValues = contestAnnouncementsIds.map(id => `"${id}"`).join(', ');
    await this.database.exec(`
      DELETE FROM ContestAnnouncement
      WHERE id IN (${contestAnnouncementsIdsValues});
    `);
    this.emit(DataModelEvents.onContestAnnouncementRemoved, contestAnnouncementsIds);
  }

  getContestAnnouncements(contestId) {
    return this.database.all(`
      SELECT id, type, messageId
      FROM ContestAnnouncement
      WHERE contestId = ${contestId};
    `);
  }

  getContestAnnouncement(messageId) {
    return this.database.get(`
      SELECT id, type, contestId
      FROM ContestAnnouncement
      WHERE messageId = ${messageId};
    `);
  }

  async addMessage(guildId, channelId, messageId, messageChunks) {
    const values = messageChunks.map(
      ({id, hash}, position) => `("${id}", "${hash}", ${position}, "${messageId}")`
    );
    if (values.length === 0) {
      return;
    }
    await this.database.exec(`
      BEGIN TRANSACTION;
        INSERT OR REPLACE INTO Message(id, guildId, channelId)
        VALUES ("${messageId}", "${guildId}", "${channelId}");
        INSERT INTO MessageChunk(id, hash, position, messageId)
        VALUES ${values.join(', ')};
      COMMIT;
    `);
    this.emit(DataModelEvents.onMessageAdded, {guildId, channelId, messageId});
  }

  async updateMessage(messageId, updatedMessageChunks, obsoleteMessageChunks) {
    if (updatedMessageChunks.length === 0 && obsoleteMessageChunks.length === 0) {
      return;
    }
    const updateStatements = updatedMessageChunks.map(
      ({id, hash}) => (`
        UPDATE MessageChunk
        SET hash = "${hash}"
        WHERE id = "${id}";
      `)
    );
    const obsoleteMessageChunksIdsValues = obsoleteMessageChunks.map(({id}) => `"${id}"`).join(', ');
    await this.database.exec(`
      BEGIN TRANSACTION;
        ${updateStatements}
        DELETE FROM MessageChunk
        WHERE id IN (${obsoleteMessageChunksIdsValues});
      COMMIT;
    `);
    this.emit(DataModelEvents.onMessageChanged, messageId);
  }

  async removeMessages(messagesIds) {
    if (messagesIds.length === 0) {
      return;
    }
    const messageIdsValues = messagesIds.map(messageId => `"${messageId}"`).join(', ');
    await this.database.exec(`
      BEGIN TRANSACTION;
        DELETE FROM Message
        WHERE id IN (${messageIdsValues});
        DELETE FROM MessageChunk
        WHERE messageId IN (${messageIdsValues});
      COMMIT;
    `);
    this.emit(DataModelEvents.onMessagesRemoved, messagesIds);
  }

  getMessage(messageId) {
    return this.database.get(`
      SELECT id, guildId, channelId
      FROM Message
      WHERE id = "${messageId}";
    `);
  }

  getMessageChunks(messageId) {
    return this.database.all(`
      SELECT id, hash
      FROM MessageChunk
      WHERE messageId = "${messageId}"
      ORDER BY position ASC;
    `);
  }

  getMessageChunk(id) {
    return this.database.get(`
      SELECT id, hash, messageId
      FROM MessageChunk
      WHERE id = "${id}";
    `);
  }

  addContestVoteCategory(name, description, max, useByDefault, guildId) {
    return this.database.run(`
      INSERT INTO ContestVoteCategory(name, description, max, useByDefault, guildId)
      VALUES ("${name}", "${description}", ${max}, ${useByDefault ? 1 : 0}, "${guildId}");
    `);
  }

  getAssignedContestVoteCategories(contestId) {
    return this.database.all(`
      SELECT id, name, description, max
      FROM ContestVoteCategory
      INNER JOIN ContestVoteCategories ON ContestVoteCategories.contestVoteCategoryId = ContestVoteCategory.id
      WHERE ContestVoteCategories.contestId = ${contestId};
    `);
  }

  getContestVoteCategoriesNames(guildId) {
    return this.database.all(`
      SELECT id, name
      FROM ContestVoteCategory
      WHERE guildId = "${guildId}";
    `);
  }

  getContestVoteCategory(id) {
    return this.database.get(`
      SELECT id, name, description, max
      FROM ContestVoteCategory
      WHERE id = "${id}";
    `);
  }

  removeContestVoteCategory(contestVoteCategoryId) {
    return this.database.exec(`
      BEGIN TRANSACTION;
        DELETE FROM ContestVoteCategories
        WHERE contestVoteCategoryId = ${contestVoteCategoryId};

        DELETE FROM ContestVoteCategory
        WHERE id = ${contestVoteCategoryId};
      COMMIT;
    `);
  }

  changeContestVoteCategory(contestVoteCategoryId, name, description, max, useByDefault) {
    return this.database.run(`
      UPDATE ContestVoteCategory
      SET name = "${name}",
          description = "${description}",
          max = ${max},
          useByDefault = ${useByDefault}
      WHERE id = ${contestVoteCategoryId};
    `);
  }

  assignContestVoteCategory(contestId, contestVoteCategoryId) {
    return this.database.run(`
      INSERT INTO ContestVoteCategories(contestId, contestVoteCategoryId)
      VALUES (${contestId}, ${contestVoteCategoryId});
    `);
  }

  unassignContestVoteCategory(contestId, contestVoteCategoryId) {
    return this.database.run(`
      DELETE FROM ContestVoteCategories
      WHERE contestId = ${contestId} AND contestVoteCategoryId = ${contestVoteCategoryId};
    `);
  }

  addContestRule(description, useByDefault, guildId) {
    return this.database.run(`
      INSERT INTO ContestRule(description, useByDefault, guildId)
      VALUES ("${description}", ${useByDefault ? 1 : 0}, "${guildId}");
    `);
  }

  getAssignedContestRules(contestId) {
    return this.database.all(`
      SELECT ContestRule.id, ContestRule.description
      FROM ContestRule
      INNER JOIN ContestRules ON ContestRules.contestRuleId = ContestRule.id
      WHERE ContestRules.contestId = ${contestId};
    `);
  }

  getContestRulesDescriptions(guildId) {
    return this.database.all(`
      SELECT id, description
      FROM ContestRule
      WHERE guildId = "${guildId}";
    `);
  }

  getContestRule(id) {
    return this.database.get(`
      SELECT id, description
      FROM ContestRule
      WHERE id = "${id}";
    `);
  }

  removeContestRule(contestRuleId) {
    return this.database.exec(`
      BEGIN TRANSACTION;
        DELETE FROM ContestRules
        WHERE contestRuleId = ${contestRuleId};

        DELETE FROM ContestRule
        WHERE id = ${contestRuleId};
      COMMIT;
    `);
  }

  changeContestRule(contestRuleId, description, useByDefault) {
    return this.database.run(`
      UPDATE ContestRule
      SET description = "${description}",
          useByDefault = ${useByDefault}
      WHERE id = ${contestRuleId};
    `);
  }

  assignContestRule(contestId, contestRuleId) {
    return this.database.run(`
      INSERT INTO ContestRules(contestId, contestRuleId)
      VALUES (${contestId}, ${contestRuleId});
    `);
  }

  unassignContestRule(contestId, contestRuleId) {
    return this.database.run(`
      DELETE FROM ContestRules
      WHERE contestId = ${contestId} AND contestRuleId = ${contestRuleId};
    `);
  }

  async submitContestEntry(name, description, url, contestId, authorId) {
    await this.database.exec(`
      INSERT OR REPLACE INTO ContestEntry(name, description, url, authorId, contestId)
      VALUES ("${name}", "${description}", "${url}", "${authorId}", ${contestId});
  `);
    this.emit(DataModelEvents.onContestEntrySubmitted, contestId);
  }

  getSubmittedContestEntries(contestId) {
    return this.database.all(`
      SELECT ContestEntry.id, ContestEntry.name, ContestEntry.description, ContestEntry.url, ContestEntry.submitDate, User.name as authorName
      FROM ContestEntry
      INNER JOIN User ON User.id = ContestEntry.authorId
      WHERE ContestEntry.contestId = ${contestId}
      ORDER BY ContestEntry.submitDate ASC;
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

module.exports = {
  DataModelEvents,
  ContestState,
  DataModel,
}
