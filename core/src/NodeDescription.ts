import { Param } from './Param';
import { PortWithSchema } from './types/PortWithSchema';

export type NodeDescription = {
  name: string,
  label?: string,
  category?: string,
  inputs: PortWithSchema[],
  outputs: PortWithSchema[],
  params: Record<string, Param>,
  tags: string[],
}