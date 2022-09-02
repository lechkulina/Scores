const config = require('../config.js');
const {Database: SQLiteDatabase, OPEN_READWRITE, OPEN_CREATE, OPEN_FULLMUTEX} = require('sqlite3');

class Database {
  open() {
    return new Promise((resolve, reject) => {
      console.info(`Opening database ${config.database.fileName}`);
      this.database = new SQLiteDatabase(config.database.fileName, OPEN_READWRITE | OPEN_CREATE | OPEN_FULLMUTEX, error => {
        if (error) {
          console.error(`Failed to open database ${config.database.fileName} - got error ${error.name} - ${error.message}`);
          reject(error);
          return;
        }
        console.info(`Database ${config.database.fileName} is ready`);
        resolve();
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (!this.database) {
        resolve();
        return;
      }
      this.database.close(error => {
        if (error) {
          console.error(`Failed to close database ${config.database.fileName} - got error ${error.name} - ${error.message}`);
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  exec(sql) {
    return new Promise((resolve, reject) => {
      if (!this.database) {
        console.warn('Unable to execute exec query - database is not opened');
        resolve();
        return;
      }
      this.database.exec(sql, error => {
        if (error) {
          console.error(`Failed to execute exec query - got error ${error.name} - ${error.message}`);
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  run(sql, params) {
    return new Promise((resolve, reject) => {
      if (!this.database) {
        console.warn('Unable to execute run query - database is not opened');
        resolve();
        return;
      }
      this.database.run(sql, params, error => {
        if (error) {
          console.error(`Failed to execute run query - got error ${error.name} - ${error.message}`);
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  get(sql, params) {
    return new Promise((resolve, reject) => {
      if (!this.database) {
        console.warn('Unable to execute get query - database is not opened');
        resolve();
        return;
      }
      this.database.get(sql, params, (error, row) => {
        if (error) {
          console.error(`Failed to execute get query - got error ${error.name} - ${error.message}`);
          reject(error);
          return;
        }
        resolve(row);
      });
    });
  }

  all(sql, params) {
    return new Promise((resolve, reject) => {
      if (!this.database) {
        console.warn('Unable to execute all query - database is not opened');
        resolve([]);
        return;
      }
      this.database.all(sql, params, (error, rows) => {
        if (error) {
          console.error(`Failed to execute all query - got error ${error.name} - ${error.message}`);
          reject(error);
          return;
        }
        resolve(rows);
      });
    });
  }
}

module.exports = Database;
