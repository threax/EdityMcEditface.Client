///<amd-module name="edity.core.edit.components.sync"/>

"use strict";

import * as storage from "hr.storage";
import * as controller from "hr.controller";
import * as navmenu from "edity.editorcore.navmenu";
import * as toggles from "hr.toggles";
import * as Iterable from "hr.iterable";
import * as git from "edity.editorcore.GitService";
import * as editorServices from 'edity.editorcore.EditorServices';
import * as client from 'edity.editorcore.EdityHypermediaClient';
import * as saveService from "edity.editorcore.SaveService";
import { ExternalPromise } from 'hr.externalpromise';

class NavButtonController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [SyncManager, PullController, git.GitService];
    }

    constructor(private syncManager: SyncManager, private pull: PullController) {
        
    }

    public async sync(evt: Event): Promise<void> {
        evt.preventDefault();
        try {
            await saveService.saveNow();
            await this.syncManager.sync();
        }
        catch (err) {
            this.pull.showError(err);
        }
    }
}

class SyncManager implements git.ISyncHandler {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [client.EntryPointInjector, PushController, PullController, git.GitService];
    }

    constructor(private entryInjector: client.EntryPointInjector, private push: PushController, private pull: PullController, private gitService: git.GitService) {
        this.gitService.setSyncHandler(this);
    }

    public async sync(): Promise<git.SyncResult> {
        var entry = await this.entryInjector.load();
        var syncResult = new git.SyncResult(false);
        if (entry.canBeginSync()) {
            var syncInfo = await entry.beginSync();

            if (syncInfo.canCommit()) { //If we can commit, we can't sync, so show that dialog
                var commitResult = await this.gitService.commit("Before syncing you must commit any outstanding changes.");
                if (commitResult.Success) {
                    syncResult = await this.sync();
                }
            }

            else if (syncInfo.canPull()) {
                var syncResult = await this.pull.show(syncInfo);
                if (syncResult.Success) {
                    syncResult = await this.sync();
                }
            }

            else if (syncInfo.canPush()) {
                syncResult = await this.push.show(syncInfo);
            }

            else {
                this.pull.showNoSync();
            }
        }

        return syncResult;
    }
}

interface HistoryDisplay extends client.History {
    whenStr: string;
}

abstract class SyncController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, PushController];
    }

    protected dialog: controller.OnOffToggle;

    protected load: controller.OnOffToggle;
    protected main: controller.OnOffToggle;
    protected cantSync: controller.OnOffToggle;
    protected error: controller.OnOffToggle;
    protected noChanges: controller.OnOffToggle;
    protected group: toggles.Group;

    protected changesModel: controller.Model<client.SyncInfo>;
    protected history: controller.Model<HistoryDisplay>;

    protected currentSyncInfo: client.SyncInfoResult;
    private currentPromise: ExternalPromise<git.SyncResult> = null;

    constructor(bindings: controller.BindingCollection) {
        this.dialog = bindings.getToggle('dialog');

        this.load = bindings.getToggle('load');
        this.main = bindings.getToggle('main');
        this.cantSync = bindings.getToggle('cantSync');
        this.error = bindings.getToggle('error');
        this.noChanges = bindings.getToggle('noChanges');
        this.group = new toggles.Group(this.load, this.main, this.cantSync, this.error, this.noChanges);

        this.changesModel = bindings.getModel<client.SyncInfo>('changes');
        this.history = bindings.getModel<HistoryDisplay>('history');
    }

    public abstract performAction(evt: Event): Promise<void>;

    protected abstract get CurrentHistory(): client.History[];

    public show(syncInfo: client.SyncInfoResult): Promise<git.SyncResult> {
        if (this.currentPromise !== null) {
            this.currentPromise.resolve(new git.SyncResult(false));
        }

        this.currentPromise = new ExternalPromise<git.SyncResult>();

        this.currentSyncInfo = syncInfo;
        var data = this.currentSyncInfo.data;

        this.group.activate(this.main);
        this.changesModel.setData(data);
        this.history.setData(new Iterable.Iterable(this.CurrentHistory).select(SyncController.formatRow));

        this.dialog.on();

        return this.currentPromise.Promise;
    }

    public showNoSync() {
        this.dialog.on();
        this.group.activate(this.noChanges);
    }

    public showError(err: Error) {
        this.dialog.on();
        this.group.activate(this.error);
        //Doesn't really do anything with err, but should
    }

    protected resolveCurrentPromise(success: boolean) {
        if (this.currentPromise !== null) {
            this.currentPromise.resolve(new git.SyncResult(success));
        }
    }

    private static formatRow(row: HistoryDisplay): HistoryDisplay {
        var date = new Date(row.when);
        row.whenStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        return row;
    }
}

class PullController extends SyncController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, PushController];
    }

    constructor(bindings: controller.BindingCollection) {
        super(bindings);
    }

    public async performAction(evt: Event): Promise<void> {
        evt.preventDefault();
        this.group.activate(this.load);
        try {
            await this.currentSyncInfo.pull();
            this.dialog.off();
            this.resolveCurrentPromise(true);
        }
        catch (err) {
            this.group.activate(this.error)
        }
    }

    protected get CurrentHistory(): client.History[] {
        return this.currentSyncInfo.data.behindHistory;
    }
}

class PushController extends SyncController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection];
    }

    constructor(bindings: controller.BindingCollection) {
        super(bindings);
    }

    public async performAction(evt: Event): Promise<void> {
        evt.preventDefault();
        this.group.activate(this.load);
        try {
            await this.currentSyncInfo.push();
            this.dialog.off();
            this.resolveCurrentPromise(true);
        }
        catch (err) {
            this.group.activate(this.error);
        }
    }

    protected get CurrentHistory(): client.History[] {
        return this.currentSyncInfo.data.aheadHistory;
    }
}

var builder = editorServices.createBaseBuilder().createChildBuilder();
git.addServices(builder.Services);
builder.Services.tryAddShared(PushController, PushController);
builder.Services.tryAddShared(PullController, PullController);
builder.Services.tryAddShared(NavButtonController, NavButtonController);
builder.Services.tryAddShared(SyncManager, SyncManager);

builder.create("syncpush", PushController);
builder.create("syncpull", PullController);

var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
editMenu.addInjected("SyncNavItem", builder.createOnCallback(NavButtonController));