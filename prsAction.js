import { tryParse } from 'be-enhanced/cpu.js';
const reActionStatement = [
    {
        regExp: new RegExp(String.raw `^triggeredBy(?<dependencies>.*)`),
        defaultVals: {}
    }
];
export function prsAction(self) {
    //be careful about making this asynchronous due to args getting out of sync
    let { Action, instructions } = self;
    if (instructions === undefined)
        instructions = [];
    const args = [];
    const instruction = {
        args,
        isAction: true
    };
    instructions.push(instruction);
    const act0 = Action[0];
    const test = tryParse(act0, reActionStatement);
    if (test === null)
        throw 'PE'; //Parse Error
    const { dependencies } = test;
    const splitDependencies = dependencies.split(',').map(x => x.trim());
    for (const dependency of splitDependencies) {
        const type = dependency[0];
        const prop = dependency.substring(1);
        const arg = {
            type,
            prop
        };
        args.push(arg);
    }
    return {
        instructions
    };
}
