"use strict";

import * as edityClient from 'edity.editorcore.EdityClient';
import * as uploader from 'edity.editorcore.uploader';
import { ActionEventDispatcher, FuncEventDispatcher } from 'hr.eventdispatcher';
import { PagedClientData } from 'edity.editorcore.pageddata';
import { Fetcher } from 'hr.fetcher';
import * as editorServices from 'edity.editorcore.EditorServices';
import * as di from 'hr.di';
import * as client from 'edity.editorcore.EdityHypermediaClient';
import * as controller from 'hr.controller';

export interface CommitVariant {
    variant: string;
    rowCreated: controller.CreateCallback;
}

export class CommitResult {
    constructor(private success: boolean) {
        
    }

    public get Success() {
        return this.success;
    }
}

export interface ICommitHandler {
    commit(): Promise<CommitResult>;
}

export class SyncResult {
    constructor(private success: boolean) {

    }

    public get Success() {
        return this.success;
    }
}

export interface ISyncHandler {
    sync(): Promise<SyncResult>;
}

export class GitService {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [edityClient.GitClient];
    }

    private revertStartedHandler = new ActionEventDispatcher<void>();
    private revertCompletedHandler = new ActionEventDispatcher<boolean>();
    //Commit variant detection and sync
    private determineCommitVariantEventHandler = new FuncEventDispatcher<CommitVariant, client.UncommittedChangeResult>();

    private commitHandler: ICommitHandler;
    private syncHandler: ISyncHandler;

    constructor(private client: edityClient.GitClient) {

    }

    /**
     * Set the commit handler to use.
     * @param commitHandler
     */
    public setCommitHandler(commitHandler: ICommitHandler): void {
        this.commitHandler = commitHandler;
    }

    /**
     * Perform a commit, will return a CommitResult promise with
     * the results of trying to commit.
     */
    public commit(): Promise<CommitResult> {
        if (this.commitHandler) {
            return this.commitHandler.commit();
        }
        else {
            return Promise.resolve(new CommitResult(false));
        }
    }

    /**
     * Set the sync handler to use.
     * @param syncHandler
     */
    public setSyncHandler(syncHandler: ISyncHandler) {
        this.syncHandler = syncHandler;
    }

    /**
     * Perform a sync, will return a SyncResult promise with
     * the results of trying to sync.
     */
    public sync(): Promise<SyncResult> {
        if (this.syncHandler) {
            return this.syncHandler.sync();
        }
        else {
            return Promise.resolve(new SyncResult(false));
        }
    }

    get revertStarted() { return this.revertStartedHandler.modifier; }
    get revertCompleted() { return this.revertCompletedHandler.modifier; };
    get determineCommitVariantEvent() { return this.determineCommitVariantEventHandler.modifier };

    uncommittedDiff(file:string) {
        return this.client.uncommittedDiff(file, null);
    }

    mergeInfo(file:string) {
        return this.client.mergeInfo(file, null);
    }

    historyCount(file) {
        return this.client.repoHistoryCount(file, null);
    }

    createHistoryPager(file, count) {
        return new PagedClientData<edityClient.History[]>((current, resultsPerPage) => this.getDataPage(file, current, resultsPerPage), count);
    }

    getDataPage(file, current, resultsPerPage): Promise<edityClient.History[]> {
        return this.client.fileHistory(file, current, resultsPerPage, null);
    }

    resolve(file, content) {
        var blob = new Blob([content], { type: "text/html" });
        return this.client.resolve(file, { data: blob, fileName: file }, null);
    }

    fireDetermineCommitVariant(result: client.UncommittedChangeResult) {
        return this.determineCommitVariantEventHandler.fire(result);
    }
}

export function addServices(services: di.ServiceCollection) {
    edityClient.addServices(services);
    services.tryAddShared(GitService, GitService);
}