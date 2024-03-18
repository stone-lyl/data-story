import { Param, ParamValue, RepeatableParam } from '../Param';
import { ItemValue } from '../types/ItemValue';
import { ParamsValueEvaluator } from '../types/ParamsValueEvaluator';

export class RepeatableParamEvaluator implements ParamsValueEvaluator<RepeatableParam<any>> {

  type = 'RepeatableParam' as const;

  constructor(private evaluator: ParamsValueEvaluator<any>) {
  }

  evaluate(itemValue: ItemValue, param: RepeatableParam<any>) {
    return param.value.map((formVal: Record<string, unknown> ) => {
      const result = Object.fromEntries(param.row.map((row: Param) => {
        const rowParam = {...row, value: formVal[row.name] as ParamValue};
        return [row.name, this.evaluator.evaluate(itemValue, rowParam)] as const;
      }));

      return {
        ...formVal,
        ...result
      };
    });
  }

  canEvaluate(param: Param): param is RepeatableParam<any> {
    return param.type === this.type;
  }
}
