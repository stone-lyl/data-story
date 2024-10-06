import React from 'react';
import { DataStoryEvents, DataStoryEventType, useDataStoryEvent } from '@data-story/ui';
import { multiline } from '@data-story/core';

export function VsCodeToast({ postMessage }: {
  postMessage: (message: {
    type: string;
    message?: string;
    [key: string]: any;
  }) => void
}) {
  useDataStoryEvent((event: DataStoryEventType) => {
    const info = {
      type: 'toast',
      message: '',
      status: 'success',
    };
    switch (event.type) {
      case DataStoryEvents.RUN_SUCCESS:
        info.message = multiline`
          Diagram executed successfully!
          Execution time: ${event.payload.time} ms
        `
        break;
      case DataStoryEvents.RUN_ERROR:
        info.message = `Diagram execution failed! Error was: ${event.payload.error}`;
        info.status = 'error';
        break;
      case DataStoryEvents.SAVE_SUCCESS:
        info.message = 'Diagram saved successfully!';
        break;
      case DataStoryEvents.SAVE_ERROR:
        console.error(event.payload);
        info.message = 'Diagram save failed!';
        info.status = 'error';
    }
    postMessage(info);
  });

  return (
    <div></div>
  );
}