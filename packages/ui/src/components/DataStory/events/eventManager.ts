import { Subject } from 'rxjs';
import { EventHandler, DataStoryEventType } from './dataStoryEventType';
import { useEffect } from 'react';
import { useLatest } from 'ahooks';

class EventManager {
  private subject: Subject<unknown>;
  constructor() {
    this.subject = new Subject();
  }

  /**
   * emit event
   */
  emit(event: DataStoryEventType) {
    this.subject.next(event);
  }

  /**
   * subscribe event
   */
  on(handler: EventHandler) {
    // need to call the listener handler synchronously, as the data from MockJSServer is synchronous
    return this.subject.subscribe(handler as unknown as ((value: unknown) => void));
  }
}

/**
 * global singleton event manager
 */
export const eventManager = new EventManager();

/**
 * use hook to subscribe event
 * @param {EventHandler} handler
 */
export const useDataStoryEvent = (handler: EventHandler) => {
  const handlerRef = useLatest(handler);

  useEffect(() => {
    const subscription = eventManager.on(handlerRef.current);
    return () => subscription.unsubscribe();
  }, [handler, handlerRef]);
}
