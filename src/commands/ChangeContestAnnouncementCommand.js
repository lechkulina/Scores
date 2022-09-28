const {OptionId, StringOption, NumberOption, BooleanOption, ChannelOption} = require('../options/CommonOptions');
const ContestStateOption = require('../options/ContestStateOption');
const ContestAnnouncementOption = require('../options/ContestAnnouncementOption');
const {
  ContestAnnouncementValidator,
  StringsLengthsValidator,
  NumbersValuesValidator,
  ChannelValidator
} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class AddContestAnnouncementHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.announcement = this.getOptionValue(OptionId.ContestAnnouncement);
    return interaction.createMessage({
      content: this.translate('commands.changeContestAnnouncement.messages.confirmation', {
        announcementName: this.announcement.name,
        channelName: this.announcement.channelName,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const name = this.getOptionValue(OptionId.Name);
    const channel = this.getOptionValue(OptionId.Channel);
    const hoursBefore = this.getOptionValue(OptionId.HoursBefore);
    const contestState = this.getOptionValue(OptionId.ContestState);
    const useByDefault = this.getOptionValue(OptionId.UseByDefault);
    const showRules = this.getOptionValue(OptionId.ShowRules);
    const showVoteCategories = this.getOptionValue(OptionId.ShowVoteCategories);
    const showRewards = this.getOptionValue(OptionId.ShowRewards);
    const showEntries = this.getOptionValue(OptionId.ShowEntries);
    const showWinners = this.getOptionValue(OptionId.ShowWinners);
    const showVotingResults = this.getOptionValue(OptionId.ShowVotingResults);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changeContestAnnouncement(
          this.announcement.id,
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
          channel.id,
          channel.name,
          interaction.guildID
        );
        return this.translate('commands.changeContestAnnouncement.messages.success', {
          announcementName: this.announcement.name,
          channelName: this.announcement.channelName,
        });
      } catch (error) {
        console.error(`Failed to change contest announcement ${this.announcement.name} from channel ${this.announcement.channelName} - got error`, error);
        return this.translate('commands.changeContestAnnouncement.errors.failure', {
          announcementName: this.announcement.name,
          channelName: this.announcement.channelName,
        });
      }
    });
  }
}

class ChangeContestAnnouncementCommand extends Command {
  constructor(...props) {
    super('change-contest-announcement', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.changeContestAnnouncement.description'));
    this.addOptions([
      new ContestAnnouncementOption(
        OptionId.ContestAnnouncement,
        this.translate('commands.changeContestAnnouncement.options.contestAnnouncement'), 
        this.dataModel
      ),
      new StringOption(OptionId.Name, this.translate('commands.changeContestAnnouncement.options.name')),
      new NumberOption(OptionId.HoursBefore, this.translate('commands.changeContestAnnouncement.options.hoursBefore')),
      new ContestStateOption(OptionId.ContestState, this.translate('commands.changeContestAnnouncement.options.contestState'), this.translate),
      new ChannelOption(OptionId.Channel, this.translate('common.channel')),
      new BooleanOption(OptionId.ShowRules, this.translate('commands.changeContestAnnouncement.options.showRules')),
      new BooleanOption(OptionId.ShowVoteCategories, this.translate('commands.changeContestAnnouncement.options.showVoteCategories')),
      new BooleanOption(OptionId.ShowRewards, this.translate('commands.changeContestAnnouncement.options.showRewards')),
      new BooleanOption(OptionId.ShowEntries, this.translate('commands.changeContestAnnouncement.options.showEntries')),
      new BooleanOption(OptionId.ShowWinners, this.translate('commands.changeContestAnnouncement.options.showWinners')),
      new BooleanOption(OptionId.ShowVotingResults, this.translate('commands.changeContestAnnouncement.options.showVotingResults')),
      new BooleanOption(OptionId.UseByDefault, this.translate('commands.changeContestAnnouncement.options.useByDefault')),
    ]);
    const minNameLength = this.settings.get(SettingId.MinNameLength);
    const maxNameLength = this.settings.get(SettingId.MaxNameLength);
    this.addValidators([
      new ContestAnnouncementValidator(OptionId.ContestAnnouncement, this.dataModel),
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

module.exports = ChangeContestAnnouncementCommand;
