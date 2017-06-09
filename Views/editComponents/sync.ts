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

class NavButtonController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [client.EntryPointInjector, PushController, PullController];
    }

    constructor(private entryInjector: client.EntryPointInjector, private push: PushController, private pull: PullController) {

    }

    public async sync(evt: Event): Promise<void> {
        evt.preventDefault();
        try {
            var entry = await this.entryInjector.load();
            if (entry.canBeginSync()) {
                var syncInfo = await entry.beginSync();
                if (syncInfo.canPull()) {
                    this.pull.show(syncInfo);
                }
                else if (syncInfo.canPush()) {
                    this.push.show(syncInfo);
                }
                else {
                    this.pull.showNoSync();
                }
            }
        }
        catch (err) {
            this.pull.showError(err);
        }
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

    public show(syncInfo: client.SyncInfoResult): void {
        this.currentSyncInfo = syncInfo;
        var data = this.currentSyncInfo.data;

        this.group.activate(this.main);
        this.changesModel.setData(data);
        this.history.setData(new Iterable.Iterable(this.CurrentHistory).select(SyncController.formatRow));

        this.dialog.on();
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

    constructor(bindings: controller.BindingCollection, private push: PushController) {
        super(bindings);
    }

    public async performAction(evt: Event): Promise<void> {
        evt.preventDefault();
        this.group.activate(this.load);
        try {
            await this.currentSyncInfo.pull();
            this.currentSyncInfo = await this.currentSyncInfo.refresh();
            if (this.currentSyncInfo.canPush()) {
                this.push.show(this.currentSyncInfo);
            }
            else {
                this.dialog.off();
            }
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

builder.create("syncpush", PushController);
builder.create("syncpull", PullController);

var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
editMenu.addInjected("SyncNavItem", builder.createOnCallback(NavButtonController));