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
import { TASK_CONFIGURATION_METADATA, TASK_METADATA } from '../constants';
import { TaskMetadata } from '../interfaces';
import * as _ from 'lodash';

/**
 * @author erickponce
 * @author Diluka
 */
export const Task = (metadata?: TaskMetadata): MethodDecorator => {
  return (target: any, key, descriptor: PropertyDescriptor) => {
    const methodSign = `${target.name || target.constructor.name}#${key as any}`;
    metadata = _.defaults({}, metadata, { name: methodSign });
    Reflect.defineMetadata(TASK_CONFIGURATION_METADATA, metadata, descriptor.value);
    Reflect.defineMetadata(TASK_METADATA, true, descriptor.value);
    return descriptor;
  };
};
