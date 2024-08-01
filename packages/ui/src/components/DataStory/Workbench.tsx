import { DataStoryControls } from './dataStoryControls';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { ReactFlow, Background, BackgroundVariant, ReactFlowProvider, useUpdateNodeInternals, } from '@xyflow/react';
import NodeComponent from '../Node/NodeComponent';
import { RunModal } from './modals/runModal/runModal';
import { AddNodeModal } from './modals/addNodeModal';
import { StoreSchema, useStore } from './store/store';
import { shallow } from 'zustand/shallow';
import { NodeSettingsModal } from './modals/nodeSettingsModal/nodeSettingsModal';
import CommentNodeComponent from '../Node/CommentNodeComponent';
import InputNodeComponent from '../Node/InputNodeComponent';
import { useHotkeys } from './useHotkeys';
import TableNodeComponent from '../Node/TableNodeComponent';
import { DataStoryProps, StoreInitOptions } from './types';
import OutputNodeComponent from '../Node/OutputNodeComponent';
import { onDragOver, onDrop } from './onDrop';
import type { NodeTypes } from '@xyflow/react/dist/esm/types';
import { ReactFlowNode } from '../Node/ReactFlowNode';

const nodeTypes = {
  commentNodeComponent: CommentNodeComponent,
  nodeComponent: NodeComponent,
  inputNodeComponent: InputNodeComponent,
  outputNodeComponent: OutputNodeComponent,
  tableNodeComponent: TableNodeComponent,
};

export const Workbench = (props: DataStoryProps) => {
  const selector = (state: StoreSchema) => ({
    nodes: state.nodes,
    openNodeModalId: state.openNodeModalId,
    setOpenNodeModalId: state.setOpenNodeModalId,
    traverseNodes: state.traverseNodes,
  });

  const {
    nodes,
    openNodeModalId,
    setOpenNodeModalId,
    traverseNodes,
  } = useStore(selector, shallow);

  const [showRunModal, setShowRunModal] = useState(false);
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  useHotkeys({
    nodes,
    openNodeModalId,
    setShowRunModal,
    setOpenNodeModalId,
    showConfigModal,
    showRunModal,
    showAddNodeModal,
    traverseNodes,
    setShowAddNodeModal,
  });

  return (
    <>
      <ReactFlowProvider>
        <Flow {...props} setShowRunModal={setShowRunModal} setShowAddNodeModal={setShowAddNodeModal} />
      </ReactFlowProvider>

      {/* Modals */}
      <RunModal showModal={showRunModal} setShowModal={setShowRunModal}/>
      <AddNodeModal showModal={showAddNodeModal} setShowModal={setShowAddNodeModal}/>
    </>
  );
};

const useSelectedNodeSettings = ({onSelectedNode, selectedNodeData, closeNodeSetting}: {
  onSelectedNode?: (node?: ReactFlowNode) => void;
  selectedNodeData?: ReactFlowNode['data'];
  closeNodeSetting?: boolean;
}) => {
  const selector = (state: StoreSchema) => ({
    nodes: state.nodes,
    openNodeModalId: state.openNodeModalId,
    setOpenNodeModalId: state.setOpenNodeModalId,
  });

  const {
    nodes,
    openNodeModalId,
    setOpenNodeModalId,
  } = useStore(selector, shallow);

  const node = useMemo(() => {
    const node = nodes.find((n) => n.id === openNodeModalId);
    onSelectedNode?.(node);
    return node;
  }, [nodes, openNodeModalId]);

  useEffect(() => {
    if(closeNodeSetting) {
      setOpenNodeModalId(null);
    }
  },[closeNodeSetting]);

  const { updateNode } = useStore((state) => ({ updateNode: state.updateNode }), shallow);
  // todo: useUpdateNodeInternals should in the ReactFlowProvider
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    if (!node || !selectedNodeData) return;
    updateNode({
      ...node,
      data: selectedNodeData!
    });

    // Ensure ports are updated
    updateNodeInternals(node.id);
  }, [node, selectedNodeData]);

  return {
    node,
  }
}

const Flow = ({
  server,
  initDiagram,
  callback,
  hideToolbar = false,
  slotComponents,
  observers,
  onInitialize,
  setShowRunModal,
  setShowAddNodeModal,
  onSelectedNode,
  closeNodeSetting,
  selectedNodeData
}: DataStoryProps & {
  setShowRunModal: React.Dispatch<React.SetStateAction<boolean>>,
  setShowAddNodeModal: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const selector = (state: StoreSchema) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    connect: state.connect,
    onInit: state.onInit,
    onRun: state.onRun,
    setObservers: state.setObservers,
    addNodeFromDescription: state.addNodeFromDescription,
    openNodeModalId: state.openNodeModalId,
  });

  const {
    connect,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onInit,
    onRun,
    setObservers,
    addNodeFromDescription,
    openNodeModalId
  } = useStore(selector, shallow);
  const id = useId()
  const [isExecutePostRenderEffect, setIsExecutePostRenderEffect] = useState(false);

  useEffect(() => {
    setObservers('workbench', observers);
  }, [observers, setObservers]);

  useEffect(() => {
    if (onInitialize && onRun && isExecutePostRenderEffect) {
      onInitialize({ run: onRun });
      setIsExecutePostRenderEffect(false);
    }
  }, [isExecutePostRenderEffect, onRun, onInitialize]);

  const {node} =  useSelectedNodeSettings({
    onSelectedNode: onSelectedNode,
    closeNodeSetting: closeNodeSetting,
    selectedNodeData: selectedNodeData,
  });

  return (
    <>
      <ReactFlow
        id={id}
        className='bg-gray-50'
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes as NodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={connect}
        onInit={(rfInstance: StoreInitOptions['rfInstance']) => {
          onInit({
            rfInstance,
            server,
            initDiagram,
            callback,
          });
          setIsExecutePostRenderEffect(true);
        }}
        minZoom={0.25}
        maxZoom={8}
        fitView={true}
        fitViewOptions={{
          padding: 0.25,
        }}
        onDragOver={useCallback(onDragOver, [])}
        onDrop={useCallback(
          (e) => onDrop(e, addNodeFromDescription),
          [addNodeFromDescription]
        )}
      >
        <DataStoryControls
          slotComponents={slotComponents}
          hideToolbar={hideToolbar}
          setShowRunModal={setShowRunModal}
          setShowAddNodeModal={setShowAddNodeModal}
        />
        <Background color='#E7E7E7' variant={BackgroundVariant.Lines}/>
      </ReactFlow>
      {/*<NodeSettingsModal showModal={Boolean(openNodeModalId)} onClose={close} node={node!} />*/}
    </>
  )
}
