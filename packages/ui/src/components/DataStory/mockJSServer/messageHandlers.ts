import {
  Application,
  Diagram,
  ExecutionFailure,
  InMemoryStorage,
  type InputObserver,
  InputObserverController,
  type ItemValue, RequestObserverType,
  type ItemsObserver, LinkCountsObserver, NotifyDataUpdate, GetDataFromStorage, LinkId, NodeStatusObserver
} from '@data-story/core';
import { loadDiagram, saveDiagram } from './storeDiagram';
import { ExecutionObserver } from '@data-story/core/src';

type RunMessage = {
  msgId: string,
  type: 'run',
  diagram: Diagram,
  inputObservers: InputObserver[],
}

export type HandlerParam = {data: unknown, sendEvent: (msg: Record<string, any>) => void};
export type Message = {type: string}&Record<string, unknown>;

type Handler = (params: HandlerParam) => Promise<unknown>;
export type MessageHandlers = {
  run: Handler,
  getNodeDescriptions: Handler,
  updateDiagram: Handler,
  [key: string]: Handler,
};
const LocalStorageKey = 'data-story-tree';

export const getDefaultMsgHandlers = (app: Application, inputObserverController: InputObserverController) => {
  const run = async({ data, sendEvent }: HandlerParam) => {
    const storage = new InMemoryStorage();
    const { diagram } = data as RunMessage;

    const executor = app!.getExecutor({
      diagram,
      storage,
      inputObserverController,
    });

    try {
      const execution = executor?.execute();
      for await(const executionUpdate of execution) {
      }

      const executionResult = {
        type: 'ExecutionResult',
        time: Date.now(),
      }
      sendEvent(executionResult);
    } catch(error: any) {
      const failure: ExecutionFailure = {
        type: 'ExecutionFailure',
        message: error?.message,
        history: executor.memory.getHistory()
      }
      sendEvent(failure);
    }
  };

  const linkCountsObserver = ({ data, sendEvent }: HandlerParam) => {
    inputObserverController.addLinkCountsObserver({
      ...data as LinkCountsObserver,
      onReceive: ({ links }) => {
        sendEvent({
          links: links,
          type: RequestObserverType.linkCountsObserver
        })
      }
    })
  }

  const nodeStatusObserver = ({ data, sendEvent }: HandlerParam) => {
    inputObserverController.addNodeStatusObserver({
      ...data as NodeStatusObserver,
      onReceive: ({ nodes }) => {
        sendEvent({
          nodes: nodes,
          type: RequestObserverType.nodeStatusObserver
        })
      }
    })
  }

  const itemsObserver = ({ data, sendEvent }: HandlerParam) => {
    inputObserverController.addItemsObserver({
      ...data as ItemsObserver,
      onReceive: (items: ItemValue[], inputObserver: InputObserver) => {
        sendEvent({
          items,
          inputObserver,
          type: RequestObserverType.itemsObserver
        })
      }
    } as ItemsObserver);
  }

  const cancelObserver = ({ data, sendEvent }: HandlerParam) => {
    inputObserverController.deleteExecutionObserver(data as ExecutionObserver);
    sendEvent({
      ...data as Record<string, unknown>,
      cancelObserver: true
    });
  }

  const notifyDataUpdate = ({ data, sendEvent }: HandlerParam) => {
    inputObserverController.notifyDataUpdate({
      ...data as NotifyDataUpdate,
      onReceive: () => {
        sendEvent({
          linkIds: (data as NotifyDataUpdate).linkIds,
          type: RequestObserverType.notifyDataUpdate
        });
      }
    } as NotifyDataUpdate);
  }

  const getNodeDescriptions = async({ data, sendEvent }: HandlerParam) => {
    const nodeDescriptions = app!.descriptions();
    setTimeout(() => {
      sendEvent({
        ...data as Record<string, unknown>,
        availableNodes: nodeDescriptions
      });
    }, 1000);
  };

  const updateDiagram = async({ data, sendEvent }: HandlerParam) => {
    saveDiagram(LocalStorageKey, (data as {diagram: Diagram}).diagram);
  }

  const getDiagram = async({ data, sendEvent }: HandlerParam) => {
    const localDiagram = loadDiagram(LocalStorageKey);

    sendEvent({
      ...data as Record<string, unknown>,
      diagram: localDiagram.diagram
    });
  };

  const getDataFromStorage = async({ data, sendEvent }: HandlerParam) => {
    const result: Record<LinkId, ItemValue[]> = inputObserverController.getDataFromStorage(data as GetDataFromStorage);
    sendEvent(result);
  }

  return {
    run,
    getNodeDescriptions,
    updateDiagram,
    getDiagram,
    linkCountsObserver,
    itemsObserver,
    notifyDataUpdate,
    cancelObserver,
    getDataFromStorage,
    nodeStatusObserver
  }
}
