import { ActionOnEventConfigs } from "trans-render/froop/types";
import {IBE} from 'be-enhanced/types';
import {Target, Scope, ProxyPropChangeInfo} from 'trans-render/lib/types';

export interface EndUserProps extends IBE{
    Value?: Array<ValueStatement>;
    scriptRef?: Target,
    nameOfFormula?: string,

}

//copied from be-switched.  Share from trans-render?
export type Types = '$' | '#' | '@' | '/';

export interface AllProps extends EndUserProps{
    isParsed?: boolean;
    formulaEvaluator?: (vals: any) => any;
}

export type ValueStatement = string;

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export type POA = [PAP | undefined, ActionOnEventConfigs<PAP, Actions>];

export interface Actions{
    onValues(self: this): ProPAP;
    importSymbols(self: this): ProPAP;
}

export interface ParsedValueStatement{
    dependencies: string,
}