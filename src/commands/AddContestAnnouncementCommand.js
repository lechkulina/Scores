const {OptionId, StringOption, NumberOption, BooleanOption, ChannelOption} = require('../options/CommonOptions');
const ContestStateOption = require('../options/ContestStateOption');
const {StringsLengthsValidator, NumbersValuesValidator, ChannelValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class AddContestAnnouncementHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const name = this.getOptionValue(OptionId.Name);
    const channel = this.getOptionValue(OptionId.Channel);
    try {
      await this.dataModel.addContestAnnouncement({
        name,
        hoursBefore: this.getOptionValue(OptionId.HoursBefore),
        contestState: this.getOptionValue(OptionId.ContestState),
        useByDefault: this.getOptionValue(OptionId.UseByDefault),
        showRules: this.getOptionValue(OptionId.ShowRules),
        showVoteCategories: this.getOptionValue(OptionId.ShowVoteCategories),
        showRewards: this.getOptionValue(OptionId.ShowRewards),
        showEntries: this.getOptionValue(OptionId.ShowEntries),
        showVotingResults: this.getOptionValue(OptionId.ShowVotingResults),
        channelId: channel.id,
        channelName: channel.name,
        guildId: interaction.guildID,
      });
      return interaction.createMessage({
        content: this.translate('commands.addContestAnnouncement.messages.success', {
          announcementName: name,
          channelName: channel.name,
        })
      });
    } catch (error) {
      console.error(`Failed to create contest announcement ${name} on channel ${channel.name} - got error`, error);
      return interaction.createMessage(this.translate('commands.addContestAnnouncement.errors.failure', {
        announcementName: name,
        channelName: channel.name,
      }));
    }
  }
}

class AddContestAnnouncementCommand extends Command {
  constructor(...props) {
    super('add-contest-announcement', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.addContestAnnouncement.description'));
    this.addOptions([
      new StringOption(OptionId.Name, this.translate('commands.addContestAnnouncement.options.name')),
      new NumberOption(OptionId.HoursBefore, this.translate('commands.addContestAnnouncement.options.hoursBefore')),
      new ContestStateOption(OptionId.ContestState, this.translate('commands.addContestAnnouncement.options.contestState'), this.translate),
      new ChannelOption(OptionId.Channel, this.translate('common.channel')),
      new BooleanOption(OptionId.ShowRules, this.translate('commands.addContestAnnouncement.options.showRules')),
      new BooleanOption(OptionId.ShowVoteCategories, this.translate('commands.addContestAnnouncement.options.showVoteCategories')),
      new BooleanOption(OptionId.ShowRewards, this.translate('commands.addContestAnnouncement.options.showRewards')),
      new BooleanOption(OptionId.ShowEntries, this.translate('commands.addContestAnnouncement.options.showEntries')),
      new BooleanOption(OptionId.ShowVotingResults, this.translate('commands.addContestAnnouncement.options.showVotingResults')),
      new BooleanOption(OptionId.UseByDefault, this.translate('commands.addContestAnnouncement.options.useByDefault')),
    ]);
    const minNameLength = this.settings.get(SettingId.MinNameLength);
    const maxNameLength = this.settings.get(SettingId.MaxNameLength);
    this.addValidators([
      new StringsLengthsValidator(minNameLength, maxNameLength, [OptionId.Name], this.options),
      new NumbersValuesValidator([OptionId.HoursBefore], this.options),
      new ChannelValidator(OptionId.Channel, this.clientHandler),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddContestAnnouncementHandler(...props);
  }
}

module.exports = AddContestAnnouncementCommand;
