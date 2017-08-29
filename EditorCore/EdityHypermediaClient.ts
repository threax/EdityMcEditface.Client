import * as hal from 'hr.halcyon.EndpointClient';

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

    public submitLatestDraft(): Promise<DraftResult> {
        return this.client.LoadLink("SubmitLatestDraft")
               .then(r => {
                    return new DraftResult(r);
                });

    }

    public canSubmitLatestDraft(): boolean {
        return this.client.HasLink("SubmitLatestDraft");
    }

    public getSubmitLatestDraftDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("SubmitLatestDraft")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasSubmitLatestDraftDocs(): boolean {
        return this.client.HasLinkDoc("SubmitLatestDraft");
    }

    public submitAllDrafts(): Promise<void> {
        return this.client.LoadLink("SubmitAllDrafts").then(hal.makeVoid);
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

    public getListDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("List")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasListDocs(): boolean {
        return this.client.HasLinkDoc("List");
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

export class DraftEntryPointResult {
    private client: hal.HalEndpointClient;

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

    public commit(data: NewCommit): Promise<void> {
        return this.client.LoadLinkWithBody("Commit", data).then(hal.makeVoid);
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

export class EntryPointInjector {
    private url: string;
    private fetcher: hal.Fetcher;
    private instance: EntryPointResult;

    constructor(url: string, fetcher: hal.Fetcher) {
        this.url = url;
        this.fetcher = fetcher;
    }

    public load(): Promise<EntryPointResult> {
        if (!this.instance) {
            return EntryPointResult.Load(this.url, this.fetcher).then((r) => {
                this.instance = r;
                return r;
            });
        }

        return Promise.resolve(this.instance);
    }
}

export class EntryPointResult {
    private client: hal.HalEndpointClient;

    public static Load(url: string, fetcher: hal.Fetcher): Promise<EntryPointResult> {
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

    public submitAllDrafts(): Promise<void> {
        return this.client.LoadLink("SubmitAllDrafts").then(hal.makeVoid);
    }

    public canSubmitAllDrafts(): boolean {
        return this.client.HasLink("SubmitAllDrafts");
    }

    public commit(data: NewCommit): Promise<void> {
        return this.client.LoadLinkWithBody("Commit", data).then(hal.makeVoid);
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

    public beginPublish(): Promise<PublishEntryPointResult> {
        return this.client.LoadLink("BeginPublish")
               .then(r => {
                    return new PublishEntryPointResult(r);
                });

    }

    public canBeginPublish(): boolean {
        return this.client.HasLink("BeginPublish");
    }

    public getBeginPublishDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("BeginPublish")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasBeginPublishDocs(): boolean {
        return this.client.HasLinkDoc("BeginPublish");
    }

    public compile(): Promise<CompileProgressResult> {
        return this.client.LoadLink("Compile")
               .then(r => {
                    return new CompileProgressResult(r);
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

    public listPages(query: PageQuery): Promise<PageInfoCollectionResult> {
        return this.client.LoadLinkWithQuery("ListPages", query)
               .then(r => {
                    return new PageInfoCollectionResult(r);
                });

    }

    public canListPages(): boolean {
        return this.client.HasLink("ListPages");
    }

    public getListPagesDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("ListPages")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasListPagesDocs(): boolean {
        return this.client.HasLinkDoc("ListPages");
    }

    public listTemplates(): Promise<TemplateCollectionResult> {
        return this.client.LoadLink("ListTemplates")
               .then(r => {
                    return new TemplateCollectionResult(r);
                });

    }

    public canListTemplates(): boolean {
        return this.client.HasLink("ListTemplates");
    }

    public getListTemplatesDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("ListTemplates")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasListTemplatesDocs(): boolean {
        return this.client.HasLinkDoc("ListTemplates");
    }

    public uploadFile(data: UploadInput): Promise<void> {
        return this.client.LoadLinkWithForm("UploadFile", data).then(hal.makeVoid);
    }

    public canUploadFile(): boolean {
        return this.client.HasLink("UploadFile");
    }

    public getUploadFileDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("UploadFile")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasUploadFileDocs(): boolean {
        return this.client.HasLinkDoc("UploadFile");
    }

    public deleteFile(query: DeleteFileQuery): Promise<void> {
        return this.client.LoadLinkWithQuery("DeleteFile", query).then(hal.makeVoid);
    }

    public canDeleteFile(): boolean {
        return this.client.HasLink("DeleteFile");
    }

    public getDeleteFileDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("DeleteFile")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasDeleteFileDocs(): boolean {
        return this.client.HasLinkDoc("DeleteFile");
    }

    public listUploadedFiles(query: ListFileQuery): Promise<FileListResult> {
        return this.client.LoadLinkWithQuery("ListUploadedFiles", query)
               .then(r => {
                    return new FileListResult(r);
                });

    }

    public canListUploadedFiles(): boolean {
        return this.client.HasLink("ListUploadedFiles");
    }

    public getListUploadedFilesDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("ListUploadedFiles")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasListUploadedFilesDocs(): boolean {
        return this.client.HasLinkDoc("ListUploadedFiles");
    }

    public addAsset(data: ImageUploadInput): Promise<ImageUploadResponseResult> {
        return this.client.LoadLinkWithForm("AddAsset", data)
               .then(r => {
                    return new ImageUploadResponseResult(r);
                });

    }

    public canAddAsset(): boolean {
        return this.client.HasLink("AddAsset");
    }

    public getAddAssetDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("AddAsset")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasAddAssetDocs(): boolean {
        return this.client.HasLinkDoc("AddAsset");
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

export class FileListResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: FileList = undefined;
    public get data(): FileList {
        this.strongData = this.strongData || this.client.GetData<FileList>();
        return this.strongData;
    }

    public listUploadedFiles(query: ListFileQuery): Promise<FileListResult> {
        return this.client.LoadLinkWithQuery("ListUploadedFiles", query)
               .then(r => {
                    return new FileListResult(r);
                });

    }

    public canListUploadedFiles(): boolean {
        return this.client.HasLink("ListUploadedFiles");
    }

    public getListUploadedFilesDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("ListUploadedFiles")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasListUploadedFilesDocs(): boolean {
        return this.client.HasLinkDoc("ListUploadedFiles");
    }

    public uploadFile(data: UploadInput): Promise<void> {
        return this.client.LoadLinkWithForm("UploadFile", data).then(hal.makeVoid);
    }

    public canUploadFile(): boolean {
        return this.client.HasLink("UploadFile");
    }

    public getUploadFileDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("UploadFile")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasUploadFileDocs(): boolean {
        return this.client.HasLinkDoc("UploadFile");
    }

    public deleteFile(query: DeleteFileQuery): Promise<void> {
        return this.client.LoadLinkWithQuery("DeleteFile", query).then(hal.makeVoid);
    }

    public canDeleteFile(): boolean {
        return this.client.HasLink("DeleteFile");
    }

    public getDeleteFileDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("DeleteFile")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasDeleteFileDocs(): boolean {
        return this.client.HasLinkDoc("DeleteFile");
    }
}

export class TemplateCollectionResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: TemplateCollection = undefined;
    public get data(): TemplateCollection {
        this.strongData = this.strongData || this.client.GetData<TemplateCollection>();
        return this.strongData;
    }

    private strongItems: TemplateViewResult[];
    public get items(): TemplateViewResult[] {
        if (this.strongItems === undefined) {
            var embeds = this.client.GetEmbed("values");
            var clients = embeds.GetAllClients();
            this.strongItems = [];
            for (var i = 0; i < clients.length; ++i) {
                this.strongItems.push(new TemplateViewResult(clients[i]));
            }
        }
        return this.strongItems;
    }

    public refresh(): Promise<TemplateCollectionResult> {
        return this.client.LoadLink("self")
               .then(r => {
                    return new TemplateCollectionResult(r);
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

export class TemplateViewResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: TemplateView = undefined;
    public get data(): TemplateView {
        this.strongData = this.strongData || this.client.GetData<TemplateView>();
        return this.strongData;
    }

    public getContent(): Promise<hal.Response> {
        return this.client.LoadRawLink("GetContent");
    }

    public canGetContent(): boolean {
        return this.client.HasLink("GetContent");
    }

    public getGetContentDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("GetContent")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasGetContentDocs(): boolean {
        return this.client.HasLinkDoc("GetContent");
    }
}

export class PageInfoResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: PageInfo = undefined;
    public get data(): PageInfo {
        this.strongData = this.strongData || this.client.GetData<PageInfo>();
        return this.strongData;
    }

    public savePage(data: SavePageInput): Promise<void> {
        return this.client.LoadLinkWithForm("SavePage", data).then(hal.makeVoid);
    }

    public canSavePage(): boolean {
        return this.client.HasLink("SavePage");
    }

    public getSavePageDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("SavePage")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasSavePageDocs(): boolean {
        return this.client.HasLinkDoc("SavePage");
    }

    public deletePage(): Promise<void> {
        return this.client.LoadLink("DeletePage").then(hal.makeVoid);
    }

    public canDeletePage(): boolean {
        return this.client.HasLink("DeletePage");
    }

    public getSettings(): Promise<PageSettingsResult> {
        return this.client.LoadLink("GetSettings")
               .then(r => {
                    return new PageSettingsResult(r);
                });

    }

    public canGetSettings(): boolean {
        return this.client.HasLink("GetSettings");
    }

    public getGetSettingsDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("GetSettings")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasGetSettingsDocs(): boolean {
        return this.client.HasLinkDoc("GetSettings");
    }

    public updateSettings(data: PageSettings): Promise<void> {
        return this.client.LoadLinkWithBody("UpdateSettings", data).then(hal.makeVoid);
    }

    public canUpdateSettings(): boolean {
        return this.client.HasLink("UpdateSettings");
    }

    public getUpdateSettingsDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("UpdateSettings")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasUpdateSettingsDocs(): boolean {
        return this.client.HasLinkDoc("UpdateSettings");
    }
}

export class PageInfoCollectionResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: PageInfoCollection = undefined;
    public get data(): PageInfoCollection {
        this.strongData = this.strongData || this.client.GetData<PageInfoCollection>();
        return this.strongData;
    }

    private strongItems: PageInfoResult[];
    public get items(): PageInfoResult[] {
        if (this.strongItems === undefined) {
            var embeds = this.client.GetEmbed("values");
            var clients = embeds.GetAllClients();
            this.strongItems = [];
            for (var i = 0; i < clients.length; ++i) {
                this.strongItems.push(new PageInfoResult(clients[i]));
            }
        }
        return this.strongItems;
    }

    public refresh(): Promise<PageInfoCollectionResult> {
        return this.client.LoadLink("self")
               .then(r => {
                    return new PageInfoCollectionResult(r);
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

    public next(): Promise<PageInfoCollectionResult> {
        return this.client.LoadLink("next")
               .then(r => {
                    return new PageInfoCollectionResult(r);
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

    public previous(): Promise<PageInfoCollectionResult> {
        return this.client.LoadLink("previous")
               .then(r => {
                    return new PageInfoCollectionResult(r);
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

    public first(): Promise<PageInfoCollectionResult> {
        return this.client.LoadLink("first")
               .then(r => {
                    return new PageInfoCollectionResult(r);
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

    public last(): Promise<PageInfoCollectionResult> {
        return this.client.LoadLink("last")
               .then(r => {
                    return new PageInfoCollectionResult(r);
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

export class PageSettingsResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: PageSettings = undefined;
    public get data(): PageSettings {
        this.strongData = this.strongData || this.client.GetData<PageSettings>();
        return this.strongData;
    }

    public refresh(): Promise<PageSettingsResult> {
        return this.client.LoadLink("self")
               .then(r => {
                    return new PageSettingsResult(r);
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

    public updateSettings(data: PageSettings): Promise<void> {
        return this.client.LoadLinkWithBody("UpdateSettings", data).then(hal.makeVoid);
    }

    public canUpdateSettings(): boolean {
        return this.client.HasLink("UpdateSettings");
    }

    public getUpdateSettingsDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("UpdateSettings")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasUpdateSettingsDocs(): boolean {
        return this.client.HasLinkDoc("UpdateSettings");
    }

    public savePage(data: SavePageInput): Promise<void> {
        return this.client.LoadLinkWithForm("SavePage", data).then(hal.makeVoid);
    }

    public canSavePage(): boolean {
        return this.client.HasLink("SavePage");
    }

    public getSavePageDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("SavePage")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasSavePageDocs(): boolean {
        return this.client.HasLinkDoc("SavePage");
    }

    public deletePage(): Promise<void> {
        return this.client.LoadLink("DeletePage").then(hal.makeVoid);
    }

    public canDeletePage(): boolean {
        return this.client.HasLink("DeletePage");
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

    public resolve(data: ResolveMergeArgs): Promise<void> {
        return this.client.LoadLinkWithForm("Resolve", data).then(hal.makeVoid);
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

    public pull(): Promise<void> {
        return this.client.LoadLink("Pull").then(hal.makeVoid);
    }

    public canPull(): boolean {
        return this.client.HasLink("Pull");
    }

    public push(): Promise<void> {
        return this.client.LoadLink("Push").then(hal.makeVoid);
    }

    public canPush(): boolean {
        return this.client.HasLink("Push");
    }

    public commit(data: NewCommit): Promise<void> {
        return this.client.LoadLinkWithBody("Commit", data).then(hal.makeVoid);
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

    public revert(): Promise<void> {
        return this.client.LoadLink("Revert").then(hal.makeVoid);
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

export class CompileProgressResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: CompileProgress = undefined;
    public get data(): CompileProgress {
        this.strongData = this.strongData || this.client.GetData<CompileProgress>();
        return this.strongData;
    }

    public refresh(): Promise<CompileProgressResult> {
        return this.client.LoadLink("self")
               .then(r => {
                    return new CompileProgressResult(r);
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

export class CompileResultResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: CompileResult = undefined;
    public get data(): CompileResult {
        this.strongData = this.strongData || this.client.GetData<CompileResult>();
        return this.strongData;
    }

    public beginPublish(): Promise<PublishEntryPointResult> {
        return this.client.LoadLink("BeginPublish")
               .then(r => {
                    return new PublishEntryPointResult(r);
                });

    }

    public canBeginPublish(): boolean {
        return this.client.HasLink("BeginPublish");
    }

    public getBeginPublishDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("BeginPublish")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasBeginPublishDocs(): boolean {
        return this.client.HasLinkDoc("BeginPublish");
    }
}

export class PublishEntryPointResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: PublishEntryPoint = undefined;
    public get data(): PublishEntryPoint {
        this.strongData = this.strongData || this.client.GetData<PublishEntryPoint>();
        return this.strongData;
    }

    public refresh(): Promise<PublishEntryPointResult> {
        return this.client.LoadLink("self")
               .then(r => {
                    return new PublishEntryPointResult(r);
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

    public compile(): Promise<CompileProgressResult> {
        return this.client.LoadLink("Compile")
               .then(r => {
                    return new CompileProgressResult(r);
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

    public commit(data: NewCommit): Promise<void> {
        return this.client.LoadLinkWithBody("Commit", data).then(hal.makeVoid);
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

    public setPhase(): Promise<void> {
        return this.client.LoadLink("SetPhase").then(hal.makeVoid);
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

export class ImageUploadResponseResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    private strongData: ImageUploadResponse = undefined;
    public get data(): ImageUploadResponse {
        this.strongData = this.strongData || this.client.GetData<ImageUploadResponse>();
        return this.strongData;
    }

    public getEntryPoint(): Promise<void> {
        return this.client.LoadLink("GetEntryPoint").then(hal.makeVoid);
    }

    public canGetEntryPoint(): boolean {
        return this.client.HasLink("GetEntryPoint");
    }
}
//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v9.4.5.0 (http://NJsonSchema.org)
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
    status?: DraftStatus2;
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
    showChangedOnly?: boolean;
    offset?: number;
    limit?: number;
    total?: number;
}

export interface DraftQuery {
    /** Set this to a specific file to load only the draft info for that file. */
    file?: string;
    /** Set this to true to show only changed files. */
    showChangedOnly?: boolean;
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

export interface EntryPoint {
}

export interface PhaseCollection {
}

export interface UncommittedChangeCollection {
}

export interface History2 {
    message?: string;
    sha?: string;
    name?: string;
    email?: string;
    when?: Date;
}

export interface PublishEntryPoint {
    behindBy?: number;
    behindHistory?: History2[];
}

export interface CompileProgress {
    completed?: boolean;
    currentFile?: number;
    totalFiles?: number;
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

export interface PageQuery {
    file?: string;
    /** The number of pages (item number = Offset * Limit) into the collection to query. */
    offset?: number;
    /** The limit of the number of items to return. */
    limit?: number;
}

export interface PageInfoCollection {
    offset?: number;
    limit?: number;
    total?: number;
}

export interface TemplateCollection {
}

export interface UploadInput {
    file?: string;
    content?: any;
}

export interface DeleteFileQuery {
    file?: string;
}

export interface ListFileQuery {
    dir?: string;
}

/** A list of files in a directory. */
export interface FileList {
    /** The directories inside this directory. */
    directories?: string[];
    /** The files inside this directory. */
    files?: string[];
    /** The path that this file list represents. */
    path?: string;
}

export interface ImageUploadInput {
    upload?: any;
}

export interface ImageUploadResponse {
    /** Set to 1 for uploaded or 0 for not uploaded */
    uploaded?: number;
    /** The name of the saved file */
    fileName?: string;
    /** The url to the saved file */
    url?: string;
    /** A message to display */
    message?: string;
}

export interface History3 {
    message?: string;
    sha?: string;
    name?: string;
    email?: string;
    when?: Date;
}

export interface TemplateView {
    path?: string;
}

export interface PageInfo {
    filePath?: string;
}

export interface SavePageInput {
    content?: any;
}

export interface PageSettings {
    title: string;
    visible?: boolean;
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
    state?: UncommittedChangeState;
}

export interface CompileResult {
    elapsedSeconds?: number;
}

export interface Phase {
    name?: string;
    current?: boolean;
}

export enum DraftStatus2 {
    UndraftedEdits = <any>"UndraftedEdits", 
    NeverDrafted = <any>"NeverDrafted", 
    UpToDate = <any>"UpToDate", 
}

export enum UncommittedChangeState {
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

