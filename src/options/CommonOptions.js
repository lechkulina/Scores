const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const Option = require('./Option');

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
  ActiveBeginDate: 'active-begin-date',
  ActiveEndDate: 'active-end-eate',
  VotingBeginDate: 'voting-begin-date',
  VotingEndDate: 'voting-end-date',
};

class NumberOption extends Option {
  constructor(name, description, required = true) {
    super(name, description, ApplicationCommandOptionTypes.NUMBER, required, false);
  }
}

class StringOption extends Option {
  constructor(name, description, required = true) {
    super(name, description, ApplicationCommandOptionTypes.STRING, required, false);
  }
}

class UserOption extends Option {
  constructor(description, required = true) {
    super(OptionId.User, description, ApplicationCommandOptionTypes.USER, required, false);
  }
}

class RoleOption extends Option {
  constructor(description, required = true) {
    super(OptionId.Role, description, ApplicationCommandOptionTypes.ROLE, required, false);
  }
}

module.exports = {
  OptionId,
  NumberOption,
  StringOption,
  UserOption,
  RoleOption,
};
