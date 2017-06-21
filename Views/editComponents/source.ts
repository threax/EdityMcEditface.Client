///<amd-module name="edity.core.edit.components.source"/>

"use strict";


import * as domQuery from "hr.domquery";
import * as storage from "hr.storage";
import * as controller from "hr.controller";
import * as navmenu from "edity.editorcore.navmenu";
import * as page from "edity.editorcore.PageService";
import * as editorServices from 'edity.editorcore.EditorServices';

var CodeMirror = (<any>window).CodeMirror;

class NavItemController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [EditSourceController];
    }

    constructor(private editSourceController: EditSourceController) {

    }

    edit(evt) {
        evt.preventDefault();
        this.editSourceController.startEdit();
    }
}

class EditSourceController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, page.PageService, controller.InjectedControllerBuilder];
    }

    private editSourceDialog;
    private cm;

    constructor(bindings: controller.BindingCollection, private pageService: page.PageService, private builder: controller.InjectedControllerBuilder) {
        this.editSourceDialog = bindings.getToggle('dialog');
        var codemirrorElement = domQuery.first('#editSourceTextarea');
        this.cm = CodeMirror.fromTextArea(codemirrorElement, {
            lineNumbers: true,
            mode: "htmlmixed",
            theme: "edity"
        });

        var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
        builder.Services.addSharedInstance(EditSourceController, this);
        editMenu.addInjected("EditSourceNavItem", navmenu.EditStart + 90, builder.createOnCallback(NavItemController));
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

var builder = editorServices.createBaseBuilder();
page.addServices(builder.Services);
builder.Services.tryAddTransient(EditSourceController, EditSourceController);
builder.Services.tryAddTransient(NavItemController, NavItemController);
builder.create("editSource", EditSourceController);