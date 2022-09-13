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
    return this.scheduleNextTasksRun();
  }

  async scheduleNextTasksRun() {
    const tasksRunInterval = await this.settings.get('tasksRunInterval');
    this.tasksRunTimer = setTimeout(() => this.runTasks(), tasksRunInterval);
  }

  addTasks(tasks) {
    tasks.forEach(task => {
      // override tasks with the same id
      console.debug(`${this.tasks.has(task.id) ? 'Updating' : 'Scheduling'} task ${task.id}`);
      this.tasks.set(task.id, task);
    });
  }

  removeTasks(tasksIds) {
    tasksIds.forEach(taskId => {
      this.tasks.delete(taskId);
    });
  }

  initialize() {
    return this.scheduleNextTasksRun();
  }
}

module.exports = TasksScheduler;
