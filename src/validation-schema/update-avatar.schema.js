const File = require('./../utils/file.util');

module.exports = {
  type: 'object',
  properties: {
    avatarFile: {
      type: 'object',
      properties: {
        filename: {
          type: 'string'
        },
        mimetype: {
          type: 'string',
          format: 'anyImage' // accept image only
        },
        size: {
          type: 'number',
          maximum: File.convertMBToByte(1) // maximum 1 mb
        }
      },
      required: [
        'filename',
        'mimetype',
        'size'
      ]
    },
  },
  required: [
    'avatarFile'
  ]
};