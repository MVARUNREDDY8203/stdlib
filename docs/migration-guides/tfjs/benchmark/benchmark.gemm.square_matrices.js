/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len */

'use strict';

// MODULES //

var resolve = require( 'path' ).resolve;
var bench = require( '@stdlib/bench' );
var discreteUniform = require( '@stdlib/random/array/discrete-uniform' );
var pow = require( '@stdlib/math/base/special/pow' );
var floor = require( '@stdlib/math/base/special/floor' );
var numel = require( '@stdlib/ndarray/base/numel' );
var shape2strides = require( '@stdlib/ndarray/base/shape2strides' );
var isnanf = require( '@stdlib/math/base/assert/is-nanf' );
var format = require( '@stdlib/string/format' );
var tryRequire = require( '@stdlib/utils/try-require' );

// var sgemm = require( '@stdlib/blas/base/sgemm' ).ndarray;
var sgemm = require( '@stdlib/utils/noop' ); // FIXME: remove once `sgemm` merged

var pkg = require( './../package.json' ).name;


// VARIABLES //

var tf = tryRequire( resolve( __dirname, '..', 'node_modules', '@tensorflow/tfjs' ) );
var tfnode = tryRequire( resolve( __dirname, '..', 'node_modules', '@tensorflow/tfjs-node' ) );
var opts = {
	'skip': ( tf instanceof Error )
};
var OPTS = {
	'dtype': 'float32'
};


// FUNCTIONS //

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveIntegerArray} shapeA - shape of the first array
* @param {string} orderA - memory layout of the first array
* @param {PositiveIntegerArray} shapeB - shape of the second array
* @param {string} orderB - memory layout of the second array
* @param {PositiveIntegerArray} shapeC - shape of the third array
* @param {string} orderC - memory layout of the third array
* @returns {Function} benchmark function
*/
function createBenchmark1( shapeA, orderA, shapeB, orderB, shapeC, orderC ) {
	var sa;
	var sb;
	var sc;
	var A;
	var B;
	var C;

	A = discreteUniform( numel( shapeA ), 0, 10, OPTS );
	B = discreteUniform( numel( shapeB ), 0, 10, OPTS );
	C = discreteUniform( numel( shapeC ), 0, 10, OPTS );

	sa = shape2strides( shapeA, orderA );
	sb = shape2strides( shapeB, orderB );
	sc = shape2strides( shapeC, orderC );

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var i;

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			sgemm( 'no-transpose', 'no-transpose', shapeA[0], shapeC[1], shapeB[0], 0.5, A, sa[0], sa[1], 0, B, sb[0], sb[1], 0, 2.0, C, sc[0], sc[1], 0 );
			if ( isnanf( C[ i%C.length ] ) ) {
				b.fail( 'should not return NaN' );
			}
		}
		b.toc();
		if ( isnanf( C[ i%C.length ] ) ) {
			b.fail( 'should not return NaN' );
		}
		b.pass( 'benchmark finished' );
		b.end();
	}
}

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveIntegerArray} shapeA - shape of the first array
* @param {PositiveIntegerArray} shapeB - shape of the second array
* @param {PositiveIntegerArray} shapeC - shape of the third array
* @returns {Function} benchmark function
*/
function createBenchmark2( shapeA, shapeB, shapeC ) {
	var abuf;
	var bbuf;
	var cbuf;

	abuf = discreteUniform( numel( shapeA ), 0, 10, OPTS );
	bbuf = discreteUniform( numel( shapeB ), 0, 10, OPTS );
	cbuf = discreteUniform( numel( shapeC ), 0, 10, OPTS );

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var out;
		var A;
		var B;
		var C;
		var D;
		var i;

		tf.setBackend( 'cpu' );

		A = tf.tensor( abuf, shapeA, OPTS.dtype );
		B = tf.tensor( bbuf, shapeB, OPTS.dtype );
		C = tf.tensor( cbuf, shapeC, OPTS.dtype );

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			D = tf.matMul( A, B );
			out = tf.add( D, C );
			if ( typeof out !== 'object' ) {
				b.fail( 'should return an object' );
			}
			tf.dispose( D );
			tf.dispose( out );
		}
		b.toc();
		if ( typeof out !== 'object' ) {
			b.fail( 'should return an object' );
		}
		tf.dispose( A );
		tf.dispose( B );
		tf.dispose( C );
		b.pass( 'benchmark finished' );
		b.end();
	}
}

