import * as pageConfig from 'htmlrapier/src/pageconfig';

interface Config {
    editSettings?: {};
}

var config = undefined;

export function IsEditMode(): boolean {
    if(config === undefined){
        var config = pageConfig.read<Config>();
    }
    return config.editSettings !== undefined;
}