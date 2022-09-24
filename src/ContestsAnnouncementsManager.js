const moment = require('moment');
const {DataModelEvents, ContestState} = require('./DataModel');
const {formatDuration, Entities} = require('./Formatters');
const {SettingId} = require('./Settings');
const {msInHour} = require('./constants');

const AnnouncementType = {
  Initial: 0,
  Reminder: 1,
  Final: 2,
};

function generateUpdateTaskId(announcementId) {
  return `update-announcement-${announcementId}`;
}

function generateCreateTaskId(announcementType, contestId) {
  return `create-announcement-${announcementType}-${contestId}`;
}

class ContestsAnnouncementsManager {
  constructor(dataModel, settings, tasksScheduler, messagePublisher, translate) {
    this.dataModel = dataModel;
    this.settings = settings;
    this.tasksScheduler = tasksScheduler;
    this.messagePublisher = messagePublisher;
    this.translate = translate;
    this.removeAnnouncementsLock = Promise.resolve();
    this.onContestAddedCallback = this.onContestAdded.bind(this);
    this.onContestRemovedCallback = this.onContestRemoved.bind(this);
    this.onContestAnnouncementAddedCallback = this.onContestAnnouncementAdded.bind(this);
    this.onMessagesRemovedCallback = this.onMessagesRemoved.bind(this);
    this.onUpdateContestAnnouncementsCallback = this.onUpdateContestAnnouncements.bind(this);
    this.onUpdateOpenContestsAnnouncementsCallback = this.onUpdateOpenContestsAnnouncements.bind(this);
  }

  generateHeaderSection(contest, announcementType, now) {
    const sections = [];
    switch(announcementType) {
      case AnnouncementType.Final:
        sections.push(
          this.translate('announcements.contest.headerTitleFinal')
        );
        break;
      case AnnouncementType.Reminder:
        sections.push(
          this.translate('announcements.contest.headerTitleReminder')
        );
        break;
      default:
        sections.push(
          this.translate('announcements.contest.headerTitleInitial')
        );
        break;
    }
    switch (true) {
      case contest.activeEndDate <= now:
        sections.push(
          this.translate('announcements.contest.headerDescriptionFinal', {
            contestName: contest.name,
          })
        );
        break;
      case contest.votingBeginDate <= now:
        sections.push(
          this.translate('announcements.contest.headerDescriptionBeforeFinal', {
            contestName: contest.name,
            finalStartsIn: formatDuration(this.translate, contest.activeEndDate - now),
          })
        );
        break;
      case contest.activeBeginDate <= now:
        sections.push(
          this.translate('announcements.contest.headerDescriptionBeforeVoting', {
            contestName: contest.name,
            votingStartsIn: formatDuration(this.translate, contest.votingBeginDate - now),
          })
        );
        break;
      default:
        sections.push(
          this.translate('announcements.contest.headerDescriptionInitial', {
            contestName: contest.name,
            contestStartsIn: formatDuration(this.translate, contest.activeBeginDate - now),
          })
        );
        break;
    }
    return sections.join(Entities.NewLine);
  }

  generateDescriptionSection(contest, now) {
    const sections = [
      this.translate('announcements.contest.descriptionTitle'),
    ];
    switch (true) {
      // TODO
      case contest.activeEndDate <= now:
        sections.push(
          this.translate('announcements.contest.descriptionFinal', {
            maxPointsCount: 0,
            winnerPointsCount: 0,
            winnerName: 0,
            winnerEntryName: '',
          })
        );
        break;
      case contest.votingBeginDate <= now:
        sections.push(
          this.translate('announcements.contest.descriptionBeforeFinal')
        );
        break;
      case contest.activeBeginDate <= now:
        sections.push(
          this.translate('announcements.contest.descriptionBeforeVoting', {
            description: contest.description,
          })
        );
        break;
      default:
        sections.push(
          this.translate('announcements.contest.descriptionInitial', {
            description: contest.description,
          })
        );
        break;
    }
    return sections.join(Entities.NewLine);
  }

  async generateRulesSection(contest) {
    const rules = await this.dataModel.getAssignedContestRules(contest.id);
    if (rules.length === 0) {
      return '';
    }
    const sections = [
      this.translate('announcements.contest.rulesTitle'),
      this.translate('announcements.contest.rulesDescription'),
    ];
    rules.forEach(({description}) => {
      sections.push(
        this.translate('announcements.contest.ruleDescription', {
          ruleDescription: description,
        })
      );
    });
    return sections.join(Entities.NewLine);
  }

