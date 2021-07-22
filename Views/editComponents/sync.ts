"use strict";

import * as controller from 'htmlrapier/src/controller';
import * as navmenu from '../../EditorCore/navmenu';
import * as toggles from 'htmlrapier/src/toggles';
import * as Iterable from 'htmlrapier/src/iterable';
import * as git from '../../EditorCore/GitService';
import * as editorServices from 'edity.services.EditorServices';
import * as client from '../../EditorCore/EdityHypermediaClient';
import * as saveService from '../../EditorCore/SaveService';
import { ExternalPromise } from 'htmlrapier/src/externalpromise';

class NavButtonController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, SyncManager, PullController, git.GitService];
    }

    private load: controller.OnOffToggle;

    constructor(bindings: controller.BindingCollection, private syncManager: SyncManager, private pull: PullController) {
        this.load = bindings.getToggle("load");
        this.load.off();
        this.syncManager.setLoadToggle(this.load);
    }

    public async sync(evt: Event): Promise<void> {
        evt.preventDefault();
        try {
            await saveService.saveNow();
            await this.syncManager.sync(true, null);
        }
        catch (err) {
            this.load.off();
            this.pull.showError(err);
        }
    }
}

class SyncManagerHandler implements git.ISyncHandler {
    constructor (private syncManager: SyncManager){

    }

    public sync(message: string): Promise<git.SyncResult> {
        return this.syncManager.sync(false, message);
    }
}

class SyncManager {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [client.EntryPointInjector, PushController, PullController, git.GitService];
    }

    private loadToggle: controller.OnOffToggle;

    constructor(private entryInjector: client.EntryPointInjector, private push: PushController, private pull: PullController, private gitService: git.GitService) {
        this.gitService.setSyncHandler(new SyncManagerHandler(this));
    }

    public async sync(showNoSync: boolean, message: string): Promise<git.SyncResult> {
        try {
            if (this.loadToggle) {
                this.loadToggle.on();
            }
            var entry = await this.entryInjector.load();
            var syncResult = new git.SyncResult(false);
            if (entry.canBeginSync()) {
                var syncInfo = await entry.beginSync();

                if (syncInfo.canCommit()) { //If we can commit, we can't sync, so show that dialog
                    if (this.loadToggle) {
                        this.loadToggle.off();
                    }
                    var commitResult = await this.gitService.commit("Before syncing you must commit any outstanding changes.");
                    if (commitResult.Success) {
                        syncResult = await this.sync(showNoSync, message);
                    }
                }

                else if (syncInfo.canPull()) {
                    if (this.loadToggle) {
                        this.loadToggle.off();
                    }
                    var syncResult = await this.pull.show(syncInfo, message);
                    if (syncResult.Success) {
                        syncResult = await this.sync(showNoSync, message);
                    }
                }

                else if (syncInfo.canPush()) {
                    if (this.loadToggle) {
                        this.loadToggle.off();
                    }
                    syncResult = await this.push.show(syncInfo, message);
                }

                else if (showNoSync) {
                    if (this.loadToggle) {
                        this.loadToggle.off();
                    }
                    this.pull.showNoSync();
                }
            }

            return syncResult;
        }
        catch (err) {
            if (this.loadToggle) {
                this.loadToggle.off();
            }
            throw err;
        }
    }

    public setLoadToggle(loadToggle: controller.OnOffToggle) {
        this.loadToggle = loadToggle;
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
    private messageToggle: controller.OnOffToggle;

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
        this.messageToggle = bindings.getToggle('message');
    }

    public abstract performAction(evt: Event): Promise<void>;

    protected abstract get CurrentHistory(): client.History[];

    public show(syncInfo: client.SyncInfoResult, message: String): Promise<git.SyncResult> {
        if (this.currentPromise !== null) {
            this.currentPromise.resolve(new git.SyncResult(false));
        }

        this.currentPromise = new ExternalPromise<git.SyncResult>();

        this.currentSyncInfo = syncInfo;
        var data = Object.create(this.currentSyncInfo.data);
        data.message = message;
        if (message) {
            this.messageToggle.on();
        }
        else {
            this.messageToggle.off();
        }

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
        var result: HistoryDisplay = Object.create(row);
        var date = new Date(row.when);
        result.whenStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        return result;
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
editMenu.addInjected("SyncNavItem", navmenu.GitStart + 10, builder.createOnCallback(NavButtonController));