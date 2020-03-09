const mongoose = require('mongoose');
const crypto = require('crypto');

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

mongoose.model('OneTimePass', OneTimePassSchema);
