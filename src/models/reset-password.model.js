const { model, SchemaTypes, Schema } = require('mongoose');
const { CollectionNames } = require('../const').DB;

module.exports = model(CollectionNames.RESET_PASSWORD, new Schema({
  userId: {
    type: SchemaTypes.ObjectId,
    ref: CollectionNames.USER,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { collection: CollectionNames.RESET_PASSWORD }));