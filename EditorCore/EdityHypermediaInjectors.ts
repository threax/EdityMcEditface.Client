import * as client from 'edity.editorcore.EdityHypermediaClient';
import * as hyperCrud from 'hr.widgets.HypermediaCrudService';
import * as di from 'hr.di';

export class DraftCrudInjector implements hyperCrud.HypermediaPageInjector {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [client.EntryPointInjector];
    }

    constructor(private injector: client.EntryPointInjector) {

    }

    async list(query: any): Promise<hyperCrud.HypermediaCrudCollection> {
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