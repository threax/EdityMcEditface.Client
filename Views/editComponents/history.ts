///<amd-module name="edity.core.edit.components.history"/>

"use strict";

import * as controller from 'htmlrapier/src/controller';
import * as navmenu from '../../EditorCore/navmenu';
import * as toggles from 'htmlrapier/src/toggles';
import * as git from '../../EditorCore/GitService';
import * as editorServices from 'edity.services.EditorServices';
import * as hyperCrudPage from 'htmlrapier.widgets/src/HypermediaCrudService';
import * as injectors from '../../EditorCore/EdityHypermediaInjectors';

class NavButtonController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [HistoryController];
    }

    constructor(private controller: HistoryController) {

    }

    history(evt) {
        evt.preventDefault();
        this.controller.showHistory();
    }
}

class HistoryController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, controller.InjectedControllerBuilder];
    }

    private dialog: toggles.OnOffToggle;
    private firstRun: boolean = true;

    constructor(bindings: controller.BindingCollection, private builder: controller.InjectedControllerBuilder) {
        this.dialog = bindings.getToggle('dialog');

        //Add to nav menu
        var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
        builder.Services.addSharedInstance(HistoryController, this);
        editMenu.addInjected("HistoryNavItem", navmenu.PageInfoStart + 90, builder.createOnCallback(NavButtonController));
    }

    public showHistory(): void {
        if (this.firstRun) {
            //Create table
            builder.create("history.pageNumbers", hyperCrudPage.CrudPageNumbers);
            builder.create("historyMainTable", hyperCrudPage.CrudTableController);
            this.firstRun = false;
        }
        this.dialog.on();
    }
}

var builder = editorServices.createBaseBuilder().createChildBuilder();

hyperCrudPage.addServices(builder.Services);
builder.Services.tryAddShared(hyperCrudPage.HypermediaPageInjector, injectors.PageHistoryCrudInjector);

git.addServices(builder.Services);
builder.Services.tryAddTransient(HistoryController, HistoryController);
builder.Services.tryAddTransient(NavButtonController, NavButtonController);
builder.create("history", HistoryController);