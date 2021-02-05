const bcrypt = require("bcryptjs");
const cryptoRandomString = require("crypto-random-string");
const cryptoJS = require("crypto-js");
const config = require("../config");
const jwt = require("jwt-simple");
class User {
  constructor(
    email,
    username,
    password,
    role = "user",
    id,
    passwordChangedAt,
    passwordResetToken,
    passwordResetExpires
  ) {
    this.email = email;
    this.username = username;
    this.role = role;
    this.highscore = 0;
    this.password = password;
    this.id = id;
    this.passwordChangedAt = passwordChangedAt;
    this.passwordResetToken = passwordResetToken;
    this.passwordResetExpires = passwordResetExpires;
  }

  getEmail() {
    return this.email.toLowerCase();
  }

  setEmail(email) {
    this.email = email;
  }

  getUsername() {
    return this.username;
  }

  setUsername(username) {
    this.username = username;
  }

  getPassword() {
    return this.password;
  }

  async setPassword(password) {
    this.password = password;
  }

  getRole() {
    return this.role;
  }

  setRole(role) {
    this.role = role;
  }

  getHighscore() {
    return this.highscore;
  }

  setHighscore(highscore) {
    this.highscore = highscore || 0;
  }

  getId() {
    return this.id;
  }

  setId(id) {
    this.id = id;
  }

  getPasswordChangedAt() {
    return this.passwordChangedAt;
  }

  setPasswordChangedAt(date) {
    this.passwordChangedAt = date;
  }

  getPasswordResetToken() {
    return this.passwordResetToken;
  }

  setPasswordResetToken(token) {
    this.passwordResetToken = token;
  }

  getPasswordResetExpires() {
    return this.passwordResetExpires;
  }

  setPasswordResetExpires(date) {
    this.passwordResetExpires = date;
  }

  async checkPassword(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
  }

  changedPasswordAfterLogin(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  }

  async createPasswordResetToken() {
    const payload = { id: this.id, email: this.email };

    this.passwordResetToken = jwt.encode(
      payload,
      config.jwtSecret,
      false,
      "HS256"
    );
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return this.passwordResetToken;
  }
}

module.exports = User;
