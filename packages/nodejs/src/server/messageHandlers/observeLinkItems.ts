import { MessageHandler, MessageHandlerParams } from '../MessageHandler';
import {
  type InputObserver,
  type ItemValue,
  type ObserveLinkItems,
  RequestObserverType,
} from '@data-story/core';

export const observeLinkItems: MessageHandler<ObserveLinkItems> = async({
  ws,
  data,
  observerController,
}: MessageHandlerParams<ObserveLinkItems>) => {
  observerController.addLinkItemsObserver({
    ...data,
    onReceive: (items: ItemValue[], inputObserver: InputObserver) => {
      ws.send(JSON.stringify({
        items,
        inputObserver,
        type: RequestObserverType.observeLinkItems,
        msgId: data!.msgId,
      }))
    },
  } as ObserveLinkItems);
}
