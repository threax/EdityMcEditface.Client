"use strict";

import * as controller from 'htmlrapier/src/controller';
import * as client from '../../EditorCore/EdityHypermediaClient';
import * as navmenu from '../../EditorCore/navmenu';
import * as Toggles from 'htmlrapier/src/toggles';
import * as editorServices from 'edity.services.EditorServices';
import * as uri from 'htmlrapier/src/uri';

class NavButtonController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [PageSettingsController];
    }

    constructor(private pageSettingsInstance: PageSettingsController) {

    }

    open(evt) {
        evt.preventDefault();
        this.pageSettingsInstance.open();
    }
}

class DeletePageConfirmationController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection];
    }

    private dialog;
    private model;
    private currentPage: client.PageInfoResult = null;

    constructor(bindings: controller.BindingCollection) {
        this.dialog = bindings.getToggle('dialog');
        this.model = bindings.getModel("info");
    }

    public async deletePage(evt: Event): Promise<void> {
        evt.preventDefault();
        evt.stopPropagation();

        //Need to delete page
        if (this.currentPage !== null) {
            await this.currentPage.deletePage();
        }
        this.currentPage = null;
        this.dialog.off();
    }

    confirmDelete(name: string, currentPage: client.PageInfoResult) {
        this.model.setData(name);
        this.currentPage = currentPage;
        this.dialog.on();
    }
}

class PageSettingsController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, client.EntryPointInjector, DeletePageConfirmationController, controller.InjectedControllerBuilder];
    }

    private dialog;
    private main: Toggles.Toggle;
    private error: Toggles.Toggle;
    private load: Toggles.Toggle;
    private toggles: Toggles.Group;
    private settings: controller.Model<client.PageSettings>;
    private currentPage: client.PageInfoResult;

    constructor(bindings: controller.BindingCollection, private entryInjector: client.EntryPointInjector, private deletePageConfirmation: DeletePageConfirmationController, private builder: controller.InjectedControllerBuilder) {
        this.dialog = bindings.getToggle('dialog');

        this.main = bindings.getToggle('main');
        this.error = bindings.getToggle('error');
        this.load = bindings.getToggle('load');
        this.toggles = new Toggles.Group(this.main, this.error, this.load);

        this.settings = bindings.getModel<client.PageSettings>("settings");

        var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
        builder.Services.addSharedInstance(PageSettingsController, this);
        editMenu.addInjected("SettingsNavItem", navmenu.PageInfoStart + 10, builder.createOnCallback(NavButtonController));
    }

    public deletePage(evt: Event): void {
        evt.preventDefault();
        evt.stopPropagation();
        this.deletePageConfirmation.confirmDelete(document.title, this.currentPage);
        this.dialog.off();
    }

    public async open(): Promise<void> {
        this.toggles.activate(this.load);
        this.dialog.on();
        try {
            var entry = await this.entryInjector.load();
            if (entry.canListPages()) {
                var url = new uri.Uri();
                var path = url.path;
                var pages = await entry.listPages({
                    file: path
                });

                if (pages.data.total >= 0) {
                    this.currentPage = pages.items[0];

                    if (this.currentPage.canGetSettings()) {
                        var settingsResult = await this.currentPage.getSettings();
                        this.settings.setData(settingsResult.data);
                        this.toggles.activate(this.main);
                    }
                }
            }
        }
        catch (err) {
            console.log("Error loading page settings " + err.message);
            this.toggles.activate(this.error);
        }
    }

    public async submit(evt: Event): Promise<void> {
        evt.preventDefault();
        try {
            this.toggles.activate(this.load);
            var data = this.settings.getData();
            await this.currentPage.updateSettings(data);
            this.toggles.activate(this.main);
            this.dialog.off();
        }
        catch (err) {
            console.log("Error saving page settings " + err.message);
            this.toggles.activate(this.error);
        }
    }
}

var builder = editorServices.createBaseBuilder().createChildBuilder();
builder.Services.tryAddShared(DeletePageConfirmationController, DeletePageConfirmationController);
builder.Services.tryAddShared(PageSettingsController, PageSettingsController);
builder.Services.tryAddTransient(NavButtonController, NavButtonController);
builder.create('deletePageConfirm', DeletePageConfirmationController);
builder.create('pageSettings', PageSettingsController);