  async generateVoteCategoriesSection(contest) {
    const voteCategories = await this.dataModel.getAssignedContestVoteCategories(contest.id);
    if (voteCategories.length === 0) {
      return '';
    }
    const sections = [
      this.translate('announcements.contest.voteCategoriesTitle'),
      this.translate('announcements.contest.voteCategoriesDescription', {
        count: voteCategories.length
      }),
    ];
    voteCategories.forEach(({name, description, max}) => {
      sections.push(
        this.translate('announcements.contest.voteCategoryDescription', {
          voteCategoryName: name,
          voteCategoryDescription: description,
          maxPointsPerVoteCategory: max,
        })
      );
    });
    const maxPointsPerVoting = voteCategories.reduce((points, voteCategory) => {
      points += voteCategory.max;
      return points;
    }, 0);
    const requiredCompletedVotingsCount = contest.requiredCompletedVotingsCount;
    const maxPointsFromVotings = maxPointsPerVoting * requiredCompletedVotingsCount;
    sections.push(
      this.translate('announcements.contest.voteCategoriesSummary', {
        maxPointsPerVoting,
        requiredCompletedVotingsCount,
        maxPointsFromVotings,
      })
    );
    return sections.join(Entities.NewLine);
  }

  async generateRewardsSection(contest) {
    const rewards = await this.dataModel.getAssignedContestRewards(contest.id);
    if (rewards.length === 0) {
      return '';
    }
    const sections = [
      this.translate('announcements.contest.rewardsTitle'),
      this.translate('announcements.contest.rewardsDescription'),
    ];
    rewards.forEach(({description}) => {
      sections.push(
        this.translate('announcements.contest.rewardDescription', {
          rewardDescription: description,
        })
      );
    });
    return sections.join(Entities.NewLine);
  }

  async generateEntriesSection(contest, now) {
    if (now < contest.activeBeginDate) {
      return '';
    }
    const entries = await this.dataModel.getContestEntries(contest.id);
    if (entries.length === 0) {
      return '';
    }
    const dateAndTimeOutputFormat = this.settings.get(SettingId.DateAndTimeOutputFormat);
    const sections = [
      this.translate('announcements.contest.entriesTitle'),
      this.translate('announcements.contest.entriesDescription', {
        count: entries.length,
      })
    ];
    entries.forEach(({name, authorName, submitDate}) => {
      sections.push(
        this.translate('announcements.contest.entryDescription', {
          entryName: name,
          authorName,
          submitDate: moment(submitDate).format(dateAndTimeOutputFormat),
        })
      );
    });
    const userWithMostEntries = await this.dataModel.getUserWithMostEntries(contest.id);
    if (userWithMostEntries) {
      sections.push(
        this.translate('announcements.contest.userWithMostEntries', {
          entriesCount: userWithMostEntries.entriesCount,
          userName: userWithMostEntries.userName,
        })
      )
    }
    return sections.join(Entities.NewLine);
  }

  async generateVotingResultsSection(contest) {
    return ''; // TODO
  }

  async generateContent(contest, announcementType) {
    const now = Date.now();
    const sections = [
      this.generateHeaderSection(contest, announcementType, now),
      this.generateDescriptionSection(contest, now),
    ];
    sections.push(
      ...await (() => {
        switch (announcementType) {
          case AnnouncementType.Initial:
            return Promise.all([
              this.generateRulesSection(contest),
              this.generateVoteCategoriesSection(contest),
              this.generateEntriesSection(contest, now),
            ]);
          case AnnouncementType.Reminder:
            return Promise.all([
              this.generateRulesSection(contest),
              this.generateEntriesSection(contest, now),
            ]);
          case AnnouncementType.Final:
            return Promise.all([
              this.generateRewardsSection(contest),
              this.generateVotingResultsSection(contest),
            ]);
        }
      })()
    );
    return sections
      .filter(section => !!section)
      .join(Entities.EmptyLine);
  }

  async createAnnouncement(contest, announcementType) {
    const channelId = this.settings.get(SettingId.ContestsAnnouncementsChannelId);
    const content = await this.generateContent(contest, announcementType);
    const messageId = await this.messagePublisher.createMessage(contest.guildId, channelId, content);
    return this.dataModel.addContestAnnouncement(announcementType, contest.id, messageId);
  }

