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
import { Redis, RedisOptions } from 'ioredis';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Priority } from './patches';

export interface RedisClientFactoryOptions {
  createClientFactory: (options?: RedisOptions) => Redis;
}

export interface TaskMetadata {
  name?: string;
  unique?: boolean;
  queue?: string;
  concurrency?: number;
  priority?: Priority;
  ttl?: number;
  attempts?: number;
  backoff?: (attempts: number, delay: number) => number | { delay?: number, type: string } | boolean;
}

export interface ScheduleMetadata extends TaskMetadata {
  schedule: string;
  scheduleType?: 'interval' | 'when' | 'now';
  env?: string[];
  data?: object;
}

export interface TaskProperties {
  task: (job, done) => void;
  metadata: TaskMetadata | ScheduleMetadata;
}

export interface TaskModuleOptions {
  prefix?: string;
  redis?: RedisClientFactoryOptions | RedisOptions | string;
  concurrency?: number;
  /**
   * restore:boolean - tells kue-scheduler to try to restore schedules in case of restarts or other causes.
   * By default its not enable. When enable use restore error and restore success queue events to communicate with the scheduler.
   */
  restore?: boolean;
  /**
   * worker:boolean - tells kue-scheduler to listen and process job. Default to true.
   * If set to false you need another kue-scheduler instance to process the scheduled jobs from other process
   */
  worker?: boolean;
  /**
   * skipConfig:boolean - tells kue-scheduler to skip enabling enabling key expiry notification.
   */
  skipConfig?: boolean;
}

export interface TaskModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<TaskModuleOptions> | TaskModuleOptions;
  inject?: any[];
}
