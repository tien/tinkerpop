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

import { GraphTraversalSource } from './graph-traversal.js';
import { TraversalStrategies } from './traversal-strategy.js';
import { Graph } from '../structure/graph.js';
import { RemoteConnection } from '../driver/remote-connection.js';

/**
 * Provides a unified way to construct a <code>TraversalSource</code> from the perspective of the traversal. In this
 * syntax the user is creating the source and binding it to a reference which is either an existing <code>Graph</code>
 * instance or a <code>RemoteConnection</code>.
 */
export default class AnonymousTraversalSource {
  /**
   * Creates a new instance of {@code AnonymousTraversalSource}.
   * @param {Function} [traversalSourceClass] Optional {@code GraphTraversalSource} constructor.
   * @param {Function} [traversalClass] Optional {@code GraphTraversal} constructor.
   */
  constructor(readonly traversalSourceClass: typeof GraphTraversalSource) {}

  static traversal(traversalSourceClass: typeof GraphTraversalSource) {
    return new AnonymousTraversalSource(traversalSourceClass || GraphTraversalSource);
  }

  /**
   * Creates a {@link GraphTraversalSource} binding a {@link RemoteConnection} to a remote {@link Graph} instances as its
   * reference so that traversals spawned from it will execute over that reference.
   * @param {RemoteConnection} remoteConnection
   * @return {GraphTraversalSource}
   * @deprecated As of release 4.0.0, prefer {@link with_}.
   */
  withRemote(remoteConnection: RemoteConnection) {
    return this.withGraph(new Graph()).withRemote(remoteConnection);
  }

  /**
   * Creates the specified {@link GraphTraversalSource} binding an embedded {@link Graph} as its reference such that
   * traversals spawned from it will execute over that reference. As there are no "embedded Graph" instances in
   * gremlin-javascript as there on the JVM, the {@link GraphTraversalSource} can only ever be constructed as "empty"
   * with a {@link Graph} instance (which is only a reference to a graph and is not capable of holding data). As a
   * result, the {@link GraphTraversalSource} will do nothing unless a "remote" is then assigned to it later.
   * @param {Graph} graph
   * @return {GraphTraversalSource}
   * @deprecated As of release 3.4.9, prefer {@link withRemote} until some form of "embedded graph" becomes available
   * at which point there will be support for {@code withEmbedded} which is part of the canonical Java API.
   */
  withGraph(graph: Graph) {
    return new this.traversalSourceClass(graph, new TraversalStrategies());
  }
}
