const Database = require('./Database');
const EventEmitter = require('events');

const DataModelEvents = {
  onContestAdded: 'onContestAdded',
  onContestChanged: 'onContestChanged',
  onContestRemoved: 'onContestRemoved',
  onContestAnnouncementAdded: 'onContestAnnouncementAdded',
  onContestAnnouncementChanged: 'onContestAnnouncementChanged',
  onContestAnnouncementRemoved: 'onContestAnnouncementRemoved',
  onContestAnnouncementAssigned: 'onContestAnnouncementAssigned',
  onContestAnnouncementUnassigned: 'onContestAnnouncementUnassigned',
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
  Pending: 'pending',
  OpenForSubmittingEntries: 'openForSubmittingEntries',
  OpenForVoting: 'openForVoting',
  Finished: 'finished',
  Any: 'any',
};

function calculateContestState(contest) {
  const now = Date.now();
  if (now < contest.submittingEntriesBeginDate) {
    return ContestState.Pending;
  }
  if (now >= contest.submittingEntriesBeginDate && now < contest.votingBeginDate) {
    return ContestState.OpenForSubmittingEntries;
  }
  if (now >= contest.votingBeginDate && now < contest.votingEndDate) {
    return ContestState.OpenForVoting;
  }
  return ContestState.Finished;  // now >= contest.votingEndDate
}

function joinStatements(clauses) {
  return clauses
    .filter(clause => !!clause)
    .join('\n');
}

function joinClauses(clauses) {
  return joinStatements(clauses).concat(';');
}

function createLimitClause(limit) {
  return !!limit ? `LIMIT ${limit}` : '';
}

function createWhereClause(conditions, operator = 'AND') {
  return conditions.length > 0
    ? `WHERE ${conditions.join(` ${operator} `)}`
    : '';
}

function createContestWhereClause({guildId, contestState}) {
  const conditions = [];
  if (guildId) {
    conditions.push(`Contest.guildId = "${guildId}"`);
  }
  const now = Date.now();
  switch (contestState) {
    case ContestState.Pending:
      conditions.push(`${now} < Contest.submittingEntriesBeginDate`);
      break;
    case ContestState.OpenForSubmittingEntries:
      conditions.push(`${now} >= Contest.submittingEntriesBeginDate`);
      conditions.push(`${now} < Contest.votingBeginDate`);
      break;
    case ContestState.OpenForVoting:
      conditions.push(`${now} >= Contest.votingBeginDate`);
      conditions.push(`${now} < Contest.votingEndDate`);
      break;
    case ContestState.Finished:
      conditions.push(`${now} >= Contest.votingEndDate`);
      break;
  }
  return createWhereClause(conditions);
}

function createContestAnnouncementAssignmentsWhereClause({
  contestId,
  contestAnnouncementId,
  messageId,
  guildId
}) {
  const conditions = [];
  if (contestId != null) {
    conditions.push(`ContestAnnouncements.contestId = ${contestId}`);
  }
  if (contestAnnouncementId != null) {
    conditions.push(`ContestAnnouncements.contestAnnouncementId = ${contestAnnouncementId}`);
  }
  if (messageId != null) {
    conditions.push(`ContestAnnouncements.messageId = ${messageId}`);
  }
  if (guildId != null) {
    conditions.push(`ContestAnnouncements.guildId = "${guildId}"`);
  }
  return createWhereClause(conditions);
}

function createContestEntriesWhereClause({contestId, authorId}) {
  const conditions = [];
  if (contestId != null) {
    conditions.push(`ContestEntry.contestId = ${contestId}`);
  }
  if (authorId != null) {
    conditions.push(`ContestEntry.authorId = ${authorId}`);
  }
  return createWhereClause(conditions);
}

function createContestVotesWhereClause({contestEntryId, voterId}) {
  const conditions = [];
  if (contestEntryId != null) {
    conditions.push(`ContestVote.contestEntryId = ${contestEntryId}`);
  }
  if (voterId != null) {
    conditions.push(`ContestVote.voterId = ${voterId}`);
  }
  return createWhereClause(conditions);
}

class DataModel extends EventEmitter {
  constructor() {
    super();
    this.database = new Database();
    this.lock = Promise.resolve();
  }

  createSchema() {
    return this.database.exec(require('./schema.js'));
  }

  addPointsCategory(name, min, max, guildId) {
    return this.database.run(`
      INSERT INTO PointsCategory(
        name,
        min,
        max,
        guildId
      )
      VALUES (
        "${name}",
        ${min},
        ${max},
        "${guildId}"
      );`
    );
  }

  removePointsCategory(pointsCategoryId) {
    return this.database.run(`
      DELETE FROM PointsCategory
      WHERE id = ${pointsCategoryId};`
    );
  }

  changePointsCategory(pointsCategoryId, name, min, max) {
    return this.database.run(`
      UPDATE PointsCategory
      SET name = "${name}",
          min = ${min},
          max = ${max}
      WHERE id = ${pointsCategoryId};`
    );
  }

  getPointsCategories(guildId, limit) {
    return this.database.all(
      joinClauses([`
        SELECT id, name, min, max
        FROM PointsCategory
        WHERE guildId = "${guildId}"`,
        createLimitClause(limit),
      ])
    );
  }

  getPointsCategory(pointsCategoryId) {
    return this.database.get(`
      SELECT id, name, min, max, guildId
      FROM PointsCategory
      WHERE id = ${pointsCategoryId};`
    );
  }
  
  addPoints(points, userId, giverId, pointsCategoryId) {
    return this.database.run(`
      INSERT INTO Points(
        points,
        userId,
        giverId,
        pointsCategoryId,
        acquireDate
      )
      VALUES (
        ${points},
        "${userId}",
        "${giverId}",
        "${pointsCategoryId}",
        ${Date.now()}
      );`
    );
  }

  removePoints(pointsId) {
    return this.database.run(`
      DELETE FROM Points
      WHERE id = ${pointsId};`
    );
  }

  changePoints(pointsId, points, pointsCategoryId) {
    return this.database.run(`
      UPDATE Points
      SET points = ${points},
          pointsCategoryId = ${pointsCategoryId}
      WHERE id = ${pointsId};`
    );
  }

