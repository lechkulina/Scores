const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const Option = require('./Option');

const OptionId = {
  User: 'user',
  Reason: 'reason',
  Points: 'points',
  Comment: 'comment',
  Name: 'name',
  Min: 'min',
  Max: 'max'
};

class NumberOption extends Option {
  constructor(name, description, required) {
    super(name, description, ApplicationCommandOptionTypes.NUMBER, required, false);
  }
}

class StringOption extends Option {
  constructor(name, description, required) {
    super(name, description, ApplicationCommandOptionTypes.STRING, required, false);
  }
}

module.exports = {
  OptionId,
  NumberOption,
  StringOption,
};
