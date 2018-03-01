"use strict";

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
    rowCreated: controller.CreateCallback<any>;
}

export class CommitResult {
    constructor(private success: boolean) {
        
    }

    public get Success() {
        return this.success;
    }
}

export interface ICommitHandler {
    commit(message: string): Promise<CommitResult>;
}

export class SyncResult {
    constructor(private success: boolean) {

    }

    public get Success() {
        return this.success;
    }
}

export interface ISyncHandler {
    sync(message: string): Promise<SyncResult>;
}

export class GitService {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [];
    }

    private revertStartedHandler = new ActionEventDispatcher<void>();
    private revertCompletedHandler = new ActionEventDispatcher<boolean>();
    //Commit variant detection and sync
    private determineCommitVariantEventHandler = new FuncEventDispatcher<CommitVariant, client.UncommittedChangeResult>();

    private commitHandler: ICommitHandler;
    private syncHandler: ISyncHandler;

    constructor() {

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
    public commit(message: string): Promise<CommitResult> {
        if (this.commitHandler) {
            return this.commitHandler.commit(message);
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
    public sync(message: string): Promise<SyncResult> {
        if (this.syncHandler) {
            return this.syncHandler.sync(message);
        }
        else {
            return Promise.resolve(new SyncResult(false));
        }
    }

    public fireRevertStarted() {
        this.revertStartedHandler.fire(undefined);
    }

    public fireRevertCompleted(success: boolean) {
        this.revertCompletedHandler.fire(success);
    }

    get revertStarted() { return this.revertStartedHandler.modifier; }
    get revertCompleted() { return this.revertCompletedHandler.modifier; };
    get determineCommitVariantEvent() { return this.determineCommitVariantEventHandler.modifier };

    fireDetermineCommitVariant(result: client.UncommittedChangeResult) {
        return this.determineCommitVariantEventHandler.fire(result);
    }
}

export function addServices(services: di.ServiceCollection) {
    services.tryAddShared(GitService, GitService);
}