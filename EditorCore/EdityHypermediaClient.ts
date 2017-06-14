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

    public listPageHistory(query: HistoryQuery): Promise<HistoryCollectionResult> {
        return this.client.LoadLinkWithQuery("ListPageHistory", query)
            .then(r => {
                return new HistoryCollectionResult(r);
            });
    }

    public canListPageHistory(): boolean {
        return this.client.HasLink("ListPageHistory");
    }

    public getListPageHistoryDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("ListPageHistory")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasListPageHistoryDocs(): boolean {
        return this.client.HasLinkDoc("ListPageHistory");
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

export class DraftEntryPointInjector {
    private url: string;
    private fetcher: Fetcher;
    private instance: Promise<DraftEntryPointResult>;

    constructor(url: string, fetcher: Fetcher) {
        this.url = url;
        this.fetcher = fetcher;
    }

    public load(): Promise<DraftEntryPointResult> {
        if (!this.instance) {
            this.instance = DraftEntryPointResult.Load(this.url, this.fetcher);
        }

        return this.instance;
    }
}

export class DraftEntryPointResult {
    private client: hal.HalEndpointClient;

    public static Load(url: string, fetcher: Fetcher): Promise<DraftEntryPointResult> {
        return hal.HalEndpointClient.Load({
            href: url,
            method: "GET"
        }, fetcher)
            .then(c => {
                return new DraftEntryPointResult(c);
            });
    }

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: DraftEntryPoint = undefined;
    public get data(): DraftEntryPoint {
        this.strongData = this.strongData || this.client.GetData<DraftEntryPoint>();
        return this.strongData;
    }

    public refresh(): Promise<DraftEntryPointResult> {
        return this.client.LoadLink("self")
            .then(r => {
                return new DraftEntryPointResult(r);
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

    public beginDraft(): Promise<DraftEntryPointResult> {
        return this.client.LoadLink("BeginDraft")
            .then(r => {
                return new DraftEntryPointResult(r);
            });
    }

    public canBeginDraft(): boolean {
        return this.client.HasLink("BeginDraft");
    }

    public getBeginDraftDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("BeginDraft")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasBeginDraftDocs(): boolean {
        return this.client.HasLinkDoc("BeginDraft");
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

    public publishStatus(): Promise<CompilerStatusResult> {
        return this.client.LoadLink("PublishStatus")
            .then(r => {
                return new CompilerStatusResult(r);
            });
    }

    public canPublishStatus(): boolean {
        return this.client.HasLink("PublishStatus");
    }

    public getPublishStatusDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("PublishStatus")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasPublishStatusDocs(): boolean {
        return this.client.HasLinkDoc("PublishStatus");
    }

    public compile(): Promise<CompilerResultResult> {
        return this.client.LoadLink("Compile")
            .then(r => {
                return new CompilerResultResult(r);
            });
    }

    public canCompile(): boolean {
        return this.client.HasLink("Compile");
    }

    public getCompileDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("Compile")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasCompileDocs(): boolean {
        return this.client.HasLinkDoc("Compile");
    }

    public listHistory(query: HistoryQuery): Promise<HistoryCollectionResult> {
        return this.client.LoadLinkWithQuery("ListHistory", query)
            .then(r => {
                return new HistoryCollectionResult(r);
            });
    }

    public canListHistory(): boolean {
        return this.client.HasLink("ListHistory");
    }

    public getListHistoryDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("ListHistory")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasListHistoryDocs(): boolean {
        return this.client.HasLinkDoc("ListHistory");
    }

    public getMergeInfo(query: MergeQuery): Promise<MergeInfoResult> {
        return this.client.LoadLinkWithQuery("GetMergeInfo", query)
            .then(r => {
                return new MergeInfoResult(r);
            });
    }

    public canGetMergeInfo(): boolean {
        return this.client.HasLink("GetMergeInfo");
    }

    public getGetMergeInfoDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("GetMergeInfo")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasGetMergeInfoDocs(): boolean {
        return this.client.HasLinkDoc("GetMergeInfo");
    }
}

export class HistoryResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: History = undefined;
    public get data(): History {
        this.strongData = this.strongData || this.client.GetData<History>();
        return this.strongData;
    }

    public getEntryPoint(): Promise<EntryPointResult> {
        return this.client.LoadLink("GetEntryPoint")
            .then(r => {
                return new EntryPointResult(r);
            });
    }

    public canGetEntryPoint(): boolean {
        return this.client.HasLink("GetEntryPoint");
    }

    public getGetEntryPointDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("GetEntryPoint")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasGetEntryPointDocs(): boolean {
        return this.client.HasLinkDoc("GetEntryPoint");
    }
}

export class HistoryCollectionResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: HistoryCollection = undefined;
    public get data(): HistoryCollection {
        this.strongData = this.strongData || this.client.GetData<HistoryCollection>();
        return this.strongData;
    }

    private strongItems: HistoryResult[];
    public get items(): HistoryResult[] {
        if (this.strongItems === undefined) {
            var embeds = this.client.GetEmbed("values");
            var clients = embeds.GetAllClients();
            this.strongItems = [];
            for (var i = 0; i < clients.length; ++i) {
                this.strongItems.push(new HistoryResult(clients[i]));
            }
        }
        return this.strongItems;
    }

    public refresh(): Promise<HistoryCollectionResult> {
        return this.client.LoadLink("self")
            .then(r => {
                return new HistoryCollectionResult(r);
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

    public getListDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("List")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasListDocs(): boolean {
        return this.client.HasLinkDoc("List");
    }

    public next(): Promise<HistoryCollectionResult> {
        return this.client.LoadLink("next")
            .then(r => {
                return new HistoryCollectionResult(r);
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

    public previous(): Promise<HistoryCollectionResult> {
        return this.client.LoadLink("previous")
            .then(r => {
                return new HistoryCollectionResult(r);
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

    public first(): Promise<HistoryCollectionResult> {
        return this.client.LoadLink("first")
            .then(r => {
                return new HistoryCollectionResult(r);
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

    public last(): Promise<HistoryCollectionResult> {
        return this.client.LoadLink("last")
            .then(r => {
                return new HistoryCollectionResult(r);
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

    public listPageHistory(query: HistoryQuery): Promise<HistoryCollectionResult> {
        return this.client.LoadLinkWithQuery("ListPageHistory", query)
            .then(r => {
                return new HistoryCollectionResult(r);
            });
    }

    public canListPageHistory(): boolean {
        return this.client.HasLink("ListPageHistory");
    }

    public getListPageHistoryDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("ListPageHistory")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasListPageHistoryDocs(): boolean {
        return this.client.HasLinkDoc("ListPageHistory");
    }
}

export class MergeInfoResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: MergeInfo = undefined;
    public get data(): MergeInfo {
        this.strongData = this.strongData || this.client.GetData<MergeInfo>();
        return this.strongData;
    }

    public refresh(): Promise<MergeInfoResult> {
        return this.client.LoadLink("self")
            .then(r => {
                return new MergeInfoResult(r);
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

    public resolve(data: ResolveMergeArgs) {
        return this.client.LoadLinkWithForm("Resolve", data)
            .then(r => {
                return r;
            });
    }

    public canResolve(): boolean {
        return this.client.HasLink("Resolve");
    }

    public getResolveDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("Resolve")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasResolveDocs(): boolean {
        return this.client.HasLinkDoc("Resolve");
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
        if (this.strongItems === undefined) {
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

export class CompilerResultResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: CompilerResult = undefined;
    public get data(): CompilerResult {
        this.strongData = this.strongData || this.client.GetData<CompilerResult>();
        return this.strongData;
    }

    public publishStatus(): Promise<CompilerStatusResult> {
        return this.client.LoadLink("PublishStatus")
            .then(r => {
                return new CompilerStatusResult(r);
            });
    }

    public canPublishStatus(): boolean {
        return this.client.HasLink("PublishStatus");
    }

    public getPublishStatusDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("PublishStatus")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasPublishStatusDocs(): boolean {
        return this.client.HasLinkDoc("PublishStatus");
    }
}

export class CompilerStatusResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: CompilerStatus = undefined;
    public get data(): CompilerStatus {
        this.strongData = this.strongData || this.client.GetData<CompilerStatus>();
        return this.strongData;
    }

    public refresh(): Promise<CompilerStatusResult> {
        return this.client.LoadLink("self")
            .then(r => {
                return new CompilerStatusResult(r);
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

    public compile(): Promise<CompilerResultResult> {
        return this.client.LoadLink("Compile")
            .then(r => {
                return new CompilerResultResult(r);
            });
    }

    public canCompile(): boolean {
        return this.client.HasLink("Compile");
    }

    public getCompileDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("Compile")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasCompileDocs(): boolean {
        return this.client.HasLinkDoc("Compile");
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

export interface HistoryQuery {
    filePath?: string;
    /** The number of pages (item number = Offset * Limit) into the collection to query. */
    offset?: number;
    /** The limit of the number of items to return. */
    limit?: number;
}

export interface HistoryCollection {
    filePath?: string;
    offset?: number;
    limit?: number;
    total?: number;
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

export interface DraftEntryPoint {
}

export interface NewCommit {
    message?: string;
}

export interface EntryPoint {
}

export interface PhaseCollection {
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

export interface CompilerStatus {
    behindBy?: number;
    behindHistory?: any;
}

export interface CompilerResult {
    elapsedSeconds?: number;
}

export interface MergeQuery {
    file?: string;
}

export interface MergeInfo {
    merged?: string;
    theirs?: string;
    mine?: string;
    file?: string;
}

export interface History2 {
    message?: string;
    sha?: string;
    name?: string;
    email?: string;
    when?: Date;
}

export interface DiffInfo {
    filePath?: string;
    original?: string;
    changed?: string;
}

export interface ResolveMergeArgs {
    content?: any;
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

