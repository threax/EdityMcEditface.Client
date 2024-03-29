"use strict";

import * as controller from 'htmlrapier/src/controller';
import * as navmenu from '../../EditorCore/navmenu';
import * as toggles from 'htmlrapier/src/toggles';
import * as editorServices from 'edity.services.EditorServices';
import * as client from '../../EditorCore/EdityHypermediaClient';
import * as injectors from '../../EditorCore/EdityHypermediaInjectors';
import * as uri from 'htmlrapier/src/uri';
import * as hyperCrudPage from 'htmlrapier.widgets/src/HypermediaCrudService';
import * as crudPage from 'htmlrapier.widgets/src/CrudPage';
import * as saveService from '../../EditorCore/SaveService';
import * as git from '../../EditorCore/GitService';

class NavButtonController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, DraftController, client.EntryPointInjector, git.GitService];
    }

    private load: controller.OnOffToggle;

    constructor(bindings: controller.BindingCollection, private controller: DraftController, private entryInjector: client.EntryPointInjector, private gitService: git.GitService) {
        this.load = bindings.getToggle("load");
        this.load.off();
    }

    public async open(evt: Event): Promise<void> {
        evt.preventDefault();
        try {
            await saveService.saveNow();
            this.handleDraft();
        }
        catch (err) {
            this.load.off();
            console.log("General error drafting\nMessage:" + err.message);
        }
    }

    private async handleDraft(): Promise<void> {
        try {
            this.load.on();
            var entry = await this.entryInjector.load();
            var beginDraft = await entry.beginDraft();
            if (beginDraft.canCommit()) {
                this.load.off();
                var commitResult = await this.gitService.commit("Before drafting you must commit any outstanding changes.");
                if (commitResult.Success) {
                    await this.handleDraft();
                }
            }
            else if (beginDraft.canBeginSync()) {
                this.load.off();
                var syncResult = await this.gitService.sync("Before drafting you must sync changes.");
                if (syncResult.Success) {
                    await this.handleDraft();
                }
            }
            else {
                this.load.off();
                this.controller.show();
            }
        }
        catch (err) {
            this.load.off();
            throw err;
        }
    }
}

class DraftRowController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, crudPage.ICrudService, controller.InjectControllerData];
    }

    private view: controller.IView<client.Draft>;

    constructor(bindings: controller.BindingCollection, private crudService: crudPage.ICrudService, private data: client.DraftResult) {
        this.view = bindings.getView("draftStatus");
        this.view.setData(data.data);
    }

    public async draft(evt: Event): Promise<void> {
        if (this.data.canSubmitLatestDraft()) {
            var result = await this.data.submitLatestDraft();
            this.view.setData(result.data);
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
    var injector = childBuilder.createUnbound(client.EntryPointInjector);
    var entry = await injector.load();

    if (entry.canListDrafts()) {
        childBuilder.Services.tryAddTransient(crudPage.CrudTableRowController, DraftRowController);
        childBuilder.Services.tryAddShared(hyperCrudPage.HypermediaPageInjector, injectors.DraftCrudInjector);
        hyperCrudPage.addServices(childBuilder.Services);

        childBuilder.create("draft", DraftController);
        var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
        editMenu.addInjected("DraftNavItem", navmenu.PublishStart + 0, childBuilder.createOnCallback(NavButtonController));
    }
})();