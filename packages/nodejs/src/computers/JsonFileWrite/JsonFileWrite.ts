import glob from 'glob';
import { promises as fs } from 'fs';
import { Computer, str } from '@data-story/core';

export const JsonFileWrite: Computer = {
  name: 'JsonFile.write',
  label: 'JsonFile.write',
  inputs: [{
    name: 'input',
    schema: {}
  }],
  outputs: [],
  params: [
    str({
      name: 'path',
      label: 'Path',
      help: 'File path',
    }),
  ],

  canRun({ input }) {
    return input.haveAllItemsAtInput('input')
  },

  async *run({ input, params }) {
    const incoming = input.pull()

    const path = params.path as string
    const content = JSON.stringify(incoming.map(i => i.value), null, 2)

    await fs.writeFile(path, content, 'utf-8')
  },
};