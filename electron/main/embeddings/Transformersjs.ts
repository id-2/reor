import * as lancedb from 'vectordb';
// import { pipeline } from '@xenova/transformers';

// import pipeline from '@xenova/transformers';
// const requireESM = require('esm')(module);

// const pipe = requireESM('@xenova/transformers');

export const setupPipeline = async (modelName: string) => {
  /*
  just noting for future explorers that we do a dynamic import because transformers.js is an ESM module,
  and this repo is not yet and so doing the import at the top pollutes
  this repo turning it into an ESM repo... super annoying and the whole industry
  is dealing with this problem now as we transition into ESM.
  */
  const { pipeline } = await import('@xenova/transformers');
  return pipeline('feature-extraction', modelName);
};
const pipe: any = null;

// async function initPipe() {
//   const { pipeline } = await import('@xenova/transformers');
//   pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
// }

// initPipe().catch((error) =>
//   console.error('Failed to initialize pipeline:', error),
// );

const TransformersJSEmbedFun: lancedb.EmbeddingFunction<string> = {
  sourceColumn: 'content',
  embed: async (batch: string[]): Promise<number[][]> => {
    // // eslint-disable-next-line no-new-func
    // const TransformersApi = Function('return import("@xenova/transformers")')();
    // const { pipe } = await TransformersApi;
    if (pipe === null) {
      throw new Error('Pipeline not initialized');
    }
    try {
      const result: number[][] = await Promise.all(
        batch.map(async (text) => {
          const res = await pipe(text, { pooling: 'mean', normalize: true });
          return Array.from(res.data);
        }),
      );
      return result;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
};

export default TransformersJSEmbedFun;
