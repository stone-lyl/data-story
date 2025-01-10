import { MessageHandler } from '../MessageHandler';
import { CancelObservation } from '@data-story/core';

export const cancelObservation: MessageHandler = async({ event, postMessage, inputObserverController }) => {
  inputObserverController.deleteExecutionObserver(event as CancelObservation);
  postMessage?.({
    msgId: event!.msgId,
  });
};
