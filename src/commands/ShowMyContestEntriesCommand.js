const moment = require('moment');
const {OptionId} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const {ContestValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {Entities, joinSections} = require('../Formatters');
const {ContestState} = require('../DataModel');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class ShowMyContestEntriesHandler extends InteractionHandler {
  generateHeaderSection(contest, entries) {
    const key = `commands.showMyContestEntries.messages.header.${
      entries.length > 0
      ? 'withEntries'
      : 'withoutEntries'
    }`;
    return this.translate(key, {
      contestName: contest.name,
      entriesCount: entries.length,
    });
  }

  groupEntries(entriesSummary) {
    const entries = new Map();
    entriesSummary.forEach(({
      entryId,
      entryName,
      submitDate,
      categoryName,
      scores
    }) => {
      if (!entries.has(entryId)) {
        entries.set(entryId, {
          entryName,
          submitDate,
          categories: [],
        })
      }
      const entry = entries.get(entryId);
      entry.categories.push({
        categoryName,
        scores,
      });
    });
    return Array.from(entries.values());
  }

  generateEntriesSections(entries) {
    const sections = [];
    if (entries.length === 0) {
      return sections;
    }
    const dateOutputFormat = this.settings.get(SettingId.DateOutputFormat);
    const key = 'commands.showMyContestEntries.messages.entries';
    entries.forEach(({
      entryName,
      submitDate,
      categories
    }) => {
      if (categories.length === 0) {
        return;
      }
      const subSections = [
        this.translate(`${key}.title`, {
          entryName,
          submitDate: moment(submitDate).format(dateOutputFormat),
        })
      ];
      categories.forEach(({categoryName, scores}) => {
        subSections.push(
          this.translate(`${key}.item.${
            scores == null
              ? 'withoutScore'
              : 'withScore'  
          }`, {
            categoryName,
            scores,
          })
        );
      });
      sections.push(subSections.join(Entities.NewLine));
    });
    return sections;
  }

  async handleCommandInteraction(interaction) {
    this.markAsDone();
    try {
      const userId = interaction.member.user.id;
      const contest = this.getOptionValue(OptionId.Contest);
      const entriesSummary = await this.dataModel.getUserContestEntriesSummary(contest.id, userId);
      const entries = this.groupEntries(entriesSummary);
      return this.createLongMessage(interaction,
        joinSections([
          this.generateHeaderSection(contest, entries),
          ...this.generateEntriesSections(entries)
        ], Entities.EmptyLine)
      );
    } catch (error) {
      console.error(`Failed to show contest votes - got error`, error);
      return interaction.createMessage(this.translate('commands.showMyContestEntries.errors.failure'));
    }
  }
}

class ShowMyContestEntriesCommand extends Command {
  constructor(...props) {
    super('show-my-contest-entries', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.showMyContestEntries.description'));
    this.addOptions([
      new ContestOption(
        ContestState.OpenForSubmittingEntries, OptionId.Contest, this.translate('commands.showMyContestEntries.options.contest'), this.dataModel),
    ]);
    this.addValidators([
      new ContestValidator(OptionId.Contest, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ShowMyContestEntriesHandler(...props);
  }
}

module.exports = ShowMyContestEntriesCommand;
