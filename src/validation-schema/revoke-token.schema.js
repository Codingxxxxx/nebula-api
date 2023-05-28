module.exports = {
  type: 'object',
  properties: {
    refreshToken: {
      type: 'string'
    },
    accessToken: {
      type: 'string'
    }
  },
  required: [
    'accessToken',
    'refreshToken'
  ]
};