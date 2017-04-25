///<amd-module name="edity.core.edit.components.commit"/>

"use strict";

import * as storage from "hr.storage";
import * as controller from "hr.controller";
import * as navmenu from "edity.editorcore.navmenu";
import * as toggles from "hr.toggles";
import * as git from "edity.editorcore.GitService";
import * as saveService from "edity.editorcore.SaveService";

class NavButtonController {
    constructor(bindings, private controller: CommitController) {

    }

    commit(evt) {
        evt.preventDefault();
        saveService.saveNow()
        .then(r => {
            this.controller.startCommit();
        })
    }
}

class CommitController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, git.GitService];
    }

    private commitModel;
    private dialog;

    private main;
    private load;
    private error;
    private noChanges;
    private toggleGroup;
    private changedFiles;
    private currentRowCreatedCallback;

    constructor(bindings: controller.BindingCollection, private GitService: git.GitService) {
        this.commitModel = bindings.getModel('commit');
        this.dialog = bindings.getToggle('dialog');

        this.main = bindings.getToggle('main');
        this.load = bindings.getToggle('load');
        this.error = bindings.getToggle('error');
        this.noChanges = bindings.getToggle('noChanges');
        this.toggleGroup = new toggles.Group(this.main, this.load, this.error, this.noChanges);
        this.changedFiles = bindings.getModel('changedFiles');

        GitService.revertStarted.add(() => this.toggleGroup.activate(this.load));

        GitService.revertCompleted.add((success) => {
            if (success) {
                this.updateUncommittedFiles();
            }
            else {
                this.toggleGroup.activate(this.error);
            }
        });

        var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
        editMenu.add("CommitNavItem", NavButtonController, this);
    }

    private updateUncommittedFiles() {
        this.GitService.uncommittedChanges()
            .then((data: any[]) => {
                if (data.length > 0) {
                    this.toggleGroup.activate(this.main);
                    this.changedFiles.setData(data, (bindings, data) => this.commitRowCreated(bindings, data), (data) => this.determineCommitVariant(data));
                }
                else {
                    this.toggleGroup.activate(this.noChanges);
                }
            })
            .catch((data) => {
                this.toggleGroup.activate(this.error);
            });
    }

    commit(evt) {
        evt.preventDefault();
        this.toggleGroup.activate(this.load);
        var data = this.commitModel.getData();
        this.GitService.commit(data)
            .then((resultData) => {
                this.toggleGroup.activate(this.main);
                this.commitModel.clear();
                this.dialog.off();
            })
            .catch((errorData) => {
                this.toggleGroup.activate(this.main);
                alert('Error Committing');
            });
    }

    startCommit() {
        this.toggleGroup.activate(this.load);
        this.dialog.on();
        this.updateUncommittedFiles();
    }

    private determineCommitVariant(data) {
        var listenerVariant = this.GitService.fireDetermineCommitVariant(data);
        if (listenerVariant) {
            this.currentRowCreatedCallback = listenerVariant[0].rowCreated;
            return listenerVariant[0].variant;
        }
        return data.state;
    }

    private commitRowCreated(bindings, data) {
        if (this.currentRowCreatedCallback) {
            this.currentRowCreatedCallback(bindings, data);
            this.currentRowCreatedCallback = null;
        }
    }
}

var builder = new controller.InjectedControllerBuilder();
git.addServices(builder.Services);
builder.Services.tryAddTransient(CommitController, CommitController);

builder.create("commit", CommitController);