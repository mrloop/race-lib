import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import pkg from './package.json';

export default [
	// browser-friendly UMD build
	{
		input: 'src/index.js',
    output: {
      file: pkg.browser,
      format: 'umd',
      name: 'race-lib',
    },
    plugins: [
      resolve({
        mainFields: ['module', 'main'],
        preferBuiltins: false
      }),
      commonjs(),
      babel({
        exclude: ['node_modules/**'],
        babelHelpers: 'bundled',
      })
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// the `targets` option which can specify `dest` and `format`)
	{
		input: 'src/index.js',
		external: ['uri-js', 'es6-promise', 'abort-controller', 'event-target-shim', 'serial-fetch'],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		],
    plugins: [
      babel({
        exclude: ['node_modules/**'],
        babelHelpers: 'bundled',
      })
    ]
	}
];
