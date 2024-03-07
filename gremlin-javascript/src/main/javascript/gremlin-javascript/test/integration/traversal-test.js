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

import { fail, strictEqual, ok } from 'assert';
import { AssertionError } from 'assert';
import { Vertex } from '../../lib/structure/graph.js';
import AnonymousTraversal from '../../lib/process/anonymous-traversal.js';
import { GraphTraversalSource, GraphTraversal, statics } from '../../lib/process/graph-traversal.js';
import {
  SubgraphStrategy,
  ReadOnlyStrategy,
  SeedStrategy,
  ReservedKeysVerificationStrategy,
  EdgeLabelVerificationStrategy,
} from '../../lib/process/traversal-strategy.js';
import Bytecode from '../../lib/process/bytecode.js';
import { getConnection, getDriverRemoteConnection } from '../helper.js';
const __ = statics;
const { traversal } = AnonymousTraversal;

let connection;
let txConnection;

class SocialTraversal extends GraphTraversal {
  constructor(graph, traversalStrategies, bytecode) {
    super(graph, traversalStrategies, bytecode);
  }

  aged(age) {
    return this.has('person', 'age', age);
  }
}

class SocialTraversalSource extends GraphTraversalSource {
  constructor(graph, traversalStrategies, bytecode) {
    super(graph, traversalStrategies, bytecode, SocialTraversalSource, SocialTraversal);
  }

  person(name) {
    return this.V().has('person', 'name', name);
  }
}

function anonymous() {
  return new SocialTraversal(null, null, new Bytecode());
}

function aged(age) {
  return anonymous().aged(age);
}

