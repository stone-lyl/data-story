import { ItemValue } from './types/ItemValue';
import { Storage } from './types/Storage';
import { NodeId } from './types/Node';
import { LinkId } from './types/Link';

export class InMemoryStorage implements Storage {
  itemsMap = new Map<NodeId | LinkId, ItemValue[]>();
}
