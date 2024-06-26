import { createDefaultStringable, str } from '../Param';
import { ComputerConfig } from '../types/ComputerConfig';

export const Input: ComputerConfig = {
  name: 'Input',
  inputs: ['input'],
  outputs: ['output'],
  params: [
    createDefaultStringable({
      name: 'port_name',
      label: 'Port Name',
      value: 'input',
      help: 'The name of the input port.',
      multiline: false,
      canInterpolate: true
    })
  ],

  async *run({ input, output}) {
    while(true) {
      const [ portName, ...other ] = input.getPortNames()

      if (!portName || other.length > 0) throw new Error('Input computer must have exactly one input port.')

      const incoming = input.pullFrom(portName)

      output.push(incoming)

      yield;
    }
  },
};
