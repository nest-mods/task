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

import 'reflect-metadata';
import { Controller } from '@nestjs/common/interfaces/controllers/controller.interface';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { SCHEDULE_METADATA, TASK_CONFIGURATION_METADATA, TASK_METADATA } from './constants';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { TaskProperties } from './interfaces';

export enum TaskType {
  TASK = 'task',
  SCHEDULE = 'schedule',
}

export class TaskMetadataExplorer {
  constructor(private metadataScanner: MetadataScanner) {
  }

  public explore(instance: Controller, type: TaskType = TaskType.TASK): TaskProperties[] {
    const instancePrototype = Object.getPrototypeOf(instance);

    return this.metadataScanner.scanFromPrototype<Controller, TaskProperties>(
      instance,
      instancePrototype,
      (method) => this.exploreMethodMetadata(instance, instancePrototype, method, type),
    );
  }

  public exploreMethodMetadata(instance, instancePrototype, methodName: string, type: TaskType = TaskType.TASK): TaskProperties {
    const task = instancePrototype[methodName];
    const isTask = type === TaskType.TASK
      ? Reflect.getMetadata(TASK_METADATA, task)
      : Reflect.getMetadata(SCHEDULE_METADATA, task);

    if (isUndefined(isTask)) {
      return null;
    }

    const metadata = Reflect.getMetadata(TASK_CONFIGURATION_METADATA, task);
    return {
      task,
      metadata,
    };
  }
}
