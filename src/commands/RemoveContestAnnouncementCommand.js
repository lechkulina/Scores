const {OptionId} = require('../options/CommonOptions');
const ContestAnnouncementOption = require('../options/ContestAnnouncementOption');
const {ContestAnnouncementValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class RemoveContestRewardHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.announcement = this.getOptionValue(OptionId.ContestAnnouncement);
    return interaction.createMessage({
      content: this.translate('commands.removeContestAnnouncement.messages.confirmation', {
        announcementName: this.announcement.name,
        channelName: this.announcement.channelName,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.removeContestAnnouncement(this.announcement.id);
        return this.translate('commands.removeContestAnnouncement.messages.success', {
          announcementName: this.announcement.name,
          channelName: this.announcement.channelName,
        });
      } catch (error) {
        console.error(`Failed to remove contest announcement ${this.announcement.name} from channel ${this.announcement.channelName} - got error`, error);
        return this.translate('commands.removeContestAnnouncement.errors.failure', {
          announcementName: this.announcement.name,
          channelName: this.announcement.channelName,
        });
      }
    });
  }
}

class RemoveContestAnnouncementCommand extends Command {
  constructor(...props) {
    super('remove-contest-announcement', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.removeContestAnnouncement.description'));
    this.addOptions([
      new ContestAnnouncementOption(
        OptionId.ContestAnnouncement,
        this.translate('commands.removeContestAnnouncement.options.contestAnnouncement'), 
        this.dataModel
      ),
    ]);
    this.addValidators([
      new ContestAnnouncementValidator(OptionId.ContestAnnouncement, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RemoveContestRewardHandler(...props);
  }
}

module.exports = RemoveContestAnnouncementCommand;
