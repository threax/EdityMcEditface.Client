///<amd-module name="edity.core.edit"/>

"use strict";

import * as component from "hr.components";
import * as domQuery from "hr.domquery";
import * as navmenu from "edity.editorcore.navmenu";
import * as controller from 'hr.controller';
import * as toggle from 'hr.toggles';
import * as storage from "hr.storage";

class ToolsViewController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, ToolsViewStorage];
    }

    private mainToggle: controller.OnOffToggle;

    constructor(bindings: controller.BindingCollection, private storage: ToolsViewStorage) {
        this.mainToggle = bindings.getToggle("main");

        var status = this.storage.getValue({
            open: false
        });

        if (status.open) {
            this.mainToggle.on();
        }

        window.addEventListener("beforeunload", e => {
            this.storage.setValue({
                open: this.mainToggle.mode
            });
        });
    }

    public toggleTools(evt: Event) {
        evt.preventDefault();
        this.mainToggle.toggle();
    }
}

interface ToolsViewSessionData {
    open: boolean;
}

export class ToolsViewStorage extends storage.JsonStorage<ToolsViewSessionData> {
    constructor(storageDriver: storage.IStorageDriver) {
        super(storageDriver)
    }
}

var navMenu = domQuery.first('[data-editor-navmenu]');

function itemAdded(item: navmenu.INavMenuItem) {
    component.single(item.name, navMenu, null, item.created);
}

var menu = navmenu.getNavMenu("edit-nav-menu-items");
menu.getItems().forEach(itemAdded);
menu.itemAdded.add(itemAdded);

var builder = new controller.InjectedControllerBuilder();
builder.Services.addTransient(ToolsViewController, ToolsViewController);
builder.Services.tryAddTransient(ToolsViewStorage, s => new ToolsViewStorage(new storage.SessionStorageDriver("toolsViewStorage")));
builder.create("edity-tools", ToolsViewController);