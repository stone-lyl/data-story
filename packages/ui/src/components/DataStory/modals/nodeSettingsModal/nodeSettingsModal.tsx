import { Params, InputSchemas, OutputSchemas, Config, Code } from './tabs';
import { shallow } from 'zustand/shallow';
import { StoreSchema, useStore } from '../../store/store';
import { useForm } from 'react-hook-form';
import { DataStoryNode } from '../../../Node/DataStoryNode';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { useState } from 'react';
import { InputMode, Param, ParamV3, ParamValue, pascalToSentenceCase, string } from '@data-story/core';

type TabKey = 'Params' | 'InputSchemas' | 'OutputSchemas' | 'Code' | 'Config';

const TAB_COMPONENTS: Record<TabKey, React.ComponentType<any>> = {
  Params,
  InputSchemas,
  OutputSchemas,
  Code,
  Config,
};

export const NodeSettingsModal = () => {
  const [tab, setTab] = useState<TabKey>('Params')

  const selector = (state: StoreSchema) => ({
    nodes: state.nodes,
    openNodeModalId: state.openNodeModalId,
    setOpenNodeModalId: state.setOpenNodeModalId,
    refreshNodes: state.refreshNodes,
    setNodes: state.setNodes,
  });  

  const { nodes, openNodeModalId, setOpenNodeModalId, setNodes } = useStore(selector, shallow);

  const node = nodes.find((node: DataStoryNode) => node.id === openNodeModalId)!

  const defaultValues = {
    label: node.data.label,
    params: node.data.params.reduce((acc, param: ParamV3) => {
      acc[param.name] = param.inputMode.value
      return acc

    }, {} as Record<string, InputMode['value']>)
  }

  const form = useForm({
    defaultValues,
  });

  const close = () => setOpenNodeModalId(null);

  const saveAndClose = () => {
    form.handleSubmit((submitted: {
      label: string,
      params: Record<string, InputMode['value']>
    }) => {
      setNodes(
        nodes.map((n) => {
          if (n.id === node.id) {
            // Root level fields
            const newData = { ...n.data };
            newData.label = submitted.label;

            console.log({submitted})

            // Param fields
            for (const [key, value] of Object.entries(submitted.params)) {
              console.log({
                key,
                value              
              })

              const param = newData.params.find((p) => p.name === key)!;
              param.inputMode.value = value;

              console.log(`Setting ${key} to ${value}`)
            }

            n.data = newData;
          }

          return n;
        })
      );
    })()
    
    close()
  }

  useEscapeKey(close);

  const TabComponent = TAB_COMPONENTS[tab as keyof typeof TAB_COMPONENTS];

  return <>
    <div className="flex justify-center overflow-x-hidden fixed inset-0 z-50 outline-none focus:outline-none">
      <div className="relative w-full max-w-4xl my-8 mx-auto px-8">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/* ***** HEADER ***** */}
          <div className="flex items-start justify-between px-8 py-2 border-solid border-slate-200 rounded-t">
            <input
              {...form.register('label')}
              className="pr-4 bg-white mt-4 flex flex-col align-center justify-center text-lg text-gray-400 font-bold tracking widest"
            />
            <div className="cursor-pointer p-1 ml-auto text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none" onClick={close}>
              <span className="text-gray-500 h-6 w-6 text-2xl block outline-none focus:outline-none">
                ×
              </span>
            </div>
          </div>
          {/* ***** TABS ***** */}
          <div className="mx-8 flex space-x-8 text-xxs uppercase text-gray-400">           
            {Object.keys(TAB_COMPONENTS).map((key) => (
              <div
                key={key}
                onClick={() => setTab(key as TabKey)}
                className={`pb-2 hover:text-gray-500 cursor-pointer ${tab === key && 'border-b-2 border-blue-400'}`}
              >
                {pascalToSentenceCase(key)}
              </div>
            ))}
          </div>

          {/* ***** CONTENT ***** */}
          <TabComponent node={node} register={form.register} form={form}/>

          {/* ***** FOOTER ***** */}
          <div className="my-2 flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
            <button className="text-gray-500 focus:text-gray-800 background-transparent font-bold uppercase px-6 py-2 text-xs outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button" onClick={close}>
              Close
            </button>
            {<button className="bg-blue-500 focus:bg-blue-700 text-white active:bg-blue-600 font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button" onClick={saveAndClose}>
              Save
            </button>}
          </div>
        </div>
      </div>
    </div>
    <div className="opacity-25 fixed inset-0 z-40 bg-black" />
  </>;
}