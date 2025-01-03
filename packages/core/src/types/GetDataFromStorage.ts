import { ItemValue } from './ItemValue';
import { LinkId } from './Link';

export type GetDataFromStorage = {
  type: 'getDataFromStorage',
  linkId: LinkId,
  msgId?: string,
  offset?: number,
  limit?: number,
}

export type LinkItems = Record<LinkId, ItemValue[]>