module.exports = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      maxLength: 320
    }
  },
  required: ['email']
};