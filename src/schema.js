module.exports = `
PRAGMA foreign_keys = ON;

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
  messageId TEXT NOT NULL REFERENCES Message(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS User(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  guildId TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Role(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  guildId TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Channel(
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

CREATE TABLE IF NOT EXISTS PointsCategory(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  min INTEGER NOT NULL,
  max INTEGER NOT NULL,
  guildId TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Points(
  id INTEGER PRIMARY KEY,
  points INTEGER,
  acquireDate INTEGER NOT NULL,
  userId TEXT NOT NULL REFERENCES User(id),
  giverId TEXT NOT NULL REFERENCES User(id),
  pointsCategoryId INTEGER NOT NULL REFERENCES PointsCategory(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Contest(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  requiredCompletedVotingsCount INTEGER NOT NULL,
  submittingEntriesBeginDate INTEGER NOT NULL,
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
  contestId INTEGER REFERENCES Contest(id)
    ON DELETE CASCADE,
  contestRuleId INTEGER REFERENCES ContestRule(id)
    ON DELETE CASCADE,
  PRIMARY KEY(contestId, contestRuleId)
);

CREATE TABLE IF NOT EXISTS ContestReward(
  id INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  useByDefault INTEGER DEFAULT 0,
  guildId TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ContestRewards(
  contestId INTEGER NOT NULL REFERENCES Contest(id)
    ON DELETE CASCADE,
  contestRewardId INTEGER NOT NULL REFERENCES ContestReward(id)
    ON DELETE CASCADE,
  PRIMARY KEY(contestId, contestRewardId)
);

CREATE TABLE IF NOT EXISTS ContestVoteCategory(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  max INTEGER NOT NULL CHECK (max > 0),
  useByDefault INTEGER DEFAULT 0,
  guildId TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ContestVoteCategories(
  contestId INTEGER REFERENCES Contest(id)
    ON DELETE CASCADE,
  contestVoteCategoryId INTEGER REFERENCES ContestVoteCategory(id)
    ON DELETE CASCADE,
  PRIMARY KEY(contestId, contestVoteCategoryId)
);

CREATE TABLE IF NOT EXISTS ContestEntry(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  url TEXT NOT NULL,
  submitDate INTEGER NOT NULL,
  authorId TEXT NOT NULL REFERENCES User(id),
  contestId INTEGER NOT NULL REFERENCES Contest(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ContestVote(
  id INTEGER PRIMARY KEY,
  score INTEGER CHECK (score > 0),
  voteDate INTEGER NOT NULL,
  contestEntryId INTEGER NOT NULL REFERENCES ContestEntry(id)
    ON DELETE CASCADE,
  contestVoteCategoryId INTEGER NOT NULL REFERENCES ContestVoteCategory(id)
    ON DELETE CASCADE,
  voterId TEXT NOT NULL REFERENCES User(id),
  UNIQUE(contestEntryId, contestVoteCategoryId, voterId)
);

CREATE TABLE IF NOT EXISTS ContestAnnouncement(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  hoursBefore INTEGER NOT NULL,
  contestState STRING NOT NULL,
  channelId TEXT NOT NULL REFERENCES Channel(id),
  useByDefault INTEGER DEFAULT 0,
  showRules INTEGER DEFAULT 0,
  showVoteCategories INTEGER DEFAULT 0,
  showRewards INTEGER DEFAULT 0,
  showEntries INTEGER DEFAULT 0,
  showWinners INTEGER DEFAULT 0,
  showVotingResults INTEGER DEFAULT 0,
  guildId TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ContestAnnouncements(
  id INTEGER PRIMARY KEY,
  contestId INTEGER REFERENCES Contest(id)
    ON DELETE SET NULL,
  contestAnnouncementId INTEGER REFERENCES ContestAnnouncement(id)
    ON DELETE SET NULL,
  messageId TEXT REFERENCES Message(id)
    ON DELETE SET NULL,
  published INTEGER DEFAULT 0,
  removed INTEGER DEFAULT 0,
  guildId TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Poll(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  activeBeginDate INTEGER NOT NULL,
  activeEndDate INTEGER NOT NULL,
  showUsersAnswers INTEGER DEFAULT 0,
  showCorrectAnswers INTEGER DEFAULT 0,
  channelId TEXT NOT NULL REFERENCES Channel(id),
  guildId TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS PollQuestion(
  id INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  pollId INTEGER REFERENCES Poll(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS PollQuestions(
  pollQuestionId INTEGER REFERENCES PollQuestion(id)
    ON DELETE SET NULL,
  messageId TEXT REFERENCES Message(id)
    ON DELETE SET NULL,
  published INTEGER DEFAULT 0,
  removed INTEGER DEFAULT 0,
  guildId TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS PollAnswer(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  correct INTEGER NOT NULL DEFAULT 0,
  pollQuestionId INTEGER REFERENCES PollQuestion(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS PollAnswers(
  pollAnswerId INTEGER REFERENCES PollAnswer(id)
    ON DELETE CASCADE,
  userId TEXT NOT NULL REFERENCES User(id),
  PRIMARY KEY(pollAnswerId, userId)
);

CREATE TABLE IF NOT EXISTS Settings(
  id TEXT PRIMARY KEY,
  value TEXT,
  type TEXT NOT NULL
);

COMMIT;
`