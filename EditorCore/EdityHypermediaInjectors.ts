import * as client from 'edity.editorcore.EdityHypermediaClient';
import * as hyperCrud from 'hr.widgets.HypermediaCrudService';
import * as di from 'hr.di';
import * as uri from 'hr.uri';

export class DraftCrudInjector extends hyperCrud.AbstractHypermediaPageInjector {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [client.EntryPointInjector];
    }

    constructor(private injector: client.EntryPointInjector) {
        super();
    }

    async list(query: client.DraftQuery): Promise<hyperCrud.HypermediaCrudCollection> {
        var entry = await this.injector.load();
        return entry.listDrafts(query);
    }

    async canList(): Promise<boolean> {
        var entry = await this.injector.load();
        return entry.canListDrafts();
    }

    public getDeletePrompt(item: client.DraftResult): string {
        throw new Error("Delete not supported for drafts.");
    }
}

export class PageHistoryCrudInjector extends hyperCrud.AbstractHypermediaPageInjector {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [client.EntryPointInjector];
    }

    constructor(private injector: client.EntryPointInjector) {
        super();
    }

    async list(query: client.HistoryQuery): Promise<hyperCrud.HypermediaCrudCollection> {
        //Force path to be current page url
        var url = new uri.Uri();
        query.filePath = url.path;

        var entry = await this.injector.load();
        return entry.listHistory(query);
    }

    async canList(): Promise<boolean> {
        var entry = await this.injector.load();
        return entry.canListHistory();
    }

    public getDeletePrompt(item: client.HistoryResult): string {
        throw new Error("Delete not supported for history.");
    }
}