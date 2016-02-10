/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.apache.tinkerpop.gremlin.process.computer.traversal.step.map;

import org.apache.tinkerpop.gremlin.process.computer.ComputerResult;
import org.apache.tinkerpop.gremlin.process.computer.GraphComputer;
import org.apache.tinkerpop.gremlin.process.computer.traversal.TraversalVertexProgram;
import org.apache.tinkerpop.gremlin.process.traversal.Step;
import org.apache.tinkerpop.gremlin.process.traversal.Traversal;
import org.apache.tinkerpop.gremlin.process.traversal.TraversalStrategies;
import org.apache.tinkerpop.gremlin.process.traversal.Traverser;
import org.apache.tinkerpop.gremlin.process.traversal.step.util.AbstractStep;
import org.apache.tinkerpop.gremlin.process.traversal.strategy.finalization.TraversalVertexProgramStrategy;
import org.apache.tinkerpop.gremlin.process.traversal.strategy.verification.ComputerVerificationStrategy;
import org.apache.tinkerpop.gremlin.process.traversal.traverser.TraverserRequirement;
import org.apache.tinkerpop.gremlin.process.traversal.util.FastNoSuchElementException;
import org.apache.tinkerpop.gremlin.structure.util.StringFactory;

import java.util.Set;

/**
 * @author Marko A. Rodriguez (http://markorodriguez.com)
 */
public final class TraversalVertexProgramStep<S> extends AbstractStep<S, ComputerResult> {

    public Traversal.Admin<S, ?> computerTraversal;
    private final GraphComputer graphComputer;
    private boolean first = true;

    public TraversalVertexProgramStep(final Traversal.Admin traversal, final Traversal.Admin<S, ?> computerTraversal, final GraphComputer graphComputer) {
        super(traversal);
        this.graphComputer = graphComputer;
        this.computerTraversal = computerTraversal;
        this.computerTraversal.getSideEffects().mergeInto(this.getTraversal().getSideEffects());
        this.computerTraversal.setSideEffects(this.getTraversal().getSideEffects());
        TraversalStrategies strategies = this.getTraversal().getStrategies().clone();
        strategies.removeStrategies(TraversalVertexProgramStrategy.class);
        strategies.addStrategies(ComputerVerificationStrategy.instance());
        this.computerTraversal.setStrategies(strategies);
        this.computerTraversal.applyStrategies();
    }

    @Override
    protected Traverser<ComputerResult> processNextStart() {
        if (this.first) { // && previousStep EmptyStep
            try {
                this.first = false;
                final ComputerResult result = this.graphComputer.program(TraversalVertexProgram.build().traversal(this.computerTraversal).create(this.getTraversal().getGraph().get())).submit().get();
                return this.getTraversal().getTraverserGenerator().generate(result, (Step) this, 1l);
            } catch (final Exception e) {
                throw new IllegalStateException(e.getMessage(), e);
            }
        }
        throw FastNoSuchElementException.instance();
    }

    @Override
    public String toString() {
        return StringFactory.stepString(this, this.computerTraversal);
    }

    /*@Override
    public TraversalVertexProgramStep<S> clone() {
        final TraversalVertexProgramStep<S> clone = (TraversalVertexProgramStep<S>) super.clone();
        clone.computerTraversal = this.integrateChild(this.computerTraversal.clone());
        return clone;
    }*/

    public Set<TraverserRequirement> getRequirements() {
        return this.computerTraversal.getTraverserRequirements();
    }
}
