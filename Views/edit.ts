///<amd-module name="edity.core.edit"/>

"use strict";

import * as component from "hr.components";
import * as domQuery from "hr.domquery";
import * as navmenu from "edity.editorcore.navmenu";
import * as controller from 'hr.controller';
import * as toggle from 'hr.toggles';

class ToolsViewController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection];
    }

    private mainToggle: controller.OnOffToggle;

    constructor(bindings: controller.BindingCollection) {
        this.mainToggle = bindings.getToggle("main");
    }

    public toggleTools(evt: Event) {
        evt.preventDefault();
        this.mainToggle.toggle();
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
builder.create("edity-tools", ToolsViewController);