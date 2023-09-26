import { BE, propDefaults, propInfo } from 'be-enhanced/BE.js';
import { XE } from 'xtal-element/XE.js';
import { register } from 'be-hive/register.js';
export class BeFor extends BE {
    static get beConfig() {
        return {
            parse: true,
            parseAndCamelize: true,
            isParsedProp: 'isParsed'
        };
    }
    async onValues(self) {
        //TODO:  cache like be-switched
        const { prsValue } = await import('./prsValue.js');
        const parsed = await prsValue(self);
        return parsed;
    }
    async importSymbols(self) {
        import('be-exportable/be-exportable.js');
        const { scriptRef, enhancedElement, nameOfFormula } = self;
        const { findRealm } = await import('trans-render/lib/findRealm.js');
        const target = await findRealm(enhancedElement, scriptRef);
        if (target === null)
            throw 404;
        if (!target.src) {
            const { rewrite } = await import('./rewrite.js');
            rewrite(self, target);
        }
        const exportable = await target.beEnhanced.whenResolved('be-exportable');
        return {
            formulaEvaluator: exportable.exports[nameOfFormula]
        };
    }
}
const tagName = 'be-for';
const ifWantsToBe = 'for';
const upgrade = '*';
const xe = new XE({
    config: {
        tagName,
        isEnh: true,
        propDefaults: {
            ...propDefaults,
            scriptRef: 'previousElementSibling',
            nameOfFormula: 'formula'
        },
        propInfo: {
            ...propInfo
        },
        actions: {
            onValues: 'Value',
            importSymbols: {
                ifAllOf: ['isParsed', 'nameOfFormula', 'args', 'scriptRef']
            }
        }
    },
    superclass: BeFor
});
register(ifWantsToBe, upgrade, tagName);
