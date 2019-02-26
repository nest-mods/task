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

/*
 * Created by Diluka on 2019-02-19.
 *
 *
 * ----------- 神 兽 佑 我 -----------
 *        ┏┓      ┏┓+ +
 *       ┏┛┻━━━━━━┛┻┓ + +
 *       ┃          ┃
 *       ┣     ━    ┃ ++ + + +
 *      ████━████   ┃+
 *       ┃          ┃ +
 *       ┃  ┴       ┃
 *       ┃          ┃ + +
 *       ┗━┓      ┏━┛  Code is far away from bug
 *         ┃      ┃       with the animal protecting
 *         ┃      ┃ + + + +
 *         ┃      ┃
 *         ┃      ┃ +
 *         ┃      ┃      +  +
 *         ┃      ┃    +
 *         ┃      ┗━━━┓ + +
 *         ┃          ┣┓
 *         ┃          ┏┛
 *         ┗┓┓┏━━━━┳┓┏┛ + + + +
 *          ┃┫┫    ┃┫┫
 *          ┗┻┛    ┗┻┛+ + + +
 * ----------- 永 无 BUG ------------
 */
import * as events from 'events';
import 'kue-scheduler';
import { DoneCallback } from 'kue';

// see https://www.npmjs.com/package/kue-scheduler

declare module 'kue' {

  export interface Job extends events.EventEmitter {
    unique(type: string): this;

    on(event: ScheduleEvent | string, listener: (...args: any[]) => void): this;
  }

  export interface Queue {
    /**
     * Clear all kue and kue-scheduler redis data. Clean up if performed atomically with fail all or success all guarantee.
     * @param done
     */
    clear(done: DoneCallback);

    /**
     * Enable redis key expiry notifications.
     */
    enableExpiryNotifications();

    /**
     * Runs a given job instance every after a given interval.
     * If unique key is provided only single instance job will exists otherwise on every run new job instance will be used.
     * @param interval can either be a human-interval String format or a cron String format.
     * @param job
     * @param done
     */
    every(interval: string, job: Job, done?: DoneCallback);

    /**
     * Schedules a given job instance to run once at a given time. when can either be a Date instance or a date.js String such as tomorrow at 5pm.
     * If unique key is provided only single instance job will exists otherwise on every run new job istance will be used.
     * @param when
     * @param job
     */
    schedule(when: string, job: Job);

    /**
     * Schedules a given job instance to run once immediately.
     * @param job
     */
    now(job: Job);

    /**
     * Remove either scheduled job with its expiry key and schedule data or non-scheduled job.
     * A criteria may contain jobExpiryKey, jobDataKey or unique identifier of the job in case of unique jobs
     * @param job
     * @param done
     */
    remove(job: number | Job | object, done: DoneCallback);

    /**
     * Enforce kue-scheduler to restore schedules in cases that may cause your application to miss redis key expiry events.
     * You may enable restore using options but in some scenario you may invoke restore by yourself.
     * @param done
     */
    restore(done: DoneCallback);
  }
}

export enum ScheduleEvent {
  /**
   * Use it to interact with kue-scheduler to get notified when an error occur.
   */
  SCHEDULE_ERROR = 'schedule error',
  /**
   * Use it to interact with kue-scheduler to obtained instance of current scheduled job.
   */
  SCHEDULE_SUCCESS = 'schedule success',
  /**
   * Use it to interact with kue-scheduler to be notified if the current instance of job is unique and already schedule to run.
   */
  ALREADY_SCHEDULED = 'already scheduled',
  /**
   * Use it to interact with kue-scheduler to get notified when a lock error occured.
   */
  LOCK_ERROR = 'lock error',
  /**
   * Use it to interact with kue-scheduler to get notified when unlock error occured.
   */
  UNLOCK_ERROR = 'unlock error',
  /**
   * Fired when kue-scheduler successfully restore previous schedules.
   */
  RESTORE_SUCCESS = 'restore success',
  /**
   * Fired when kue-scheduler failed to restore previous schedules.
   */
  RESTORE_ERROR = 'restore error',
  /**
   * Fired when kue-scheduler receive unknown key event from redis. Use it to be notified on unknown key(s) events.
   */
  SCHEDULER_UNKNOWN_JOB_EXPIRY_KEY = 'scheduler unknown job expiry key',
}
