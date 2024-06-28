import { diagramJson } from './diagramJson';
import { DataStoryElement, OperatorElement } from './circuitElement';
import { signal } from './nodes/signal';
import { sleep } from './nodes/sleep';
import { consoleLog } from './nodes/consoleLog';

console.log(diagramJson)

const allElements = {
  Signal: signal,
  Sleep: sleep,
  ConsoleLog: consoleLog
}

function convertParams(params: Record<string, any>[]): Record<string, any> {
  const result = params.reduce((acc, param) => {
    const { name, value, type } = param;
    if (type === 'StringableParam') {
      return { [name]: value.value }
    }
    return { [name]: value }
  }, {});
  console.log(result)
  return result;
}

function convertNodesToElements(nodes: Record<string, any>[]): DataStoryElement[] {
  const eles = nodes.map(node => {
    const param = convertParams(node.params);
    const { type } = node;
    // @ts-ignore
    const element = allElements[type].boot(param) as DataStoryElement;
    console.log(element)
    return element;
  })
  return eles;
}

function convertLinksToElements(links: any): OperatorElement {

}

const convertJSONToDiagram = (json: string) => {
  const { name, diagram } = JSON.parse(json);
  const { nodes, links } = diagram;
  convertNodesToElements(nodes);
  convertLinksToElements(links);
}
