///<amd-module name="edity.core.edit.components.settings"/>

"use strict";

import * as controller from "hr.controller";
import * as FormLifecycle from "edity.editorcore.FormLifecycle";
import * as storage from "hr.storage";
import { PageClient, PageSettings, addServices as addEdityClientServices } from "edity.editorcore.EdityClient";
import * as navmenu from "edity.editorcore.navmenu";
import * as Toggles from 'hr.toggles';
import { Fetcher } from 'hr.fetcher';
import * as editorServices from 'edity.editorcore.EditorServices';

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
        return [controller.BindingCollection, PageClient];
    }

    private dialog;
    private model;
    private uploadUrl;
    private currentUrl;
    private client: PageClient;

    constructor(bindings: controller.BindingCollection, client: PageClient) {
        this.dialog = bindings.getToggle('dialog');
        this.model = bindings.getModel("info");
        this.uploadUrl = this.model.getSrc();
        this.currentUrl;
        this.client = client;
    }

    deletePage(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this.client.delete(this.currentUrl, null);
        this.currentUrl = null;
        this.dialog.off();
    }

    confirmDelete(name, url) {
        this.model.setData(name);
        this.currentUrl = url;
        this.dialog.on();
    }
}

class PageSettingsController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, PageClient, DeletePageConfirmationController, controller.InjectedControllerBuilder];
    }

    private dialog;
    private main: Toggles.Toggle;
    private error: Toggles.Toggle;
    private load: Toggles.Toggle;
    private toggles: Toggles.Group;
    private settings: controller.Model<PageSettings>;

    constructor(bindings: controller.BindingCollection, private client: PageClient, private deletePageConfirmation: DeletePageConfirmationController, private builder: controller.InjectedControllerBuilder) {
        this.dialog = bindings.getToggle('dialog');

        this.main = bindings.getToggle('main');
        this.error = bindings.getToggle('error');
        this.load = bindings.getToggle('load');
        this.toggles = new Toggles.Group(this.main, this.error, this.load);

        this.settings = bindings.getModel<PageSettings>("settings");

        var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
        builder.Services.addSharedInstance(PageSettingsController, this);
        editMenu.addInjected("SettingsNavItem", builder.createOnCallback(NavButtonController));
    }

    deletePage(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this.deletePageConfirmation.confirmDelete(document.title, window.location.pathname);
        this.dialog.off();
    }

    open() {
        this.toggles.activate(this.load);
        this.client.getSettings(window.location.pathname, null)
            .then(data => {
                this.settings.setData(data);
                this.toggles.activate(this.main);
            })
            .catch(err => {
                this.toggles.activate(this.error);
            });
        this.dialog.on();
    }

    submit(evt) {
        evt.preventDefault();
        this.toggles.activate(this.load);
        var data = this.settings.getData();
        this.client.updateSettings(window.location.pathname, data, null)
            .then(result => {
                this.toggles.activate(this.main);
                this.dialog.off();
            })
            .catch(err => {
                this.toggles.activate(this.error);
            });
    }
}

var builder = editorServices.createBaseBuilder();
addEdityClientServices(builder.Services);
builder.Services.tryAddShared(DeletePageConfirmationController, DeletePageConfirmationController);
builder.Services.tryAddShared(PageSettingsController, PageSettingsController);
builder.Services.tryAddTransient(NavButtonController, NavButtonController);
builder.create('deletePageConfirm', DeletePageConfirmationController);
builder.create('pageSettings', PageSettingsController);