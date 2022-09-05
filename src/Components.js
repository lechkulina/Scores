const {Constants: {ComponentTypes, ButtonStyles}} = require('eris');

const ButtonId = {
  No: 'no',
  Yes: 'yes',
  SendDirectMessage: 'send-direct-message',
  CreatePublicMessage: 'create-public-message',
  DoBoth: 'do-both',
};

function button(id, label, style = ButtonStyles.PRIMARY) {
  return {
    type: ComponentTypes.BUTTON,
    style,
    custom_id: id,
    label,
  }
}

function actionRow(components = []) {
  return {
    type: ComponentTypes.ACTION_ROW,
    components,
  }
}

module.exports = {
  ButtonId,
  button,
  actionRow,
};