  async updateAnnouncement(contest, announcement) {
    const content = await this.generateContent(contest, announcement.type);
    return this.messagePublisher.updateMessage(announcement.messageId, content);
  }

  removeAnnouncements(announcements) {
    this.removeAnnouncementsLock = this.removeAnnouncementsLock.finally(async () => {
      const announcementsIds = announcements.map(({id}) => id);
      const messagesIds = [];
      const tasksIds = [];
      announcements.forEach(announcement => {
        // in case a single message was removed remotely
        if (announcement.messageId) {
          messagesIds.push(announcement.messageId);
        }
        tasksIds.push(generateUpdateTaskId(announcement.id));
        tasksIds.push(
          ...Object.values(AnnouncementType).map(announcementType => (
            generateCreateTaskId(announcementType, announcement.contestId)
          ))
        );
      });
      this.tasksScheduler.removeTasks(tasksIds);
      await this.messagePublisher.removeMessages(messagesIds);
      return this.dataModel.removeContestAnnouncements(announcementsIds);
    });
    return this.removeAnnouncementsLock;
  }

  async updateContestAnnouncements(contest) {
    const announcements = await this.dataModel.getContestAnnouncements(contest.id);
    return Promise.all(
      announcements.map(announcement => this.updateAnnouncement(contest, announcement))
    );
  }

  createContestSchedule(contest) {
    const entries = [];
    const now = Date.now();
    const threshold = contest.announcementsThreshold * msInHour;
    if (contest.activeBeginDate - threshold < now) {
      entries.push({
        announcementType: AnnouncementType.Initial,
        date: contest.activeBeginDate - threshold,
      });
    }
    if (contest.votingBeginDate - threshold < now) {
      entries.push({
        announcementType: AnnouncementType.Reminder,
        date: contest.votingBeginDate - threshold,
      });
    }
    if (contest.activeEndDate - now < 0) {
      entries.push({
        announcementType: AnnouncementType.Final,
        date: contest.activeEndDate,
      });
    }
    return entries;
  }

  async createContestsTasks(contests) {
    const tasks = [];
    const now = Date.now();
    for (const contest of contests) {
      const announcements = await this.dataModel.getContestAnnouncements(contest.id);
      const scheduleEntries = this.createContestSchedule(contest);
      scheduleEntries.forEach(scheduleEntry => {
        const announcement = announcements.find(({type}) => type === scheduleEntry.announcementType);
        if (announcement) {
          tasks.push({
            id: generateUpdateTaskId(announcement.id),
            scheduleDate: now,
            expirationDate: contest.activeEndDate,
            interval: 10 * 1000,
            run: () => this.updateAnnouncement(contest, announcement),
          });
        } else {
          tasks.push({
            id: generateCreateTaskId(scheduleEntry.announcementType, contest.id),
            scheduleDate: scheduleEntry.date,
            expirationDate: scheduleEntry.date,
            run: () => this.createAnnouncement(contest, scheduleEntry.announcementType),
          });          
        }
      });
    }
    return tasks;
  }

  async onContestAdded(guildId) {
    const contests = await this.dataModel.getContests(guildId);
    const tasks = await this.createContestsTasks(contests);
    this.tasksScheduler.addTasks(tasks);
  }

  async onContestRemoved(contestId) {
    const announcements = await this.dataModel.getContestAnnouncements(contestId);
    return this.removeAnnouncements(announcements);
  }

  async onContestAnnouncementAdded(contestId) {
    const contest = await this.dataModel.getContest(contestId);
    const tasks = await this.createContestsTasks([contest]);
    this.tasksScheduler.addTasks(tasks);
  }

  async onMessagesRemoved(messagesIds) {
    const announcements = await Promise.all(
      messagesIds.map(messageId => this.dataModel.getContestAnnouncement(messageId))
    );
    return this.removeAnnouncements(announcements.filter(announcement => !!announcement));
  }

  async onUpdateContestAnnouncements(contestId) {
    const contest = await this.dataModel.getContest(contestId);
    return this.updateContestAnnouncements(contest);
  }

