///<amd-module name="edity.core.edit.components.branch"/>

"use strict";

import * as controller from "hr.controller";
import * as navmenu from "edity.editorcore.navmenu";
import * as toggles from "hr.toggles";
import * as editorServices from 'edity.editorcore.EditorServices';
import * as storage from 'hr.storage';

interface BranchCookie {
    currentBranch: string;
}

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

class BranchController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, BranchStorage];
    }

    private dialog: controller.OnOffToggle;

    constructor(bindings: controller.BindingCollection, private storage: BranchStorage) {
        this.dialog = bindings.getToggle('dialog');
    }

    public show(): void {
        this.dialog.on();
        var branchCookie: BranchCookie = this.storage.getValue();
        if (branchCookie === null) {
            branchCookie = {
                currentBranch: "draft"
            }
        }
        this.storage.setValue(branchCookie);
    }
}

class BranchStorage extends storage.JsonStorage<BranchCookie>{
    constructor(storage: storage.IStorageDriver) {
        super(storage);
    }
}

var builder = editorServices.createBaseBuilder();
var childBuilder = builder.createChildBuilder();
childBuilder.Services.addShared(BranchStorage, s => new BranchStorage(new storage.CookieStorageDriver("BranchCookie")));
childBuilder.Services.addShared(BranchController, BranchController);
childBuilder.Services.addShared(NavButtonController, NavButtonController);

childBuilder.create("branch", BranchController);
var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
editMenu.addInjected("BranchNavItem", childBuilder.createOnCallback(NavButtonController));