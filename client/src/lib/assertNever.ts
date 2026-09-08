// Exhaustiveness guard. If a new PostType is added and a switch/branch chain
// forgets to handle it, `value` is no longer `never` and this stops compiling.
export const assertNever = (value: never): never => {
  throw new Error(`Unhandled discriminated case: ${JSON.stringify(value)}`);
};
