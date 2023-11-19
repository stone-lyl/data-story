import { ComputerFactory } from './ComputerFactory';
import { Diagram } from './Diagram';
import { Node, NodeId } from './types/Node';
import { Link } from './types/Link';
import { PositionGuesser } from './PositionGuesser';
import { Port, PortName } from './types/Port';
import { ComputerConfig } from './types/ComputerConfig';

export class DiagramBuilder {
  diagram: Diagram
  previousNode: Node | null = null
  fromDirective: PortName | null = null
  toDirective: PortName | null = null
  aboveDirective: NodeId | null = null

  constructor() {
    this.diagram = new Diagram([], [])
  }

  from(directive: string) {
    this.fromDirective = directive
    return this
  }

  above(directive: string) {
    this.aboveDirective = directive
    return this;
  }

  on(directive: string) {
    return this.from(directive)
  }

  to(directive: string) {
    this.toDirective = directive
    return this
  }

  add(
    config: ComputerConfig,
    params: Record<string, any> = {}
  ) {
    const computer = new ComputerFactory().get(config)

    const nodeId = `${computer.name}.${this.getScopedId(computer.name)}`

    const node: Node = {
      id: nodeId,
      label: config.label,
      type: computer.name,
      // The inputs have not yet been assigned ids, to it here
      inputs: (computer.inputs ?? []).map(input => {
        return {
          ...input,
          id: `${nodeId}.${input.name}`, name: input.name
        }
      }),
      // The outputs have not yet been assigned ids, to it here
      outputs: (computer.outputs ?? []).map(output => {
        return {
          ...output,
          id: `${nodeId}.${output.name}`, name: output.name
        }
      }),
      // default params
      params: computer.params,
    }

    // set explicit params
    for(const [key, value] of Object.entries(params)) {
      const param = node.params.find(param => param.name === key)

      if(!param) throw new Error(`Bad param: ${key}. Param not found on ${node.id}`)

      param.inputMode.value = value
    }
    
    if(this.aboveDirective) {
      const aboveNode = this.diagram.nodes.find(node => node.id === this.aboveDirective)

      if(!aboveNode) throw new Error(`Bad above directive: ${this.aboveDirective}. Node not found`)

      node.position = {
        x: aboveNode.position!.x,
        y: aboveNode.position!.y - 100,
      }
    } else {
      node.position = new PositionGuesser(
        this.diagram
      ).guess(node)
    }


    this.diagram.nodes.push(node)
    
    this.linkToNewNode(node)

    this.previousNode = node

    this.fromDirective = null

    this.aboveDirective = null

    return this
  }

  link(from: string, to: string) {
    const link: Link = {
      id: `${from}--->${to}`,
      sourcePortId: from,
      targetPortId: to,
    }

    this.diagram.links.push(link)

    return this
  }

  get() {
    return this.diagram
  }

  protected getScopedId(computerName: string) {
    const max = this.diagram.nodes
      .filter(node => node.type === computerName)
      .map(node => node.id)
      .map(id => id.split('.')[1])
      .map(id => parseInt(id))
      .reduce((max, id) => Math.max(max, id), 0)

    return max + 1
  }

  protected linkToNewNode(newNode: Node) {
    const originPort = this.getPortToLinkTo()

    const newNodePort = this.toDirective
      ? newNode.inputs.find(input => input.name === this.toDirective)
      : newNode.inputs.at(0);

    if(!originPort || !newNodePort) return

    const link: Link = {
      id: `${originPort.id}--->${newNodePort.id}`,
      sourcePortId: originPort.id!,
      targetPortId: newNodePort.id!,
    }

    this.diagram.links.push(link)
  }

  protected getPortToLinkTo(): Port | undefined {
    if(!this.previousNode) return

    // 1. Default: First port on the most recent node
    if(!this.fromDirective) {
      return this.previousNode.outputs.at(0)
    }

    // 2. A specified port on the most recent node
    if(
      // Is a port name
      typeof this.fromDirective === 'string'
      // Is not in format "node.port"
      && !this.fromDirective.includes('.')
    ) {
      const port = this.previousNode.outputs.find(
        output => output.name === this.fromDirective
      )

      console.log(this.previousNode.outputs)

      if(!port) throw new Error(`Bad on directive: ${this.fromDirective}. Port not found on ${this.previousNode.id}`)

      return port
    }

    // 3. A specified port on a specified node
    if(
      // Is a port name
      typeof this.fromDirective === 'string'
      // Is not in format "node.port"
      && this.fromDirective.includes('.')
    ) {
      const parts = this.fromDirective.split('.')

      // Node counter may be omitted - assume 1
      const [nodeType, nodeId, portName] = parts.length === 3
        ? parts
        : [parts.at(0), 1, parts.at(1)]

      const origin = this.diagram.nodes.find(
        node => node.id === `${nodeType}.${nodeId}`
      )
      if(!origin) throw new Error(`Bad on directive: ${this.fromDirective}. Could not find origin node`)

      const port = origin?.outputs.find(
        output => output.name === portName
      )

      if(!port) throw new Error(`Bad on directive: ${this.fromDirective}. Could not find origin port`)

      return port
    }

    // No port found
    return undefined
  }
}