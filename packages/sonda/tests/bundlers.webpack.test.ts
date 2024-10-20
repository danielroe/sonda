import { vi, describe, it, expect } from 'vitest';
import { join } from 'path';
import webpack from 'webpack';
import { SondaWebpackPlugin } from '../src/bundlers/webpack';
import type { Options } from '../src/types';

const mocks = vi.hoisted( () => ( {
	generateReportFromAssets: vi.fn().mockResolvedValue( undefined )
} ) );

vi.mock( '../src/report/generate.js', () => ( {
	generateReportFromAssets: mocks.generateReportFromAssets
} ) );

const distDir = join( import.meta.dirname, 'dist' );

function runCompiler( compiler: webpack.Compiler ) {
	return new Promise<void>( ( resolve, reject ) => {
		compiler.run( ( err, stats ) => {
			if ( err || stats?.hasErrors() ) {
				return reject( err || stats?.toJson().errors );
			}
			resolve();
		} );
	} );
}

describe( 'SondaWebpackPlugin', () => {
	it( 'should transform the code correctly', async () => {
		const compiler = webpack( {
			entry: join( import.meta.dirname, 'fixtures/bundlers/index.js' ),
			output: {
				path: distDir,
				filename: 'webpack_1.js',
			},
			plugins: [ new SondaWebpackPlugin() ],
			devtool: 'source-map',
		} );

		await runCompiler( compiler );

		expect( mocks.generateReportFromAssets ).toHaveBeenCalledWith(
			[
				join( import.meta.dirname, 'dist/webpack_1.js' )
			],
			{
				'tests/fixtures/bundlers/index.js': {
					belongsTo: null,
					bytes: 66,
					format: 'esm',
					imports: [ 'tests/fixtures/detailed/index.js' ]
				},
				'tests/fixtures/detailed/index.js': {
					belongsTo: null,
					bytes: 238,
					format: 'esm',
					imports: []
				}
			},
			{}
		);
	} );

	it( 'passes options to the `generateReportFromAssets` function', async () => {
		const options: Partial<Options> = {
			format: 'json',
			open: false
		};

		const compiler = webpack( {
			entry: join( import.meta.dirname, 'fixtures/bundlers/index.js' ),
			output: {
				path: distDir,
				filename: 'webpack_2.js',
			},
			plugins: [ new SondaWebpackPlugin( options ) ],
			devtool: 'source-map',
		} );

		await runCompiler( compiler );

		expect( mocks.generateReportFromAssets ).toHaveBeenCalledWith(
			expect.any( Array ),
			expect.any( Object ),
			options
		);
	} );
} );