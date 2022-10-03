const moment = require('moment');
const {DataModelEvents, ContestState} = require('./DataModel');
const {formatDuration, joinSections, Entities} = require('./Formatters');
const {SettingId} = require('./Settings');
const {msInHour} = require('./constants');

const TaskType = {
  Publish: 'publish',
  Republish: 'republish',
  Unpublish: 'unpublish',
  Update: 'update',
  Refresh: 'refresh',
  Remove: 'remove',
}

function generateTaskId(taskType, assignment) {
  return `${taskType}-contest-announcement-assignment-${assignment.id}`;
}

class ContestsAnnouncementsManager {
  constructor(dataModel, settings, tasksScheduler, messagePublisher, translate) {
    this.dataModel = dataModel;
    this.settings = settings;
    this.tasksScheduler = tasksScheduler;
    this.messagePublisher = messagePublisher;
    this.translate = translate;
    this.onGuildChangedCallback = this.onGuildChanged.bind(this);
    this.onContestChangedCallback = this.onContestChanged.bind(this);
    this.onAnnouncementChangedCallback = this.onAnnouncementChanged.bind(this);
    this.onAssignmentChangedCallback = this.onAssignmentChanged.bind(this);
    this.onMessagesRemovedCallback = this.onMessagesRemoved.bind(this);
    this.scheduleTasksCallback = this.scheduleTasks.bind(this);
  }

  generateHeaderSection(contest, announcement, remainingTime) {
    const key = `announcements.contest.header.${announcement.contestState}.${remainingTime > 0 ? 'ready' : 'expired'}`;
    return joinSections([
      this.translate(`${key}.title`),
      this.translate(`${key}.content`, {
        contestName: contest.name,
        remainingTime: formatDuration(this.translate, remainingTime),
      }),
    ]);
  }

  generateDescriptionSection(contest, announcement, remainingTime) {
    const key = `announcements.contest.description.${announcement.contestState}.${remainingTime > 0 ? 'ready' : 'expired'}`;
    return joinSections([
      this.translate(`${key}.title`),
      this.translate(`${key}.content`, {
        description: contest.description,
      }),
    ]);
  }

  async generateWinnersSection(contest, announcement) {
    if (!announcement.showWinners) {
      return;
    }
    const winners = await this.dataModel.getContestWinners(contest.id);
    const key = `announcements.contest.winners.${announcement.contestState}`;
    const sections = [
      this.translate(`${key}.title`, {
        count: winners.length,
      }),
      this.translate(`${key}.${winners.length === 0 ? 'noItems' : 'description'}`, {
        count: winners.length,
      }),
    ];
    winners.forEach(({entryName, authorName, scores}) => {
      sections.push(
        this.translate('announcements.contest.winners.item', {
          entryName,
          authorName,
          scores,
          count: winners.length,
        })
      );
    });
    sections.push(
      this.translate(`${key}.summary`)
    );
    return joinSections(sections);
  }

  async generateRulesSection(contest, announcement) {
    if (!announcement.showRules) {
      return;
    }
    const rules = await this.dataModel.getAssignedContestRules(contest.id);
    const key = `announcements.contest.rules.${announcement.contestState}`;
    const sections = [
      this.translate(`${key}.title`),
      this.translate(`${key}.${rules.length === 0 ? 'noItems' : 'description'}`),
    ];
    rules.forEach(({description}) => {
      sections.push(
        this.translate('announcements.contest.rules.item', {
          item: description,
        })
      );
    });
    return joinSections(sections);
  }

  async generateVoteCategoriesSection(contest, announcement) {
    if (!announcement.showVoteCategories) {
      return;
    }
    const categories = await this.dataModel.getAssignedContestVoteCategories(contest.id);
    const key = `announcements.contest.voteCategories.${announcement.contestState}`;
    const sections = [
      this.translate(`${key}.title`),
      this.translate(`${key}.${categories.length === 0 ? 'noItems' : 'description'}`, {
        categoriesCount: categories.length,
      }),
    ];
    categories.forEach(({name, description, max}) => {
      sections.push(
        this.translate('announcements.contest.voteCategories.item', {
          categoryName: name,
          categoryDescription: description,
          maxPointsPerCategory: max,
        })
      );
    });
    if (categories.length > 0) {
      const maxPointsPerVoting = categories.reduce((points, voteCategory) => {
        points += voteCategory.max;
        return points;
      }, 0);
      const requiredCompletedVotingsCount = contest.requiredCompletedVotingsCount;
      const maxPointsFromVotings = maxPointsPerVoting * requiredCompletedVotingsCount;
      sections.push(
        this.translate(`${key}.summary`, {
          maxPointsPerVoting,
          requiredCompletedVotingsCount,
          maxPointsFromVotings,
        })
      );
    }
    return joinSections(sections);
  }

