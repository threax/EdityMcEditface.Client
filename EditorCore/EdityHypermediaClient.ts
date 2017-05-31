import * as hal from 'hr.halcyon.EndpointClient';
import { Fetcher } from 'hr.fetcher';

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

    public listBranches(): Promise<BranchViewCollectionResult> {
        return this.client.LoadLink("ListBranches")
            .then(r => {
                return new BranchViewCollectionResult(r);
            });
    }

    public canListBranches(): boolean {
        return this.client.HasLink("ListBranches");
    }

    public getListBranchesDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("ListBranches")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasListBranchesDocs(): boolean {
        return this.client.HasLinkDoc("ListBranches");
    }
}

export class BranchViewResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: BranchView = undefined;
    public get data(): BranchView {
        this.strongData = this.strongData || this.client.GetData<BranchView>();
        return this.strongData;
    }

    public setBranch() {
        return this.client.LoadLink("SetBranch")
            .then(r => {
                return r;
            });
    }

    public canSetBranch(): boolean {
        return this.client.HasLink("SetBranch");
    }
}

export class BranchViewCollectionResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: BranchViewCollection = undefined;
    public get data(): BranchViewCollection {
        this.strongData = this.strongData || this.client.GetData<BranchViewCollection>();
        return this.strongData;
    }

    private strongItems: BranchViewResult[];
    public get items(): BranchViewResult[] {
        if (this.strongItems === undefined) {
            var embeds = this.client.GetEmbed("values");
            var clients = embeds.GetAllClients();
            this.strongItems = [];
            for (var i = 0; i < clients.length; ++i) {
                this.strongItems.push(new BranchViewResult(clients[i]));
            }
        }
        return this.strongItems;
    }

    public refresh(): Promise<BranchViewCollectionResult> {
        return this.client.LoadLink("self")
            .then(r => {
                return new BranchViewCollectionResult(r);
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
export interface EntryPoint {
}
export interface BranchViewCollection {
}
export interface BranchView {
    name?: string;
    current?: boolean;
}

