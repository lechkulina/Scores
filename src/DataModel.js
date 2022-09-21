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
  onContestVoteCategoryAdded: 'onContestVoteCategoryAdded',
  onContestVoteCategoryChanged: 'onContestVoteCategoryChanged',
  onContestVoteCategoryRemoved: 'onContestVoteCategoryRemoved',
  onContestVoteCategoryAssigned: 'onContestVoteCategoryAssigned',
  onContestVoteCategoryUnassigned: 'onContestVoteCategoryUnassigned',
  onContestRuleAdded: 'onContestRuleAdded',
  onContestRuleChanged: 'onContestRuleChanged',
  onContestRuleRemoved: 'onContestRuleRemoved',
  onContestRuleAssigned: 'onContestRuleAssigned',
  onContestRuleUnassigned: 'onContestRuleUnassigned',
  onContestRewardAdded: 'onContestRewardAdded',
  onContestRewardChanged: 'onContestRewardChanged',
  onContestRewardRemoved: 'onContestRewardRemoved',
  onContestRewardAssigned: 'onContestRewardAssigned',
  onContestRewardUnassigned: 'onContestRewardUnassigned',
  onContestEntrySubmitted: 'onContestEntrySubmitted',
  onContestEntryCanceled: 'onContestEntryCanceled',
  onContestEntryChanged: 'onContestEntryChanged',
  onContestVoteAdded: 'onContestVoteAdded',
  onContestVoteChanged: 'onContestVoteChanged',
  onContestVoteRemoved: 'onContestVoteRemoved',
}

const ContestState = {
  Any: 'Any',
  Active: 'Active',
  Open: 'Open',
  OpenForSubmittingEntries: 'OpenForSubmittingEntries',
  OpenForVoting: 'OpenForVoting',
};

class DataModel extends EventEmitter {
  constructor() {
    super();
    this.database = new Database();
  }

  getLimitClause(limit) {
    return !!limit ? `LIMIT ${limit}` : '';
  }

  joinClauses(clauses) {
    return clauses
      .filter(clause => !!clause)
      .join('\n')
      .concat(';');
  }

  createSchema() {
    return this.database.exec(require('./schema.js'));
  }

  addReason(name, min, max) {
    return this.database.run(`
      INSERT INTO Reason(name, min, max)
      VALUES ("${name}", ${min}, ${max});
    `);
  }

  removeReason(reasonId) {
    return this.database.run(`
      DELETE FROM Reason
      WHERE id = ${reasonId};
    `);
  }

  changeReason(reasonId, name, min, max) {
    return this.database.run(`
      UPDATE Reason
      SET name = "${name}",
          min = ${min},
          max = ${max}
      WHERE id = ${reasonId};
    `);
  }

  getReasons(limit) {
    return this.database.all(
      this.joinClauses([
        'SELECT id, name, min, max',
        'FROM Reason',
        this.getLimitClause(limit),
      ])
    );
  }

