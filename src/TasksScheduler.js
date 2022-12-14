const {SettingId} = require('./Settings');

class TasksScheduler { 
  constructor(settings) {
    this.settings = settings;
    this.tasks = new Map();
    this.tasksRunTimer = 0;
  }

  removeExpiredTasks(now, tasks) {
    const expiredTasks = tasks.filter(task => task.expirationDate <= now);
    if (expiredTasks.length === 0) {
      return;
    }
    console.info(`Removing ${expiredTasks.length} expired tasks`);
    expiredTasks.forEach(({id}) => {
      this.tasks.delete(id);
    });
  }

  async runReadyTasks(now, tasks) {
    // look for ready tasks
    const readyTasks = tasks.filter(task => {
      if (task.scheduleDate > now) {
        return false;
      }
      if (task.lastRunDate && task.interval) {
        if (now - task.lastRunDate < task.interval) {
          return false;
        }
      }
      return true;
    });
    if (readyTasks.length === 0) {
      return;
    }
    // run and update their state
    console.info(`Found ${readyTasks.length} tasks that are ready to run - running them`);
    for (const readyTask of readyTasks) {
      await readyTask.run();
      readyTask.lastRunDate = now;
    }
  }

  async runTasks() {
    // make copy or all current tasks in order to allow adding and removing tasks in mid runs
    const now = Date.now();
    const tasks = Array.from(this.tasks.values());
    await this.runReadyTasks(now, tasks);
    this.removeExpiredTasks(now, tasks); // expired tasks are removed after giving them a chance to run at least once
    this.scheduleNextTasksRun();
  }

  scheduleNextTasksRun() {
    const tasksRunInterval = this.settings.get(SettingId.TasksRunInterval);
    this.tasksRunTimer = setTimeout(() => this.runTasks(), 2000);
  }

  hasTask(taskId) {
    return this.tasks.has(taskId);
  }

  addTask(task) {
    // override tasks with the same id
    console.debug(`${this.hasTask(task.id) ? 'Updating' : 'Scheduling'} task ${task.id}`);
    this.tasks.set(task.id, task);
  }

  addTasks(tasks) {
    tasks.forEach(task => this.addTask(task));
  }

  removeTask(taskId) {
    this.tasks.delete(taskId);
  }

  removeTasks(tasksIds) {
    tasksIds.forEach(taskId => this.removeTask(taskId));
  }

  initialize() {
    this.scheduleNextTasksRun();
  }
}

module.exports = TasksScheduler;
