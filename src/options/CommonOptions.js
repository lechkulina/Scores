const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {Option} = require('./Option');

const OptionId = {
  User: 'user',
  Role: 'role',
  Reason: 'reason',
  Command: 'command',
  RecentlyGivenPoints: 'recently-given-points',
  Points: 'points',
  Name: 'name',
  Min: 'min',
  Max: 'max',
  Description: 'description',
  Url: 'url',
  AnnouncementsThreshold: 'announcements-threshold',
  ActiveBeginDate: 'active-begin-date',
  ActiveEndDate: 'active-end-date',
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
  AssignAction: 'assign-action',
};

class NumberOption extends Option {
  constructor(name, description, required) {
    super(name, description, ApplicationCommandOptionTypes.NUMBER, required);
  }
}

class StringOption extends Option {
  constructor(name, description, required) {
    super(name, description, ApplicationCommandOptionTypes.STRING, required);
  }
}

class BooleanOption extends Option {
  constructor(name, description, required) {
    super(name, description, ApplicationCommandOptionTypes.BOOLEAN, required);
  }
}

class UserOption extends Option {
  constructor(description, required) {
    super(OptionId.User, description, ApplicationCommandOptionTypes.USER, required);
  }
}

class RoleOption extends Option {
  constructor(description, required) {
    super(OptionId.Role, description, ApplicationCommandOptionTypes.ROLE, required);
  }
}

module.exports = {
  OptionId,
  NumberOption,
  StringOption,
  BooleanOption,
  UserOption,
  RoleOption,
};
