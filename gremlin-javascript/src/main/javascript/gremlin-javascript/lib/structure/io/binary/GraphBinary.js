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
 * GraphBinary 1.0 support implementation.
 *
 * The officially expected entrypoint is GraphBinaryReader/GraphBinaryWriter pair of classes,
 * examine lib/driver/** for use cases.
 *
 * See AnySerializer.serialize() for the mechanism of serializer selection for a given JavaScript value,
 * also consider AnySerializer.serialize() unit tests for real examples.
 * See NumberSerializationStrategy to understand how it deals with JavaScript numbers' serialization.
 *
 * Consider AnySerializer.serialize()/deserialize() unit tests to see what is not implemented,
 * what is ignored, what is not expected to be (de)serialized, etc.
 *
 * TODO: it has the following open topics:
 * - [] Should we do anything for application/vnd.graphbinary-v1.0-stringd mime type support?
 * Core Data Types support:
 * - [] 0x22: BigDecimal
 * - [] 0x2b: Tree
 * - [] 0x2c: Metrics
 * - [] 0x2d: TraversalMetrics
 * - [] 0x00: Custom
 * Extended Types support:
 * - [] 0x80: Char
 * - [] 0x81: Duration
 * - [] 0x82: InetAddress
 * - [] 0x83: Instant
 * - [] 0x84: LocalDate
 * - [] 0x85: LocalDateTime
 * - [] 0x86: LocalTime
 * - [] 0x87: MonthDay
 * - [] 0x88: OffsetDateTime
 * - [] 0x89: OffsetTime
 * - [] 0x8a: Period
 * - [] 0x8b: Year
 * - [] 0x8c: YearMonth
 * - [] 0x8d: ZonedDateTime
 * - [] 0x8e: ZoneOffset
 *
 * @author Igor Ostapenko
 */
/*eslint-disable*/

export { default as DataType } from './internals/DataType.js';
import DataType from './internals/DataType.js';
import * as utils from './internals/utils.js';
import IntSerializer from './internals/IntSerializer.js';
import LongSerializer from './internals/LongSerializer.js';
import LongSerializerNg from './internals/LongSerializerNg.js';
import StringSerializer from './internals/StringSerializer.js';
import DateSerializer from './internals/DateSerializer.js';
import DoubleSerializer from './internals/DoubleSerializer.js';
import FloatSerializer from './internals/FloatSerializer.js';
import ArraySerializer from './internals/ArraySerializer.js';
import MapSerializer from './internals/MapSerializer.js';
import UuidSerializer from './internals/UuidSerializer.js';
import EdgeSerializer from './internals/EdgeSerializer.js';
import PathSerializer from './internals/PathSerializer.js';
import PropertySerializer from './internals/PropertySerializer.js';
import VertexSerializer from './internals/VertexSerializer.js';
import VertexPropertySerializer from './internals/VertexPropertySerializer.js';
import BytecodeSerializer from './internals/BytecodeSerializer.js';
import PSerializer from './internals/PSerializer.js';
import TraverserSerializer from './internals/TraverserSerializer.js';
import EnumSerializer from './internals/EnumSerializer.js';
import LambdaSerializer from './internals/LambdaSerializer.js';
import BigIntegerSerializer from './internals/BigIntegerSerializer.js';
import ByteSerializer from './internals/ByteSerializer.js';
import ByteBufferSerializer from './internals/ByteBufferSerializer.js';
import ShortSerializer from './internals/ShortSerializer.js';
import BooleanSerializer from './internals/BooleanSerializer.js';
import TextPSerializer from './internals/TextPSerializer.js';
import TraversalStrategySerializer from './internals/TraversalStrategySerializer.js';
import BulkSetSerializer from './internals/BulkSetSerializer.js';
import UnspecifiedNullSerializer from './internals/UnspecifiedNullSerializer.js';
import NumberSerializationStrategy from './internals/NumberSerializationStrategy.js';
import AnySerializer from './internals/AnySerializer.js';
import GraphBinaryReader from './internals/GraphBinaryReader.js';
import GraphBinaryWriter from './internals/GraphBinaryWriter.js';

const ioc = {};

ioc.DataType = DataType;
ioc.utils = utils;

ioc.serializers = {};

