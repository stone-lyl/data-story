import { promises as fs } from 'fs';
import { Computer, str } from '@data-story/core';

export const WriteFile: Computer = {
  name: 'WriteFile',
  label: 'WriteFile',
  category: 'NodeJs',
  inputs: [{
    name: 'input',
    schema: {},
  }],
  outputs: [],
  params: [
    str({
      name: 'path',
      label: 'Path',
      help: 'File path',
      input: '${path}/output.txt',
    }),
    str({
      name: 'content',
      label: 'Content',
      help: 'File content',
      input: 'Hello world!',
    }),
  ],

  async *run({ input, output }) {
    const [ incoming ] = input.pull(1)

    const path = incoming.params.path as string
    const content = incoming.params.content as string

    await fs.writeFile(path, content, 'utf-8')
  },
};