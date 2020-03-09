const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const OneTimePassSchema = new Schema({
    email: String,
    OTP: String,
    validUntil: Date,
    used: Boolean
});

OneTimePassSchema.methods.setOTP = function () {
    this.OTP = crypto.randomBytes(4).toString('hex');

    console.log("------ OTP -------");
    console.log(this.OTP);
    console.log("------------------");

    this.validUntil = new Date();
    const validMinutes = 60;
    this.validUntil.setMinutes(this.validUntil.getMinutes() + validMinutes);
    this.used = false;
}

OneTimePassSchema.methods.match = function (OTP) {
    match = this.OTP == OTP && this.used == false && this.validUntil > Date.now();
    console.log('---');
    
    console.log(match);
    console.log(this.OTP == OTP);
    console.log(!this.used);
    console.log(this.validUntil - Date.now() > 0);

    /*
    console.log("###");
    console.log(this.validUntil);
    console.log(Date.now());
    console.log(this.validUntil > Date.now());
    */
    console.log('===');
    if (match) {
	this.used = true;
    }

    return match;
}

OneTimePassSchema.methods.generateJWT = function() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 1);

  return jwt.sign({
    email: this.email,
    id: this._id,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, 'twice_approved');
}

OneTimePassSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    token: this.generateJWT(),
  };
};

mongoose.model('OneTimePass', OneTimePassSchema);
