package com.tinkerpop.gremlin.process.graph.step.sideEffect.mapreduce;

import com.tinkerpop.gremlin.process.Traversal;
import com.tinkerpop.gremlin.process.computer.MapReduce;
import com.tinkerpop.gremlin.process.computer.traversal.TraversalVertexProgram;
import com.tinkerpop.gremlin.process.computer.util.LambdaHolder;
import com.tinkerpop.gremlin.process.graph.step.sideEffect.GroupByStep;
import com.tinkerpop.gremlin.structure.Vertex;
import org.apache.commons.configuration.Configuration;
import org.javatuples.Pair;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * @author Marko A. Rodriguez (http://markorodriguez.com)
 */
public class GroupByMapReduce implements MapReduce<Object, Collection, Object, Object, Map> {

    public static final String GROUP_BY_STEP_SIDE_EFFECT_KEY = "gremlin.groupByStep.sideEffectKey";
    public static final String GROUP_BY_STEP_STEP_LABEL = "gremlin.groupByStep.stepLabel";

    private String sideEffectKey;
    private String groupByStepKey;
    private Function reduceFunction;

    public GroupByMapReduce() {

    }

    public GroupByMapReduce(final GroupByStep step) {
        this.groupByStepKey = step.getLabel();
        this.sideEffectKey = step.getSideEffectKey();
        this.reduceFunction = step.reduceFunction;
    }

    @Override
    public void storeState(final Configuration configuration) {
        configuration.setProperty(GROUP_BY_STEP_SIDE_EFFECT_KEY, this.sideEffectKey);
        configuration.setProperty(GROUP_BY_STEP_STEP_LABEL, this.groupByStepKey);
    }

    @Override
    public void loadState(final Configuration configuration) {
        this.sideEffectKey = configuration.getString(GROUP_BY_STEP_SIDE_EFFECT_KEY);
        this.groupByStepKey = configuration.getString(GROUP_BY_STEP_STEP_LABEL);
        final LambdaHolder<Supplier<Traversal>> traversalSupplier = LambdaHolder.loadState(configuration, TraversalVertexProgram.TRAVERSAL_SUPPLIER); // TODO: dah.
        final Traversal<?, ?> traversal = traversalSupplier.get().get();
        final GroupByStep groupByStep = (GroupByStep) traversal.getSteps().stream()
                .filter(step -> step.getLabel().equals(this.groupByStepKey))
                .findAny().get();
        this.reduceFunction = groupByStep.reduceFunction;
    }

    @Override
    public boolean doStage(final Stage stage) {
        return !stage.equals(Stage.COMBINE);
    }

    @Override
    public void map(Vertex vertex, MapEmitter<Object, Collection> emitter) {
        MapReduce.getLocalSideEffects(vertex).<Map<Object, Collection>>orElse(this.sideEffectKey, Collections.emptyMap()).forEach(emitter::emit);
    }

    @Override
    public void reduce(final Object key, final Iterator<Collection> values, final ReduceEmitter<Object, Object> emitter) {
        final List list = new ArrayList();
        values.forEachRemaining(list::addAll);
        emitter.emit(key, (null == this.reduceFunction) ? list : this.reduceFunction.apply(list));
    }

    @Override
    public Map generateSideEffect(Iterator<Pair<Object, Object>> keyValues) {
        final Map map = new HashMap();
        keyValues.forEachRemaining(pair -> map.put(pair.getValue0(), pair.getValue1()));
        return map;
    }

    @Override
    public String getSideEffectKey() {
        return this.sideEffectKey;
    }
}