  getUserAccumulatedPointsSummary(guildId, userId) {
    return this.database.get(`
      SELECT SUM(points) AS points,
             COUNT(1) AS pointsCount,
             MIN(acquireDate) AS minAcquireDate,
             MAX(acquireDate) AS maxAcquireDate
      FROM Points
      INNER JOIN PointsCategory
        ON PointsCategory.id = Points.pointsCategoryId
      WHERE PointsCategory.guildId = "${guildId}"
        AND userId = "${userId}";`
    );
  }

  getUserRecentlyGivenPointsSummary(guildId, userId, limit) {
    return this.database.all(
      joinClauses([`
        SELECT Points.points AS points,
               Points.acquireDate AS acquireDate,
               Giver.name AS giverName,
               PointsCategory.name AS categoryName
        FROM Points
        INNER JOIN User AS Giver
          ON Giver.id = giverId
        INNER JOIN PointsCategory
          ON PointsCategory.id = Points.pointsCategoryId
        WHERE PointsCategory.guildId = "${guildId}"
          AND Points.userId = "${userId}"
        ORDER BY Points.acquireDate DESC`,
        createLimitClause(limit),
      ])
    );
  }

  getUserPointsRankingsSummary(guildId, userId) {
    return this.database.all(`
      SELECT PointsWithRanks.points,
             PointsWithRanks.rank,
             PointsCategory.name AS categoryName
      FROM (
        SELECT PointsPerUserCategory.*,
               ROW_NUMBER() OVER (
                 PARTITION BY PointsPerUserCategory.pointsCategoryId
                 ORDER BY PointsPerUserCategory.points DESC
               ) AS rank
        FROM (
          SELECT userId,
                 pointsCategoryId,
                 SUM(points) AS points
          FROM Points
          GROUP BY userId, pointsCategoryId
        ) AS PointsPerUserCategory
      ) AS PointsWithRanks
      INNER JOIN PointsCategory
        ON PointsCategory.id = PointsWithRanks.pointsCategoryId
      WHERE PointsCategory.guildId = "${guildId}"
        AND  PointsWithRanks.userId = "${userId}"`
    );
  }

  getUserContestsRankingsSummary(guildId, userId) {
    return this.database.all(`
      SELECT EntriesScoresWithRanks.entryName,
             EntriesScoresWithRanks.contestName,
             EntriesScoresWithRanks.scores,
             EntriesScoresWithRanks.rank
      FROM (
        SELECT EntriesScores.*,
               ROW_NUMBER() OVER (
                 PARTITION BY EntriesScores.contestId
                 ORDER BY EntriesScores.scores DESC
               ) AS rank
        FROM (
          SELECT ContestEntry.name as entryName,
                 ContestEntry.authorId AS authorId,
                 Contest.id AS contestId,
                 Contest.name as contestName,
                 SUM(ContestVote.score) scores
          FROM ContestEntry
          INNER JOIN Contest
            ON Contest.id = ContestEntry.contestId
          LEFT JOIN ContestVote
            ON ContestVote.contestEntryId = ContestEntry.id
          WHERE unixepoch() * 1000 >= Contest.votingEndDate
            AND ContestVote.score IS NOT NULL
            AND Contest.guildId = "${guildId}"
          GROUP BY ContestEntry.id
        ) AS EntriesScores
        LIMIT 1
      ) AS EntriesScoresWithRanks
      WHERE EntriesScoresWithRanks.authorId = "${userId}";`
    );
  }

  getUserContestsVotesSummary(guildId, userId) {
    return this.database.all(`
      SELECT ContestEntry.name as entryName,
             submitDate,
             Contest.name as contestName,
             Contest.votingEndDate,
             SUM(ContestVote.score) scores
      FROM ContestEntry
      INNER JOIN Contest
        ON Contest.id = ContestEntry.contestId
      LEFT JOIN ContestVote
        ON ContestVote.contestEntryId = ContestEntry.id
      WHERE unixepoch() * 1000 >= Contest.votingEndDate
        AND ContestVote.score IS NOT NULL
        AND Contest.guildId = "${guildId}"
        AND ContestEntry.authorId = "${userId}"
      GROUP BY ContestEntry.id
      ORDER BY ContestEntry.submitDate`
    );
  }

  getUserRecentlyGivenPointsOptions(guildId, userId, giverId, limit) {
    return this.database.all(
      joinClauses([`
        SELECT Points.id,
               Points.points AS points,
               Points.acquireDate AS acquireDate,
               PointsCategory.name AS categoryName
        FROM Points
        INNER JOIN PointsCategory
          ON PointsCategory.id = Points.pointsCategoryId
        WHERE Points.userId = "${userId}"
          AND Points.giverId = "${giverId}"
          AND PointsCategory.guildId = "${guildId}"
        ORDER BY Points.acquireDate DESC`,
        createLimitClause(limit),
      ])
    );
  }

  getPointsRankingsSummary(guildId, rankLimit) {
    return this.database.all(`
      SELECT PointsWithRanks.points,
             PointsWithRanks.rank,
             User.name AS userName,
             PointsCategory.name AS categoryName
      FROM (
        SELECT PointsPerUserCategory.*,
               ROW_NUMBER() OVER (
                 PARTITION BY PointsPerUserCategory.pointsCategoryId
                 ORDER BY PointsPerUserCategory.points DESC
               ) AS rank
        FROM (
          SELECT userId,
                 pointsCategoryId,
                 SUM(points) AS points
          FROM Points
          GROUP BY userId, pointsCategoryId
        ) AS PointsPerUserCategory
      ) AS PointsWithRanks
      INNER JOIN PointsCategory
        ON PointsCategory.id = PointsWithRanks.pointsCategoryId
      INNER JOIN USER
        ON User.id = PointsWithRanks.userId
      WHERE PointsCategory.guildId = "${guildId}"
        AND PointsWithRanks.rank <= ${rankLimit}`
    );
  }

