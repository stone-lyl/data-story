import { Param, Port } from '@data-story/core';
import { Node } from '@xyflow/react';

export type DataStoryNodeData = {
  params: Param[],
  computer: string,
  label: string,
  inputs: Port[],
  outputs: Port[],
}

export type ReactFlowNode = Node<DataStoryNodeData>;
