/**
 * Collection of all supported commands
 */
module.exports = [
  require('./AddPointsCommand'),
  require('./RemovePointsCommand'),
  require('./ChangePointsCommand'),
  require('./ShowPointsCommand'),
  require('./AddReasonCommand'),
  require('./RemoveReasonCommand'),
  require('./ChangeReasonCommand'),
  require('./ShowHelpCommand'),
  require('./GrantRolePermissionCommand'),
];
