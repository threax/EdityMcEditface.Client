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

    public refresh(): Promise<DraftResult> {
        return this.client.LoadLink("self")
               .then(r => {
                    return new DraftResult(r);
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

    public submitLatestDraft() {
        return this.client.LoadLink("SubmitLatestDraft")
               .then(r => {
                    return r;
                });
    }

    public canSubmitLatestDraft(): boolean {
        return this.client.HasLink("SubmitLatestDraft");
    }

    public submitAllDrafts() {
        return this.client.LoadLink("SubmitAllDrafts")
               .then(r => {
                    return r;
                });
    }

    public canSubmitAllDrafts(): boolean {
        return this.client.HasLink("SubmitAllDrafts");
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
        if(this.strongItems === undefined){
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

    public next(): Promise<DraftCollectionResult> {
        return this.client.LoadLink("next")
               .then(r => {
                    return new DraftCollectionResult(r);
                });
    }

    public canNext(): boolean {
        return this.client.HasLink("next");
    }

    public getNextDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("next")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasNextDocs(): boolean {
        return this.client.HasLinkDoc("next");
    }

    public previous(): Promise<DraftCollectionResult> {
        return this.client.LoadLink("previous")
               .then(r => {
                    return new DraftCollectionResult(r);
                });
    }

    public canPrevious(): boolean {
        return this.client.HasLink("previous");
    }

    public getPreviousDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("previous")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasPreviousDocs(): boolean {
        return this.client.HasLinkDoc("previous");
    }

    public first(): Promise<DraftCollectionResult> {
        return this.client.LoadLink("first")
               .then(r => {
                    return new DraftCollectionResult(r);
                });
    }

    public canFirst(): boolean {
        return this.client.HasLink("first");
    }

    public getFirstDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("first")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasFirstDocs(): boolean {
        return this.client.HasLinkDoc("first");
    }

    public last(): Promise<DraftCollectionResult> {
        return this.client.LoadLink("last")
               .then(r => {
                    return new DraftCollectionResult(r);
                });
    }

    public canLast(): boolean {
        return this.client.HasLink("last");
    }

    public getLastDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("last")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasLastDocs(): boolean {
        return this.client.HasLinkDoc("last");
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

    public submitAllDrafts() {
        return this.client.LoadLink("SubmitAllDrafts")
               .then(r => {
                    return r;
                });
    }

    public canSubmitAllDrafts(): boolean {
        return this.client.HasLink("SubmitAllDrafts");
    }

    public commit(data: NewCommit) {
        return this.client.LoadLinkWithBody("Commit", data)
               .then(r => {
                    return r;
                });
    }

    public canCommit(): boolean {
        return this.client.HasLink("Commit");
    }

    public getCommitDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("Commit")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasCommitDocs(): boolean {
        return this.client.HasLinkDoc("Commit");
    }

    public getUncommittedChanges(): Promise<UncommittedChangeCollectionResult> {
        return this.client.LoadLink("GetUncommittedChanges")
               .then(r => {
                    return new UncommittedChangeCollectionResult(r);
                });
    }

    public canGetUncommittedChanges(): boolean {
        return this.client.HasLink("GetUncommittedChanges");
    }

    public getGetUncommittedChangesDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("GetUncommittedChanges")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasGetUncommittedChangesDocs(): boolean {
        return this.client.HasLinkDoc("GetUncommittedChanges");
    }

    public beginSync(): Promise<SyncInfoResult> {
        return this.client.LoadLink("BeginSync")
               .then(r => {
                    return new SyncInfoResult(r);
                });
    }

    public canBeginSync(): boolean {
        return this.client.HasLink("BeginSync");
    }

    public getBeginSyncDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("BeginSync")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasBeginSyncDocs(): boolean {
        return this.client.HasLinkDoc("BeginSync");
    }
}

export class DiffInfoResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: DiffInfo = undefined;
    public get data(): DiffInfo {
        this.strongData = this.strongData || this.client.GetData<DiffInfo>();
        return this.strongData;
    }

    public refresh(): Promise<DiffInfoResult> {
        return this.client.LoadLink("self")
               .then(r => {
                    return new DiffInfoResult(r);
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

export class SyncInfoResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: SyncInfo = undefined;
    public get data(): SyncInfo {
        this.strongData = this.strongData || this.client.GetData<SyncInfo>();
        return this.strongData;
    }

    public refresh(): Promise<SyncInfoResult> {
        return this.client.LoadLink("self")
               .then(r => {
                    return new SyncInfoResult(r);
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

    public pull() {
        return this.client.LoadLink("Pull")
               .then(r => {
                    return r;
                });
    }

    public canPull(): boolean {
        return this.client.HasLink("Pull");
    }

    public push() {
        return this.client.LoadLink("Push")
               .then(r => {
                    return r;
                });
    }

    public canPush(): boolean {
        return this.client.HasLink("Push");
    }
}

export class UncommittedChangeResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: UncommittedChange = undefined;
    public get data(): UncommittedChange {
        this.strongData = this.strongData || this.client.GetData<UncommittedChange>();
        return this.strongData;
    }

    public getUncommittedDiff(): Promise<DiffInfoResult> {
        return this.client.LoadLink("GetUncommittedDiff")
               .then(r => {
                    return new DiffInfoResult(r);
                });
    }

    public canGetUncommittedDiff(): boolean {
        return this.client.HasLink("GetUncommittedDiff");
    }

    public getGetUncommittedDiffDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("GetUncommittedDiff")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasGetUncommittedDiffDocs(): boolean {
        return this.client.HasLinkDoc("GetUncommittedDiff");
    }

    public revert() {
        return this.client.LoadLink("Revert")
               .then(r => {
                    return r;
                });
    }

    public canRevert(): boolean {
        return this.client.HasLink("Revert");
    }
}

export class UncommittedChangeCollectionResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: UncommittedChangeCollection = undefined;
    public get data(): UncommittedChangeCollection {
        this.strongData = this.strongData || this.client.GetData<UncommittedChangeCollection>();
        return this.strongData;
    }

    private strongItems: UncommittedChangeResult[];
    public get items(): UncommittedChangeResult[] {
        if(this.strongItems === undefined){
            var embeds = this.client.GetEmbed("values");
            var clients = embeds.GetAllClients();
            this.strongItems = [];
            for (var i = 0; i < clients.length; ++i) {
                this.strongItems.push(new UncommittedChangeResult(clients[i]));
            }
        }
        return this.strongItems;
    }

    public refresh(): Promise<UncommittedChangeCollectionResult> {
        return this.client.LoadLink("self")
               .then(r => {
                    return new UncommittedChangeCollectionResult(r);
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
        if(this.strongItems === undefined){
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
//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v9.1.0.0 (http://NJsonSchema.org)
// </auto-generated>
//----------------------





/** This enum captures the current status of a draft. */
export enum DraftStatus {
    UndraftedEdits = <any>"UndraftedEdits", 
    NeverDrafted = <any>"NeverDrafted", 
    UpToDate = <any>"UpToDate", 
}

export interface Draft {
    lastUpdate?: Date;
    status?: string;
    file?: string;
    title?: string;
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

export interface NewCommit {
    message?: string;
}

export interface UncommittedChangeCollection {
}

export interface History {
    message?: string;
    sha?: string;
    name?: string;
    email?: string;
    when?: Date;
}

export interface SyncInfo {
    aheadBy?: number;
    behindBy?: number;
    aheadHistory?: History[];
    behindHistory?: History[];
}

export interface DiffInfo {
    filePath?: string;
    original?: string;
    changed?: string;
}

/** A verision of FileStatus from git with ambiguity removed */
export enum GitFileStatus {
    Nonexistent = <any>"Nonexistent", 
    Unaltered = <any>"Unaltered", 
    Added = <any>"Added", 
    Removed = <any>"Removed", 
    Renamed = <any>"Renamed", 
    Modified = <any>"Modified", 
    Unreadable = <any>"Unreadable", 
    Ignored = <any>"Ignored", 
    Conflicted = <any>"Conflicted", 
}

export interface UncommittedChange {
    filePath?: string;
    state?: string;
}

export interface Phase {
    name?: string;
    current?: boolean;
}

