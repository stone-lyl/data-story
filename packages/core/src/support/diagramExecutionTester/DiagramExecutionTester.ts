import { expect } from 'vitest';
import { Diagram } from '../../Diagram';
import { ExecutionUpdate } from '../../types/ExecutionUpdate';
import { ExecutorFactory } from '../../ExecutorFactory';
import { core } from '../../core';

export const whenRunning = (diagram: Diagram) => {
  return new DiagramExecutionTester(diagram)
}

export class DiagramExecutionTester {
  shouldExpectSuccess: boolean = true
  shouldExpectFailMessage: string | undefined

  constructor(public diagram: Diagram) {}

  async ok() {
    await core.boot()
    const executor = ExecutorFactory.create({
      diagram: this.diagram,
      registry: core.getRegistry(),
    })

    const execution = executor.execute()

    const updates: ExecutionUpdate[] = []
    let succeeded: boolean;
    let errorMessage: string | undefined;

    try {
      // Run the execution
      for await(const update of execution) {
        updates.push(update)
      }

      // We came here, so the execution was successful
      succeeded = true
    } catch(error) {
      // We came here, so the execution failed
      succeeded = false
      errorMessage = (error as Error).message
    }

    // Ensure the outcome is what the tester expected
    expect(succeeded).toBe(this.shouldExpectSuccess);

    // Ensure specific error message
    if(this.shouldExpectFailMessage) {
      expect(errorMessage).toBe(this.shouldExpectFailMessage)
    }
  }

  expectFail(message?: string) {
    this.shouldExpectSuccess = false
    this.shouldExpectFailMessage = message

    return this
  }

  expectSuccess() {
    this.shouldExpectSuccess = true

    return this
  }
}
