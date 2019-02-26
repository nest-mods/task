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
import { DoneCallback, Job } from 'kue';
import { Schedule, TaskModule } from '../src';
import { INestApplication, Injectable, LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Log } from '@nest-mods/log';

let globalResult: any = {};

@Injectable()
class Schedules {

  @Log() private logger: LoggerService;

  @Schedule('*/3 * * * * *')
  test0(job: Job, done: DoneCallback) {
    globalResult.test = true;
    this.logger.log({ message: 'every 3 seconds', level: 'debug' });
    done(null, 'test ok!');
  }

  @Schedule('every 1 seconds')
  test1(job: Job, done: DoneCallback) {
    globalResult.test1 = true;
    this.logger.log('every 1 seconds');
    done(null, 'test ok!');
  }

  @Schedule({
    schedule: '2 seconds from now',
    scheduleType: 'when',
    data: { a: 1, b: 2 },
  })
  test2(job: Job, done: DoneCallback) {
    globalResult.test2 = true;
    this.logger.log('2 seconds from now');
    done(null, job.data);
  }

  @Schedule({
    schedule: '',
    scheduleType: 'now',
    env: ['noop'],
  })
  test3(job: Job, done: DoneCallback) {
    globalResult.test3 = true;
    this.logger.log('every 2 seconds');
    done(null, 'test ok!');
  }
}

describe('定时任务测试', function() {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TaskModule.forRootAsync({
          useFactory: () => {
            return {};
          },
        }),
        TaskModule.forFeature(Schedules)],
      providers: [Schedules],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    await of({}).pipe(delay(3000)).toPromise();
  });

  it('计划任务', () => {
    expect(globalResult.test1).toBeTruthy();
  });

  it('定时任务', () => {
    expect(globalResult.test2).toBeTruthy();
  });

  it('计划任务过滤', function() {
    expect(globalResult.test3).toBeFalsy();
  });

});