  async generateRewardsSection(contest, announcement) {
    if (!announcement.showRewards) {
      return;
    }
    const rewards = await this.dataModel.getAssignedContestRewards(contest.id);
    const key = `announcements.contest.rewards.${announcement.contestState}`;
    const sections = [
      this.translate(`${key}.title`),
      this.translate(`${key}.${rewards.length === 0 ? 'noItems' : 'description'}`),
    ];
    rewards.forEach(({description}) => {
      sections.push(
        this.translate('announcements.contest.rewards.item', {
          item: description,
        })
      );
    });
    return joinSections(sections);
  }

  async generateEntriesSection(contest, announcement) {
    if (!announcement.showEntries) {
      return;
    }
    const entries = await this.dataModel.getContestEntries({
      contestId: contest.id,
    });
    const dateAndTimeOutputFormat = this.settings.get(SettingId.DateAndTimeOutputFormat);
    const key = `announcements.contest.entries.${announcement.contestState}`;
    const sections = [
      this.translate(`${key}.title`),
      this.translate(`${key}.${entries.length === 0 ? 'noItems' : 'description'}`, {
        entriesCount: entries.length,
      }),
    ];
    entries.forEach(({name, authorName, submitDate}) => {
      sections.push(
        this.translate('announcements.contest.entries.item', {
          entryName: name,
          authorName,
          submitDate: moment(submitDate).format(dateAndTimeOutputFormat),
        })
      );
    });
    if (entries.length > 0) {
      const userWithMostEntries = await this.dataModel.getUserWithMostEntries(contest.id);
      if (userWithMostEntries) {
        sections.push(
          this.translate(`${key}.summary`, {
            entriesCount: userWithMostEntries.entriesCount,
            userName: userWithMostEntries.userName,
          })
        );
      }
    }
    return joinSections(sections);
  }

  async generateVotingResultsSection(contest, announcement) {
    if (!announcement.showVotingResults) {
      return;
    }
    const results = await this.dataModel.getContestVotingResults(contest.id);
    const key = `announcements.contest.votingResults.${announcement.contestState}`;
    const sections = [
      this.translate(`${key}.title`),
      this.translate(`${key}.${results.length === 0 ? 'noItems' : 'description'}`, {
        entriesCount: results.length,
      }),
    ];
    results.forEach(({entryName, authorName, scores}) => {
      sections.push(
        this.translate('announcements.contest.votingResults.item', {
          entryName,
          authorName,
          scores,
        })
      );
    });
    if (results.length > 0) {
      const userWithMostEntries = await this.dataModel.getUserWithMostEntries(contest.id);
      if (userWithMostEntries) {
        sections.push(
          this.translate(`${key}.summary`, {
            entriesCount: userWithMostEntries.entriesCount,
            userName: userWithMostEntries.userName,
          })
        );
      }
    }
    return joinSections(sections);
  }

  async generateContent(contest, announcement, expirationDate) {
    const remainingTime = expirationDate - Date.now();
    return joinSections([
      this.generateHeaderSection(contest, announcement, remainingTime),
      this.generateDescriptionSection(contest, announcement, remainingTime),
      await this.generateWinnersSection(contest, announcement),
      await this.generateRewardsSection(contest, announcement),
      await this.generateRulesSection(contest, announcement),
      await this.generateVoteCategoriesSection(contest, announcement),
      await this.generateEntriesSection(contest, announcement),
      await this.generateVotingResultsSection(contest, announcement),
    ], Entities.EmptyLine);
  }

  async publishAnnouncement(assignment, contest, announcement, expirationDate) {
    console.debug(`Publising contest announcement ${announcement.id} for contest ${contest.id} under assignment ${assignment.id}`);
    const content = await this.generateContent(contest, announcement, expirationDate);
    const messageId = await this.messagePublisher.createMessage(announcement.guildId, announcement.channelId, content);
    await this.dataModel.publishContestAnnouncement(contest.id, announcement.id, messageId);
    const publishedAssignemnt = await this.dataModel.getContestAnnouncementAssignment(assignment.id);
    await this.scheduleTask(publishedAssignemnt);
  }