describe('Traversal', function () {
  before(function () {
    connection = getConnection('gmodern');
    return connection.open();
  });
  after(function () {
    return connection.close();
  });
  describe('#construct', function () {
    it('should not hang if server not present', function () {
      const g = traversal().withRemote(
        getDriverRemoteConnection('ws://localhost:9998/gremlin', { traversalSource: 'g' }),
      );
      return g
        .V()
        .toList()
        .then(function () {
          fail('there is no server so an error should have occurred');
        })
        .catch(function (err) {
          if (err instanceof AssertionError) throw err;
          strictEqual(err.code, 'ECONNREFUSED');
        });
    });
  });
  describe('#toList()', function () {
    it('should submit the traversal and return a list', function () {
      var g = traversal().withRemote(connection);
      return g
        .V()
        .toList()
        .then(function (list) {
          ok(list);
          strictEqual(list.length, 6);
          list.forEach((v) => ok(v instanceof Vertex));
        });
    });
  });
  describe('#clone()', function () {
    it('should reset a traversal when cloned', function () {
      var g = traversal().withRemote(connection);
      var t = g.V().count();
      return t.next().then(function (item1) {
        ok(item1);
        strictEqual(item1.value, 6);
        t.clone()
          .next()
          .then(function (item2) {
            ok(item2);
            strictEqual(item2.value, 6);
          });
      });
    });
  });
  describe('#next()', function () {
    it('should submit the traversal and return an iterator', function () {
      var g = traversal().withRemote(connection);
      var t = g.V().count();
      return t
        .hasNext()
        .then(function (more) {
          ok(more);
          strictEqual(more, true);
          return t.next();
        })
        .then(function (item) {
          strictEqual(item.done, false);
          strictEqual(typeof item.value, 'number');
          return t.next();
        })
        .then(function (item) {
          ok(item);
          strictEqual(item.done, true);
          strictEqual(item.value, null);
        });
    });
  });
  describe('lambdas', function () {
    it('should handle 1-arg lambdas', function () {
      const g = traversal().withRemote(connection);
      return g
        .V()
        .has('person', 'name', 'marko')
        .values('name')
        .map(() => 'it.get()[1]')
        .toList()
        .then(function (s) {
          ok(s);
          strictEqual(s[0], 'a');
        });
    });
  });
  describe('dsl', function () {
    it('should expose DSL methods', function () {
      const g = traversal(SocialTraversalSource).withRemote(connection);
      return g
        .person('marko')
        .aged(29)
        .values('name')
        .toList()
        .then(function (list) {
          ok(list);
          strictEqual(list.length, 1);
          strictEqual(list[0], 'marko');
        });
    });

    it('should expose anonymous DSL methods', function () {
      const g = traversal(SocialTraversalSource).withRemote(connection);
      return g
        .person('marko')
        .filter(aged(29))
        .values('name')
        .toList()
        .then(function (list) {
          ok(list);
          strictEqual(list.length, 1);
          strictEqual(list[0], 'marko');
        });
    });
  });
  describe('more complex traversals', function () {
    it('should return paths of value maps', function () {
      const g = traversal().withRemote(connection);
      return g
        .V(1)
        .out()
        .order()
        .in_()
        .order()
        .limit(1)
        .path()
        .by(__.valueMap('name'))
        .toList()
        .then(function (list) {
          ok(list);
          strictEqual(list.length, 1);
          strictEqual(list[0].objects[0].get('name')[0], 'marko');
          strictEqual(list[0].objects[1].get('name')[0], 'vadas');
          strictEqual(list[0].objects[2].get('name')[0], 'marko');
        });
    });
  });
  describe('should allow TraversalStrategy definition', function () {
    it('should allow SubgraphStrategy', function () {
      const g = traversal()
        .withRemote(connection)
        .withStrategies(new SubgraphStrategy({ vertices: __.hasLabel('person'), edges: __.hasLabel('created') }));
      g.V()
        .count()
        .next()
        .then(
          function (item1) {
            ok(item1);
            strictEqual(item1.value, 4);
          },
          (err) => fail('tanked: ' + err),
        );
      g.E()
        .count()
        .next()
        .then(
          function (item1) {
            ok(item1);
            strictEqual(item1.value, 0);
          },
          (err) => fail('tanked: ' + err),
        );
      g.V()
        .label()
        .dedup()
        .count()
        .next()
        .then(
          function (item1) {
            ok(item1);
            strictEqual(item1.value, 1);
          },
          (err) => fail('tanked: ' + err),
        );
      g.V()
        .label()
        .dedup()
        .next()
        .then(
          function (item1) {
            ok(item1);
            strictEqual(item1.value, 'person');
          },
          (err) => fail('tanked: ' + err),
        );
    });
    it('should allow ReadOnlyStrategy', function () {
      const g = traversal().withRemote(connection).withStrategies(new ReadOnlyStrategy());
      return g
        .addV()
        .iterate()
        .then(
          () => fail('should have tanked'),
          (err) => ok(err),
        );
    });
    it('should allow ReservedKeysVerificationStrategy', function () {
      const g = traversal().withRemote(connection).withStrategies(new ReservedKeysVerificationStrategy(false, true));
      return g
        .addV()
        .property('id', "please-don't-use-id")
        .iterate()
        .then(
          () => fail('should have tanked'),
          (err) => ok(err),
        );
    });
    it('should allow EdgeLabelVerificationStrategy', function () {
      const g = traversal().withRemote(connection).withStrategies(new EdgeLabelVerificationStrategy(false, true));
      g.V()
        .outE('created', 'knows')
        .count()
        .next()
        .then(function (item1) {
          ok(item1);
          strictEqual(item1.value, 6);
        });
      return g
        .V()
        .out()
        .iterate()
        .then(
          () => fail('should have tanked'),
          (err) => strictEqual(err.statusCode, 500),
        );
    });
    it('should allow with_(evaluationTimeout,10)', function () {
      const g = traversal().withRemote(connection).with_('x').with_('evaluationTimeout', 10);
      return g
        .V()
        .repeat(__.both())
        .iterate()
        .then(
          () => fail('should have tanked'),
          (err) => strictEqual(err.statusCode, 598),
        );
    });
    it('should allow SeedStrategy', function () {
      const g = traversal()
        .withRemote(connection)
        .withStrategies(new SeedStrategy({ seed: 999999 }));
      return g
        .V()
        .coin(0.4)
        .count()
        .next()
        .then(
          function (item1) {
            ok(item1);
            strictEqual(item1.value, 1);
          },
          (err) => fail('tanked: ' + err),
        );
    });
  });
  describe('should handle tx errors if graph not support tx', function () {
    it('should throw exception on commit if graph not support tx', async function () {
      const g = traversal().withRemote(connection);
      const tx = g.tx();
      const gtx = tx.begin();
      const result = await g.V().count().next();
      strictEqual(6, result.value);
      try {
        await tx.commit();
        fail('should throw error');
      } catch (err) {
        strictEqual('Server error: Graph does not support transactions (500)', err.message);
      }
    });
    it('should throw exception on rollback if graph not support tx', async function () {
      const g = traversal().withRemote(connection);
      const tx = g.tx();
      tx.begin();
      try {
        await tx.rollback();
        fail('should throw error');
      } catch (err) {
        strictEqual('Server error: Graph does not support transactions (500)', err.message);
      }
    });
  });
  describe('support remote transactions - commit', function () {
    before(function () {
      txConnection = getConnection('gtx');
      return txConnection.open();
    });
    after(function () {
      const g = traversal().withRemote(txConnection);
      return g
        .V()
        .drop()
        .iterate()
        .then(() => {
          return txConnection.close();
        });
    });
    it('should commit a simple transaction', async function () {
      const g = traversal().withRemote(txConnection);
      const tx = g.tx();
      const gtx = tx.begin();
      await Promise.all([
        gtx.addV('person').property('name', 'jorge').iterate(),
        gtx.addV('person').property('name', 'josh').iterate(),
      ]);

      let r = await gtx.V().count().next();
      // assert within the transaction....
      ok(r);
      strictEqual(r.value, 2);

      // now commit changes to test outside of the transaction
      await tx.commit();

      r = await g.V().count().next();
      ok(r);
      strictEqual(r.value, 2);
      // connection closing async, so need to wait
      while (tx._sessionBasedConnection.isOpen) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      ok(!tx._sessionBasedConnection.isOpen);
    });
  });
  describe('support remote transactions - rollback', function () {
    before(function () {
      txConnection = getConnection('gtx');
      return txConnection.open();
    });
    after(function () {
      const g = traversal().withRemote(txConnection);
      return g
        .V()
        .drop()
        .iterate()
        .then(() => {
          return txConnection.close();
        });
    });
    it('should rollback a simple transaction', async function () {
      const g = traversal().withRemote(txConnection);
      const tx = g.tx();
      const gtx = tx.begin();
      await Promise.all([
        gtx.addV('person').property('name', 'jorge').iterate(),
        gtx.addV('person').property('name', 'josh').iterate(),
      ]);

      let r = await gtx.V().count().next();
      // assert within the transaction....
      ok(r);
      strictEqual(r.value, 2);

      // now rollback changes to test outside of the transaction
      await tx.rollback();

      r = await g.V().count().next();
      ok(r);
      strictEqual(r.value, 0);
      // connection closing async, so need to wait
      while (tx._sessionBasedConnection.isOpen) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      ok(!tx._sessionBasedConnection.isOpen);
    });
  });
});
