import { useStore } from '../DataStory/store/store';
import { StoreSchema } from '../DataStory/types';
import { createDataStoryId, ItemValue, ObserveLinkUpdate, RequestObserverType } from '@data-story/core';
import { useLatest } from 'ahooks';
import { shallow } from 'zustand/shallow';
import { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

const initialScreenCount: number = 20;

export function useObserverTable({ id, setIsDataFetched, setItems, items, parentRef }: {
  id: string,
  setIsDataFetched: (value: boolean) => void,
  setItems: (value: any) => void
  items: ItemValue[];
  parentRef: React.MutableRefObject<HTMLDivElement | null>;
}): {
    loadMore: MutableRefObject<() => Promise<void> | undefined>
  } {
  const selector = (state: StoreSchema) => ({
    toDiagram: state.toDiagram,
    client: state.client,
  });
  const { toDiagram, client } = useStore(selector, shallow);

  const linkIds = toDiagram()?.getInputLinkIdsFromNodeIdAndPortName?.(id, 'input');
  const pendingRequest = useRef(false);
  const linkOffsets = useRef<Map<string, number>>(new Map());

  const loadMore = useLatest(async () => {
    if (pendingRequest.current) return;
    if (!client?.getDataFromStorage || !linkIds) return;

    setIsDataFetched(true);
    pendingRequest.current = true;

    try {
      const newItems: ItemValue[] = [];

      // Fetch data for each link
      const promises = linkIds.map(async (linkId) => {
        const currentOffset = linkOffsets.current.get(linkId) ?? 0;
        const result = await client?.getDataFromStorage?.({
          type: 'getDataFromStorage',
          linkId,
          limit: initialScreenCount,
          offset: currentOffset,
        });

        const linkItems = result?.[linkId] ?? [];
        if (linkItems.length > 0) {
          newItems.push(...linkItems);
          // Update offset only if we got items
          linkOffsets.current.set(linkId, currentOffset + linkItems.length);
        }
      });

      await Promise.all(promises);

      if (newItems.length > 0) {
        setItems(prevItems => [...prevItems, ...newItems]);
      }
    } finally {
      pendingRequest.current = false;
    }
  });

  useLayoutEffect(() => {
    const currentRef = parentRef.current;
    if (!currentRef) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = currentRef;
      if (scrollTop + clientHeight >= scrollHeight) {
        loadMore.current();
      }
    };

    currentRef?.addEventListener('scroll', handleScroll);
    return () => {
      currentRef?.removeEventListener('scroll', handleScroll);
    };
  }, [loadMore, parentRef.current]);

  useEffect(() => {
    if (!client?.observeLinkUpdate || !linkIds) return;
    const observerId = createDataStoryId();
    const tableUpdate: ObserveLinkUpdate = {
      observerId,
      linkIds: linkIds,
      type: RequestObserverType.observeLinkUpdate,
      throttleMs: 300,
      onReceive: (linkIds) => {
        if (items.length < initialScreenCount) {
          loadMore.current();
        }
      }
    }
    client?.observeLinkUpdate?.(tableUpdate);

    return () => {
      client?.cancelObservation?.({ observerId, type: RequestObserverType.cancelObservation });
    }
  }, [client, id, items.length, linkIds, loadMore]);

  return { loadMore };
}
