import { num, StringableInputValue } from '../Param';
import { Computer } from '../types/Computer';

export const Await: Computer = {
  name: 'Await',
  label: 'Await',
  inputs: [
    {
      name: 'input',
      schema: {},
    },
  ],
  outputs: [
    {
      name: 'output',
      schema: {},
    },
    {
      name: 'no_items',
      schema: {},
    },
  ],
  params: [
    num(
      {
        name: 'number_of_items',
        label: 'Number of Items',
        help: 'How many items to await?',
        multiline: false,
        canInterpolate: false,
        interpolate: false,
        value: 'Infinity',
      },
    ),
  ],

  canRun({ input, params, isAvailable }) {
    const haveChunk = input.haveItemsAtInput(
      'input',
      (params.number_of_items.input as StringableInputValue).rawValue as number,
    )

    const haveRemainder = input.haveAllItemsAtInput('input')

    return isAvailable() && (haveChunk || haveRemainder)
  },

  async *run({ input, output, params }) {
    let hasPulledAny = false

    while(true) {
      // not set the batch limit, because the param has number_of_items
      const incoming = input.pull()

      const pulledCount = incoming.length
      if(pulledCount > 0) hasPulledAny = true
      const chunkSize = params.number_of_items as unknown as number

      output.push(incoming)

      if(pulledCount === 0) output.pushTo('no_items', [{
        message: 'No items available to await node.',
      }])

      if(pulledCount < chunkSize) break;

      yield;
    }
  },
};
