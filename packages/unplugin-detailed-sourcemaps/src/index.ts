import {
  createUnplugin,
  type UnpluginFactory,
  type UnpluginInstance,
  type TransformResult
} from 'unplugin';
import { loadCodeAndMap } from 'sonar';

export interface Options {

  /**
   * RegExp matching imports which sourcemap should be read.
   *
   * @default /\.js$/
   */
  include: RegExp;

  /**
   * RegExp matching imports for which sourcemaps should be ignored.
   *
   * @default undefined
   */
  exclude?: RegExp;
}

type Factory = UnpluginFactory<Options | undefined>;

function factory( options?: Partial<Options> ): ReturnType<Factory> {
  const defaultOptions: Options = {
    include: /\.js$/,
    exclude: undefined,
  };

  const {
    include,
    exclude
  } = Object.assign({}, defaultOptions, options) as Options;

  return {
    name: 'unplugin-detailed-sourcemaps',
    enforce: 'pre',

    loadInclude( id: string ): boolean {
      return include.test(id) && !exclude?.test(id);
    },

    async load( id: string ): Promise<TransformResult> {
      const result = await loadCodeAndMap( id );

      return result;
    }
  };
}

type Plugin = UnpluginInstance<Partial<Options> | undefined>;

export const plugin: Plugin = /* #__PURE__ */ createUnplugin(factory);
export const vitePlugin: Plugin['vite'] = plugin.vite;
export const rollupPlugin: Plugin['rollup'] = plugin.rollup;
export const rolldownPlugin: Plugin['rolldown'] = plugin.rolldown;
export const webpackPlugin: Plugin['webpack'] = plugin.webpack;
export const rspackPlugin: Plugin['rspack'] = plugin.rspack;
export const esbuildPlugin: Plugin['esbuild'] = plugin.esbuild;
export const farmPlugin: Plugin['farm'] = plugin.farm;
