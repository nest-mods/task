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
import { Controller, Get, INestApplication, Injectable, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { KueService, Task, TaskModule } from '../src';
import { DoneCallback, Job } from 'kue';
import * as request from 'supertest';

@Injectable()
class Tasks {
  @Task()
  test(job: Job, done: DoneCallback) {
    done(null, job.data);
  }
}

@Controller()
class TestController {

  constructor(private tasks: Tasks,
              private kueService: KueService) {
  }

  @Get('test')
  test() {
    const job = this.kueService.createJob(this.tasks.test, { test: 'OK' });
    return job.await();
  }
}

describe('后台任务测试', function() {

  let app: INestApplication;

  beforeAll(async () => {

    const module = await Test.createTestingModule({
      imports: [
        TaskModule.forRootAsync({
          useFactory: () => {
            return {};
          },
        }),
        TaskModule.forFeature(Tasks)],
      providers: [Tasks],
      controllers: [TestController],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('任务执行', async () => {
    const res = await request(app.getHttpServer())
      .get('/test')
      .expect(200)
      .expect({ test: 'OK' });

    Logger.warn({ res });
  });
});
