const {Constants: {ComponentTypes, ButtonStyles}} = require('eris');

const ButtonId = {
  No: 'no',
  Yes: 'yes',
  SendDirectMessage: 'send-direct-message',
  CreatePublicMessage: 'create-public-message',
  DoBoth: 'do-both',
};

function createButton(id, label, style = ButtonStyles.PRIMARY) {
  return {
    type: ComponentTypes.BUTTON,
    style,
    custom_id: id,
    label,
  }
}

function createActionRow(components = []) {
  return {
    type: ComponentTypes.ACTION_ROW,
    components,
  }
}

module.exports = {
  ButtonId,
  createButton,
  createActionRow,
};
