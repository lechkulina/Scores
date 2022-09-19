module.exports = `
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS Message(
  id TEXT NOT NULL PRIMARY KEY,
  guildId TEXT NOT NULL,
  channelId TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS MessageChunk(
  id TEXT NOT NULL PRIMARY KEY,
  hash TEXT NOT NULL,
  position INTEGER NOT NULL,
  messageId TEXT NOT NULL REFERENCES Message(id) ON DELETE NO ACTION
);
CREATE TABLE IF NOT EXISTS User(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  discriminator TEXT NOT NULL,
  guildId TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS Role(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  guildId TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS Command(
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS RolePermission(
  id INTEGER PRIMARY KEY,
  roleId TEXT REFERENCES Role(id),
  commandId TEXT REFERENCES Command(id)
);
CREATE TABLE IF NOT EXISTS UserPermission(
  id INTEGER PRIMARY KEY,
  userId TEXT REFERENCES User(id),
  commandId TEXT REFERENCES Command(id)
);
CREATE TABLE IF NOT EXISTS Reason(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  min INTEGER NOT NULL CHECK (min > 0),
  max INTEGER NOT NULL CHECK (max > 0)
);
CREATE TABLE IF NOT EXISTS Points(
  id INTEGER PRIMARY KEY,
  points INTEGER CHECK (points > 0),
  acquireDate INTEGER DEFAULT CURRENT_TIMESTAMP,
  userId TEXT NOT NULL REFERENCES User(id),
  giverId TEXT NOT NULL REFERENCES User(id),
  reasonId INTEGER NOT NULL REFERENCES Reason(id)
);
CREATE TABLE IF NOT EXISTS Contest(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  announcementsThreshold INTEGER NOT NULL,
  activeBeginDate INTEGER NOT NULL,
  activeEndDate INTEGER NOT NULL,
  votingBeginDate INTEGER NOT NULL,
  votingEndDate INTEGER NOT NULL,
  guildId TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ContestRule(
  id INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  useByDefault INTEGER DEFAULT 0,
  guildId TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ContestRules(
  contestId INTEGER NOT NULL REFERENCES Contest(id),
  contestRuleId INTEGER NOT NULL REFERENCES ContestRule(id),
  PRIMARY KEY(contestId, contestRuleId)
);
CREATE TABLE IF NOT EXISTS ContestReward(
  id INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  useByDefault INTEGER DEFAULT 0,
  guildId TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ContestRewards(
  contestId INTEGER NOT NULL REFERENCES Contest(id),
  contestRewardId INTEGER NOT NULL REFERENCES ContestReward(id),
  PRIMARY KEY(contestId, contestRewardId)
);
CREATE TABLE IF NOT EXISTS ContestVoteCategory(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  max INTEGER NOT NULL CHECK (max > 0),
  useByDefault INTEGER DEFAULT 0,
  guildId TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ContestVoteCategories(
  contestId INTEGER NOT NULL REFERENCES Contest(id),
  contestVoteCategoryId INTEGER NOT NULL REFERENCES ContestVoteCategory(id),
  PRIMARY KEY(contestId, contestVoteCategoryId)
);
CREATE TABLE IF NOT EXISTS ContestEntry(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  submitDate INTEGER DEFAULT CURRENT_TIMESTAMP,
  authorId TEXT NOT NULL REFERENCES User(id),
  contestId INTEGER NOT NULL REFERENCES Contest(id)
);
CREATE TABLE IF NOT EXISTS ContestVote(
  id INTEGER PRIMARY KEY,
  score INTEGER CHECK (score > 0),
  voteDate INTEGER DEFAULT CURRENT_TIMESTAMP,
  contestEntryId INTEGER NOT NULL REFERENCES ContestEntry(id),
  contestVoteCategoryId INTEGER NOT NULL REFERENCES ContestVoteCategory(id),
  voterId TEXT NOT NULL REFERENCES User(id)
);
CREATE TABLE IF NOT EXISTS ContestAnnouncement(
  id INTEGER PRIMARY KEY,
  type INTEGER NOT NULL,
  contestId INTEGER NOT NULL REFERENCES Contest(id) ON DELETE NO ACTION,
  messageId TEXT NOT NULL REFERENCES Message(id) ON DELETE NO ACTION
);
DROP TABLE IF EXISTS Settings;
CREATE TABLE IF NOT EXISTS Settings(
  key TEXT PRIMARY KEY,
  value TEXT
);
COMMIT;
`