/*
 * MIT License
 *
 * Copyright (c) 2019 nest-mods
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Inject, Injectable } from '@nestjs/common';
import { FancyLoggerService } from '../fancy-logger/fancy-logger.service';
import { Controller } from '@nestjs/common/interfaces';
import * as kue from 'kue';
import {TaskFnType, ScheduleMetadata, TaskMetadata, TaskModuleOptions} from '../../interfaces';
import { TASK_CONFIGURATION_METADATA, TASK_MODULE_OPTIONS } from '../../constants';
import { InvalidScheduleException } from '../../errors/invalid-schedule.exception';
import * as _ from 'lodash';
import yn from 'yn';

@Injectable()
export class KueService {
  public static readonly JOB_PREFIX: string = 'tasks:';
  public static readonly SCHEDULE_PREFIX: string = 'schedules:';
  public static readonly DEFAULT_QUEUE_NAME: string = 'default';
  public static readonly SCHEDULE_QUEUE_NAME: string = 'schedule';
  protected static readonly DEBUG_EVENTS = [
    'job enqueue',
    'job complete',
    'job failed attempt',
    'job failed',
  ];

  protected queues: { [name: string]: kue.Queue } = {};
  private debugActive: boolean = false;

  constructor(
    protected readonly fancyLogger: FancyLoggerService,
    @Inject(TASK_MODULE_OPTIONS) protected readonly config: TaskModuleOptions,
  ) {
    this.queues[KueService.DEFAULT_QUEUE_NAME] = this.createQueue(KueService.DEFAULT_QUEUE_NAME);
  }

  registerTask(task: TaskFnType, metadata: TaskMetadata, ctrl: Controller) {
    const concurrency: number = metadata.concurrency || this.config.concurrency;
    const q = this.getQueue(metadata.queue || KueService.DEFAULT_QUEUE_NAME);
    q.process(KueService.JOB_PREFIX + metadata.name, concurrency, async (j, d) => {
      try {
        await Promise.resolve(task.call(ctrl, j, d));
      } catch (err) {
        d(err);
      }
    });
  }

  registerSchedule(task: TaskFnType, metadata: ScheduleMetadata, ctrl: Controller) {
    const concurrency: number = metadata.concurrency || this.config.concurrency;
    const q = this.getQueue(metadata.queue || KueService.SCHEDULE_QUEUE_NAME);
    q.process(KueService.SCHEDULE_PREFIX + metadata.name, concurrency, async (j, d) => {
      try {
        await Promise.resolve(task.call(ctrl, j, d));
      } catch (err) {
        d(err);
      }
    });
  }

  buildJob(task: TaskFnType, data: object): kue.Job {
    const metadata: TaskMetadata = Reflect.getMetadata(TASK_CONFIGURATION_METADATA, task);
    const queue: kue.Queue = this.getQueue(metadata.queue);

    const job: kue.Job = queue.createJob(KueService.JOB_PREFIX + metadata.name, data);
    this.buildJobWithMetadata(job, metadata);
    return job;
  }

  createJob(task: TaskFnType, data: object) {
    return this.buildJob(task, data).save();
  }

  buildSchedule(task: TaskFnType, data: object): kue.Job {
    const metadata: ScheduleMetadata = Reflect.getMetadata(TASK_CONFIGURATION_METADATA, task);
    const queue: kue.Queue = this.getQueue(metadata.queue || KueService.SCHEDULE_QUEUE_NAME);

    if (_.isArray(metadata.env) && !_.includes(metadata.env, process.env.NODE_ENV)) {
      return this.createEmptyJob();
    }

    const job: kue.Job = queue.createJob(KueService.SCHEDULE_PREFIX + metadata.name, data);
    this.buildJobWithMetadata(job, metadata);

    switch (metadata.scheduleType) {
      case 'interval':
        queue.every(metadata.schedule, job);
        break;
      case 'when':
        queue.schedule(metadata.schedule, job);
        break;
      case 'now':
        queue.now(job);
        break;
      default:
        throw new InvalidScheduleException();
    }

    return job;
  }

  createSchedule(task: TaskFnType, data: object) {
    return this.buildSchedule(task, data).save();
  }

  getQueue(name: string = KueService.DEFAULT_QUEUE_NAME) {
    if (!this.queues[name]) {
      this.queues[name] = this.createQueue(name);
    }

    return this.queues[name];
  }

  async getJob(id: number): Promise<kue.Job> {
    return new Promise((resolve, reject) => {
      kue.Job.get(id, (err, job: kue.Job) => {
        if (err) {
          return reject(err);
        }
        return resolve(job);
      });
    });
  }

  private createEmptyJob() {
    const name = 'EfabfD14-4A67-A60F-CEBf-EddED1758b5f';
    const q = this.getQueue();
    q.process(name);
    return q.createJob(name, {});
  }

  private buildJobWithMetadata(job: kue.Job, metadata: TaskMetadata | ScheduleMetadata) {
    if (metadata.ttl) {
      job.ttl(metadata.ttl);
    }
    if (metadata.attempts) {
      job.attempts(metadata.attempts);
    }
    if (metadata.backoff) {
      job.backoff(metadata.backoff);
    }
    if (metadata.priority) {
      job.priority(metadata.priority);
    }
    if (metadata.unique) {
      job.unique(metadata.name);
    }
    return job;
  }

  private createQueue(queueName: string): kue.Queue {
    const queue: kue.Queue = kue.createQueue(this.config);
    queue.setMaxListeners(0);

    if (!this.debugActive &&
      yn(process.env.KUE_DEBUG) &&
      queueName === KueService.DEFAULT_QUEUE_NAME) {
      this.debugActive = true;
      this.bindDebugQueueEvents(queue);
    }

    return queue;
  }

  private bindDebugQueueEvents(queue: kue.Queue) {
    for (const event of KueService.DEBUG_EVENTS) {
      queue.on(event, (id) => {
        kue.Job.get(id, (err, job: kue.Job) => {
          if (job) {
            this.debugLog(job, event);
          }
        });
      });
    }

    queue.on('job error', (id, error) => {
      kue.Job.get(id, (err, job: kue.Job) => {
        if (job) {
          this.debugLog(job, 'job error', error);
        }
      });
    });
  }

  private debugLog(job: kue.Job, event: string, err?) {
    const log: string = `Task ${job.type} ${event} `;
    this.fancyLogger.debug('TaskModule', log, 'TaskRunner', err);
  }
}
