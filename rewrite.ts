import {AP} from './types';

export function rewrite({enhancedElement, nameOfFormula, args}: AP, scriptEl: HTMLScriptElement){
    const inner = scriptEl.innerHTML.trim();
    if(inner.indexOf('=>') === -1){
        // const strArgs: string[] = [];
        // instance.getStringArgs(args, strArgs);
        const str = `export const ${nameOfFormula} = async ({${args!.map(x => x.prop).join(',')}}) => ({
            value: ${inner}
        })`;
        scriptEl.innerHTML = str
    }else if(!inner.startsWith(`export const ${nameOfFormula} = async `)){
        scriptEl.innerHTML = `export const ${nameOfFormula} = async ` + inner;
    }
}