  getContestsRankingsSummary(guildId, rankLimit) {
    return this.database.all(`
      SELECT EntriesScoresWithRanks.entryName,
             EntriesScoresWithRanks.contestName,
             User.name AS authorName,
             EntriesScoresWithRanks.scores,
             EntriesScoresWithRanks.rank
      FROM (
        SELECT EntriesScores.*,
               ROW_NUMBER() OVER (
                 PARTITION BY EntriesScores.contestId
                 ORDER BY EntriesScores.scores DESC
               ) AS rank
        FROM (
          SELECT ContestEntry.name as entryName,
                 ContestEntry.authorId AS authorId,
                 Contest.id AS contestId,
                 Contest.name as contestName,
                 SUM(ContestVote.score) scores
          FROM ContestEntry
          INNER JOIN Contest
            ON Contest.id = ContestEntry.contestId
          LEFT JOIN ContestVote
            ON ContestVote.contestEntryId = ContestEntry.id
          WHERE unixepoch() * 1000 >= Contest.votingEndDate
            AND ContestVote.score IS NOT NULL
            AND Contest.guildId = "${guildId}"
          GROUP BY ContestEntry.id
        ) AS EntriesScores
      ) AS EntriesScoresWithRanks
      INNER JOIN User
        ON User.id = EntriesScoresWithRanks.authorId
      WHERE EntriesScoresWithRanks.rank <= ${rankLimit};`
    );
  }

  getPoints(pointsId) {
    return this.database.get(`
      SELECT Points.id AS id,
             Points.points AS points,
             Points.acquireDate AS acquireDate,
             Giver.name AS giverName,
             PointsCategory.name AS categoryName
      FROM Points
      INNER JOIN User AS Giver
        ON Giver.id = giverId
      INNER JOIN PointsCategory
        ON PointsCategory.id = Points.pointsCategoryId
      WHERE Points.id="${pointsId}"`
    );
  }

  setSettings(settings) {
    if (settings.length === 0) {
      return;
    }
    const values = settings
      .map(({id, value, type}) => `("${id}", "${value}", "${type}")`)
      .join(', ');
    return this.database.run(`
      INSERT OR REPLACE INTO Settings(id, value, type)
      VALUES ${values};`
    );
  }

  getSettings() {
    return this.database.all(`
      SELECT id, value, type
      FROM Settings;`
    );
  }

  addCommand(id, description) {
    return this.database.run(`
      INSERT OR REPLACE INTO Command(id, description)
      VALUES ("${id}", "${description}");
    `);
  }

  getCommands(limit) {
    return this.database.all(
      joinClauses([`
        SELECT id, description
        FROM Command`,
        createLimitClause(limit),
      ])
    );
  }

  getCommand(id) {
    return this.database.get(`
      SELECT id, description
      FROM Command
      WHERE id = "${id}";`
    );
  }

  // TODO Remove this !
  addRole(id, name, guildId) {
    return this.database.run(`
      INSERT OR REPLACE INTO Role(id, name, guildId)
      VALUES ("${id}", "${name}", "${guildId}");`);
  }

  grantRolePermission(roleId, commandId) {
    return this.database.run(`
      INSERT OR REPLACE INTO RolePermission(roleId, commandId)
      VALUES ("${roleId}", "${commandId}");`
    );
  }

  revokeRolePermission(roleId, commandId) {
    return this.database.run(`
      DELETE FROM RolePermission
      WHERE roleId = "${roleId}" AND commandId = "${commandId}";`
    );
  }

  addUser(id, name, discriminator, guildId) {
    return this.database.run(`
      INSERT OR REPLACE INTO User(id, name, discriminator, guildId)
      VALUES ("${id}", "${name}", "${discriminator}", "${guildId}");`
    );
  }

  grantUserPermission(userId, commandId) {
    return this.database.run(`
      INSERT OR REPLACE INTO UserPermission(userId, commandId)
      VALUES ("${userId}", "${commandId}");`
    );
  }

  revokeUserPermission(userId, commandId) {
    return this.database.run(`
      DELETE FROM UserPermission
      WHERE userId = "${userId}" AND commandId = "${commandId}";`
    );
  }

  async isAllowed(userId, roleIds, commandId) {
    const roleIdsValues = roleIds
      .map(roldId => `"${roldId}"`)
      .join(', ');
    return (await this.database.get(`
      SELECT 1 AS allowed
      FROM UserPermission AS U, RolePermission AS R
      WHERE (U.userId = "${userId}" AND U.commandId = "${commandId}")
        OR (R.roleId IN (${roleIdsValues}) AND R.commandId = "${commandId}")`
    )) ? true : false;
  }

  getCommandsWithPermissions(userId, roleIds) {
    return this.database.all(`
      SELECT Command.id AS id, Command.description AS description, IFNULL((
        SELECT 1
        FROM UserPermission AS U, RolePermission AS R
        WHERE (U.userId = "${userId}" AND U.commandId = Command.id)
          OR (R.roleId IN (${roleIds.map(roldId => `"${roldId}"`).join(', ')}) AND R.commandId = Command.id)
      ), 0) AS allowed
      FROM Command;`
    );
  }

  async addContest(
    name,
    description,
    requiredCompletedVotingsCount,
    submittingEntriesBeginDate,
    votingBeginDate,
    votingEndDate,
    guildId
  ) {
    await this.database.exec(`
      PRAGMA temp_store = 2;

      BEGIN TRANSACTION;
        INSERT INTO Contest(
          name,
          description,
          requiredCompletedVotingsCount,
          submittingEntriesBeginDate,
          votingBeginDate,
          votingEndDate,
          guildId
        )
        VALUES (
          "${name}",
          "${description}",
          ${requiredCompletedVotingsCount},
          ${submittingEntriesBeginDate},
          ${votingBeginDate},
          ${votingEndDate},
          "${guildId}"
        );

        CREATE TEMP TABLE Variables AS SELECT last_insert_rowid() AS contestId;

        INSERT INTO ContestVoteCategories(contestId, contestVoteCategoryId)
        SELECT Variables.contestId, ContestVoteCategory.id
        FROM ContestVoteCategory, Variables
        WHERE ContestVoteCategory.useByDefault = 1 AND guildId = "${guildId}";

        INSERT INTO ContestRules(contestId, contestRuleId)
        SELECT Variables.contestId, ContestRule.id
        FROM ContestRule, Variables
        WHERE ContestRule.useByDefault = 1 AND guildId = "${guildId}";

        INSERT INTO ContestRewards(contestId, contestRewardId)
        SELECT Variables.contestId, ContestReward.id
        FROM ContestReward, Variables
        WHERE ContestReward.useByDefault = 1 AND guildId = "${guildId}";

        INSERT INTO ContestAnnouncements(contestId, contestAnnouncementId, guildId)
        SELECT Variables.contestId, ContestAnnouncement.id, "${guildId}"
        FROM ContestAnnouncement, Variables
        WHERE ContestAnnouncement.useByDefault = 1 AND guildId = "${guildId}";

        DROP TABLE Variables;
      COMMIT;`
    );
    this.emit(DataModelEvents.onContestAdded, guildId);
  }

