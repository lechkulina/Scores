module.exports = `
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS Guild(
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS User(
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    discriminator TEXT NOT NULL,
    guildId TEXT NOT NULL REFERENCES Guild(id)
);
CREATE TABLE IF NOT EXISTS Reason(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    min INTEGER NOT NULL CHECK (min > 0),
    max INTEGER NOT NULL CHECK (max > 0)
);
CREATE TABLE IF NOT EXISTS Scores(
    id INTEGER PRIMARY KEY,
    score INTEGER CHECK (score > 0),
    acquireDate INTEGER DEFAULT CURRENT_TIMESTAMP,
    comment TEXT,
    userId TEXT NOT NULL REFERENCES User(id),
    reasonId NOT NULL REFERENCES Reason(id)
);
CREATE TABLE IF NOT EXISTS Contest(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    activeBeginDate INTEGER,
    activeEndDate INTEGER,
    votingBeginDate INTEGER,
    votingEndDate INTEGER
);
CREATE TABLE IF NOT EXISTS Category(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    min INTEGER NOT NULL CHECK (min > 0),
    max INTEGER NOT NULL CHECK (max > 0)
);
CREATE TABLE IF NOT EXISTS ContestCategory(
    contestId INTEGER NOT NULL REFERENCES Contest(id),
    categoryId INTEGER NOT NULL REFERENCES Category(id),
    PRIMARY KEY(contestId, categoryId)
);
CREATE TABLE IF NOT EXISTS Entry(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    authorId TEXT NOT NULL REFERENCES User(id)
);
CREATE TABLE IF NOT EXISTS Vote(
    id INTEGER PRIMARY KEY,
    score INTEGER CHECK (score > 0),
    voteDate INTEGER DEFAULT CURRENT_TIMESTAMP,
    entryId INTEGER NOT NULL REFERENCES Entry(id),
    voterId TEXT NOT NULL REFERENCES User(id)
);
COMMIT;
`