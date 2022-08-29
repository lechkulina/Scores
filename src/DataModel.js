const Database = require('./Database');

class User {
  constructor(id, discriminator, name) {
    this.id = id;
    this.discriminator = discriminator;
    this.name = name;
  }
}

class DataModel {
  constructor(client) {
    this.client = client;
    this.database = new Database();
    this.users = undefined;

    // temporary data
    this.users = new Map();
    Array.from(Array(22).keys()).map(index => 
      new User(index, `TestUser#${index}`, 'TestUser_')
    ).forEach(user => this.users.set(user.id, user));
  }

  async initialize() {
    return this.database.initialize();
  }

  async getUsers() {
    if (this.users) {
      return Array.from(this.users.values());
    }
    return [];
  }
}

module.exports = DataModel;
