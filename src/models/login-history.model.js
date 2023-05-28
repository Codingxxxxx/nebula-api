const { model, SchemaTypes, Schema } = require('mongoose');
const { CollectionNames } = require('../const').DB;

module.exports = model(CollectionNames.LOGIN_HISTORY, new Schema({
  userId: {
    type: SchemaTypes.ObjectId,
    required: true
  },
  ipv4: {
    type: String,
    required: true
  },
  os: {
    type: String
  },
  browser: {
    type: String
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { collection: CollectionNames.LOGIN_HISTORY }));