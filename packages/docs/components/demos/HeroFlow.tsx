import { DataStory } from '@data-story/ui'
import {
  Application,
  coreNodeProvider,
  nodes,
  multiline,
  core,
} from '@data-story/core';
import useWindowDimensions from '../../hooks/useWindowDimensions';

export default () => {
  const { height, width } = useWindowDimensions();
  const isSmallScreen = width < 768;

  const app = new Application();

  app.register(coreNodeProvider);

  app.boot();

  const { Signal, Pass, Comment, Ignore } = nodes;

  const welcomeMarkdown = multiline`
    ### Welcome to DataStory 👋
    Real time data processing for NodeJS and React.  
    [docs](/docs) | [playground](/playground)
  `

  // Good for computers
  const bigDiagram = core.getDiagramBuilder()
    .add({...Signal, label: 'Realtime'}, { period: 20, count: 100000})
    .add({...Pass, label: 'Automation'})
    .add({...Ignore, label: 'for React & NodeJS'})
    .above('Signal.1').add(Comment, { content: welcomeMarkdown})
    .from('Signal.1.output').below('Pass.1').add({
      ...Ignore,
      label: 'in Your App',
    })
    .jiggle({x: 60, y: 25})
    .get()

  // Good for mobile
  const smallDiagram = core.getDiagramBuilder()
    .add({...Signal, label: 'Realtime'}, { period: 20, count: 100000})
    .add({...Ignore, label: 'Automation'})
    .above('Signal.1').add(Comment, { content: welcomeMarkdown})
    .from('Signal.1.output').below('Ignore.1').add({
      ...Ignore,
      label: 'in Your App',
    })
    .jiggle({x: 60, y: 25})
    .get()

  return (
    <div className="w-full h-1/2 sm:h-screen">
      <DataStory
        server={{ type: 'JS', app }}
        initDiagram={isSmallScreen ? smallDiagram : bigDiagram}
        onInitialize={(options) => options.run()}
        hideToolbar={true}
      />
    </div>
  );
};