  async changeContest(
    contestId,
    name,
    description,
    requiredCompletedVotingsCount,
    submittingEntriesBeginDate,
    votingBeginDate,
    votingEndDate
  ) {
    await this.database.run(`
      UPDATE Contest
      SET name = "${name}",
          description = "${description}",
          requiredCompletedVotingsCount = ${requiredCompletedVotingsCount},
          submittingEntriesBeginDate = ${submittingEntriesBeginDate},
          votingBeginDate = ${votingBeginDate},
          votingEndDate = ${votingEndDate}
      WHERE id = ${contestId};
    `);
    this.emit(DataModelEvents.onContestChanged, contestId);
  }

  async removeContest(contestId) {
    await this.database.run(`
      DELETE FROM Contest
      WHERE id = ${contestId};`
    );
    this.emit(DataModelEvents.onContestRemoved, contestId);
  }

  getContestsNames({limit, ...params} = {}) {
    return this.database.all(
      joinClauses([`
        SELECT id, name
        FROM Contest`,
        createContestWhereClause(params),
        createLimitClause(limit),
      ])
    );
  }

  getContests(params = {}) {
    return this.database.all(
      joinClauses([`
        SELECT id,
               name,
               description,
               requiredCompletedVotingsCount,
               submittingEntriesBeginDate,
               votingBeginDate,
               votingEndDate,
               guildId
        FROM Contest`,
        createContestWhereClause(params)
      ])
    );
  }

  getContest(contestId) {
    return this.database.get(`
      SELECT id,
             name,
             description,
             requiredCompletedVotingsCount,
             submittingEntriesBeginDate,
             votingBeginDate,
             votingEndDate,
             guildId
      FROM Contest
      WHERE id = ${contestId};`
    );
  }

  async addContestAnnouncement(
    name,
    hoursBefore,
    contestState,
    useByDefault,
    showRules,
    showVoteCategories,
    showRewards,
    showEntries,
    showWinners,
    showVotingResults,
    channelId,
    channelName,
    guildId
  ) {
    await this.database.exec(`
      BEGIN TRANSACTION;
        INSERT OR REPLACE INTO Channel(id, name, guildId)
        VALUES ("${channelId}", "${channelName}", "${guildId}");

        INSERT INTO ContestAnnouncement(
          name,
          hoursBefore,
          contestState,
          channelId,
          useByDefault,
          showRules,
          showVoteCategories,
          showRewards,
          showEntries,
          showWinners,
          showVotingResults,
          guildId
        )
        VALUES (
          "${name}",
          ${hoursBefore},
          "${contestState}",
          "${channelId}",
          ${useByDefault},
          ${showRules},
          ${showVoteCategories},
          ${showRewards},
          ${showEntries},
          ${showWinners},
          ${showVotingResults},
          "${guildId}"
        );
      COMMIT;`
    );
    this.emit(DataModelEvents.onContestAnnouncementAdded, guildId);
  }

  async removeContestAnnouncement(contestAnnouncementId) {
    await this.database.exec(`
      DELETE FROM ContestAnnouncement
      WHERE id = ${contestAnnouncementId};`
    );
    this.emit(DataModelEvents.onContestAnnouncementRemoved, contestAnnouncementId);
  }

  async changeContestAnnouncement(
    contestAnnouncementId,
    name,
    hoursBefore,
    contestState,
    useByDefault,
    showRules,
    showVoteCategories,
    showRewards,
    showEntries,
    showWinners,
    showVotingResults,
    channelId,
    channelName,
    guildId
  ) {
    await this.database.exec(`
      BEGIN TRANSACTION;
        INSERT OR REPLACE INTO Channel(
          id,
          name,
          guildId
        )
        VALUES (
          "${channelId}",
          "${channelName}",
          "${guildId}"
        );

        UPDATE ContestAnnouncement
        SET name = "${name}",
            hoursBefore = ${hoursBefore},
            contestState = "${contestState}",
            channelId = "${channelId}",
            useByDefault = ${useByDefault},
            showRules = ${showRules},
            showVoteCategories = ${showVoteCategories},
            showRewards = ${showRewards},
            showEntries = ${showEntries},
            showWinners = ${showWinners},
            showVotingResults = ${showVotingResults}
        WHERE id = ${contestAnnouncementId};
      COMMIT;`
    );
    this.emit(DataModelEvents.onContestAnnouncementChanged, contestAnnouncementId);
  }

  getContestAnnouncementsNames(guildId, limit) {
    return this.database.all(
      joinClauses([`
        SELECT id, name
        FROM ContestAnnouncement
        WHERE guildId = "${guildId}"`,
        createLimitClause(limit),
      ])
    );
  }

  getContestAnnouncement(id) {
    return this.database.get(`
      SELECT ContestAnnouncement.id,
             ContestAnnouncement.name,
             hoursBefore,
             contestState,
             channelId,
             Channel.name AS channelName,
             useByDefault,
             showRules,
             showVoteCategories,
             showRewards,
             showEntries,
             showWinners,
             showVotingResults,
             ContestAnnouncement.guildId
      FROM ContestAnnouncement
      INNER JOIN Channel ON Channel.id = ContestAnnouncement.channelId
      WHERE ContestAnnouncement.id = ${id};`
    );
  }

  getAssignedContestAnnouncementsNames(contestId, limit) {
    return this.database.all(
      joinClauses([`
        SELECT ContestAnnouncement.id, ContestAnnouncement.name
        FROM ContestAnnouncement
        INNER JOIN ContestAnnouncements
          ON ContestAnnouncements.contestAnnouncementId = ContestAnnouncement.id
        WHERE ContestAnnouncements.contestId = ${contestId}`,
        createLimitClause(limit),
      ])
    );
  }

  async assignContestAnnouncement(contestId, contestAnnouncementId, guildId) {
    await this.database.run(`
      INSERT INTO ContestAnnouncements(
        contestId,
        contestAnnouncementId,
        guildId
      )
      VALUES (
        ${contestId},
        ${contestAnnouncementId},
        "${guildId}"
      );`
    );
    this.emit(DataModelEvents.onContestAnnouncementAssigned, contestId, contestAnnouncementId);
  }

