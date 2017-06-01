import * as hal from 'hr.halcyon.EndpointClient';
import { Fetcher } from 'hr.fetcher';

export class DraftResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: Draft = undefined;
    public get data(): Draft {
        this.strongData = this.strongData || this.client.GetData<Draft>();
        return this.strongData;
    }

    public submitLatestDraft() {
        return this.client.LoadLink("SubmitLatestDraft")
            .then(r => {
                return r;
            });
    }

    public canSubmitLatestDraft(): boolean {
        return this.client.HasLink("SubmitLatestDraft");
    }
}

export class DraftCollectionResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: DraftCollection = undefined;
    public get data(): DraftCollection {
        this.strongData = this.strongData || this.client.GetData<DraftCollection>();
        return this.strongData;
    }

    private strongItems: DraftResult[];
    public get items(): DraftResult[] {
        if (this.strongItems === undefined) {
            var embeds = this.client.GetEmbed("values");
            var clients = embeds.GetAllClients();
            this.strongItems = [];
            for (var i = 0; i < clients.length; ++i) {
                this.strongItems.push(new DraftResult(clients[i]));
            }
        }
        return this.strongItems;
    }

    public refresh(): Promise<DraftCollectionResult> {
        return this.client.LoadLink("self")
            .then(r => {
                return new DraftCollectionResult(r);
            });
    }

    public canRefresh(): boolean {
        return this.client.HasLink("self");
    }

    public getRefreshDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("self")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasRefreshDocs(): boolean {
        return this.client.HasLinkDoc("self");
    }
}

export class EntryPointInjector {
    private url: string;
    private fetcher: Fetcher;
    private instance: Promise<EntryPointResult>;

    constructor(url: string, fetcher: Fetcher) {
        this.url = url;
        this.fetcher = fetcher;
    }

    public load(): Promise<EntryPointResult> {
        if (!this.instance) {
            this.instance = EntryPointResult.Load(this.url, this.fetcher);
        }

        return this.instance;
    }
}

export class EntryPointResult {
    private client: hal.HalEndpointClient;

    public static Load(url: string, fetcher: Fetcher): Promise<EntryPointResult> {
        return hal.HalEndpointClient.Load({
            href: url,
            method: "GET"
        }, fetcher)
            .then(c => {
                return new EntryPointResult(c);
            });
    }

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: EntryPoint = undefined;
    public get data(): EntryPoint {
        this.strongData = this.strongData || this.client.GetData<EntryPoint>();
        return this.strongData;
    }

    public refresh(): Promise<EntryPointResult> {
        return this.client.LoadLink("self")
            .then(r => {
                return new EntryPointResult(r);
            });
    }

    public canRefresh(): boolean {
        return this.client.HasLink("self");
    }

    public getRefreshDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("self")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasRefreshDocs(): boolean {
        return this.client.HasLinkDoc("self");
    }

    public listPhases(): Promise<PhaseCollectionResult> {
        return this.client.LoadLink("ListPhases")
            .then(r => {
                return new PhaseCollectionResult(r);
            });
    }

    public canListPhases(): boolean {
        return this.client.HasLink("ListPhases");
    }

    public getListPhasesDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("ListPhases")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasListPhasesDocs(): boolean {
        return this.client.HasLinkDoc("ListPhases");
    }

    public listDrafts(query: DraftQuery): Promise<DraftCollectionResult> {
        return this.client.LoadLinkWithQuery("ListDrafts", query)
            .then(r => {
                return new DraftCollectionResult(r);
            });
    }

    public canListDrafts(): boolean {
        return this.client.HasLink("ListDrafts");
    }

    public getListDraftsDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("ListDrafts")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasListDraftsDocs(): boolean {
        return this.client.HasLinkDoc("ListDrafts");
    }
}

export class PhaseResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: Phase = undefined;
    public get data(): Phase {
        this.strongData = this.strongData || this.client.GetData<Phase>();
        return this.strongData;
    }

    public setPhase() {
        return this.client.LoadLink("SetPhase")
            .then(r => {
                return r;
            });
    }

    public canSetPhase(): boolean {
        return this.client.HasLink("SetPhase");
    }
}

export class PhaseCollectionResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: PhaseCollection = undefined;
    public get data(): PhaseCollection {
        this.strongData = this.strongData || this.client.GetData<PhaseCollection>();
        return this.strongData;
    }

    private strongItems: PhaseResult[];
    public get items(): PhaseResult[] {
        if (this.strongItems === undefined) {
            var embeds = this.client.GetEmbed("values");
            var clients = embeds.GetAllClients();
            this.strongItems = [];
            for (var i = 0; i < clients.length; ++i) {
                this.strongItems.push(new PhaseResult(clients[i]));
            }
        }
        return this.strongItems;
    }

    public refresh(): Promise<PhaseCollectionResult> {
        return this.client.LoadLink("self")
            .then(r => {
                return new PhaseCollectionResult(r);
            });
    }

    public canRefresh(): boolean {
        return this.client.HasLink("self");
    }

    public getRefreshDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("self")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasRefreshDocs(): boolean {
        return this.client.HasLinkDoc("self");
    }
}
export interface Draft {
    file?: string;
}
export interface DraftCollection {
    offset?: number;
    limit?: number;
    total?: number;
}
export interface DraftQuery {
    file?: string;
    /** The number of pages (item number = Offset * Limit) into the collection to query. */
    offset?: number;
    /** The limit of the number of items to return. */
    limit?: number;
}
export interface EntryPoint {
}
export interface PhaseCollection {
}
export interface Phase {
    name?: string;
    current?: boolean;
}

