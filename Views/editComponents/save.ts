///<amd-module name="edity.core.edit.components.save"/>

"use strict";

import * as navmenu from "edity.editorcore.navmenu";
import * as saveService from "edity.editorcore.SaveService";
import * as controller from 'hr.controller';
import * as editorServices from 'edity.editorcore.EditorServices';

class SaveController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection];
    }

    private load: controller.OnOffToggle;

    constructor(bindings: controller.BindingCollection){
        this.load = bindings.getToggle("load");
        this.load.off();

        saveService.saveStartedEvent.add(() => this.load.on());
        saveService.saveCompletedEvent.add(() => this.load.off());
        saveService.saveErrorEvent.add(() => this.load.off());
        saveService.saveErrorEvent.add(() => this.saveError());
    }

    private saveError() {
        alert('Error saving changes. Please try again later.')
    }

    save(evt) {
        evt.preventDefault();
        saveService.saveNow();
    }
}

var builder = editorServices.createBaseBuilder();
var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
builder.Services.tryAddTransient(SaveController, SaveController);
editMenu.addInjected("SaveButton", builder.createOnCallback(SaveController));