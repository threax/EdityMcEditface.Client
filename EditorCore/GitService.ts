"use strict";

import * as edityClient from 'edity.editorcore.EdityClient';
import * as uploader from 'edity.editorcore.uploader';
import { ActionEventDispatcher, FuncEventDispatcher } from 'hr.eventdispatcher';
import { PagedClientData } from 'edity.editorcore.pageddata';
import { Fetcher } from 'hr.fetcher';
import * as editorServices from 'edity.editorcore.EditorServices';
import * as di from 'hr.di';

export class GitService {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [edityClient.GitClient];
    }

    private revertStartedHandler = new ActionEventDispatcher<void>();
    private revertCompletedHandler = new ActionEventDispatcher<boolean>();
    private host = "";
    //Commit variant detection and sync
    private determineCommitVariantEventHandler = new FuncEventDispatcher<any, any>();

    constructor(private client: edityClient.GitClient) {

    }

    get revertStarted() { return this.revertStartedHandler.modifier; }
    get revertCompleted() { return this.revertCompletedHandler.modifier; };
    get determineCommitVariantEvent() { return this.determineCommitVariantEventHandler.modifier };

    setHost(url) {
        this.host = url;
    }

    syncInfo() {
        return this.client.syncInfo(null);
    }

    uncommittedChanges() {
        return this.client.uncommittedChanges(null);
    }

    commit(data: edityClient.NewCommit) {
        return this.client.commit(data, null);
    }

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

    pull() {
        return this.client.pull(null);
    }

    push() {
        return this.client.push(null);
    }

    async revert(file) {
        try {
            this.revertStartedHandler.fire(null);
            var data = await this.client.revert(file, null);
            this.revertCompletedHandler.fire(true);
        }
        catch (err) {
            this.revertCompletedHandler.fire(false);
        }
    }

    fireDetermineCommitVariant(data) {
        return this.determineCommitVariantEventHandler.fire(data);
    }
}

export function addServices(services: di.ServiceCollection) {
    editorServices.addServices(services);
    edityClient.addServices(services);
    services.tryAddShared(GitService, GitService);
}