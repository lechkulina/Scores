module.exports = {
  commands: {
    addPoints: {
      failedToAddPoints: ({points, userName}) => (`Faield to add ${points} to ${userName}`),
    }
  }
};
