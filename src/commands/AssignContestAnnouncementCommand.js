const {OptionId} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const ContestAnnouncementOption = require('../options/ContestAnnouncementOption');
const InteractionHandler = require('../InteractionHandler');
const {ContestValidator, ContestAnnouncementValidator} = require('../validators/validators');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class AssignContestAnnouncementHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const contest = this.getOptionValue(OptionId.Contest);
    const announcement = this.getOptionValue(OptionId.ContestAnnouncement);
    try {
      await this.dataModel.assignContestAnnouncement(contest.id, announcement.id, interaction.guildID);
      return interaction.createMessage(
          this.translate('commands.assignContestAnnouncement.messages.success', {
            announcementName: announcement.name,
            contestName: contest.name,
        })
      );
    } catch (error) {
      console.error(`Failed to assign contest announcement ${announcement.name} to contest ${contest.name} - got error`, error);
      return interaction.createMessage(
        this.translate('commands.assignContestAnnouncement.errors.failure', {
          announcementName: announcement.name,
          contestName: contest.name,
        })
      );
    }
  }
}

class AssignContestAnnouncementCommand extends Command {
  constructor(...props) {
    super('assign-contest-announcement', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.assignContestAnnouncement.description'));
    this.addOptions([
      new ContestOption(ContestState.Any, OptionId.Contest, this.translate('common.contest'), this.dataModel),
      new ContestAnnouncementOption(
        OptionId.ContestAnnouncement,
        this.translate('commands.assignContestAnnouncement.options.contestAnnouncement'), 
        this.dataModel
      ),
    ]);
    this.addValidators([
      new ContestValidator(OptionId.Contest, this.dataModel),
      new ContestAnnouncementValidator(OptionId.ContestAnnouncement, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AssignContestAnnouncementHandler(...props);
  }
}

module.exports = AssignContestAnnouncementCommand;
