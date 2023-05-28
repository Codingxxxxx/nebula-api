module.exports = {
  type: 'object',
  properties: {
    currentPassword: {
      type: 'string',
      maxLength: 256,
    },
    newPassword: {
      type: 'string',
      minLength: 6,
      maxLength: 256
    }
  },
  required: [
    'currentPassword',
    'newPassword'
  ]
};