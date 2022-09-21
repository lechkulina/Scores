
const Validator = require('./Validator');

class PointsValidator extends Validator {
  constructor(optionId, dataModel) {
    super();
    this.optionId = optionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const pointsId = optionsValues.get(this.optionId);
    try {
      const points = await this.dataModel.getPoints(pointsId);
      if (points) {
        optionsValues.set(this.optionId, points);
      } else {
        issues.push(translate('validators.unknownPoints', {
          pointsId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch points ${pointsId} data - got error`, error);
      issues.push(translate('validators.pointsFetchFailure', {
        pointsId,
      }));
    }
    return issues;
  }
}

module.exports = PointsValidator;

