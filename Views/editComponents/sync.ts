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
            }
        }
        catch (err) {
            alert("Error starting sync " + err.message);
        }
    }
}

class PullController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, PushController];
    }

    private dialog: controller.OnOffToggle;

    private load: controller.OnOffToggle;
    private main: controller.OnOffToggle;
    private cantSync: controller.OnOffToggle;
    private error: controller.OnOffToggle;
    private noChanges: controller.OnOffToggle;
    private group: toggles.Group;

    private changesModel: controller.Model<client.SyncInfo>;
    private behindHistory: controller.Model<any>;

    private currentSyncInfo: client.SyncInfoResult;

    constructor(bindings: controller.BindingCollection, private push: PushController) {
        this.dialog = bindings.getToggle('dialog');

        this.load = bindings.getToggle('load');
        this.main = bindings.getToggle('main');
        this.cantSync = bindings.getToggle('cantSync');
        this.error = bindings.getToggle('error');
        this.noChanges = bindings.getToggle('noChanges');
        this.group = new toggles.Group(this.load, this.main, this.cantSync, this.error, this.noChanges);

        this.changesModel = bindings.getModel<client.SyncInfo>('changes');
        this.behindHistory = bindings.getModel<any>('behindHistory');
    }

    public async pull(evt): Promise<void> {
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

    private setupSyncInfo(data: client.SyncInfo): void {
        if (data.aheadBy === 0 && data.behindBy === 0) {
            this.group.activate(this.noChanges);
        }
        else {
            this.group.activate(this.main);
            this.changesModel.setData(data);
            this.behindHistory.setData(new Iterable.Iterable(data.behindHistory).select(PullController.formatRow));
        }
    }

    public show(syncInfo: client.SyncInfoResult): void {
        this.setupSyncInfo(syncInfo.data);
        this.dialog.on();
        this.currentSyncInfo = syncInfo;
    }

    private static formatRow(row) {
        var date = new Date(row.when);
        row.when = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        return row;
    }
}

class PushController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection];
    }

    private dialog: controller.OnOffToggle;

    private load: controller.OnOffToggle;
    private main: controller.OnOffToggle;
    private cantSync: controller.OnOffToggle;
    private error: controller.OnOffToggle;
    private noChanges: controller.OnOffToggle;
    private group: toggles.Group;

    private changesModel;
    private aheadHistory;

    private currentSyncInfo: client.SyncInfoResult;

    constructor(bindings: controller.BindingCollection) {
        this.dialog = bindings.getToggle('dialog');

        this.load = bindings.getToggle('load');
        this.main = bindings.getToggle('main');
        this.cantSync = bindings.getToggle('cantSync');
        this.error = bindings.getToggle('error');
        this.noChanges = bindings.getToggle('noChanges');
        this.group = new toggles.Group(this.load, this.main, this.cantSync, this.error, this.noChanges);

        this.changesModel = bindings.getModel('changes');
        this.aheadHistory = bindings.getModel('aheadHistory');
    }

    public async push(evt: Event): Promise<void> {
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

    private setupSyncInfo(data: client.SyncInfo): void {
        if (data.aheadBy === 0 && data.behindBy === 0) {
            this.group.activate(this.noChanges);
        }
        else {
            this.group.activate(this.main);
            this.changesModel.setData(data);
            this.aheadHistory.setData(new Iterable.Iterable(data.aheadHistory).select(PushController.formatRow));
        }
    }

    public show(syncInfo: client.SyncInfoResult): void {
        this.setupSyncInfo(syncInfo.data);
        this.dialog.on();
        this.currentSyncInfo = syncInfo;
    }

    private static formatRow(row) {
        var date = new Date(row.when);
        row.when = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        return row;
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