import * as bootstrap from 'hr.bootstrap.all';
import { AccessTokenManager } from 'hr.accesstokens';
import { Fetcher } from 'hr.fetcher';
import { CacheBuster } from 'hr.cachebuster';
import { WindowFetch } from 'hr.windowfetch';
import { WithCredentialsFetcher } from 'edity.editorcore.WithCredentialsFetcher';
import { CompilerService } from 'edity.editorcore.CompileService';
import * as di from 'hr.di';

interface PageSettings {
    baseUrl;
}

export function addServices(services: di.ServiceCollection) {
    bootstrap.activate();

    services.tryAddSingleton(Fetcher, s => new WithCredentialsFetcher(new CacheBuster(new WindowFetch())));
    services.tryAddSingleton(IBackwardCompatPageStart, EditorPageStart);
}

/**
 * Some services are written in an older style, this class shims some settings
 * to that older style. It can be removed when we move this system fully to hypermedia.
 */
export abstract class IBackwardCompatPageStart {
    abstract get BaseUrl();
    abstract get CompilerService();
}

class EditorPageStart extends IBackwardCompatPageStart{
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [Fetcher];
    }

    //Configuration
    private compilerService: CompilerService;

    //Page Start
    constructor(private fetcher: Fetcher) {
        super();
        this.compilerService = new CompilerService(this.BaseUrl, this.fetcher);
    }

    get BaseUrl(): string {
        var pageSettings = <PageSettings>(<any>window).editPageSettings;
        if (pageSettings) {
            return pageSettings.baseUrl;
        }
        return "";
    }

    get CompilerService(): CompilerService {
        return this.compilerService;
    }
}