  async onUpdateOpenContestsAnnouncements(guildId) {
    const contests = await this.dataModel.getContests(guildId, ContestState.Open);
    return Promise.all(
      contests.map(contest => this.updateContestAnnouncements(contest))
    );
  }

  async initialize() {
    this.dataModel.on(DataModelEvents.onContestAdded, this.onContestAddedCallback);
    this.dataModel.on(DataModelEvents.onContestChanged, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.on(DataModelEvents.onContestRemoved, this.onContestRemovedCallback);
    this.dataModel.on(DataModelEvents.onContestAnnouncementAdded, this.onContestAnnouncementAddedCallback);
    this.dataModel.on(DataModelEvents.onMessagesRemoved, this.onMessagesRemovedCallback);
    this.dataModel.on(DataModelEvents.onContestVoteCategoryChanged, this.onUpdateOpenContestsAnnouncementsCallback);
    this.dataModel.on(DataModelEvents.onContestVoteCategoryRemoved, this.onUpdateOpenContestsAnnouncementsCallback);
    this.dataModel.on(DataModelEvents.onContestVoteCategoryAssigned, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.on(DataModelEvents.onContestVoteCategoryUnassigned, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.on(DataModelEvents.onContestRuleChanged, this.onUpdateOpenContestsAnnouncementsCallback);
    this.dataModel.on(DataModelEvents.onContestRuleRemoved, this.onUpdateOpenContestsAnnouncementsCallback);
    this.dataModel.on(DataModelEvents.onContestRuleAssigned, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.on(DataModelEvents.onContestRuleUnassigned, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.on(DataModelEvents.onContestRewardChanged, this.onUpdateOpenContestsAnnouncementsCallback);
    this.dataModel.on(DataModelEvents.onContestRewardRemoved, this.onUpdateOpenContestsAnnouncementsCallback);
    this.dataModel.on(DataModelEvents.onContestRewardAssigned, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.on(DataModelEvents.onContestRewardUnassigned, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.on(DataModelEvents.onContestEntrySubmitted, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.on(DataModelEvents.onContestEntryCanceled, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.on(DataModelEvents.onContestEntryChanged, this.onUpdateContestAnnouncementsCallback);
    const contests = await this.dataModel.getContests();
    const tasks = await this.createContestsTasks(contests);
    this.tasksScheduler.addTasks(tasks);
  }

  uninitialize() {
    this.dataModel.off(DataModelEvents.onContestAdded, this.onContestAddedCallback);
    this.dataModel.off(DataModelEvents.onContestChanged, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.off(DataModelEvents.onContestRemoved, this.onContestRemovedCallback);
    this.dataModel.off(DataModelEvents.onContestAnnouncementAdded, this.onContestAnnouncementAddedCallback);
    this.dataModel.off(DataModelEvents.onMessagesRemoved, this.onMessagesRemovedCallback);
    this.dataModel.off(DataModelEvents.onContestVoteCategoryChanged, this.onUpdateOpenContestsAnnouncementsCallback);
    this.dataModel.off(DataModelEvents.onContestVoteCategoryRemoved, this.onUpdateOpenContestsAnnouncementsCallback);
    this.dataModel.off(DataModelEvents.onContestVoteCategoryAssigned, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.off(DataModelEvents.onContestVoteCategoryUnassigned, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.off(DataModelEvents.onContestRuleChanged, this.onUpdateOpenContestsAnnouncementsCallback);
    this.dataModel.off(DataModelEvents.onContestRuleRemoved, this.onUpdateOpenContestsAnnouncementsCallback);
    this.dataModel.off(DataModelEvents.onContestRuleAssigned, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.off(DataModelEvents.onContestRuleUnassigned, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.off(DataModelEvents.onContestRewardChanged, this.onUpdateOpenContestsAnnouncementsCallback);
    this.dataModel.off(DataModelEvents.onContestRewardRemoved, this.onUpdateOpenContestsAnnouncementsCallback);
    this.dataModel.off(DataModelEvents.onContestRewardAssigned, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.off(DataModelEvents.onContestRewardUnassigned, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.off(DataModelEvents.onContestEntrySubmitted, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.off(DataModelEvents.onContestEntryCanceled, this.onUpdateContestAnnouncementsCallback);
    this.dataModel.off(DataModelEvents.onContestEntryChanged, this.onUpdateContestAnnouncementsCallback);
  }
}

module.exports = ContestsAnnouncementsManager;