/**
* Creates a benchmark function.
*
* @private
* @param {PositiveIntegerArray} shapeA - shape of the first array
* @param {PositiveIntegerArray} shapeB - shape of the second array
* @param {PositiveIntegerArray} shapeC - shape of the third array
* @returns {Function} benchmark function
*/
function createBenchmark3( shapeA, shapeB, shapeC ) {
	var abuf;
	var bbuf;
	var cbuf;

	abuf = discreteUniform( numel( shapeA ), 0, 10, OPTS );
	bbuf = discreteUniform( numel( shapeB ), 0, 10, OPTS );
	cbuf = discreteUniform( numel( shapeC ), 0, 10, OPTS );

	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		var out;
		var A;
		var B;
		var C;
		var D;
		var i;

		tfnode.setBackend( 'tensorflow' );

		A = tfnode.tensor( abuf, shapeA, OPTS.dtype );
		B = tfnode.tensor( bbuf, shapeB, OPTS.dtype );
		C = tfnode.tensor( cbuf, shapeC, OPTS.dtype );

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			D = tfnode.matMul( A, B );
			out = tfnode.add( D, C );
			if ( typeof out !== 'object' ) {
				b.fail( 'should return an object' );
			}
			tfnode.dispose( D );
			tfnode.dispose( out );
		}
		b.toc();
		if ( typeof out !== 'object' ) {
			b.fail( 'should return an object' );
		}
		tfnode.dispose( A );
		tfnode.dispose( B );
		tfnode.dispose( C );
		b.pass( 'benchmark finished' );
		b.end();
	}
}


// MAIN //

/**
* Main execution sequence.
*
* @private
*/
function main() {
	var shapes;
	var orders;
	var min;
	var max;
	var N;
	var f;
	var i;

	min = 1; // 10^min
	max = 6; // 10^max

	for ( i = min; i <= max; i++ ) {
		N = floor( pow( pow( 10, i ), 1.0/2.0 ) );
		shapes = [
			[ N, N ],
			[ N, N ],
			[ N, N ]
		];
		orders = [
			'row-major',
			'row-major',
			'row-major'
		];
		f = createBenchmark1( shapes[0], orders[0], shapes[1], orders[1], shapes[2], orders[2] );
		bench( format( '%s::stdlib:blas/base/sgemm:dtype=%s,orders=(%s),size=%d,shapes={(%s),(%s),(%s)}', pkg, OPTS.dtype, orders.join( ',' ), numel( shapes[2] ), shapes[0].join( ',' ), shapes[1].join( ',' ), shapes[2].join( ',' ) ), f );

		f = createBenchmark2( shapes[0], shapes[1], shapes[2] );
		bench( format( '%s::tfjs:matmul:dtype=%s,size=%d,shapes={(%s),(%s),(%s)}', pkg, OPTS.dtype, numel( shapes[2] ), shapes[0].join( ',' ), shapes[1].join( ',' ), shapes[2].join( ',' ) ), opts, f );

		f = createBenchmark3( shapes[0], shapes[1], shapes[2] );
		bench( format( '%s::tfjs-node:matmul:dtype=%s,size=%d,shapes={(%s),(%s),(%s)}', pkg, OPTS.dtype, numel( shapes[2] ), shapes[0].join( ',' ), shapes[1].join( ',' ), shapes[2].join( ',' ) ), opts, f );

		orders = [
			'row-major',
			'column-major',
			'row-major'
		];
		f = createBenchmark1( shapes[0], orders[0], shapes[1], orders[1], shapes[2], orders[2] );
		bench( format( '%s::stdlib:blas/base/sgemm:dtype=%s,orders=(%s),size=%d,shapes={(%s),(%s),(%s)}', pkg, OPTS.dtype, orders.join( ',' ), numel( shapes[2] ), shapes[0].join( ',' ), shapes[1].join( ',' ), shapes[2].join( ',' ) ), f );

		f = createBenchmark2( shapes[0], shapes[1], shapes[2] );
		bench( format( '%s::tfjs:matmul:dtype=%s,size=%d,shapes={(%s),(%s),(%s)}', pkg, OPTS.dtype, numel( shapes[2] ), shapes[0].join( ',' ), shapes[1].join( ',' ), shapes[2].join( ',' ) ), opts, f );

		f = createBenchmark3( shapes[0], shapes[1], shapes[2] );
		bench( format( '%s::tfjs-node:matmul:dtype=%s,size=%d,shapes={(%s),(%s),(%s)}', pkg, OPTS.dtype, numel( shapes[2] ), shapes[0].join( ',' ), shapes[1].join( ',' ), shapes[2].join( ',' ) ), opts, f );
	}
}

main();