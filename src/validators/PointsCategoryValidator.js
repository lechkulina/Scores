const Validator = require('./Validator');

class PointsCategoryValidator extends Validator {
  constructor(categoryOptionId, dataModel) {
    super();
    this.categoryOptionId = categoryOptionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const categoryId = optionsValues.get(this.categoryOptionId);
    try {
      const category = await this.dataModel.getPointsCategory(categoryId);
      if (category) {
        optionsValues.set(this.categoryOptionId, category);
      } else {
        issues.push(translate('validators.unknownPointsCategory', {
          categoryId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch points category ${categoryId} data - got error`, error);
      issues.push(translate('validators.pointsCategoryFetchFailure', {
        categoryId,
      }));
    }
    return issues;
  }
}

module.exports = PointsCategoryValidator;
