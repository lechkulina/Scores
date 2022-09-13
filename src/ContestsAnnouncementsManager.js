const moment = require('moment');
const {DataModelEvents} = require('./DataModel');
const {formatDuration, Entities} = require('./Formatters');

const AnnouncementType = {
  Initial: 0,
  Reminder: 1,
  Final: 2,
};

const msInHour = 60 * 60 * 1000;

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
  }

  generateContent(contest, announcementType) {
    const now = Date.now();
    const header = this.translate(`announcements.contest.newContestHeader`, {
      contestName: contest.name,
      beginsIn: formatDuration(this.translate, contest.activeBeginDate - now),
    });
    const description = this.translate(`announcements.contest.description`, {
      description: contest.description,
    });
    return [header, description].join(Entities.EmptyLine);
  }

  async createAnnouncement(contest, announcementType) {
    const content = this.generateContent(contest, announcementType);
    const channelId = await this.settings.get('contestsAnnouncementsChannelId');
    const messageId = await this.messagePublisher.createMessage(contest.guildId, channelId, content);
    return this.dataModel.addContestAnnouncement(announcementType, contest.id, messageId);
  }

  updateAnnouncement(contest, announcement) {
    const content = this.generateContent(contest, announcement.type);
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

  async initialize() {
    this.dataModel.on(DataModelEvents.onContestAdded, this.onContestAddedCallback);
    this.dataModel.on(DataModelEvents.onContestRemoved, this.onContestRemovedCallback);
    this.dataModel.on(DataModelEvents.onContestAnnouncementAdded, this.onContestAnnouncementAddedCallback);
    this.dataModel.on(DataModelEvents.onMessagesRemoved, this.onMessagesRemovedCallback);

    const contests = await this.dataModel.getContests();
    const tasks = await this.createContestsTasks(contests);
    this.tasksScheduler.addTasks(tasks);
  }

  uninitialize() {
    this.dataModel.off(DataModelEvents.onContestAdded, this.onContestAddedCallback);
    this.dataModel.off(DataModelEvents.onContestRemoved, this.onContestRemovedCallback);
    this.dataModel.off(DataModelEvents.onContestAnnouncementAdded, this.onContestAnnouncementAddedCallback);
    this.dataModel.off(DataModelEvents.onMessagesRemoved, this.onMessagesRemovedCallback);
  }
}

module.exports = ContestsAnnouncementsManager;