  async unassignContestAnnouncement(contestId, contestAnnouncementId) {
    await this.database.run(`
      UPDATE ContestAnnouncements
      SET removed = 1
      WHERE contestId = ${contestId}
        AND contestAnnouncementId = ${contestAnnouncementId};`
    );
    this.emit(DataModelEvents.onContestAnnouncementUnassigned, contestId, contestAnnouncementId);
  }

  async publishContestAnnouncement(contestId, contestAnnouncementId, messageId) {
    await this.database.run(`
      UPDATE ContestAnnouncements
      SET messageId = "${messageId}",
          published = 1
      WHERE contestId = ${contestId}
        AND contestAnnouncementId = ${contestAnnouncementId};`
    );
  }

  async unpublishContestAnnouncement(contestId, contestAnnouncementId) {
    await this.database.run(`
      UPDATE ContestAnnouncements
      SET messageId = NULL,
          published = 0
      WHERE contestId = ${contestId}
        AND contestAnnouncementId = ${contestAnnouncementId};`
    );
  }

  getContestAnnouncementAssignment(id) {
    return this.database.get(`
      SELECT id,
             contestId,
             contestAnnouncementId,
             messageId,
             published,
             removed
      FROM ContestAnnouncements
      WHERE id = ${id};`
    );
  }

  getContestAnnouncementAssignments(params = {}) {
    return this.database.all(
      joinClauses([
        `SELECT id,
                contestId,
                contestAnnouncementId,
                messageId,
                published,
                removed
        FROM ContestAnnouncements`,
        createContestAnnouncementAssignmentsWhereClause(params),
      ])
    );
  }

  removeContestAnnouncementAssignment(assignmentId) {
    return this.database.run(`
      DELETE FROM ContestAnnouncements
      WHERE id = ${assignmentId};`
    );
  }

  async addMessage(guildId, channelId, messageId, messageChunks) {
    if (messageChunks.length === 0) {
      return;
    }
    const messageChunksValues = messageChunks
      .map(({id, hash}, position) => `("${id}", "${hash}", ${position}, "${messageId}")`)
      .join(', ');
    await this.database.exec(`
      BEGIN TRANSACTION;
        INSERT OR REPLACE INTO Message(
          id,
          guildId,
          channelId
        )
        VALUES (
          "${messageId}",
          "${guildId}",
          "${channelId}"
        );

        INSERT INTO MessageChunk(
          id,
          hash,
          position,
          messageId
        )
        VALUES ${messageChunksValues};
      COMMIT;`
    );
    this.emit(DataModelEvents.onMessageAdded, messageId);
  }

  async updateMessage(messageId, updatedMessageChunks, obsoleteMessageChunks) {
    if (updatedMessageChunks.length === 0 && obsoleteMessageChunks.length === 0) {
      return;
    }
    const updateStatements = updatedMessageChunks
      .map(({id, hash}) => (
          `UPDATE MessageChunk
           SET hash = "${hash}"
           WHERE id = "${id}";`
        )
      );
    const obsoleteMessageChunksValues = obsoleteMessageChunks
      .map(({id}) => `"${id}"`)
      .join(', ');
    const deleteStatement = obsoleteMessageChunks.length > 0
      ? `DELETE FROM MessageChunk
         WHERE id IN (${obsoleteMessageChunksValues});`
      : '';
    await this.database.exec(
      joinStatements([
        'BEGIN TRANSACTION;',
        ...updateStatements,
        deleteStatement,
        'COMMIT;'
      ])
    );
    this.emit(DataModelEvents.onMessageChanged, messageId);
  }

  async removeMessages(messagesIds) {
    if (messagesIds.length === 0) {
      return;
    }
    const messageIdsValues = messagesIds
      .map(messageId => `"${messageId}"`)
      .join(', ');
    await this.database.exec(`
      DELETE FROM Message
      WHERE id IN (${messageIdsValues});`
    );
    this.emit(DataModelEvents.onMessagesRemoved, messagesIds);
  }

  getMessage(messageId) {
    return this.database.get(`
      SELECT id, guildId, channelId
      FROM Message
      WHERE id = "${messageId}";`
    );
  }

  getMessageChunks(messageId) {
    return this.database.all(`
      SELECT id, hash
      FROM MessageChunk
      WHERE messageId = "${messageId}"
      ORDER BY position ASC;`
    );
  }

  getMessageChunk(id) {
    return this.database.get(`
      SELECT id, hash, messageId
      FROM MessageChunk
      WHERE id = "${id}";`
    );
  }

  async addContestVoteCategory(
    name,
    description,
    max,
    useByDefault,
    guildId,
  ) {
    await this.database.run(`
      INSERT INTO ContestVoteCategory(
        name,
        description,
        max,
        useByDefault,
        guildId
      )
      VALUES (
        "${name}",
        "${description}",
        ${max},
        ${useByDefault ? 1 : 0},
        "${guildId}"
      );`
    );
    this.emit(DataModelEvents.onContestVoteCategoryAdded, guildId);
  }

  getContestAnnouncementAssignmentsForVoteCategory(contestVoteCategoryId) {
    return this.database.all(`
      SELECT ContestAnnouncements.id,
             ContestAnnouncements.contestId,
             contestAnnouncementId,
             messageId,
             published,
             removed
      FROM ContestAnnouncements
      INNER JOIN ContestVoteCategories
        ON ContestVoteCategories.contestId = ContestAnnouncements.contestId
      WHERE ContestVoteCategories.contestVoteCategoryId = ${contestVoteCategoryId};`
    );
  }

  removeContestVoteCategory(contestVoteCategoryId) {
    this.lock = this.lock.finally(async () => {
      const assignments = await this.getContestAnnouncementAssignmentsForVoteCategory(contestVoteCategoryId);
      await this.database.exec(`
        DELETE FROM ContestVoteCategory
        WHERE id = ${contestVoteCategoryId};`
      );
      this.emit(DataModelEvents.onContestVoteCategoryRemoved, assignments);
    });
    return this.lock;
  }

  changeContestVoteCategory(
    contestVoteCategoryId,
    name,
    description,
    max,
    useByDefault
  ) {
    this.lock = this.lock.finally(async () => {
      const assignments = await this.getContestAnnouncementAssignmentsForVoteCategory(contestVoteCategoryId);
      await this.database.run(`
        UPDATE ContestVoteCategory
        SET name = "${name}",
            description = "${description}",
            max = ${max},
            useByDefault = ${useByDefault}
        WHERE id = ${contestVoteCategoryId};`
      );
      this.emit(DataModelEvents.onContestVoteCategoryChanged, assignments);
    });
    return this.lock;
  }

