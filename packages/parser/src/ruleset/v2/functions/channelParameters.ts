import { createRulesetFunction } from '@stoplight/spectral-core';

import { getMissingProps, getRedundantProps, parseUrlVariables } from '../../utils';

import type { IFunctionResult } from '@stoplight/spectral-core';

export const channelParameters = createRulesetFunction<{ address : string, parameters: Record<string, unknown> }, null>(
  {
    input: {
      type: 'object',
      properties: {
        address: {type: 'string'},
        parameters: {
          type: 'object',
        },
      },
      required: ['parameters'],
    },
    options: null,
  },
  (targetVal, _, ctx) => {

    const address = targetVal.address;
    const results: IFunctionResult[] = [];

    if (!address) {
      results.push({
        message: `Address is undefined.`,
        path: [...ctx.path],
      });
      return results;
    }

    const parameters = parseUrlVariables(address);
    const missingParameters = getMissingProps(parameters, targetVal.parameters);
    if (missingParameters.length) {
      results.push({
        message: `Not all channel's parameters are described with "parameters" object. Missed: ${missingParameters.join(
          ', ',
        )}.`,
        path: [...ctx.path, 'parameters'],
      });
    }

    const redundantParameters = getRedundantProps(parameters, targetVal.parameters);
    if (redundantParameters.length) {
      redundantParameters.forEach(param => {
        results.push({
          message: `Channel's "parameters" object has redundant defined "${param}" parameter.`,
          path: [...ctx.path, 'parameters', param],
        });
      });
    }

    return results;
  },
);