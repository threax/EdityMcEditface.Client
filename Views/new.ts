///<amd-module name="edity.core.new"/>

"use strict";

import * as http from "hr.http";
import * as uploader from "edity.editorcore.uploader";
import * as component from "hr.components";
import * as domQuery from "hr.domquery";
import * as controller from "hr.controller";
import { TemplateClient, Template } from "edity.editorcore.EdityClient";
import { Fetcher } from 'hr.fetcher';
import * as editorServices from 'edity.editorcore.EditorServices';
import * as di from 'hr.di';
import { IBaseUrlInjector } from 'edity.editorcore.BaseUrlInjector';
import * as edityClient from 'edity.editorcore.EdityClient';
import * as client from 'edity.editorcore.EdityHypermediaClient';
import * as uri from 'hr.uri';

class TemplateItemController {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [controller.BindingCollection, controller.InjectControllerData, client.EntryPointInjector, TemplateClient];
    }

    constructor(bindings: controller.BindingCollection, private data: Template, private entryInjector: client.EntryPointInjector, private templateClient: TemplateClient) {
        this.data = data;
    }

    public async create(evt: Event): Promise<void> {
        evt.preventDefault();
        try {
            var entry = await this.entryInjector.load();
            if (!entry.canListPages()) {
                throw new Error("Cannot list pages");
            }
            var url = new uri.Uri();
            var pages = await entry.listPages({
                file: url.path
            });
            if (pages.data.total === 0) {
                throw new Error("Cannot find page " + url.path);
            }
            var page = pages.items[0];
            if (!page.canSavePage()) {
                throw new Error("Cannot save page " + url.path);
            }

            var templateData = await this.templateClient.getContent(this.data.path, null);

            await page.savePage({
                content: new Blob([templateData], { type: "text/html" })
            });

            window.location.href = window.location.href; //Reload page
        }
        catch (err) {
            console.log("Error saving new page\nMessage: " + err.message);
            alert('Could not create new page. Please try again later');
        }
    }
}

class NewPageController {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [controller.BindingCollection, TemplateClient, controller.InjectedControllerBuilder];
    }

    private templatesModel;

    constructor(bindings: controller.BindingCollection, private templateClient: TemplateClient, private builder: controller.InjectedControllerBuilder) {
        this.templatesModel = bindings.getModel<Template>('templates');
        this.setup();
    }

    private async setup() {
        try {
            var data = await this.templateClient.listAll(null);
            this.templatesModel.setData(data, this.builder.createOnCallback(TemplateItemController));
        }
        catch (err) {
            alert('Cannot load templates, please try again later');
        }
    }
}

var builder = editorServices.createBaseBuilder();

edityClient.addServices(builder.Services);

builder.Services.tryAddShared(TemplateClient, s => {
    var fetcher = s.getRequiredService(Fetcher);
    var shim = s.getRequiredService(IBaseUrlInjector);
    return new TemplateClient(shim.BaseUrl, fetcher);
});
builder.Services.tryAddTransient(TemplateItemController, TemplateItemController);
builder.Services.tryAddTransient(NewPageController, NewPageController);
builder.create("new", NewPageController);