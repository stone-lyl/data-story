import { Computer, num, str } from '@data-story/core';
import { Client } from '@hubspot/api-client';
import { EntityPage } from './EntityPage';
import { CrmEntityName } from './CrmEntityName';

const Template: Computer = {
  name: 'NAME',
  label: 'LABEL',
  inputs: [{
    name: 'input',
    schema: {},
  }],
  outputs: [
    {
      name: 'updated',
      schema: {},
    },
    {
      name: 'errors',
      schema: {},
    },
  ],
  category: 'Hubspot',
  params: [
    str({
      name: 'entity',
      label: 'Entity',
      help: 'The entity to retrieve.',
      input: 'ENTITY',
    }),
    str({
      name: 'properties',
      label: 'Properties',
      help: 'Comma separated list of properties.',
      input: '',
    }),
    num({
      name: 'limit',
      label: 'Limit',
      help: 'The maximum number of companies to return.',
      input: String('300'),
    }),
  ],
  async *run({ input, output, params }) {
    while(true) {
      const [ incoming ] = input.pull(1)

      // sleep 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));

      output.push([incoming])

      yield;
    }
  },
}

export const create = (name: string) => {
  const { run, ...templateProperties } = Template

  const config = {
    ...structuredClone(templateProperties),
    name: `${name}Create`,
    label: `${name}.create`,
    run,
  }

  const entityParam = config.params!.find((p) => p.name === 'entity')
  entityParam!.value = name.toLowerCase()

  return config
}