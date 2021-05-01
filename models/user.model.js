const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

var userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    role: {
        type: String,
        default: 'USER'
    },
    permissions: {
        type: String,
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetTokenExpiresAt: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updateHistory: {
        type: Array,
        required: false
    }
});


// Custom validation for email
userSchema.path("email").validate(val => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,13}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, "Invalid e-mail.");

//Methods
userSchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};


userSchema.methods.generateJwt = function() {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXP
    });
};


userSchema.set('toJSON', { virtuals: true });
userSchema.set('timestamps', true);

module.exports = mongoose.model("User", userSchema);