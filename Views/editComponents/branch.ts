///<amd-module name="edity.core.edit.components.branch"/>

"use strict";

import * as controller from "hr.controller";
import * as navmenu from "edity.editorcore.navmenu";
import * as toggles from "hr.toggles";
import * as editorServices from 'edity.editorcore.EditorServices';
import * as storage from 'hr.storage';
import * as client from 'edity.editorcore.EdityHypermediaClient';
import * as iter from 'hr.iterable';

class NavButtonController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [BranchController];
    }

    constructor(private controller: BranchController) {

    }

    open(evt) {
        evt.preventDefault();
        this.controller.show();
    }
}

interface BranchModelData {
    name: string;
    result: client.BranchViewResult;
}

class BranchItem {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, controller.InjectControllerData];
    }

    constructor(bindings: controller.BindingCollection, private data: BranchModelData) {

    }

    public async setMode(evt: Event): Promise<void> {
        evt.preventDefault();
        await this.data.result.setBranch();
        window.location.href = window.location.href;
    }
}

class BranchController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, client.EntryPointInjector, controller.InjectedControllerBuilder];
    }

    private dialog: controller.OnOffToggle;
    private mainToggle: toggles.OnOffToggle;
    private loadToggle: toggles.OnOffToggle;
    private errorToggle: toggles.OnOffToggle;
    private toggleGroup: toggles.Group;
    private branchModel: controller.Model<client.BranchView>;

    constructor(bindings: controller.BindingCollection, private entryPointInjector: client.EntryPointInjector, private builder: controller.InjectedControllerBuilder) {
        this.dialog = bindings.getToggle('dialog');

        this.mainToggle = bindings.getToggle("main");
        this.loadToggle = bindings.getToggle("load");
        this.errorToggle = bindings.getToggle("error");
        this.toggleGroup = new toggles.Group(this.mainToggle, this.loadToggle, this.errorToggle);

        this.branchModel = bindings.getModel<BranchModelData>("branch");
    }

    public async show(): Promise<void> {
        this.dialog.on();
        this.toggleGroup.activate(this.mainToggle);
        var entry = await this.entryPointInjector.load();
        if (entry.canListBranches()) {
            var branchResult = await entry.listBranches();
            var branches = new iter.Iterable(branchResult.items).select(i => {
                return {
                    name: i.data.name,
                    result: i
                };
            });
            this.branchModel.setData(branches, this.builder.createOnCallback(BranchItem));
        }
    }
}

var builder = editorServices.createBaseBuilder();
var childBuilder = builder.createChildBuilder();
childBuilder.Services.addShared(BranchController, BranchController);
childBuilder.Services.addShared(NavButtonController, NavButtonController);
childBuilder.Services.addTransient(BranchItem, BranchItem);

childBuilder.create("branch", BranchController);
var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
editMenu.addInjected("BranchNavItem", childBuilder.createOnCallback(NavButtonController));