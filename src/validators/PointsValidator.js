
const Validator = require('./Validator');

class PointsValidator extends Validator {
  constructor(pointsOptionId, dataModel) {
    super();
    this.pointsOptionId = pointsOptionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const pointsId = optionsValues.get(this.pointsOptionId);
    try {
      const points = await this.dataModel.getPoints(pointsId);
      if (points) {
        optionsValues.set(this.pointsOptionId, points);
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