  async assignContestVoteCategory(contestId, contestVoteCategoryId) {
    await this.database.run(`
      INSERT INTO ContestVoteCategories(contestId, contestVoteCategoryId)
      VALUES (${contestId}, ${contestVoteCategoryId});`
    );
    this.emit(DataModelEvents.onContestVoteCategoryAssigned, contestId, contestVoteCategoryId);
  }

  async unassignContestVoteCategory(contestId, contestVoteCategoryId) {
    await this.database.run(`
      DELETE FROM ContestVoteCategories
      WHERE contestId = ${contestId} AND contestVoteCategoryId = ${contestVoteCategoryId};`
    );
    this.emit(DataModelEvents.onContestVoteCategoryUnassigned, contestId, contestVoteCategoryId);
  }

  getAssignedContestVoteCategories(contestId, limit) {
    return this.database.all(
      joinClauses([`
        SELECT ContestVoteCategory.id,
               name,
               description,
               max
        FROM ContestVoteCategory
        INNER JOIN ContestVoteCategories
          ON ContestVoteCategories.contestVoteCategoryId = ContestVoteCategory.id
        WHERE ContestVoteCategories.contestId = ${contestId}`,
        createLimitClause(limit),
      ])
    );
  }

  getContestVoteCategoriesNames(guildId, limit) {
    return this.database.all(
      joinClauses([`
        SELECT id, name
        FROM ContestVoteCategory
        WHERE guildId = "${guildId}"`,
        createLimitClause(limit),
      ])
    );
  }

  getContestVoteCategory(id) {
    return this.database.get(`
      SELECT id,
             name,
             description,
             max
      FROM ContestVoteCategory
      WHERE id = "${id}";`
    );
  }

  async addContestRule(description, useByDefault, guildId) {
    await this.database.run(`
      INSERT INTO ContestRule(
        description,
        useByDefault,
        guildId
      )
      VALUES (
        "${description}",
        ${useByDefault ? 1 : 0},
        "${guildId}"
      );`
    );
    this.emit(DataModelEvents.onContestRuleAdded, guildId);
  }

  getContestAnnouncementAssignmentsForRule(contestRuleId) {
    return this.database.all(`
      SELECT ContestAnnouncements.id,
             ContestAnnouncements.contestId,
             contestAnnouncementId,
             messageId,
             published,
             removed
      FROM ContestAnnouncements
      INNER JOIN ContestRules
        ON ContestRules.contestId = ContestAnnouncements.contestId
      WHERE ContestRules.contestRuleId = ${contestRuleId};`
    );
  }

  removeContestRule(contestRuleId) {
    this.lock = this.lock.finally(async () => {
      const assignments = await this.getContestAnnouncementAssignmentsForRule(contestRuleId);
      await this.database.exec(`
        DELETE FROM ContestRule
        WHERE id = ${contestRuleId};`
      );
      this.emit(DataModelEvents.onContestRuleRemoved, assignments);
    });
    return this.lock;
  }

  changeContestRule(contestRuleId, description, useByDefault) {
    this.lock = this.lock.finally(async () => {
      const assignments = await this.getContestAnnouncementAssignmentsForRule(contestRuleId);
      await this.database.run(`
        UPDATE ContestRule
        SET description = "${description}",
            useByDefault = ${useByDefault}
        WHERE id = ${contestRuleId};`
      );
      this.emit(DataModelEvents.onContestRuleChanged, assignments);
    });
    return this.lock;
  }

  async assignContestRule(contestId, contestRuleId) {
    await this.database.run(`
      INSERT INTO ContestRules(
        contestId,
        contestRuleId
      )
      VALUES (
        ${contestId},
        ${contestRuleId}
      );`
    );
    this.emit(DataModelEvents.onContestRuleAssigned, contestId, contestRuleId);
  }

  async unassignContestRule(contestId, contestRuleId) {
    await this.database.run(`
      DELETE FROM ContestRules
      WHERE contestId = ${contestId}
        AND contestRuleId = ${contestRuleId};`
    );
    this.emit(DataModelEvents.onContestRuleUnassigned, contestId, contestRuleId);
  }

  getAssignedContestRules(contestId, limit) {
    return this.database.all(
      joinClauses([`
        SELECT ContestRule.id, ContestRule.description
        FROM ContestRule
        INNER JOIN ContestRules
          ON ContestRules.contestRuleId = ContestRule.id
        WHERE ContestRules.contestId = ${contestId}`,
        createLimitClause(limit),
      ])
    );
  }

  getContestRulesDescriptions(guildId, limit) {
    return this.database.all(
      joinClauses([`
        SELECT id, description
        FROM ContestRule
        WHERE guildId = "${guildId}"`,
        createLimitClause(limit),
      ])
    );
  }

  getContestRule(id) {
    return this.database.get(`
      SELECT id, description
      FROM ContestRule
      WHERE id = "${id}";`
    );
  }

  async addContestReward(description, useByDefault, guildId) {
    await this.database.run(`
      INSERT INTO ContestReward(
        description,
        useByDefault,
        guildId
      )
      VALUES (
        "${description}",
        ${useByDefault ? 1 : 0},
        "${guildId}"
      );`
    );
    this.emit(DataModelEvents.onContestRewardAdded, guildId);
  }

  getContestAnnouncementAssignmentsForReward(contestRewardId) {
    return this.database.all(`
      SELECT ContestAnnouncements.id,
             ContestAnnouncements.contestId,
             contestAnnouncementId,
             messageId,
             published,
             removed
      FROM ContestAnnouncements
      INNER JOIN ContestRewards
        ON ContestRewards.contestId = ContestAnnouncements.contestId
      WHERE ContestRewards.contestRewardId = ${contestRewardId};`
    );
  }

  removeContestReward(contestRewardId) {
    this.lock = this.lock.finally(async () => {
      const assignments = await this.getContestAnnouncementAssignmentsForReward(contestRewardId);
      await this.database.exec(`
        DELETE FROM ContestReward
        WHERE id = ${contestRewardId};`
      );
      this.emit(DataModelEvents.onContestRewardRemoved, assignments);
    });
    return this.lock;
  }

