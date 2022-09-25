const {OptionId} = require('../options/CommonOptions');
const AssignedContestAnnouncementOption = require('../options/AssignedContestAnnouncementOption');
const ContestOption = require('../options/ContestOption');
const InteractionHandler = require('../InteractionHandler');
const {ContestValidator, ContestAnnouncementValidator} = require('../validators/validators');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class UnassignContestAnnouncementHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.contest = this.getOptionValue(OptionId.Contest);
    this.announcement = this.getOptionValue(OptionId.AssignedContestAnnouncement);
    return interaction.createMessage({
      content: this.translate('commands.unassignContestAnnouncement.messages.confirmation', {
        announcementName: this.announcement.name,
        contestName: this.contest.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.unassignContestAnnouncement(this.contest.id, this.announcement.id);
        return this.translate('commands.unassignContestAnnouncement.messages.success', {
          announcementName: this.announcement.name,
          contestName: this.contest.name,
        });
      } catch (error) {
        console.error(`Failed to unassign contest announcement ${this.announcement.name} to contest ${this.contest.name} - got error`, error);
        return this.translate('commands.unassignContestAnnouncement.errors.failure', {
          announcementName: this.announcement.name,
          contestName: this.contest.name,
        });
      }
    });
  }
}

class UnassignContestAnnouncementCommand extends Command {
  constructor(...props) {
    super('unassign-contest-announcement', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.unassignContestAnnouncement.description'));
    this.addOptions([
      new ContestOption(ContestState.Any, OptionId.Contest, this.translate('common.contest'), this.dataModel),
      new AssignedContestAnnouncementOption(
        OptionId.AssignedContestAnnouncement,
        OptionId.Contest,
        this.translate('commands.unassignContestAnnouncement.options.contestAnnouncement'),
        this.dataModel
      ),
    ]);
    this.addValidators([
      new ContestValidator(OptionId.Contest, this.dataModel),
      new ContestAnnouncementValidator(OptionId.AssignedContestAnnouncement, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new UnassignContestAnnouncementHandler(...props);
  }
}

module.exports = UnassignContestAnnouncementCommand;
