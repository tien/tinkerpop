/*
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

'use strict';

import { strictEqual } from 'assert';
import Client from '../../lib/driver/client.js';

describe('Client', function () {
  const customOpProcessor = 'customOpProcessor';
  const query = 'customQuery';

  it('should use default opProcessor', function () {
    const connectionMock = {
      submit: function (processor, op, args, requestId) {
        strictEqual(args.gremlin, query);
        strictEqual(processor, '');

        return Promise.resolve();
      },
    };

    const customClient = new Client('ws://localhost:9321', { traversalSource: 'g', connectOnStartup: false });
    customClient._connection = connectionMock;
    customClient.submit(query);
  });

  it('should allow to configure opProcessor', function () {
    const connectionMock = {
      submit: function (processor, op, args, requestId) {
        strictEqual(args.gremlin, query);
        strictEqual(processor, customOpProcessor);

        return Promise.resolve();
      },
    };

    const customClient = new Client('ws://localhost:9321', {
      traversalSource: 'g',
      processor: customOpProcessor,
      connectOnStartup: false,
    });
    customClient._connection = connectionMock;
    customClient.submit(query);
  });

  it('should allow to submit extra arguments', function () {
    const connectionMock = {
      submit: function (processor, op, args, requestId) {
        strictEqual(args.gremlin, query);
        strictEqual(args.evaluationTimeout, 123);
        strictEqual(args.materializeProperties, 'tokens');
        strictEqual(processor, customOpProcessor);

        return Promise.resolve();
      },
    };

    const customClient = new Client('ws://localhost:9321', {
      traversalSource: 'g',
      processor: customOpProcessor,
      connectOnStartup: false,
    });
    customClient._connection = connectionMock;
    customClient.submit(query, null, { evaluationTimeout: 123, materializeProperties: 'tokens' });
  });
});
