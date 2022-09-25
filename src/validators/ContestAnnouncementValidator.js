const Validator = require('./Validator');

class ContestAnnouncementValidator extends Validator {
  constructor(announcementOptionId, dataModel) {
    super();
    this.announcementOptionId = announcementOptionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const announcementId = optionsValues.get(this.announcementOptionId);
    try {
      const announcement = await this.dataModel.getContestAnnouncement(announcementId);
      if (announcement) {
        optionsValues.set(this.announcementOptionId, announcement);
      } else {
        issues.push(translate('validators.unknownContestAnnouncement', {
          announcementId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch contest ${announcementId} data - got error`, error);
      issues.push(translate('validators.contestAnnouncementFetchFailure', {
        announcementId,
      }));
    }
    return issues;
  }
}

module.exports = ContestAnnouncementValidator;