  async republishAnnouncement(assignment, contest, announcement, expirationDate) {
    console.debug(`Republising contest announcement ${announcement.id} for contest ${contest.id} under assignment ${assignment.id}`);
    const content = await this.generateContent(contest, announcement, expirationDate);
    const messageId = await this.messagePublisher.createMessage(announcement.guildId, announcement.channelId, content);
    // message needs to be updated in the assignment before removinig the message
    await this.dataModel.publishContestAnnouncement(contest.id, announcement.id, messageId);
    await this.messagePublisher.removeMessage(assignment.messageId);
    const republishedAssignemnt = await this.dataModel.getContestAnnouncementAssignment(assignment.id);
    await this.scheduleTask(republishedAssignemnt);
  }

  async unpublishAnnouncement(assignment, contest, announcement) {
    console.debug(`Unpublishing contest announcement ${announcement.id} for contest ${contest.id} under assignment ${assignment.id}`);
    // message needs to be updated in the assignment before removinig the message
    await this.dataModel.unpublishContestAnnouncement(contest.id, announcement.id);
    await this.messagePublisher.removeMessage(assignment.messageId);
    const unpublishedAssignemnt = await this.dataModel.getContestAnnouncementAssignment(assignment.id);
    await this.scheduleTask(unpublishedAssignemnt);
  }

  async updateAnnouncement(assignment, contest, announcement, expirationDate) {
    console.debug(`Updating contest announcement ${announcement.id} for contest ${contest.id} under assignment ${assignment.id}`);
    const content = await this.generateContent(contest, announcement, expirationDate);
    return this.messagePublisher.updateMessage(assignment.messageId, content);
  }

  async removeAssignment(assignment) {
    console.debug(`Removing contest announcement assignment ${assignment.id}`);
    await this.dataModel.removeContestAnnouncementAssignment(assignment.id);
    if (assignment.messageId) {
      await this.messagePublisher.removeMessage(assignment.messageId);
    }
  }

  async scheduleTask(assignment, now = Date.now()) {
    this.tasksScheduler.removeTasks([
      generateTaskId(TaskType.Update, assignment),
      generateTaskId(TaskType.Refresh, assignment),
      generateTaskId(TaskType.Publish, assignment),
      generateTaskId(TaskType.Republish, assignment),
      generateTaskId(TaskType.Remove, assignment),
    ]);
    // remove announcement assignment
    if (
      assignment.removed // assignment was marked for removal
      || !assignment.contestId // contest was removed
      || !assignment.contestAnnouncementId // announcement was removed
      || (assignment.published && !assignment.messageId) // published message was removed  
    ) {
      this.tasksScheduler.addTask({
        id: generateTaskId(TaskType.Remove, assignment),
        scheduleDate: now,
        expirationDate: now,
        run: () => this.removeAssignment(assignment),
      });
      return;
    }
    const contest = await this.dataModel.getContest(assignment.contestId);
    const announcement = await this.dataModel.getContestAnnouncement(assignment.contestAnnouncementId);
    const [beginDate, expirationDate] = (() => {
      switch (announcement.contestState) {
        case ContestState.OpenForSubmittingEntries:
          return [contest.submittingEntriesBeginDate, contest.votingBeginDate];
        case ContestState.OpenForVoting:
          return [contest.votingBeginDate, contest.votingEndDate];
        case ContestState.Finished:
          return [contest.votingEndDate, contest.votingEndDate];
        default:
          return [];
      }
    })();
    if (!beginDate || !expirationDate) {
      console.warn(`Unable to create tasks for announcement ${announcement.id} - invalid contest state ${announcement.contestState}`);
      return;
    }
    // announcement expired - there is no longer need to do anything with it
    if (now >= expirationDate) {
      return;
    }
    // publish new announcement
    const publishDate = beginDate - announcement.hoursBefore * msInHour;
    if (!assignment.published) {
      this.tasksScheduler.addTask({
        id: generateTaskId(TaskType.Publish, assignment),
        scheduleDate: publishDate,
        expirationDate: publishDate,
        run: () => this.publishAnnouncement(assignment, contest, announcement, expirationDate),
      });
      return;
    }
    if (!assignment.messageId) {
      console.error(`Found published contest announcement ${announcement.id} without a message - ignoring it`);
      return;
    }
    const message = await this.dataModel.getMessage(assignment.messageId);
    // announcement channel changed - republish exising announcement
    if (announcement.channelId !== message.channelId) {
      this.tasksScheduler.addTask({
        id: generateTaskId(TaskType.Republish, assignment),
        scheduleDate: now,
        expirationDate: now,
        run: () => this.republishAnnouncement(assignment, contest, announcement, expirationDate),
      });
      return;
    }
    // publish date change and it is now in the future - unpublish exising announcement
    if (publishDate > now) {
      this.tasksScheduler.addTask({
        id: generateTaskId(TaskType.Unpublish, assignment),
        scheduleDate: now,
        expirationDate: now,
        run: () => this.unpublishAnnouncement(assignment, contest, announcement),
      });
      return;
    }
    // one-time, immediate update of the announcement...
    this.tasksScheduler.addTask({
      id: generateTaskId(TaskType.Update, assignment),
      scheduleDate: now,
      expirationDate: now,
      run: async () => {
        await this.updateAnnouncement(assignment, contest, announcement, expirationDate);
        // ...after which a refresh task starts running at fixed invervals
        const refreshInterval = 30 * 1000;
        this.tasksScheduler.addTask({
          id: generateTaskId(TaskType.Refresh, assignment),
          scheduleDate: now + refreshInterval,
          expirationDate,
          interval: refreshInterval,
          run: () => this.updateAnnouncement(assignment, contest, announcement, expirationDate),
        });
      }
    });
  }

