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
import './patches';
import { DynamicModule, Global, Module, Type } from '@nestjs/common';
import { TaskModuleAsyncOptions, TaskModuleOptions } from './interfaces';
import { TASK_MODULE_OPTIONS, TASK_MODULE_TASKS } from './constants';
import * as _ from 'lodash';
import { KueService } from './services/kue/kue.service';
import { KueTaskRegisterService } from './services/kue/kue-task-register.service';
import { FancyLoggerService } from './services/fancy-logger/fancy-logger.service';
import { LogModule } from '@nest-mods/log';

const defaultOptions: TaskModuleOptions = {
  prefix: 'q',
  concurrency: 4,
  redis: {
    host: 'localhost',
  },
};

@Global()
@Module({
  imports: [LogModule],
  providers: [
    KueService,
    KueTaskRegisterService,
    FancyLoggerService,
  ],
  exports: [KueService, KueTaskRegisterService],
})
export class TaskCoreModule {

  static forRootAsync(options?: TaskModuleAsyncOptions): DynamicModule {
    return {
      module: TaskCoreModule,
      imports: options.imports,
      providers: [
        {
          provide: TASK_MODULE_OPTIONS,
          inject: options.inject,
          useFactory: async (...args) => {
            const opts = await options.useFactory(...args);
            return _.defaults(opts, defaultOptions);
          },
        },
      ],
      exports: [TASK_MODULE_OPTIONS],
    };
  }

  static forFeature(...tasks: Array<Type<any>>): DynamicModule {
    return {
      module: TaskCoreModule,
      providers: [
        ...tasks,
        {
          provide: TASK_MODULE_TASKS,
          useFactory: (taskRegister: KueTaskRegisterService, ...instances) => {
            taskRegister.register(instances);
            return instances;
          },
          inject: [KueTaskRegisterService, ...tasks],
        },
      ],
      exports: [...tasks],
    };
  }
}
