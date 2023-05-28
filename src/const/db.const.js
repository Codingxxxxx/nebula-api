const CollectionNames = {
  USER: 'users',
  EMAIL_VERIFICATION: 'emailVerifications',
  LOGIN_HISTORY: 'loginHistories',
  RESET_PASSWORD: 'resetPasswords'
};

const UserStatus = {
  SUSPENDED: 'SUSPENDED',
  ACTIVATED: 'ACTIVATED',
  DEACTIVATED: 'DEACTIVATED'
};

const AvatarTypes = {
  GIF: 'GIF',
  FILE: 'FILE'
};

module.exports = {
  CollectionNames,
  UserStatus,
  AvatarTypes
};