import {BE, propDefaults, propInfo} from 'be-enhanced/BE.js';
import {BEConfig} from 'be-enhanced/types';
import {XE} from 'xtal-element/XE.js';
import {Actions, AllProps, AP, PAP, ProPAP, POA} from './types';
import {register} from 'be-hive/register.js';
import {AllProps as  BeExportableAllProps} from 'be-exportable/types';

export class BeFor extends BE<AP, Actions> implements Actions{
    static override get beConfig(){
        return {
            parse: true,
            parseAndCamelize: true,
            isParsedProp: 'isParsed'
        } as BEConfig
    }

    async onValues(self: this) {
        const {} = await import('./prsValue.js');
        return {

        } as PAP
    }

    async importSymbols(self: this): ProPAP {
        import('be-exportable/be-exportable.js');
        const {scriptRef, enhancedElement, nameOfFormula} = self;
        const {findRealm} = await import('trans-render/lib/findRealm.js');
        const target = await findRealm(enhancedElement, scriptRef!) as HTMLScriptElement | null;
        if(target === null) throw 404;
        if(!target.src){
            const {rewrite} = await import('./rewrite.js');
            rewrite(self, target);
        }
        const exportable = await (<any>target).beEnhanced.whenResolved('be-exportable') as BeExportableAllProps;
        return {
            formulaEvaluator: exportable.exports[nameOfFormula!]
        }
    }
}

export interface BeFor extends AllProps{}

const tagName = 'be-for';
const ifWantsToBe = 'for'
const upgrade = '*';

const xe = new XE<AP, Actions>({
   config: {
        tagName,
        isEnh: true,
        propDefaults:{
            ...propDefaults,
            scriptRef: 'previousElementSibling',
            nameOfFormula: 'formula'
        },
        propInfo: {
            ...propInfo
        },
        actions:{

        }
   },
   superclass: BeFor
});

register(ifWantsToBe, upgrade, tagName);