ioc.intSerializer = new IntSerializer(ioc);
ioc.longSerializer = new LongSerializer(ioc);
ioc.longSerializerNg = new LongSerializerNg(ioc);
ioc.stringSerializer = new StringSerializer(ioc, ioc.DataType.STRING);
ioc.dateSerializer = new DateSerializer(ioc, ioc.DataType.DATE);
ioc.timestampSerializer = new DateSerializer(ioc, ioc.DataType.TIMESTAMP);
ioc.classSerializer = new StringSerializer(ioc, ioc.DataType.CLASS);
ioc.doubleSerializer = new DoubleSerializer(ioc);
ioc.floatSerializer = new FloatSerializer(ioc);
ioc.listSerializer = new ArraySerializer(ioc, ioc.DataType.LIST);
ioc.mapSerializer = new MapSerializer(ioc);
ioc.setSerializer = new ArraySerializer(ioc, ioc.DataType.SET);
ioc.uuidSerializer = new UuidSerializer(ioc);
ioc.edgeSerializer = new EdgeSerializer(ioc);
ioc.pathSerializer = new PathSerializer(ioc);
ioc.propertySerializer = new PropertySerializer(ioc);
ioc.vertexSerializer = new VertexSerializer(ioc);
ioc.vertexPropertySerializer = new VertexPropertySerializer(ioc);
ioc.bytecodeSerializer = new BytecodeSerializer(ioc);
ioc.pSerializer = new PSerializer(ioc);
ioc.traverserSerializer = new TraverserSerializer(ioc);
ioc.enumSerializer = new EnumSerializer(ioc);
ioc.lambdaSerializer = new LambdaSerializer(ioc);
ioc.bigIntegerSerializer = new BigIntegerSerializer(ioc);
ioc.byteSerializer = new ByteSerializer(ioc);
ioc.byteBufferSerializer = new ByteBufferSerializer(ioc);
ioc.shortSerializer = new ShortSerializer(ioc);
ioc.booleanSerializer = new BooleanSerializer(ioc);
ioc.textPSerializer = new TextPSerializer(ioc);
ioc.traversalStrategySerializer = new TraversalStrategySerializer(ioc);
ioc.bulkSetSerializer = new BulkSetSerializer(ioc);
ioc.unspecifiedNullSerializer = new UnspecifiedNullSerializer(ioc);

ioc.numberSerializationStrategy = new NumberSerializationStrategy(ioc);
ioc.anySerializer = new AnySerializer(ioc);

ioc.graphBinaryReader = new GraphBinaryReader(ioc);
ioc.graphBinaryWriter = new GraphBinaryWriter(ioc);

export const serializers = ioc.serializers;
export const intSerializer = ioc.intSerializer;
export const longSerializer = ioc.longSerializer;
export const longSerializerNg = ioc.longSerializerNg;
export const stringSerializer = ioc.stringSerializer;
export const dateSerializer = ioc.dateSerializer;
export const timestampSerializer = ioc.timestampSerializer;
export const classSerializer = ioc.classSerializer;
export const doubleSerializer = ioc.doubleSerializer;
export const floatSerializer = ioc.floatSerializer;
export const listSerializer = ioc.listSerializer;
export const mapSerializer = ioc.mapSerializer;
export const setSerializer = ioc.setSerializer;
export const uuidSerializer = ioc.uuidSerializer;
export const edgeSerializer = ioc.edgeSerializer;
export const pathSerializer = ioc.pathSerializer;
export const propertySerializer = ioc.propertySerializer;
export const vertexSerializer = ioc.vertexSerializer;
export const vertexPropertySerializer = ioc.vertexPropertySerializer;
export const bytecodeSerializer = ioc.bytecodeSerializer;
export const pSerializer = ioc.pSerializer;
export const traverserSerializer = ioc.traverserSerializer;
export const enumSerializer = ioc.enumSerializer;
export const lambdaSerializer = ioc.lambdaSerializer;
export const bigIntegerSerializer = ioc.bigIntegerSerializer;
export const byteSerializer = ioc.byteSerializer;
export const byteBufferSerializer = ioc.byteBufferSerializer;
export const shortSerializer = ioc.shortSerializer;
export const booleanSerializer = ioc.booleanSerializer;
export const textPSerializer = ioc.textPSerializer;
export const traversalStrategySerializer = ioc.traversalStrategySerializer;
export const bulkSetSerializer = ioc.bulkSetSerializer;
export const unspecifiedNullSerializer = ioc.unspecifiedNullSerializer;
export const numberSerializationStrategy = ioc.numberSerializationStrategy;
export const anySerializer = ioc.anySerializer;
export const graphBinaryReader = ioc.graphBinaryReader;
export const graphBinaryWriter = ioc.graphBinaryWriter;

export default ioc;
