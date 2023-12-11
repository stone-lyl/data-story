import {
  NodeDescription,
  Application,
  Diagram,
  NullStorage,
  Executor,
} from '@data-story/core';
import { ServerClient } from './ServerClient';
import { SerializedReactFlow } from '../../../SerializedReactFlow';

export class JsClient implements ServerClient {
  constructor(
    private setAvailableNodes: (nodes: NodeDescription[]) => void,
    private updateEdgeCounts: (edgeCounts: Record<string, number>) => void,
    private setNodes: (nodes: any) => void,
    private setEdges: (edges: any) => void,
    // private setViewport: (viewport: any) => void,
    private app: Application,
  ) {}

  init() {
    this.setAvailableNodes(this.app.descriptions())

    console.log('Connected to server: JS')
  }

  describe() {}

  run(diagram: Diagram) {
    const storage = new NullStorage()    
  
    const executor = new Executor(
      diagram,
      this.app.computers,
      storage
    )
    
    const execution = executor.execute();

    const handleUpdates = (iterator: AsyncIterator<any>) => {
      iterator.next().then(({ value: update, done }) => {
        if (!done) {
          this.updateEdgeCounts(update.counts)
          for(const hook of update.hooks) {
            if(hook.type === 'CONSOLE_LOG') {
              console.log(...hook.args)
            } else {
              const userHook = this.app.hooks.get(hook.type)

              if(userHook) {
                userHook(...hook.args)
              }
            }
          }          

          // Then wait for the next one
          handleUpdates(iterator);
        } else {
          console.log('Execution complete 💫')
        }
      });
    }
    
    // Not sure what this is but it works
    handleUpdates(execution[Symbol.asyncIterator]());
  }

  async open(name: string) {

  }

  async save(name: string, reactFlow: SerializedReactFlow) {

  }
}
