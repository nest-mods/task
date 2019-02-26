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
 * Created by Diluka on 2019-02-20.
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
import * as kue from 'kue';
import { awaiter } from '../utils/awaiter.util';

kue.Job.prototype.await = function() {
  return awaiter(this);
};

declare module 'kue' {

  export interface Job extends events.EventEmitter {
    priority(priority: Priority): this;

    on(event: JobEvent | string, listener: (...args: any[]) => void): this;

    await(): Promise<any>;
  }
}

export enum Priority {
  low = 10,
  normal = 0,
  medium = -5,
  high = -10,
  critical = -15,
}

/**
 * Job-specific events are fired on the Job instances via Redis pubsub.
 */
export enum JobEvent {
  /**
   * the job is now queued
   */
  ENQUEUE = 'enqueue',
  /**
   * the job is now running
   */
  START = 'start',
  /**
   * the job is promoted from delayed state to queued
   */
  PROMOTION = 'promotion',
  /**
   * the job's progress ranging from 0-100
   */
  PROGRESS = 'progress',
  /**
   * the job has failed, but has remaining attempts yet
   */
  FAILED_ATTEMPT = 'failed attempt',
  /**
   * the job has failed and has no remaining attempts
   */
  FAILED = 'failed',
  /**
   * the job has completed
   */
  COMPLETE = 'complete',
  /**
   * the job has been removed
   */
  REMOVE = 'remove',
}
