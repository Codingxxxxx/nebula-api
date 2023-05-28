module.exports = {
  type: 'object',
  properties: {
    token: {
      type: 'string'
    },
    newPassword: {
      type: 'string',
      minLength: 6,
      maxLength: 256
    }
  },
  required: ['token', 'newPassword']
};