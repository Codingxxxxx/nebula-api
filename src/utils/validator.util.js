const Ajv = require('ajv');
const ajv = new Ajv({
  allErrors: true
});

ajv.addFormat('ascii', (val) => /^[a-zA-Z0-9]+$/.test(val));
ajv.addFormat('anyImage', (val) => /^image\//.test(val));

const { 
  signupSchema, 
  verificationSchema,
  signinSchema,
  revokeTokenSchema,
  updateAvatarSchema,
  updatePasswordSchema,
  resetPasswordSchema,
  verifyResetPasswordSchema,
  logoutSchema
} = require('./../validation-schema');

require('ajv-formats')(ajv);

module.exports = {
  validateSignup: ajv.compile(signupSchema),
  validateVerification: ajv.compile(verificationSchema),
  validateSignin: ajv.compile(signinSchema),
  validateRevokeToken: ajv.compile(revokeTokenSchema),
  validateUpdateAvatar: ajv.compile(updateAvatarSchema),
  validateUpdatePassword: ajv.compile(updatePasswordSchema),
  validateResetPassword: ajv.compile(resetPasswordSchema),
  validateVerifyResetPassword: ajv.compile(verifyResetPasswordSchema),
  validateLogout: ajv.compile(logoutSchema)
};