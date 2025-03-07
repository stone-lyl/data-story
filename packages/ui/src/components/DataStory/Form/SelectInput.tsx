import { Param, SelectParam } from '@data-story/core';
import { FormFieldWrapper, useFormField } from './UseFormField';
import { FormComponent, FormComponentProps } from '../types';

function SelectInputComponent({
  param,
}: {
  param: SelectParam
}) {
  const { register } = useFormField();

  return (
    <div className="flex w-full text-gray-500">
      <select className="bg-gray-50 text-xs px-2 py-2 w-full"
        {...register()}
      >
        {param.options.map((option) => {
          return <option
            value={option.value}
            key={option.value}
          >{option.label}</option>
        })}
      </select>

    </div>
  );
}

export function SelectInput({
  param,
}: {
  param: SelectParam
}) {
  return (<FormFieldWrapper fieldName={param.name}>
    <SelectInputComponent param={param} />
  </FormFieldWrapper>);
}

export class SelectComponent implements FormComponent<Param>{
  getComponent(params: FormComponentProps) {
    return (<SelectInput param={params.param as SelectParam} />);
  };

  getType() {
    return 'SelectParam';
  }
}
