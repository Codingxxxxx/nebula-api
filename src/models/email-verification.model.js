const { model, Schema, SchemaTypes } = require('mongoose');
const { CollectionNames } = require('../const').DB;

module.exports = model(CollectionNames.EMAIL_VERIFICATION, new Schema({
  userId: {
    type: SchemaTypes.ObjectId,
    ref: CollectionNames.USER,
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expirationDate: {
    type: Date,
    required: true
  }
}, { collection: CollectionNames.EMAIL_VERIFICATION }));