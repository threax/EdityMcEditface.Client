///<amd-module name="edity.core.edit.components.source"/>

"use strict";


import * as domQuery from "hr.domquery";
import * as storage from "hr.storage";
import * as controller from "hr.controller";
import * as navmenu from "edity.editorcore.navmenu";
import * as page from "edity.editorcore.PageService";

var CodeMirror = (<any>window).CodeMirror;

class NavItemController {
    constructor(bindings: controller.BindingCollection, private editSourceController: EditSourceController) {

    }

    edit(evt) {
        evt.preventDefault();
        this.editSourceController.startEdit();
    }
}

class EditSourceController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, page.PageService];
    }

    private editSourceDialog;
    private cm;

    constructor(bindings: controller.BindingCollection, private pageService: page.PageService) {
        this.editSourceDialog = bindings.getToggle('dialog');
        var codemirrorElement = domQuery.first('#editSourceTextarea');
        this.cm = CodeMirror.fromTextArea(codemirrorElement, {
            lineNumbers: true,
            mode: "htmlmixed",
            theme: "edity"
        });

        var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
        editMenu.add("EditSourceNavItem", NavItemController, this);
    }

    apply(evt) {
        evt.preventDefault();
        this.editSourceDialog.off();
        this.pageService.setHtml(this.cm.getValue());
    }

    startEdit() {
        this.editSourceDialog.on();
        this.cm.setSize(null, window.innerHeight - 250);
        this.cm.setValue(this.pageService.getHtml());
        setTimeout(() => this.cm.refresh(), 500);
    }
}

var builder = new controller.InjectedControllerBuilder();
page.addServices(controller.InjectedControllerBuilder.GlobalServices);
builder.Services.tryAddTransient(EditSourceController, EditSourceController);

builder.create("editSource", EditSourceController);