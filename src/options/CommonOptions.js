const {Constants: {ApplicationCommandOptionTypes, ChannelTypes}} = require('eris');
const {Option} = require('./Option');

const OptionId = {
  User: 'user',
  Role: 'role',
  Channel: 'channel',
  Reason: 'reason',
  Command: 'command',
  RecentlyGivenPoints: 'recently-given-points',
  Points: 'points',
  Name: 'name',
  Min: 'min',
  Max: 'max',
  Description: 'description',
  Url: 'url',
  RequiredCompletedVotingsCount: 'required-completed-votings-count',
  SubmittingEntriesBeginDate: 'submitting-entries-begin-date',
  VotingBeginDate: 'voting-begin-date',
  VotingEndDate: 'voting-end-date',
  Contest: 'contest',
  ContestVoteCategory: 'contest-vote-category',
  AssignedContestVoteCategory: 'assigned-contest-vote-category',
  ContestRule: 'contest-rule',
  AssignedContestRule: 'assigned-contest-rule',
  ContestReward: 'contest-reward',
  AssignedContestReward: 'assigned-contest-reward',
  UseByDefault: 'use-by-default',
  ContestEntry: 'contest-entry',
  ContestVote: 'contest-vote',
  ContestAnnouncement: 'contest-announcement',
  Score: 'score',
  ContestState: 'contest-state',
  HoursBefore: 'hours-before',
  AssignedContestAnnouncement: 'assigned-contest-announcement',
  ShowRules: 'show-rules',
  ShowVoteCategories: 'show-vote-categories',
  ShowRewards: 'show-rewards',
  ShowEntries: 'show-entries',
  ShowVotingResults: 'show-voting-results',
};

class NumberOption extends Option {
  constructor(id, description) {
    super(id, description, ApplicationCommandOptionTypes.INTEGER);
  }
}

class StringOption extends Option {
  constructor(id, description) {
    super(id, description, ApplicationCommandOptionTypes.STRING);
  }
}

class BooleanOption extends Option {
  constructor(id, description) {
    super(id, description, ApplicationCommandOptionTypes.BOOLEAN);
  }
}

class UserOption extends Option {
  constructor(id, description) {
    super(id, description, ApplicationCommandOptionTypes.USER);
  }
}

class RoleOption extends Option {
  constructor(id, description) {
    super(id, description, ApplicationCommandOptionTypes.ROLE);
  }
}

class ChannelOption extends Option {
  constructor(id, description) {
    super(id, description, ApplicationCommandOptionTypes.CHANNEL);
  }

  getConfig() {
    return {
      ...super.getConfig(),
      channel_types: [
        ChannelTypes.GUILD_TEXT
      ],
    };
  }
}

module.exports = {
  OptionId,
  NumberOption,
  StringOption,
  BooleanOption,
  UserOption,
  RoleOption,
  ChannelOption,
};
