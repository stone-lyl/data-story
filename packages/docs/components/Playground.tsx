'use client'

import { Application, coreNodeProvider, Diagram } from '@data-story/core';
import React, { useMemo } from 'react';
import { DataStory, WorkspaceApiClient, ServerConfig } from '@data-story/ui';
import { loadDiagram, LocalStorageKey, SaveComponent } from './Save';
import { ServerRequest } from '../const';

export default Playground;

function getServer(mode: 'js' | 'node', app: Application): ServerConfig {
  return mode === 'node'
    ? { type: 'SOCKET', url: ServerRequest }
    : { type: 'JS', app };
}

const app = new Application()
  .register(coreNodeProvider)
  .boot();

function Playground({ mode }: {mode?: 'js' | 'node'}) {
  const { diagram } = loadDiagram(LocalStorageKey);
  const [initDiagram] = React.useState<Diagram>(diagram);
  const [saveDiagram, setSaveDiagram] = React.useState<() => void>(() => {
  });
  const client = useMemo(() => new WorkspaceApiClient(), []);
  const server = useMemo(() => getServer(mode, app), [mode])

  return (
    <div className="w-full" style={{ height: 'calc(100vh - 72px)' }} data-cy="playground">
      <DataStory
        onSave={saveDiagram}
        // TODO: avoid re-creating the client on every render
        // SyntaxError: Cannot use import statement outside a module
        // clientv2={useCreation(() => new JsClientV2(), [])}
        client={client}
        slotComponents={[
          <SaveComponent setSaveDiagram={setSaveDiagram}/>,
        ]}
        initDiagram={initDiagram}
        server={server}
      />
    </div>
  );
};
