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

/**
 * @author Jorge Bay Gondra
 */
'use strict';

import { ok, strictEqual } from 'assert';
import * as glvModule from '../../lib/index.js';
import { process, structure, driver } from '../../lib/index.js'

describe('API', function () {
  it('should export fields under process', function () {
    ok(glvModule);
    ok(process);
    strictEqual(typeof process.Bytecode, 'function');
    strictEqual(typeof process.EnumValue, 'function');
    strictEqual(typeof process.P, 'function');
    strictEqual(typeof process.Traversal, 'function');
    strictEqual(typeof process.TraversalSideEffects, 'function');
    strictEqual(typeof process.TraversalStrategies, 'function');
    strictEqual(typeof process.TraversalStrategy, 'function');
    strictEqual(typeof process.Traverser, 'function');
    strictEqual(typeof process.GraphTraversal, 'function');
    strictEqual(typeof process.GraphTraversalSource, 'function');
    strictEqual(typeof process.barrier, 'object');
    strictEqual(typeof process.cardinality, 'object');
    strictEqual(typeof process.column, 'object');
    strictEqual(typeof process.direction, 'object');
    strictEqual(typeof process.direction.both, 'object');
    strictEqual(process.direction.both.elementName, 'BOTH');
    strictEqual(typeof process.operator, 'object');
    strictEqual(typeof process.order, 'object');
    strictEqual(typeof process.pop, 'object');
    strictEqual(typeof process.scope, 'object');
    strictEqual(typeof process.t, 'object');
    ok(process.statics);
    validateConstructor(process, 'AnonymousTraversalSource');
    strictEqual(typeof process.traversal, 'function');
  });
  it('should expose fields under structure', function () {
    ok(structure);
    ok(structure.io);
    strictEqual(typeof structure.io.GraphSONReader, 'function');
    strictEqual(typeof structure.io.GraphSONWriter, 'function');
    validateConstructor(structure.io, 'GraphSON2Reader');
    validateConstructor(structure.io, 'GraphSON2Writer');
    validateConstructor(structure.io, 'GraphSON3Reader');
    validateConstructor(structure.io, 'GraphSON3Writer');
    strictEqual(structure.io.GraphSONReader, structure.io.GraphSON3Reader);
    strictEqual(structure.io.GraphSONWriter, structure.io.GraphSON3Writer);
    strictEqual(typeof structure.Edge, 'function');
    strictEqual(typeof structure.Graph, 'function');
    strictEqual(typeof structure.Path, 'function');
    strictEqual(typeof structure.Property, 'function');
    strictEqual(typeof structure.Vertex, 'function');
    strictEqual(typeof structure.VertexProperty, 'function');
  });
  it('should expose fields under driver', function () {
    ok(driver);
    validateConstructor(driver, 'RemoteConnection');
    validateConstructor(driver, 'RemoteStrategy');
    validateConstructor(driver, 'RemoteTraversal');
    validateConstructor(driver, 'DriverRemoteConnection');
    validateConstructor(driver, 'Client');
    validateConstructor(driver, 'ResultSet');
  });
});

function validateConstructor(parent, name) {
  strictEqual(typeof parent[name], 'function');
  strictEqual(parent[name].name, name);
}
