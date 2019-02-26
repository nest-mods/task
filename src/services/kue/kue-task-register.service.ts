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

import { Injectable } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { TaskMetadataExplorer, TaskType } from '../../task-metadata-explorer';
import { FancyLoggerService } from '../fancy-logger/fancy-logger.service';
import { KueService } from './kue.service';
import { ScheduleMetadata } from '../../interfaces';

@Injectable()
export class KueTaskRegisterService {
  private readonly moduleName: string = 'TaskModule';
  private readonly metadataExplorer: TaskMetadataExplorer;

  constructor(private readonly fancyLogger: FancyLoggerService,
              private readonly kueService: KueService) {
    this.metadataExplorer = new TaskMetadataExplorer(
      new MetadataScanner(),
    );
  }

  createTasks(instance) {
    for (const { task, metadata } of this.metadataExplorer.explore(instance, TaskType.TASK)) {
      this.kueService.registerTask(task, metadata, instance);

      const desc: string = `Registered task ${metadata.name}`
        + `${(metadata.queue) ? ' on queue ' + metadata.queue : ''}`
        + `${(metadata.concurrency) ? ' with a concurrency of ' + metadata.concurrency : ''}`;
      this.fancyLogger.info(this.moduleName, desc, 'TaskExplorer');
    }

    for (const { task, metadata } of this.metadataExplorer.explore(instance, TaskType.SCHEDULE)) {
      this.kueService.registerSchedule(task, metadata as ScheduleMetadata, instance);
      this.kueService.createSchedule(task, (metadata as ScheduleMetadata).data);

      const desc: string = `Registered schedule ${metadata.name}`
        + `${(metadata.queue) ? ' on queue ' + metadata.queue : ''}`
        + `${(metadata.concurrency) ? ' with a concurrency of ' + metadata.concurrency : ''}`;
      this.fancyLogger.info(this.moduleName, desc, 'TaskExplorer');
    }
  }

  register(instances: any[]) {
    for (const instance of instances) {
      this.createTasks(instance);
    }
  }
}