  changeContestReward(contestRewardId, description, useByDefault) {
    this.lock = this.lock.finally(async () => {
      const assignments = await this.getContestAnnouncementAssignmentsForReward(contestRewardId);
      await this.database.run(`
        UPDATE ContestReward
        SET description = "${description}",
            useByDefault = ${useByDefault}
        WHERE id = ${contestRewardId};`
      );
      this.emit(DataModelEvents.onContestRewardChanged, assignments);
    });
    return this.lock;
  }

  async assignContestReward(contestId, contestRewardId) {
    await this.database.run(`
      INSERT INTO ContestRewards(contestId, contestRewardId)
      VALUES (${contestId}, ${contestRewardId});`
    );
    this.emit(DataModelEvents.onContestRewardAssigned, contestId, contestRewardId);
  }

  async unassignContestReward(contestId, contestRewardId) {
    await this.database.run(`
      DELETE FROM ContestRewards
      WHERE contestId = ${contestId}
        AND contestRewardId = ${contestRewardId};`
    );
    this.emit(DataModelEvents.onContestRewardUnassigned, contestId, contestRewardId);
  }

  getAssignedContestRewards(contestId, limit) {
    return this.database.all(
      joinClauses([`
        SELECT ContestReward.id, ContestReward.description
        FROM ContestReward
        INNER JOIN ContestRewards
          ON ContestRewards.contestRewardId = ContestReward.id
        WHERE ContestRewards.contestId = ${contestId}`,
        createLimitClause(limit),
      ])
    );
  }

  getContestRewardsDescriptions(guildId, limit) {
    return this.database.all(
      joinClauses([`
        SELECT id, description
        FROM ContestReward
        WHERE guildId = "${guildId}"`,
        createLimitClause(limit),
      ])
    );
  }

  getContestReward(id) {
    return this.database.get(`
      SELECT id, description
      FROM ContestReward
      WHERE id = "${id}";`
    );
  }

  async submitContestEntry(
    name,
    description,
    url,
    contestId,
    authorId
  ) {
    await this.database.run(`
      INSERT INTO ContestEntry(
        name,
        description,
        url,
        authorId,
        contestId,
        submitDate
      )
      VALUES (
        "${name}",
        "${description}",
        "${url}",
        "${authorId}",
        ${contestId},
        ${Date.now()}
      );`
    );
    this.emit(DataModelEvents.onContestEntrySubmitted, contestId);
  }

  async cancelContestEntry(contestEntryId, contestId, authorId) {
    await this.database.run(`
      DELETE FROM ContestEntry
      WHERE id = ${contestEntryId}
        AND contestId = ${contestId}
        AND authorId = ${authorId};`
    );
    this.emit(DataModelEvents.onContestEntryCanceled, contestId);
  }

  async changeContestEntry(
    contestEntryId,
    contestId,
    name,
    description,
    url
  ) {
    await this.database.run(`
      UPDATE ContestEntry
      SET name = "${name}",
          description = "${description}",
          url = "${url}"
      WHERE id = ${contestEntryId}
        AND contestId = ${contestId};`
    );
    this.emit(DataModelEvents.onContestEntryChanged, contestId);
  }

  getUserWithMostEntries(contestId) {
    return this.database.get(`
      SELECT User.name AS userName,
             COUNT(1) AS entriesCount
      FROM User
      INNER JOIN ContestEntry
        ON ContestEntry.authorId = User.id
      WHERE ContestEntry.contestId = ${contestId}
      GROUP BY User.id
      HAVING entriesCount > 1
      ORDER BY entriesCount DESC
      LIMIT 1`
    );
  }

  getContestEntries(params) {
    return this.database.all(
      joinClauses([`
        SELECT ContestEntry.id,
               ContestEntry.name,
               ContestEntry.description,
               ContestEntry.url,
               ContestEntry.submitDate, 
               User.name AS authorName
        FROM ContestEntry
        INNER JOIN User
          ON User.id = ContestEntry.authorId`,
        createContestEntriesWhereClause(params),
        'ORDER BY ContestEntry.submitDate ASC',
      ])
    );
  }

  getContestEntriesNames({limit, ...params}) {
    return this.database.all(
      joinClauses([`
        SELECT id, name
        FROM ContestEntry`,
        createContestEntriesWhereClause(params),
        createLimitClause(limit),
      ])
    );
  }
  
  getContestEntry(id) {
    return this.database.get(`
      SELECT id, 
             name,
             description,
             url,
             submitDate,
             authorId,
             contestId
      FROM ContestEntry
      WHERE id = "${id}";`
    );
  }

  async isContestEntryUnique(name, url, guildId) {
    return (await this.database.all(`
      SELECT
        (
          SELECT 1
          FROM ContestEntry
          WHERE ContestEntry.contestId = Contest.id
            AND name = "${name}"
        ) AS hasName,
        (
          SELECT 1
          FROM ContestEntry
          WHERE ContestEntry.contestId = Contest.id
            AND url = "${url}"
        ) AS hasUrl 
      FROM Contest
      WHERE guildId = "${guildId}"
        AND (hasName = 1 OR hasUrl = 1)
      LIMIT 1`
    )).length === 0;
  }

  async getContestEntryAuthorId(contestEntryId) {
    return (await this.database.get(`
      SELECT authorId
      FROM ContestEntry
      WHERE id = "${contestEntryId}";`
    )).authorId;
  }

  async addContestVote(
    contestId,
    contestEntryId,
    contestVoteCategoryId,
    voterId,
    score
  ) {
    await this.database.run(`
      INSERT INTO ContestVote(
        contestEntryId,
        contestVoteCategoryId,
        voterId,
        score,
        voteDate
      )
      VALUES (
        ${contestEntryId},
        ${contestVoteCategoryId},
        "${voterId}",
        ${score},
        ${Date.now()}
      );`
    );
    this.emit(DataModelEvents.onContestVoteAdded, contestId);
  }

  async changeContestVote(contestVoteId, contestId, score) {
    await this.database.run(`
      UPDATE ContestVote
      SET score = ${score}
      WHERE id = ${contestVoteId};`
    );
    this.emit(DataModelEvents.onContestVoteChanged, contestId);
  }

  async removeContestVote(contestVoteId, contestId) {
    await this.database.run(`
      DELETE FROM ContestVote
      WHERE id = ${contestVoteId};`
    );
    this.emit(DataModelEvents.onContestVoteRemoved, contestId);
  }

