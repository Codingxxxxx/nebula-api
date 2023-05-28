module.exports = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      maxLength: 15,
      minLength: 3,
      format: 'ascii'
    },
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 256
    },
    email: {
      type: 'string',
      maxLength: 320,
      format: 'email'
    }
  },
  required: [
    'username',
    'password',
    'email'
  ]
};