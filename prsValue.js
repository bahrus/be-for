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
    console.log({ test, splitDependencies });
    return {};
}
