///<amd-module name="edity.core.edit"/>

"use strict";

import * as component from 'htmlrapier/src/components';
import * as domQuery from 'htmlrapier/src/domquery';
import * as navmenu from 'edity.editorcore.navmenu';
import * as controller from 'htmlrapier/src/controller';
import * as storage from 'htmlrapier/src/storage';

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

function itemAdded(args: navmenu.INavMenuItemAddedArgs) {
    var item = args.added;
    var insert = args.insertBefore ? args.insertBefore.rootNode : null;
    component.one(item.name, null, navMenu, insert, item.created);
}

var menu = navmenu.getNavMenu("edit-nav-menu-items");
menu.getItems().forEach((value) => {
    itemAdded({
        added: value,
        insertBefore: null
    });
});
menu.itemAdded.add(itemAdded);

var builder = new controller.InjectedControllerBuilder();
builder.Services.addTransient(ToolsViewController, ToolsViewController);
builder.Services.tryAddTransient(ToolsViewStorage, s => new ToolsViewStorage(new storage.SessionStorageDriver("toolsViewStorage")));
builder.create("edity-tools", ToolsViewController);