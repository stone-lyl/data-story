import { jsFunctionEvaluation } from '../Param/evaluations/jsFunctionEvaluation';
import { jsExpressionEvaluation } from '../Param/evaluations/jsExpressionEvaluation'
import { when } from '../support/computerTester/ComputerTester';
import { multiline } from '../utils/multiline';
import { Create } from './Create';

it('reads json by default', async () => {
  await when(Create)
    .hasParams({ data: JSON.stringify([{ a: 1 }]) })
    .doRun()
    .expectOutput([{ a: 1 }])
    .ok()
})

it('wraps non array inputs', async () => {
  await when(Create)
    .hasParams({ data: JSON.stringify({ a: 1 }) })
    .doRun()
    .expectOutput([{ a: 1 }])
    .ok()
})

it('can parse js function', async () => {
  await when(Create)
    .hasParam({
      name: 'data',
      input: {
        rawValue: '() => ({ sum: 1 + 1 })',
        Evaluation: 'JS_FUNCTION',
      },
      evaluations: [
        { ...jsFunctionEvaluation, selected: true },
      ],
    })
    .doRun()
    .expectOutput([{ sum: 2 }])
    .ok()
})

it('can parse js expression', async () => {
  await when(Create)
    .hasParam({
      name: 'data',
      input: {
        rawValue: multiline`
      ({
        interesting: 'yes'
      })`,
        Evaluation: 'JS_EXPRESSION',
      },
      evaluations: [
        { ...jsExpressionEvaluation, selected: true },
      ],
    })
    .doRun()
    .expectOutput([{ interesting: 'yes' }])
    .ok()
})

it('can directly parse js objects starting with bracket', async () => {
  await when(Create)
    .hasParam({
      name: 'data',
      input: {
        rawValue: multiline`
      {
        label: 'statement'
      }`,
        Evaluation: 'JS_EXPRESSION',
      },
      evaluations: [
        { ...jsExpressionEvaluation, selected: true },
      ],
    })
    .doRun()
    .expectOutput([ {
      label: 'statement',
    }])
    .ok()
})