  getContestVotesNames({limit, ...params}) {
    return this.database.all(
      joinClauses([`
        SELECT ContestVote.id,
               ContestVote.score,
               ContestVoteCategory.name AS categoryName
        FROM ContestVote
        INNER JOIN ContestVoteCategory
          ON ContestVoteCategory.id = ContestVote.contestVoteCategoryId`,
        createContestVotesWhereClause(params),
        createLimitClause(limit),
      ])
    );
  }

  getContestVote(id) {
    return this.database.get(`
      SELECT ContestVote.id,
             score,
             voteDate,
             contestEntryId,
             contestVoteCategoryId,
             voterId,
             ContestVoteCategory.name AS categoryName
      FROM ContestVote
      INNER JOIN ContestVoteCategory
        ON ContestVoteCategory.id = ContestVote.contestVoteCategoryId
      WHERE ContestVote.id = "${id}";`
    );
  }

  getVoterContestVotesSummary(contestId, voterId) {
    return this.database.all(`
      SELECT entryId,
             entryName,
             User.name AS authorName,
             categoryId,
             ContestVoteCategory.name AS categoryName,
             ContestVote.score
      FROM (
        SELECT ContestEntry.id AS entryId,
               ContestEntry.authorId,
               ContestEntry.name AS entryName,
               ContestVoteCategories.contestVoteCategoryId AS categoryId
        FROM ContestEntry
        CROSS JOIN ContestVoteCategories
        WHERE ContestEntry.contestId = ${contestId}
          AND ContestVoteCategories.contestId = ${contestId}
      )
      INNER JOIN User
        ON User.id = authorId
      INNER JOIN ContestVoteCategory
        ON ContestVoteCategory.id = categoryId
      LEFT OUTER JOIN ContestVote
        ON ContestVote.contestEntryId = entryId
          AND ContestVote.contestVoteCategoryId = categoryId
          AND ContestVote.voterId = "${voterId}";`
    );
  }

  getContestVotersSummary(contestId) {
    return this.database.all(`
      SELECT User.name AS voterName,
             COUNT(ContestVote.id) AS votesCount,
             (
               SELECT COUNT(1)
               FROM ContestVoteCategories
               WHERE ContestVoteCategories.contestId = ContestEntry.contestId
             ) AS categoriesCount,
             (
               SELECT COUNT(1)
               FROM ContestEntry AS A
               WHERE A.contestId = ContestEntry.contestId
             ) AS entriesCount
      FROM ContestVote
      INNER JOIN User
        ON User.id = ContestVote.voterId
      INNER JOIN ContestEntry
        ON ContestEntry.id = ContestVote.contestEntryId
      WHERE ContestEntry.contestId = ${contestId}
        AND ContestVote.score IS NOT NULL
      ORDER BY votesCount DESC;`
    );
  }

  getContestVotesSummary(contestId) {
    return this.database.all(`
      SELECT entryId,
             entryName,
             User.name AS authorName,
             categoryId,
             ContestVoteCategory.name AS categoryName,
             SUM(ContestVote.score) AS scores,
             COUNT(ContestVote.id) AS votesCount
      FROM (
        SELECT ContestEntry.id AS entryId,
               ContestEntry.authorId,
               ContestEntry.name AS entryName,
               ContestVoteCategories.contestVoteCategoryId AS categoryId
        FROM ContestEntry
        CROSS JOIN ContestVoteCategories
        WHERE ContestEntry.contestId = ${contestId}
          AND ContestVoteCategories.contestId = ${contestId}
      )
      INNER JOIN User
        ON User.id = authorId
      INNER JOIN ContestVoteCategory
        ON ContestVoteCategory.id = categoryId
      LEFT OUTER JOIN ContestVote
        ON ContestVote.contestEntryId = entryId
        AND ContestVote.contestVoteCategoryId = categoryId
      GROUP BY entryId, categoryId;`
    );
  }

  getUserContestEntriesSummary(contestId, userId) {
    return this.database.all(`
      SELECT entryId,
             entryName,
             submitDate,
             categoryId,
             ContestVoteCategory.name AS categoryName,
             SUM(ContestVote.score) scores
      FROM (
        SELECT ContestEntry.id AS entryId,
               ContestEntry.name AS entryName,
               ContestEntry.submitDate AS submitDate,
               ContestVoteCategories.contestVoteCategoryId AS categoryId
        FROM ContestEntry
        CROSS JOIN ContestVoteCategories
        WHERE ContestEntry.authorId = "${userId}"
          AND ContestEntry.contestId = ${contestId}
          AND ContestVoteCategories.contestId = ${contestId}
      )
      INNER JOIN ContestVoteCategory
        ON ContestVoteCategory.id = categoryId
      LEFT OUTER JOIN ContestVote
        ON ContestVote.contestEntryId = entryId
          AND ContestVote.contestVoteCategoryId = categoryId
      GROUP BY entryId, categoryId;`
    );
  }

  getContestVotingResults(contestId) {
    return this.database.all(`
      SELECT ContestEntry.id AS entryId,
             ContestEntry.name AS entryName,
             User.name AS authorName,
             SUM(ContestVote.score) AS scores
      FROM ContestEntry
      INNER JOIN User
        ON User.id = ContestEntry.authorId
      LEFT JOIN ContestVote
        ON ContestVote.contestEntryId = ContestEntry.id
      WHERE ContestEntry.contestId = ${contestId}
        AND ContestVote.score IS NOT NULL
      GROUP BY ContestEntry.id
      ORDER BY scores DESC;`
    );
  }

  getContestWinners(contestId) {
    return this.database.all(`
      SELECT ContestEntry.id AS entryId,
             ContestEntry.name AS entryName,
             User.name AS authorName,
             SUM(ContestVote.score) AS scores
      FROM ContestEntry
      INNER JOIN User
        ON User.id = ContestEntry.authorId
      LEFT JOIN ContestVote
        ON ContestVote.contestEntryId = ContestEntry.id
      WHERE ContestEntry.contestId = ${contestId}
        AND ContestVote.score IS NOT NULL
      GROUP BY ContestEntry.id
      HAVING scores = (
        SELECT SUM(BContestVote.score) AS topScores
        FROM ContestEntry AS BContestEntry
        INNER JOIN ContestVote AS BContestVote
          ON BContestEntry.id = BContestVote.contestEntryId
        WHERE BContestEntry.contestId = ContestEntry.contestId
        GROUP BY BContestEntry.id
        ORDER BY topScores DESC
        LIMIT 1
      )
      ORDER BY ContestEntry.submitDate ASC;`
    );
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
  calculateContestState,
}
