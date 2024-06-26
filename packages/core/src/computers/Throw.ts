import { NodeRunError } from '../NodeRunError';
import { numberCast } from '../Param/casts/numberCast';
import { stringCast } from '../Param/casts/stringCast';
import { hjsonEvaluation } from '../Param/evaluations/hjsonEvaluation';
import { jsFunctionEvaluation } from '../Param/evaluations/jsFunctionEvaluation';
import { jsonEvaluation } from '../Param/evaluations/jsonEvaluation';
import { ComputerConfig } from '../types/ComputerConfig';
import { createDefaultStringable } from '../Param';

export const Throw: ComputerConfig = {
  name: 'Throw',
  inputs: ['input'],
  params: [
    createDefaultStringable({
      name: 'message',
      label: 'message',
      help: 'What to throw',
      multiline: false,
      canInterpolate: true,
      interpolate: true,
      evaluations: [
        jsFunctionEvaluation,
        jsonEvaluation,
        hjsonEvaluation,
      ],
      casts: [
        numberCast,
        stringCast,
      ],
      value: 'Some error',
    })
  ],

  async *run({ input, node }) {
    const [item] = input.pull(1)
    throw new NodeRunError({
      message: item.params.message as string,
      node,
    })
  },
};
