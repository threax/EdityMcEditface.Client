﻿///<amd-module name="edity.core.edit.components.commit"/>

"use strict";

import * as storage from "hr.storage";
import * as controller from "hr.controller";
import * as navmenu from "edity.editorcore.navmenu";
import * as toggles from "hr.toggles";
import * as saveService from "edity.editorcore.SaveService";
import * as editorServices from 'edity.editorcore.EditorServices';
import * as client from 'edity.editorcore.EdityHypermediaClient';
import * as git from "edity.editorcore.GitService";
import { ResultModel } from 'hr.halcyon.ResultModel';
import { ExternalPromise } from 'hr.externalpromise';

class NavButtonController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [CommitController];
    }

    constructor(private controller: CommitController) {

    }

    public async commit(evt: Event): Promise<void> {
        evt.preventDefault();
        await saveService.saveNow();
        this.controller.startCommit();
    }
}

class CommitHandler implements git.ICommitHandler {
    constructor(private controller: CommitController) {

    }

    public commit(): Promise<git.CommitResult> {
        return this.controller.startCommit();
    }
}

class CommitController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, client.EntryPointInjector, controller.InjectedControllerBuilder, git.GitService];
    }

    private commitModel: controller.Model<any>;
    private dialog: controller.OnOffToggle;

    private main: controller.OnOffToggle;
    private load: controller.OnOffToggle;
    private error: controller.OnOffToggle;
    private noChanges: controller.OnOffToggle;
    private toggleGroup: toggles.Group;
    private changedFiles: ResultModel<client.UncommittedChange, client.UncommittedChangeResult>;
    private currentRowCreatedCallback: any;
    private currentPromise: ExternalPromise<git.CommitResult> = null;

    constructor(bindings: controller.BindingCollection, private entry: client.EntryPointInjector, private builder: controller.InjectedControllerBuilder, private GitService: git.GitService) {
        this.commitModel = bindings.getModel('commit');
        this.dialog = bindings.getToggle('dialog');

        this.main = bindings.getToggle('main');
        this.load = bindings.getToggle('load');
        this.error = bindings.getToggle('error');
        this.noChanges = bindings.getToggle('noChanges');
        this.toggleGroup = new toggles.Group(this.main, this.load, this.error, this.noChanges);
        this.changedFiles = new ResultModel(bindings.getModel<client.UncommittedChange>('changedFiles'));

        GitService.revertStarted.add(() => this.toggleGroup.activate(this.load));
        GitService.setCommitHandler(new CommitHandler(this));

        GitService.revertCompleted.add((success) => {
            if (success) {
                this.updateUncommittedFiles();
            }
            else {
                this.toggleGroup.activate(this.error);
            }
        });

        var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
        this.builder.Services.addSharedInstance(CommitController, this);
        editMenu.addInjected("CommitNavItem", this.builder.createOnCallback(NavButtonController));
    }

    private async updateUncommittedFiles(): Promise<void> {
        try {
            var entryPoint = await this.entry.load();
            var changes = await entryPoint.getUncommittedChanges();

            if (changes.items.length > 0) {
                this.changedFiles.setData(changes.items, (bindings, data) => this.commitRowCreated(bindings, data), (data) => this.determineCommitVariant(data));
                this.toggleGroup.activate(this.main);
            }
            else {
                this.toggleGroup.activate(this.noChanges);
            }
        }
        catch (err) {
            this.toggleGroup.activate(this.error);
        }
    }

    public async commit(evt: Event): Promise<void> {
        evt.preventDefault();
        try {
            this.toggleGroup.activate(this.load);
            var data = this.commitModel.getData();
            var entryPoint = await this.entry.load();
            if (entryPoint.canCommit()) {
                await entryPoint.commit(data);
                this.toggleGroup.activate(this.main);
                this.commitModel.clear();
                this.dialog.off();
                //Fire sucessful promise event
                if (this.currentPromise !== null) {
                    this.currentPromise.resolve(new git.CommitResult(true));
                    this.currentPromise = null;
                }
            }
        }
        catch (err) {
            this.toggleGroup.activate(this.main);
            alert('Error Committing');
        }
    }

    public startCommit(): Promise<git.CommitResult> {
        //If we had an old promise hanging around we never completed the commit, send a negative result to whoever is waiting
        if (this.currentPromise !== null) {
            this.currentPromise.resolve(new git.CommitResult(false));
        }

        this.currentPromise = new ExternalPromise();

        this.toggleGroup.activate(this.load);
        this.dialog.on();
        this.updateUncommittedFiles();

        return this.currentPromise.Promise;
    }

    private determineCommitVariant(result: client.UncommittedChangeResult) {
        var listenerVariant = this.GitService.fireDetermineCommitVariant(result);
        if (listenerVariant) {
            this.currentRowCreatedCallback = listenerVariant[0].rowCreated;
            return listenerVariant[0].variant;
        }
        return result.data.state;
    }

    private commitRowCreated(bindings: controller.BindingCollection, data: client.UncommittedChangeResult) {
        if (this.currentRowCreatedCallback) {
            this.currentRowCreatedCallback(bindings, data);
            this.currentRowCreatedCallback = null;
        }
    }
}

var builder = editorServices.createBaseBuilder();
git.addServices(builder.Services);
builder.Services.tryAddTransient(CommitController, CommitController);
builder.Services.tryAddTransient(NavButtonController, NavButtonController);

builder.create("commit", CommitController);