import { Diagram, get, NodeDescription } from '@data-story/core';
import { WorkspacesApi } from './WorkspacesApi';
import { parseDiagramTree } from './parseDiagramTree';

export class JsClientV2 {
  workspacesApi: WorkspacesApi = {
    getNodeDescriptions: async ({ path }) => {
      return [] as NodeDescription[]
    },
    getTree: async ({ path }) => {
      const treeJson = localStorage.getItem(path)
      if(treeJson) return parseDiagramTree(treeJson)

      console.log('No tree found at path', path)
      // If no tree at path
      // For testing purposes: Persist and return a default tree
      const defaultTree = {
        path: '/',
        type: 'folder',
        children: [
          {
            path: '/main',
            type: 'file',
            content: new Diagram(),
          }
        ],
      }

      localStorage.setItem(path, JSON.stringify(defaultTree))
      return defaultTree
    },
  } as WorkspacesApi
}