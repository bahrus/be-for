import { tryParse } from 'be-enhanced/cpu.js';
const reValueStatement = [
    {
        regExp: new RegExp(String.raw `^basedOn(?<dependencies>.*)`),
        defaultVals: {}
    }
];
export async function prsValue(self) {
    const { Value } = self;
    const val0 = Value[0];
    const test = tryParse(val0, reValueStatement);
    if (test === null)
        throw 'PE'; //Parse Error
    const { dependencies } = test;
    const splitDependencies = dependencies.split(',').map(x => x.trim());
    const args = [];
    for (const dependency of splitDependencies) {
        const type = dependency[0];
        const prop = dependency.substring(1);
        const arg = {
            type,
            prop
        };
        args.push(arg);
    }
    //console.log({test, splitDependencies});
    return {
        args
    };
}
