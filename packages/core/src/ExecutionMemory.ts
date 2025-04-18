import { NodeStatus } from './Executor'
import { LinkId } from './types/Link'
import { NodeId } from './types/Node'
import { ItemValue } from './types/ItemValue'
import { Hook } from './types/Hook'
import { InputDevice } from './InputDevice'
import { OutputDevice } from './OutputDevice'
import { ObserverController } from './ObserverController'
import { RequestObserverType } from './types/InputObserveConfig';
import { NodeRunnerContext } from './NodeRunnerContext'

type MemoryValues = {
  nodeStatuses?: Map<NodeId, NodeStatus>,
  nodeRunnerContexts?: Map<NodeId, NodeRunnerContext>,
  linkItems?: Map<LinkId, ItemValue[]>,
  linkCounts?: Map<LinkId, number>
  inputDevices?: Map<NodeId, InputDevice>,
  outputDevices?: Map<NodeId, OutputDevice>,
  hooks?: any[],
  observerController?: ObserverController,
}

export class ExecutionMemory {
  nodeStatuses: Map<NodeId, NodeStatus>
  nodeRunnerContexts: Map<NodeId, NodeRunnerContext>
  linkItems: Map<LinkId, ItemValue[]>
  linkCounts: Map<LinkId, number>
  inputDevices: Map<NodeId, InputDevice>
  outputDevices: Map<NodeId, OutputDevice>
  hooks: Hook[]
  observerController?: ObserverController

  constructor(values: MemoryValues = {}) {
    this.nodeStatuses = values.nodeStatuses || new Map()
    this.nodeRunnerContexts = values.nodeRunnerContexts || new Map()
    this.linkItems = values.linkItems || new Map()
    this.linkCounts = values.linkCounts || new Map()
    this.inputDevices = values.inputDevices || new Map()
    this.outputDevices = values.outputDevices || new Map()
    this.hooks = values.hooks || [];
    this.observerController = values.observerController;
  }

  getNodeStatus(nodeId: NodeId): NodeStatus | undefined {
    return this.nodeStatuses.get(nodeId)
  }

  setNodeStatus(nodeId: NodeId, status: NodeStatus) {
    this.observerController?.reportNodeStatus(nodeId, status);
    this.nodeStatuses.set(nodeId, status)
  }

  getNodeStatuses(): Map<NodeId, NodeStatus> {
    return this.nodeStatuses
  }

  getNodeRunnerContext(nodeId: NodeId): NodeRunnerContext | undefined {
    return this.nodeRunnerContexts.get(nodeId)
  }

  setNodeRunnerContext(nodeId: NodeId, context: NodeRunnerContext) {
    this.nodeRunnerContexts.set(nodeId, context)
  }

  getNodeRunner(nodeId: NodeId): AsyncGenerator<undefined, void, void> | undefined {
    return this.nodeRunnerContexts.get(nodeId)?.status;
  }

  getLinkItems(linkId: LinkId): ItemValue[] | undefined {
    return this.linkItems.get(linkId)
  }

  pullLinkItems(linkId: LinkId, count: number = Infinity): ItemValue[] {
    const linkItems = this.linkItems.get(linkId)!
    const pulled = linkItems.splice(0, count)

    return pulled
  }

  pushLinkItems(linkId: LinkId, items: ItemValue[]): void {
    const linkItems = this.linkItems.get(linkId)!
    this.linkItems.set(linkId, linkItems.concat(items))

    this.observerController?.reportItems({
      linkId,
      type: RequestObserverType.observeLinkItems,
      items,
    })
  }

  setLinkItems(linkId: LinkId, items: ItemValue[]) {
    this.observerController?.setItems(linkId, items);

    this.linkItems.set(linkId, items)
  }

  getLinkCount(linkId: LinkId): number | undefined {
    return this.linkCounts.get(linkId)
  }

  getLinkCounts(): Map<LinkId, number> {
    return this.linkCounts
  }

  setLinkCount(linkId: LinkId, count: number) {
    this.observerController?.reportLinksCount({
      linkId,
      type: RequestObserverType.observeLinkCounts,
      count,
    })

    this.linkCounts.set(linkId, count)
  }

  getInputDevice(nodeId: NodeId): InputDevice | undefined {
    return this.inputDevices.get(nodeId)
  }

  setInputDevice(nodeId: NodeId, device: InputDevice) {
    this.inputDevices.set(nodeId, device)
  }

  pushHooks(hooks: Hook[]) {
    this.hooks.push(...hooks)
  }

  pullHooks() {
    const pulled = [...this.hooks]

    this.hooks = []

    return pulled
  }
}