import * as glob from 'glob';
import fs from 'fs';
import { Computer, get, serializeError, str } from '@data-story/core';

export const JsonFileRead: Computer = {
  name: 'JsonFile.read',
  label: 'JsonFile.read',
  category: 'NodeJs',
  inputs: [],
  outputs: [
    {
      name: 'output',
      schema: {},
    },
    {
      name: 'errors',
      schema: {},
    },
  ],
  params: [
    str({
      name: 'file_path',
      label: 'File path (supports glob patterns)',
      help: 'File path, e.g., **/*.json',
    }),
    str({
      name: 'items_path',
      label: 'Items Path',
      help: 'Path to the items within the JSON structure',
    }),
  ],

  async *run({ output, params }) {
    const pathPattern = params.file_path as string;
    const itemsPath = params.items_path as string;
    try {
      // Use glob to get all matching file paths
      const files = glob.sync(pathPattern, {
        cwd: process.env.WORKSPACE_FOLDER_PATH,
        ignore: ['**/node_modules/**'],
        root: process.env.WORKSPACE_FOLDER_PATH,
        absolute: true,
      });

      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          const data = JSON.parse(content);
          const items = get(data, itemsPath);
          output.push(items);
        } catch (fileError: any) {
          output.pushTo('errors', [serializeError(fileError)]);
        }
      }

      yield;
    } catch (error: any) {
      output.pushTo('errors', [serializeError(error)]);
      yield;
    }
  },
};
