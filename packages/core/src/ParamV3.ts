import { snakeCaseToTitleCase } from './utils/snakeCaseToTitleCase'

/**
 * CASTS ****************************************
 */
export type Cast = {
  type: string,
  label: string,
  selected?: boolean,
}

export const NumberCast: Cast = {
  type: 'NumberCast',
  label: 'Number',
}

export const StringCast: Cast = {
  type: 'StringCast',
  label: 'String',
}

/**
 * EVALUATIONS ****************************************
 */
export type Evaluation = {
  type: string,
  label: string,
  selected?: boolean,
}

export const JsEvaluation: Evaluation = {
  type: 'JS',
  label: 'JS',
}

export const JsonEvaluation: Evaluation = {
  type: 'JSON',
  label: 'JSON',
}

export const HjsonEvaluation: Evaluation = {
  type: 'HJSON',
  label: 'HJSON',
}

export const evaluation = (type: string): Evaluation => {
  if(type === 'JS') {
    return JsEvaluation
  }

  if(type === 'JSON') {
    return JsonEvaluation
  }

  if(type === 'HJSON') {
    return HjsonEvaluation
  }

  throw new Error(`Unknown evaluation type: ${type}`)
}

/**
 * The mode types ****************************************
 */
export type Stringable = {
  type: 'Stringable',
  selected: boolean,
  multiline: boolean,
  canInterpolate: boolean,
  interpolate?: boolean,
  casts?: Cast[],
  evaluations?: Evaluation[],
  value: string
}

export type PropertySelection = {
  type: 'PropertySelection',
  selected: boolean,
  multiline: boolean,
  casts?: Cast[],
  value: string  
}

export type Repeatable<RepeatableRow> = {
  type: 'Repeatable',
  selected: boolean,
  row: RepeatableRow,
  value: ParamV3[]
}

export type InputMode = Stringable | PropertySelection | Repeatable<ParamV3[]>

/**
 * The param type ****************************************
 */
export type ParamV3 = {
  name: string,
  label: string,
  help: string,
  inputMode: InputMode,
  alternativeInputModes: InputMode[],
}


/**
 * SAMPLE REAL USE CASES OF PARAM IMPLEMENTATIONS ****************************************
 */
// Signal.period
const SignalPeriod: ParamV3 = {
  name: 'period',
  label: 'period',
  help: 'How many ms between each signal',
  // A mode describes how the frontend should render it
  // Further more it describes how the backend should interpret it
  inputMode: {
    type: 'Stringable',
    selected: true,
    multiline: false,
    canInterpolate: true,
    interpolate: true,
    casts: [
      {...NumberCast, selected: true}
    ],
    value: '1000',
  },
  alternativeInputModes: []
}

// ConsoleLog.message
const ConsoleLogMessage: ParamV3 = {
  name: 'message',
  label: 'message',
  help: 'What to log',
  inputMode: {
    type: 'Stringable',
    selected: true,
    multiline: false,
    canInterpolate: true,
    interpolate: true,
    evaluations: [
      JsEvaluation,
      JsonEvaluation,
      HjsonEvaluation,
    ],
    casts: [
      NumberCast,
      StringCast,
    ],
    value: '',
  },
  alternativeInputModes: [],
}

/**
 * MAP.map
 */
const MapMap: ParamV3 = {
  name: 'map',
  label: 'map',
  help: 'Create a map of keys and values',
  inputMode: {
    type: 'Repeatable',
    selected: true,
    row: [
      {
        name: 'path',
        label: 'Path',
        help: 'The key to use in the output. You may use dot separated notation to create nested properties.',
        inputMode: {
          type: 'Stringable',
          selected: true,
          multiline: false,
          canInterpolate: false,
          casts: [
            { ...StringCast, selected: true },
          ],
          value: '',
        },
        alternativeInputModes: [],
      },
      {
        name: 'value',
        label: 'Value',
        help: 'The value to use in the output',
        inputMode: {
          type: 'Stringable',
          selected: true,
          multiline: false,
          canInterpolate: true,
          interpolate: true,
          evaluations: [
            JsEvaluation,
            JsonEvaluation,
            HjsonEvaluation,
          ],              
          casts: [
            NumberCast,
            StringCast,
          ],
          value: '',
        },
        alternativeInputModes: [
          {
            type: 'PropertySelection',
            selected: false,
            multiline: false,
            casts: [
              NumberCast,
              StringCast,
            ],
            value: '',
          }
        ],
      },
    ],
    value: [],
  },
  alternativeInputModes: [],
}

// quick param builders

// Provides a param with sensible defaults
export const param = ({
  name,
  label,
  help,
  inputMode,
}: {
  name: string,
  label?: string,
  help?: string,
  inputMode?: {
    type?: 'Stringable',
    multiline?: boolean,
    canInterpolate?: boolean,
    interpolate?: boolean,
    casts?: Cast[],
    evaluations?: Evaluation[],
    value?: string,
  }
}): ParamV3 => {
  return {
    name,
    label: label || snakeCaseToTitleCase(name),
    help: help || '',
    inputMode: {
      type: 'Stringable',
      selected: true,
      multiline: inputMode?.multiline || false,
      canInterpolate: inputMode?.canInterpolate || true,
      interpolate: inputMode?.interpolate || true,
      casts: inputMode?.casts || [], 
      value: inputMode?.value || '',
    },
    alternativeInputModes: [],
  }
}

export const str = ({
  name,
  label,
  help,
  multiline,
  canInterpolate,
  interpolate,
  evaluations,
  value,
}: {
  name: string,
  label?: string,
  help?: string,
  multiline?: boolean,
  canInterpolate?: boolean,
  interpolate?: boolean,
  evaluations?: Evaluation[],
  value?: string,
}): ParamV3 => {
  return param({
    name,
    label,
    inputMode: {
      multiline: multiline,
      canInterpolate: canInterpolate,
      interpolate: interpolate,
      evaluations: evaluations,
      casts: [
        { ...StringCast, selected: true },
      ],
      value: value,
    }
  })
}

export const num = ({
  name,
  label,
  help,
  multiline,
  canInterpolate,
  interpolate,
  evaluations,
  value,
}: {
  name: string,
  label?: string,
  help?: string,
  multiline?: boolean,
  canInterpolate?: boolean,
  interpolate?: boolean,
  evaluations?: Evaluation[],
  value?: string,
}): ParamV3 => {
  return param({
    name,
    label,
    inputMode: {
      multiline: multiline,
      canInterpolate: canInterpolate,
      interpolate: interpolate,
      evaluations: evaluations,
      casts: [
        { ...NumberCast, selected: true },
      ],
      value: value,
    }
  })
}

export const json_ = ({
  name,
  label,
  help,
  multiline,
  canInterpolate,
  interpolate,
  evaluations,
  value,
}: {
  name: string,
  label?: string,
  help?: string,
  multiline?: boolean,
  canInterpolate?: boolean,
  interpolate?: boolean,
  evaluations?: Evaluation[],
  value?: string,
}): ParamV3 => {
  return param({
    name,
    label,
    inputMode: {
      multiline: multiline,
      canInterpolate: canInterpolate,
      interpolate: interpolate,
      casts: [],
      evaluations: evaluations || [
        { ...JsonEvaluation, selected: true}
      ],
      value: value,
    }
  })
}