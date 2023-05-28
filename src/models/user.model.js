const { Schema, model, SchemaTypes } = require('mongoose');
const { CollectionNames, UserStatus, AvatarTypes } = require('./../const').DB;

const schema = new Schema({
  username: {
    type: String,
    required: true,
    maxLength: 15,
    min: 3,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  passwordSalt: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    maxLength: 320,
    unique: true
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVATED
  },
  avatars: {
    type: [new Schema({
      type: {
        type: String,
        required: true,
        enum: Object.values(AvatarTypes)
      },
      filename: {
        type: String
      },
      mimetype: {
        type: String
      },
      size: {
        type: Number
      },
      sourceUrl: {
        type: String,
        required: true
      }
    })],
  },
  selectedAvatar: {
    type: SchemaTypes.ObjectId
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
}, {  collection: CollectionNames.USER });

module.exports = model(CollectionNames.USER, schema);