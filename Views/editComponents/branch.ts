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
        return [controller.BindingCollection, client.EntryPointInjector, controller.InjectedControllerBuilder];
    }

    private branchDropToggle: controller.OnOffToggle;
    private mainToggle: toggles.OnOffToggle;
    private loadToggle: toggles.OnOffToggle;
    private errorToggle: toggles.OnOffToggle;
    private toggleGroup: toggles.Group;
    private branchModel: controller.Model<client.BranchView>;
    private firstOpen: boolean = true;
    private currentBranchModel: controller.IView<client.BranchView>;

    constructor(bindings: controller.BindingCollection, private entryPointInjector: client.EntryPointInjector, private builder: controller.InjectedControllerBuilder) {
        this.branchDropToggle = bindings.getToggle("branchDropToggle");

        this.currentBranchModel = bindings.getView<client.BranchView>("currentBranch");
        this.currentBranchModel.setData({
            friendlyName: "Loading..."
        });

        this.mainToggle = bindings.getToggle("main");
        this.loadToggle = bindings.getToggle("load");
        this.errorToggle = bindings.getToggle("error");
        this.toggleGroup = new toggles.Group(this.mainToggle, this.loadToggle, this.errorToggle);

        this.branchModel = bindings.getModel<BranchModelData>("branch");

        this.loadCurrentBranch();
    }

    public async loadCurrentBranch(): Promise<void> {
        try {
            var entry = await this.entryPointInjector.load();
            if (entry.canGetCurrentBranch()) {
                var branch = await entry.getCurrentBranch();
                this.currentBranchModel.setData(branch.data);
            }
        }
        catch (err) {
            this.currentBranchModel.setData({
                friendlyName: "Error loading current branch."
            });
        }
    }

    public async openBranchDropdown(evt: Event): Promise<void> {
        evt.preventDefault();

        if (this.firstOpen) {
            this.firstOpen = false;
            this.toggleGroup.activate(this.loadToggle);
            try {
                var entry = await this.entryPointInjector.load();
                if (entry.canListBranches()) {
                    var branchResult = await entry.listBranches();
                    var branches = new iter.Iterable(branchResult.items).select(i => {
                        return {
                            friendlyName: i.data.friendlyName,
                            canonicalName: i.data.canonicalName,
                            result: i
                        };
                    });
                    this.branchModel.setData(branches, this.builder.createOnCallback(BranchItem));
                    this.toggleGroup.activate(this.mainToggle);
                }
                else {
                    throw new Error("Cannot list branches.")
                }
            }
            catch (err) {
                this.toggleGroup.activate(this.errorToggle);
            }
        }
    }
}

interface BranchModelData {
    canonicalName?: string;
    friendlyName?: string;
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
        await this.data.result.checkoutBranch();
        window.location.href = window.location.href;
    }
}

var builder = editorServices.createBaseBuilder();
var childBuilder = builder.createChildBuilder();
childBuilder.Services.addShared(NavButtonController, NavButtonController);
childBuilder.Services.addTransient(BranchItem, BranchItem);

var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
editMenu.addInjected("BranchNavItem", navmenu.PublishStart + 20, childBuilder.createOnCallback(NavButtonController));