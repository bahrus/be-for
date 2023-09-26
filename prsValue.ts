import {AP, ProPAP, PAP, ParsedValueStatement} from './types';
import {RegExpOrRegExpExt} from 'be-enhanced/types';
import {arr, tryParse} from 'be-enhanced/cpu.js';

const reValueStatement: RegExpOrRegExpExt<ParsedValueStatement>[] = [
    {
        regExp: new RegExp(String.raw `^basedOn(?<dependencies>.*)`),
        defaultVals: {}
    }
]
export async function prsValue(self: AP) : ProPAP {
    const {Value} = self;
    const val0 = Value![0];
    const test = tryParse(val0, reValueStatement) as ParsedValueStatement;
    if(test === null) throw 'PE'; //Parse Error
    const {dependencies} = test;
    const splitDependencies = dependencies!.split(',').map(x => x.trim());
    console.log({test, splitDependencies});
    return {

    }
}