  async scheduleTasks(assignments) {
    const now = Date.now();
    for (const assignment of assignments) {
      await this.scheduleTask(assignment, now);
    }
  }

  async onGuildChanged(guildId) {
    console.debug(`Guild ${guildId} changed - rescheduling tasks`);
    const assignments = await this.dataModel.getContestAnnouncementAssignments({
      guildId,
    });
    this.scheduleTasks(assignments);
  }

  async onContestChanged(contestId) {
    console.debug(`Contest ${contestId} changed - rescheduling tasks`);
    const assignments = await this.dataModel.getContestAnnouncementAssignments({
      contestId,
    });
    this.scheduleTasks(assignments);
  }

  async onAnnouncementChanged(contestAnnouncementId) {
    console.debug(`Contest announcement ${contestAnnouncementId} changed - rescheduling tasks`);
    const assignments = await this.dataModel.getContestAnnouncementAssignments({
      contestAnnouncementId,
    })
    this.scheduleTasks(assignments);
  }

  async onAssignmentChanged(contestId, contestAnnouncementId) {
    console.debug(`Assignment between contest ${contestId} and announcement ${contestAnnouncementId} changed - rescheduling tasks`);
    const assignments = await this.dataModel.getContestAnnouncementAssignments({
      contestId,
      contestAnnouncementId,
    });
    this.scheduleTasks(assignments);
  }

  async onMessagesRemoved(messageId) {
    console.debug(`Message ${messageId} was removed - rescheduling tasks`);
    const assignments = await this.dataModel.getContestAnnouncementAssignments({
      messageId,
    })
    this.scheduleTasks(assignments);
  }

