/**
 * Some services are written in an older style, this class shims some settings
 * to that older style. It can be removed when we move this system fully to hypermedia.
 */
export abstract class IBaseUrlInjector {
    abstract get BaseUrl();
}

export class BaseUrlInjector implements IBaseUrlInjector {
    //Page Start
    constructor(private baseUrl: string) {
        
    }

    get BaseUrl(): string {
        return this.baseUrl;
    }
}