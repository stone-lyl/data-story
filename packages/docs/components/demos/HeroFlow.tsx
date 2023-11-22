import { DataStory } from '@data-story/ui'
import '@data-story/ui/dist/data-story.css';
import {
  Application,
  DiagramBuilder,
  coreNodeProvider,
  nodes,
} from '@data-story/core';
import { Comment, Map } from '@data-story/core/dist/computers';

export default () => {
  const app = new Application();

  app.register(coreNodeProvider);

  app.boot();

  const { Signal, /* Merge */ ConsoleLog, Ignore } = nodes;

  // Faking something more interesting than "Signals"
  // const diagram = new DiagramBuilder()
  //   .add(Signal, {
  //     label: 'Companies',
  //     count: 555,
  //     period: 10 }
  //   )
  //   // .add(Merge, {
  //   //   requestor_merge_property: 'id',
  //   //   supplier_merge_property: 'id',
  //   // })
  //   .add(ConsoleLog, {
  //     label: 'Companies::Update'
  //   })
  //   .from('Merge.1.not_merged').add(Ignore, {
  //     label: 'Discard'
  //   })
  //   .add(Signal, {
  //     label: 'Owners',
  //     period: 10
  //   })
  //   .link('Signal.2.output', 'Merge.1.suppliers')
  //   .get()

  const welcomeMarkdown = '### Welcome to DataStory 👋'

  const diagram = new DiagramBuilder()
    .add({...Signal, label: 'Realtime'}, { period: 20, count: 100000})
    .add({...Map, label: 'Automation'})
    .add({...ConsoleLog, label: 'for React & NodeJS'})

    .above('Signal.1').add(Comment, { content: welcomeMarkdown})
    .get()

  return (
    <div className="w-full mt-4" style={{ height: '36vh' }}>
      <DataStory
        server={{ type: 'JS', app }}
        diagram={diagram}
        callback={(options: any) => setTimeout(options.run, 100)}
        hideToolbar={true}
        hideTabs={true}
      />
    </div>   
  );
};