  async initialize() {
    this.dataModel.on(DataModelEvents.onMessagesRemoved, this.onMessagesRemovedCallback);
    this.dataModel.on(DataModelEvents.onContestAdded, this.onGuildChangedCallback);
    this.dataModel.on(DataModelEvents.onContestChanged, this.onContestChangedCallback);
    this.dataModel.on(DataModelEvents.onContestRemoved, this.onContestChangedCallback);
    this.dataModel.on(DataModelEvents.onContestAnnouncementChanged, this.onAnnouncementChangedCallback);
    this.dataModel.on(DataModelEvents.onContestAnnouncementRemoved, this.onAnnouncementChangedCallback);
    this.dataModel.on(DataModelEvents.onContestAnnouncementAssigned, this.onAssignmentChangedCallback);
    this.dataModel.on(DataModelEvents.onContestAnnouncementUnassigned, this.onAssignmentChangedCallback);
    this.dataModel.on(DataModelEvents.onContestVoteCategoryChanged, this.scheduleTasksCallback);
    this.dataModel.on(DataModelEvents.onContestVoteCategoryRemoved, this.scheduleTasksCallback);
    this.dataModel.on(DataModelEvents.onContestVoteCategoryAssigned, this.onContestChangedCallback);
    this.dataModel.on(DataModelEvents.onContestVoteCategoryUnassigned, this.onContestChangedCallback);
    this.dataModel.on(DataModelEvents.onContestRuleChanged, this.scheduleTasksCallback);
    this.dataModel.on(DataModelEvents.onContestRuleRemoved, this.scheduleTasksCallback);
    this.dataModel.on(DataModelEvents.onContestRuleAssigned, this.onContestChangedCallback);
    this.dataModel.on(DataModelEvents.onContestRuleUnassigned, this.onContestChangedCallback);
    this.dataModel.on(DataModelEvents.onContestRewardChanged, this.scheduleTasksCallback);
    this.dataModel.on(DataModelEvents.onContestRewardRemoved, this.scheduleTasksCallback);
    this.dataModel.on(DataModelEvents.onContestRewardAssigned, this.onContestChangedCallback);
    this.dataModel.on(DataModelEvents.onContestRewardUnassigned, this.onContestChangedCallback);
    this.dataModel.on(DataModelEvents.onContestEntrySubmitted, this.onContestChangedCallback);
    this.dataModel.on(DataModelEvents.onContestEntryCanceled, this.onContestChangedCallback);
    this.dataModel.on(DataModelEvents.onContestEntryChanged, this.onContestChangedCallback);

    const assignments = await this.dataModel.getContestAnnouncementAssignments();
    this.scheduleTasks(assignments);
  }

  uninitialize() {
    this.dataModel.off(DataModelEvents.onMessagesRemoved, this.onMessagesRemovedCallback);
    this.dataModel.off(DataModelEvents.onContestAdded, this.onGuildChangedCallback);
    this.dataModel.off(DataModelEvents.onContestChanged, this.onContestChangedCallback);
    this.dataModel.off(DataModelEvents.onContestRemoved, this.onContestChangedCallback);
    this.dataModel.off(DataModelEvents.onContestAnnouncementChanged, this.onAnnouncementChangedCallback);
    this.dataModel.off(DataModelEvents.onContestAnnouncementRemoved, this.onAnnouncementChangedCallback);
    this.dataModel.off(DataModelEvents.onContestAnnouncementAssigned, this.onAssignmentChangedCallback);
    this.dataModel.off(DataModelEvents.onContestAnnouncementUnassigned, this.onAssignmentChangedCallback);
    this.dataModel.off(DataModelEvents.onContestVoteCategoryChanged, this.scheduleTasksCallback);
    this.dataModel.off(DataModelEvents.onContestVoteCategoryRemoved, this.scheduleTasksCallback);
    this.dataModel.off(DataModelEvents.onContestVoteCategoryAssigned, this.onContestChangedCallback);
    this.dataModel.off(DataModelEvents.onContestVoteCategoryUnassigned, this.onContestChangedCallback);
    this.dataModel.off(DataModelEvents.onContestRuleChanged, this.scheduleTasksCallback);
    this.dataModel.off(DataModelEvents.onContestRuleRemoved, this.scheduleTasksCallback);
    this.dataModel.off(DataModelEvents.onContestRuleAssigned, this.onContestChangedCallback);
    this.dataModel.off(DataModelEvents.onContestRuleUnassigned, this.onContestChangedCallback);
    this.dataModel.off(DataModelEvents.onContestRewardChanged, this.scheduleTasksCallback);
    this.dataModel.off(DataModelEvents.onContestRewardRemoved, this.scheduleTasksCallback);
    this.dataModel.off(DataModelEvents.onContestRewardAssigned, this.onContestChangedCallback);
    this.dataModel.off(DataModelEvents.onContestRewardUnassigned, this.onContestChangedCallback);
    this.dataModel.off(DataModelEvents.onContestEntrySubmitted, this.onContestChangedCallback);
    this.dataModel.off(DataModelEvents.onContestEntryCanceled, this.onContestChangedCallback);
    this.dataModel.off(DataModelEvents.onContestEntryChanged, this.onContestChangedCallback);
  }
}

module.exports = ContestsAnnouncementsManager;
