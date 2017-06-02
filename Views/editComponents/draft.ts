///<amd-module name="edity.core.edit.components.draft"/>

"use strict";

import * as controller from "hr.controller";
import * as navmenu from "edity.editorcore.navmenu";
import * as toggles from "hr.toggles";
import * as editorServices from 'edity.editorcore.EditorServices';
import * as storage from 'hr.storage';
import * as client from 'edity.editorcore.EdityHypermediaClient';
import * as iter from 'hr.iterable';
import * as uri from 'hr.uri';

class NavButtonController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [DraftController];
    }

    constructor(private controller: DraftController) {

    }

    open(evt) {
        evt.preventDefault();
        this.controller.show();
    }
}

class DraftController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, client.EntryPointInjector, controller.InjectedControllerBuilder];
    }

    private dialog: controller.OnOffToggle;
    private mainToggle: toggles.OnOffToggle;
    private loadToggle: toggles.OnOffToggle;
    private errorToggle: toggles.OnOffToggle;
    private toggleGroup: toggles.Group;
    private fileInfo: client.DraftResult;

    constructor(bindings: controller.BindingCollection, private entryPointInjector: client.EntryPointInjector, private builder: controller.InjectedControllerBuilder) {
        this.dialog = bindings.getToggle('dialog');

        this.mainToggle = bindings.getToggle("main");
        this.loadToggle = bindings.getToggle("load");
        this.errorToggle = bindings.getToggle("error");
        this.toggleGroup = new toggles.Group(this.mainToggle, this.loadToggle, this.errorToggle);
    }

    public async show(): Promise<void> {
        this.dialog.on();

        try {
            this.toggleGroup.activate(this.loadToggle);
            var entry = await this.entryPointInjector.load();
            if (entry.canListDrafts()) {
                var url = new uri.Uri();
                var path = url.path;
                if (path.length > 0) {
                    path = path.substr(1);
                }
                var collection = await entry.listDrafts({
                    file: path
                });

                if (collection.data.total > 0) {
                    this.fileInfo = collection.items[0];
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
                this.toggleGroup.activate(this.mainToggle);
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
        childBuilder.create("draft", DraftController);
        var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
        editMenu.addInjected("DraftNavItem", childBuilder.createOnCallback(NavButtonController));
    }
})();