  getReason(reasonId) {
    return this.database.get(`
      SELECT id, name, min, max
      FROM Reason
      WHERE id = ${reasonId};
    `);
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
    return this.database.all(
      this.joinClauses([
        'SELECT Points.id, Points.points as points, Points.acquireDate as acquireDate, Reason.name AS reasonName',
        'FROM Points',
        'INNER JOIN Reason ON Reason.id = Points.reasonId',
        `WHERE Points.userId = "${userId}" AND Points.giverId = ${giverId}`,
        'ORDER BY Points.acquireDate DESC',
        this.getLimitClause(limit),
      ])
    );
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

  getSetting(key) {
    return this.database.get(`
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

  getCommands(limit) {
    return this.database.all(
      this.joinClauses([
        'SELECT id, description',
        'FROM Command',
        this.getLimitClause(limit),
      ])
    );
  }

  getCommand(id) {
    return this.database.get(`
      SELECT id, description
      FROM Command
      WHERE id = "${id}";
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
    return (await this.database.get(`
      SELECT 1 AS allowed
      FROM UserPermission AS U, RolePermission AS R
      WHERE (U.userId = "${userId}" AND U.commandId = "${commandId}")
        OR (R.roleId IN (${roleIds.map(roldId => `"${roldId}"`).join(', ')}) AND R.commandId = "${commandId}")
    `)) ? true : false;
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
      clause.push(`Contest.guildId = "${guildId}"`);
    }
    switch (contestState) {
      case ContestState.Active:
        clause.push(`Contest.activeBeginDate >= ${now}`);
        clause.push(`${now} < Contest.activeEndDate`);
        break;
      case ContestState.Open:
        clause.push(`${now} < Contest.activeEndDate`);
        break;
      case ContestState.OpenForSubmittingEntries:
        clause.push(`${now} >= Contest.activeBeginDate`);
        clause.push(`${now} < Contest.votingBeginDate`);
        break;
      case ContestState.OpenForVoting:
        clause.push(`${now} >= Contest.votingBeginDate`);
        clause.push(`${now} < Contest.votingEndDate`);
        break;
    }
    return clause.length > 0 ? `WHERE ${clause.join(' AND ')}` : '';
  }

  getContestsNames(guildId, contestState, limit) {
    return this.database.all(
      this.joinClauses([
        'SELECT id, name',
        'FROM Contest',
        this.getContestWhereClause(guildId, contestState),
        this.getLimitClause(limit),
      ])
    );
  }

  getContests(guildId, contestState) {
    return this.database.all(
      this.joinClauses([
        'SELECT id, name, description, announcementsThreshold, activeBeginDate, activeEndDate, votingBeginDate, votingEndDate, guildId',
        'FROM Contest',
        this.getContestWhereClause(guildId, contestState)
      ])
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
    this.emit(DataModelEvents.onMessageAdded, {
      guildId,
      channelId,
      messageId
    });
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

  async addContestVoteCategory(name, description, max, useByDefault, guildId) {
    await this.database.run(`
      INSERT INTO ContestVoteCategory(name, description, max, useByDefault, guildId)
      VALUES ("${name}", "${description}", ${max}, ${useByDefault ? 1 : 0}, "${guildId}");
    `);
    this.emit(DataModelEvents.onContestVoteCategoryAdded, guildId);
  }

  getAssignedContestVoteCategories(contestId, limit) {
    return this.database.all(
      this.joinClauses([
        'SELECT id, name, description, max',
        'FROM ContestVoteCategory',
        'INNER JOIN ContestVoteCategories ON ContestVoteCategories.contestVoteCategoryId = ContestVoteCategory.id',
        `WHERE ContestVoteCategories.contestId = ${contestId}`,
        this.getLimitClause(limit),
      ])
    );
  }

  getContestVoteCategoriesNames(guildId, limit) {
    return this.database.all(
      this.joinClauses([
        'SELECT id, name',
        'FROM ContestVoteCategory',
        `WHERE guildId = "${guildId}"`,
        this.getLimitClause(limit),
      ])
    );
  }

  getContestVoteCategory(id) {
    return this.database.get(`
      SELECT id, name, description, max
      FROM ContestVoteCategory
      WHERE id = "${id}";
    `);
  }

  async removeContestVoteCategory(contestVoteCategoryId, guildId) {
    await this.database.exec(`
      BEGIN TRANSACTION;
        DELETE FROM ContestVoteCategories
        WHERE contestVoteCategoryId = ${contestVoteCategoryId};

        DELETE FROM ContestVoteCategory
        WHERE id = ${contestVoteCategoryId};
      COMMIT;
    `);
    this.emit(DataModelEvents.onContestVoteCategoryRemoved, guildId);
  }

  async changeContestVoteCategory(contestVoteCategoryId, name, description, max, useByDefault, guildId) {
    await this.database.run(`
      UPDATE ContestVoteCategory
      SET name = "${name}",
          description = "${description}",
          max = ${max},
          useByDefault = ${useByDefault}
      WHERE id = ${contestVoteCategoryId};
    `);
    this.emit(DataModelEvents.onContestVoteCategoryChanged, guildId);
  }

  async assignContestVoteCategory(contestId, contestVoteCategoryId) {
    await this.database.run(`
      INSERT INTO ContestVoteCategories(contestId, contestVoteCategoryId)
      VALUES (${contestId}, ${contestVoteCategoryId});
    `);
    this.emit(DataModelEvents.onContestVoteCategoryAssigned, contestId);
  }

  async unassignContestVoteCategory(contestId, contestVoteCategoryId) {
    await this.database.run(`
      DELETE FROM ContestVoteCategories
      WHERE contestId = ${contestId} AND contestVoteCategoryId = ${contestVoteCategoryId};
    `);
    this.emit(DataModelEvents.onContestVoteCategoryUnassigned, contestId);
  }

  async addContestRule(description, useByDefault, guildId) {
    await this.database.run(`
      INSERT INTO ContestRule(description, useByDefault, guildId)
      VALUES ("${description}", ${useByDefault ? 1 : 0}, "${guildId}");
    `);
    this.emit(DataModelEvents.onContestRuleAdded, guildId);
  }

  getAssignedContestRules(contestId, limit) {
    return this.database.all(
      this.joinClauses([
        'SELECT ContestRule.id, ContestRule.description',
        'FROM ContestRule',
        'INNER JOIN ContestRules ON ContestRules.contestRuleId = ContestRule.id',
        `WHERE ContestRules.contestId = ${contestId}`,
        this.getLimitClause(limit),
      ])
    );
  }

  getContestRulesDescriptions(guildId, limit) {
    return this.database.all(
      this.joinClauses([
        'SELECT id, description',
        'FROM ContestRule',
        `WHERE guildId = "${guildId}"`,
        this.getLimitClause(limit),
      ])
    );
  }

  getContestRule(id) {
    return this.database.get(`
      SELECT id, description
      FROM ContestRule
      WHERE id = "${id}";
    `);
  }

  async removeContestRule(contestRuleId, guildId) {
    await this.database.exec(`
      BEGIN TRANSACTION;
        DELETE FROM ContestRules
        WHERE contestRuleId = ${contestRuleId};

        DELETE FROM ContestRule
        WHERE id = ${contestRuleId};
      COMMIT;
    `);
    this.emit(DataModelEvents.onContestRuleRemoved, guildId);
  }

  async changeContestRule(contestRuleId, description, useByDefault, guildId) {
    await this.database.run(`
      UPDATE ContestRule
      SET description = "${description}",
          useByDefault = ${useByDefault}
      WHERE id = ${contestRuleId};
    `);
    this.emit(DataModelEvents.onContestRuleChanged, guildId);
  }

  async assignContestRule(contestId, contestRuleId) {
    await this.database.run(`
      INSERT INTO ContestRules(contestId, contestRuleId)
      VALUES (${contestId}, ${contestRuleId});
    `);
    this.emit(DataModelEvents.onContestRuleAssigned, contestId);
  }

  async unassignContestRule(contestId, contestRuleId) {
    await this.database.run(`
      DELETE FROM ContestRules
      WHERE contestId = ${contestId} AND contestRuleId = ${contestRuleId};
    `);
    this.emit(DataModelEvents.onContestRuleUnassigned, contestId);
  }

  async addContestReward(description, useByDefault, guildId) {
    await this.database.run(`
      INSERT INTO ContestReward(description, useByDefault, guildId)
      VALUES ("${description}", ${useByDefault ? 1 : 0}, "${guildId}");
    `);
    this.emit(DataModelEvents.onContestRewardAdded, guildId);
  }

  getAssignedContestRewards(contestId, limit) {
    return this.database.all(
      this.joinClauses([
        'SELECT ContestReward.id, ContestReward.description',
        'FROM ContestReward',
        'INNER JOIN ContestRewards ON ContestRewards.contestRewardId = ContestReward.id',
        `WHERE ContestRewards.contestId = ${contestId}`,
        this.getLimitClause(limit),
      ])
    );
  }

  getContestRewardsDescriptions(guildId, limit) {
    return this.database.all(
      this.joinClauses([
        'SELECT id, description',
        'FROM ContestReward',
        `WHERE guildId = "${guildId}"`,
        this.getLimitClause(limit),
      ])
    );
  }

  getContestReward(id) {
    return this.database.get(`
      SELECT id, description
      FROM ContestReward
      WHERE id = "${id}";
    `);
  }

  async removeContestReward(contestRewardId, guildId) {
    await this.database.exec(`
      BEGIN TRANSACTION;
        DELETE FROM ContestRewards
        WHERE contestRewardId = ${contestRewardId};

        DELETE FROM ContestReward
        WHERE id = ${contestRewardId};
      COMMIT;
    `);
    this.emit(DataModelEvents.onContestRewardRemoved, guildId);
  }

  async changeContestReward(contestRewardId, description, useByDefault, guildId) {
    await this.database.run(`
      UPDATE ContestReward
      SET description = "${description}",
          useByDefault = ${useByDefault}
      WHERE id = ${contestRewardId};
    `);
    this.emit(DataModelEvents.onContestRewardChanged, guildId);
  }

  async assignContestReward(contestId, contestRewardId) {
    await this.database.run(`
      INSERT INTO ContestRewards(contestId, contestRewardId)
      VALUES (${contestId}, ${contestRewardId});
    `);
    this.emit(DataModelEvents.onContestRewardAssigned, contestId);
  }

  async unassignContestReward(contestId, contestRewardId) {
    await this.database.run(`
      DELETE FROM ContestRewards
      WHERE contestId = ${contestId} AND contestRewardId = ${contestRewardId};
    `);
    this.emit(DataModelEvents.onContestRewardUnassigned, contestId);
  }

  async submitContestEntry(name, description, url, contestId, authorId) {
    await this.database.run(`
      INSERT OR REPLACE INTO ContestEntry(name, description, url, authorId, contestId)
      VALUES ("${name}", "${description}", "${url}", "${authorId}", ${contestId});
    `);
    this.emit(DataModelEvents.onContestEntrySubmitted, contestId);
  }

  async cancelContestEntry(contestEntryId, contestId, authorId) {
    await this.database.run(`
      DELETE FROM ContestEntry
      WHERE id = ${contestEntryId} AND contestId = ${contestId} AND authorId = ${authorId};
    `);
    this.emit(DataModelEvents.onContestEntryCanceled, contestId);
  }

  async changeContestEntry(contestEntryId, contestId, name, description, url) {
    await this.database.run(`
      UPDATE ContestEntry
      SET name = "${name}",
          description = "${description}",
          url = "${url}"
      WHERE id = ${contestEntryId} AND contestId = ${contestId};
    `);
    this.emit(DataModelEvents.onContestEntryChanged, contestId);
  }

  getUserWithMostEntries(contestId) {
    return this.database.get(`
      SELECT User.name as userName, COUNT(1) as entriesCount
      FROM User
      INNER JOIN ContestEntry ON ContestEntry.authorId = User.id
      WHERE ContestEntry.contestId = ${contestId}
      GROUP BY User.id
      HAVING entriesCount > 1
      ORDER BY entriesCount DESC
      LIMIT 1
    `);
  }

  getContestEntriesWhereClause(contestId, authorId) {
    const clause = [`ContestEntry.contestId = ${contestId}`];
    if (authorId) {
      clause.push(`ContestEntry.authorId = ${authorId}`);
    }
    return clause.length > 0 ? `WHERE ${clause.join(' AND ')}` : '';
  }

  getContestEntries(contestId, authorId) {
    return this.database.all(
      this.joinClauses([
        'SELECT ContestEntry.id, ContestEntry.name, ContestEntry.description, ContestEntry.url, ContestEntry.submitDate, User.name as authorName',
        'FROM ContestEntry',
        'INNER JOIN User ON User.id = ContestEntry.authorId',
        this.getContestEntriesWhereClause(contestId, authorId),
        'ORDER BY ContestEntry.submitDate ASC',
      ])
    );
  }

  getContestEntriesNames(contestId, authorId, limit) {
    return this.database.all(
      this.joinClauses([
        'SELECT id, name',
        'FROM ContestEntry',
        this.getContestEntriesWhereClause(contestId, authorId),
        this.getLimitClause(limit),
      ])
    );
  }
  
  getContestEntry(id) {
    return this.database.get(`
      SELECT id, name, description, url, submitDate, authorId, contestId
      FROM ContestEntry
      WHERE id = "${id}";
    `);
  }

  async addContestVote(contestId, contestEntryId, contestVoteCategoryId, voterId, score) {
    await this.database.run(`
      INSERT INTO ContestVote(contestEntryId, contestVoteCategoryId, voterId, score)
      VALUES (${contestEntryId}, ${contestVoteCategoryId}, "${voterId}", ${score});
    `);
    this.emit(DataModelEvents.onContestVoteAdded, contestId);
  }

  async changeContestVote(contestVoteId, contestId, score) {
    await this.database.run(`
      UPDATE ContestVote
      SET score = ${score}
      WHERE id = ${contestVoteId};
    `);
    this.emit(DataModelEvents.onContestVoteChanged, contestId);
  }

  async removeContestVote(contestVoteId, contestId) {
    await this.database.run(`
      DELETE FROM ContestVote
      WHERE id = ${contestVoteId};
    `);
    this.emit(DataModelEvents.onContestVoteRemoved, contestId);
  }

  getContestVotesWhereClause(contestEntryId, voterId) {
    const clause = [`ContestVote.contestEntryId = ${contestEntryId}`];
    if (voterId) {
      clause.push(`ContestVote.voterId = ${voterId}`);
    }
    return clause.length > 0 ? `WHERE ${clause.join(' AND ')}` : '';
  }

  getContestVotesNames(contestEntryId, voterId, limit) {
    return this.database.all(
      this.joinClauses([
        'SELECT ContestVote.id, ContestVote.score, ContestVoteCategory.name as categoryName',
        'FROM ContestVote',
        'INNER JOIN ContestVoteCategory ON ContestVoteCategory.id = ContestVote.contestVoteCategoryId',
        this.getContestVotesWhereClause(contestEntryId, voterId),
        this.getLimitClause(limit),
      ])
    );
  }

  getContestVote(id) {
    return this.database.get(`
      SELECT ContestVote.id, score, voteDate, contestEntryId, contestVoteCategoryId, voterId, ContestVoteCategory.name as categoryName
      FROM ContestVote
      INNER JOIN ContestVoteCategory ON ContestVoteCategory.id = ContestVote.contestVoteCategoryId
      WHERE ContestVote.id = "${id}";
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
