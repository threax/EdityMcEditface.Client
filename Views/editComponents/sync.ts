///<amd-module name="edity.core.edit.components.sync"/>

"use strict";


import * as storage from "hr.storage";
import * as controller from "hr.controller";
import * as navmenu from "edity.editorcore.navmenu";
import * as toggles from "hr.toggles";
import * as Iterable from "hr.iterable";
import * as git from "edity.editorcore.GitService";

class NavButtonController {
    constructor(private syncInstance: SyncController) {

    }

    sync(evt) {
        evt.preventDefault();
        this.syncInstance.startSync();
    }
}

class SyncController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, git.GitService];
    }

    private commitModel;
    private dialog;

    private load;
    private main;
    private cantSync;
    private error;
    private noChanges;
    private group;

    private changesModel;
    private behindHistory;
    private aheadHistory;

    constructor(bindings: controller.BindingCollection, private GitService: git.GitService) {
        this.commitModel = bindings.getModel('commit');
        this.dialog = bindings.getToggle('dialog');

        this.load = bindings.getToggle('load');
        this.main = bindings.getToggle('main');
        this.cantSync = bindings.getToggle('cantSync');
        this.error = bindings.getToggle('error');
        this.noChanges = bindings.getToggle('noChanges');
        this.group = new toggles.Group(this.load, this.main, this.cantSync, this.error, this.noChanges);

        this.changesModel = bindings.getModel('changes');
        this.behindHistory = bindings.getModel('behindHistory');
        this.aheadHistory = bindings.getModel('aheadHistory');

        var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
        editMenu.add("SyncNavItem", NavButtonController, this);
    }

    push(evt) {
        evt.preventDefault();
        this.group.activate(this.load);
        this.GitService.push()
            .then((data) => this.GitService.syncInfo())
            .then((data) => this.setupSyncInfo(data))
            .catch((data) => this.group.activate(this.error));
    }

    pull(evt) {
        evt.preventDefault();
        this.group.activate(this.load);
        this.GitService.pull()
            .then((data) => this.GitService.syncInfo())
            .then((data) => this.setupSyncInfo(data))
            .catch((data) => this.group.activate(this.error));
    }

    private setupSyncInfo(data) {
        if (data.hasUncomittedChanges) {
            this.group.activate(this.cantSync);
        }
        else {
            if (data.aheadBy === 0 && data.behindBy === 0) {
                this.group.activate(this.noChanges);
            }
            else {
                this.group.activate(this.main);
                this.changesModel.setData(data);
                this.behindHistory.setData(new Iterable.Iterable(data.behindHistory).select(SyncController.formatRow));
                this.aheadHistory.setData(new Iterable.Iterable(data.aheadHistory).select(SyncController.formatRow));
            }
        }
    }

    startSync() {
        this.group.activate(this.load);
        this.dialog.on();

        this.GitService.syncInfo()
            .then((data) => this.setupSyncInfo(data))
            .catch((err) => this.group.activate(this.error));
    }

    private static formatRow(row) {
        var date = new Date(row.when);
        row.when = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        return row;
    }
}

var builder = new controller.InjectedControllerBuilder();
git.addServices(controller.InjectedControllerBuilder.GlobalServices);
builder.Services.tryAddShared(SyncController, SyncController);

builder.create("sync", SyncController);