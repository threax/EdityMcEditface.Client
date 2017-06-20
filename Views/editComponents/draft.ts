///<amd-module name="edity.core.edit.components.draft"/>

"use strict";

import * as controller from "hr.controller";
import * as navmenu from "edity.editorcore.navmenu";
import * as toggles from "hr.toggles";
import * as editorServices from 'edity.editorcore.EditorServices';
import * as storage from 'hr.storage';
import * as client from 'edity.editorcore.EdityHypermediaClient';
import * as injectors from 'edity.editorcore.EdityHypermediaInjectors';
import * as iter from 'hr.iterable';
import * as uri from 'hr.uri';
import * as hyperCrudPage from 'hr.widgets.HypermediaCrudService';
import * as crudPage from 'hr.widgets.CrudPage';
import * as saveService from "edity.editorcore.SaveService";
import * as git from "edity.editorcore.GitService";

class NavButtonController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [DraftController, client.EntryPointInjector, git.GitService];
    }

    constructor(private controller: DraftController, private entryInjector: client.EntryPointInjector, private gitService: git.GitService) {

    }

    public async open(evt: Event): Promise<void> {
        evt.preventDefault();
        await saveService.saveNow();
        this.handleDraft();
    }

    private async handleDraft(): Promise<void> {
        var entry = await this.entryInjector.load();
        var beginDraft = await entry.beginDraft();
        if (beginDraft.canCommit()) {
            var commitResult = await this.gitService.commit("Before drafting you must commit any outstanding changes.");
            if (commitResult.Success) {
                this.handleDraft();
            }
        }
        else if (beginDraft.canBeginSync()) {
            var syncResult = await this.gitService.sync("Before drafting you must sync changes.");
            if (syncResult.Success) {
                this.handleDraft();
            }
        }
        else {
            this.controller.show();
        }
    }
}

class DraftRowController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, crudPage.ICrudService, controller.InjectControllerData];
    }

    constructor(bindings: controller.BindingCollection, private crudService: crudPage.ICrudService, private data: client.DraftResult) {

    }

    public async draft(evt: Event): Promise<void> {
        if (this.data.canSubmitLatestDraft()) {
            await this.data.submitLatestDraft();
            this.crudService.refreshPage();
        }
    }
}

class DraftController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, client.EntryPointInjector, controller.InjectedControllerBuilder, crudPage.ICrudService];
    }

    private dialog: controller.OnOffToggle;
    private mainToggle: toggles.OnOffToggle;
    private loadToggle: toggles.OnOffToggle;
    private errorToggle: toggles.OnOffToggle;
    private toggleGroup: toggles.Group;
    private fileInfo: client.DraftResult;
    private currentPageInfo: controller.Model<client.Draft>;
    private firstDisplay: boolean = true;

    constructor(bindings: controller.BindingCollection, private entryPointInjector: client.EntryPointInjector, private builder: controller.InjectedControllerBuilder, private crudService: crudPage.ICrudService) {
        this.dialog = bindings.getToggle('dialog');

        this.mainToggle = bindings.getToggle("draftMain");
        this.loadToggle = bindings.getToggle("draftLoad");
        this.errorToggle = bindings.getToggle("draftError");
        this.toggleGroup = new toggles.Group(this.mainToggle, this.loadToggle, this.errorToggle);

        this.currentPageInfo = bindings.getModel<client.Draft>('currentPageInfo');
    }

    public async show(): Promise<void> {
        this.dialog.on();

        try {
            this.toggleGroup.activate(this.loadToggle);
            var entry = await this.entryPointInjector.load();
            if (entry.canListDrafts()) {
                var url = new uri.Uri();
                var path = url.path;
                var collection = await entry.listDrafts({
                    file: path
                });

                if (collection.data.total > 0) {
                    this.fileInfo = collection.items[0];
                    this.currentPageInfo.setData(this.fileInfo.data);

                    if (this.firstDisplay) {
                        this.firstDisplay = false;
                        this.builder.create("draftSearch", hyperCrudPage.CrudSearch);
                        this.builder.create("draftPageNumbers", hyperCrudPage.CrudPageNumbers);
                        this.builder.create("draftTable", hyperCrudPage.CrudTableController);
                    }

                    this.toggleGroup.activate(this.mainToggle);
                }
                else {
                    throw new Error("Could not find a draft for " + path);
                }
            }
            else {
                throw new Error("No permissions to find draft files.");
            }
        }
        catch (err) {
            this.toggleGroup.activate(this.errorToggle);
        }
    }

    public async draft(evt: Event): Promise<void> {
        evt.preventDefault();
        try {
            this.toggleGroup.activate(this.loadToggle);
            if (this.fileInfo.canSubmitLatestDraft()) {
                await this.fileInfo.submitLatestDraft();
                this.fileInfo = await this.fileInfo.refresh();
                this.currentPageInfo.setData(this.fileInfo.data);
                this.toggleGroup.activate(this.mainToggle);
                this.crudService.refreshPage();
            }
        }
        catch (err) {
            this.toggleGroup.activate(this.errorToggle);
        }
    }

    public async draftAll(evt: Event): Promise<void> {
        try {
            this.toggleGroup.activate(this.loadToggle);
            var entry = await this.entryPointInjector.load();
            if (entry.canSubmitAllDrafts()) {
                await entry.submitAllDrafts();
                this.crudService.refreshPage();
                this.toggleGroup.activate(this.mainToggle);
            }
            else {
                throw new Error("Cannot submit all drafts");
            }
        }
        catch (err) {
            this.toggleGroup.activate(this.errorToggle);
        }
    }
}

(async () => {
    var builder = editorServices.createBaseBuilder();

    var childBuilder = builder.createChildBuilder();
    childBuilder.Services.addShared(DraftController, DraftController);
    childBuilder.Services.addShared(NavButtonController, NavButtonController);

    //Check to see if we can draft
    var scope = builder.Services.createScope();
    var injector = scope.getRequiredService(client.EntryPointInjector);
    var entry = await injector.load();

    if (entry.canListDrafts()) {
        childBuilder.Services.tryAddTransient(crudPage.CrudTableRowController, DraftRowController);
        childBuilder.Services.tryAddShared(hyperCrudPage.HypermediaPageInjector, injectors.DraftCrudInjector);
        hyperCrudPage.addServices(childBuilder.Services);

        childBuilder.create("draft", DraftController);
        var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
        editMenu.addInjected("DraftNavItem", childBuilder.createOnCallback(NavButtonController));
    }
})();