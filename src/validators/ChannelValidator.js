const Validator = require('./Validator');

class ChannelValidator extends Validator {
  constructor(channelOptionId, clientHandler) {
    super();
    this.channelOptionId = channelOptionId;
    this.clientHandler = clientHandler;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const channelId = optionsValues.get(this.channelOptionId);
    try {
      const channel = await this.clientHandler.findChannel(interaction.guildID, channelId);
      if (channel) {
        optionsValues.set(this.channelOptionId, channel);
      } else {
        issues.push(translate('validators.unknownChannel', {
          channelId,
        }));
      }
    } catch(error) {
      console.error(`Failed to find channel ${channelId} data - got error`, error);
      issues.push(translate('validators.channelFetchFailure', {
        channelId,
      }));
    }
    return issues;
  }
}

module.exports = ChannelValidator;
