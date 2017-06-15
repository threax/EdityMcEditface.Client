///<amd-module name="edity.core.new"/>

"use strict";

import * as http from "hr.http";
import * as uploader from "edity.editorcore.uploader";
import * as component from "hr.components";
import * as domQuery from "hr.domquery";
import * as controller from "hr.controller";
import { Fetcher } from 'hr.fetcher';
import * as editorServices from 'edity.editorcore.EditorServices';
import * as di from 'hr.di';
import { IBaseUrlInjector } from 'edity.editorcore.BaseUrlInjector';
import * as client from 'edity.editorcore.EdityHypermediaClient';
import * as uri from 'hr.uri';
import { ResultModel } from 'hr.halcyon.ResultModel';

class TemplateItemController {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [controller.BindingCollection, controller.InjectControllerData, client.EntryPointInjector];
    }

    constructor(bindings: controller.BindingCollection, private data: client.TemplateViewResult, private entryInjector: client.EntryPointInjector) {
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

            var contentResponse = await this.data.getContent();
            if (contentResponse.status !== 200) {
                throw new Error("Could not get content, response was not 200 instead got " + contentResponse.status);
            }

            var templateData = await contentResponse.text();

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
        return [controller.BindingCollection, controller.InjectedControllerBuilder, client.EntryPointInjector];
    }

    private templatesModel: ResultModel<client.TemplateView, client.TemplateViewResult>;

    constructor(bindings: controller.BindingCollection, private builder: controller.InjectedControllerBuilder, private entryInjector: client.EntryPointInjector) {
        this.templatesModel = new ResultModel<client.TemplateView, client.TemplateViewResult>(bindings.getModel<client.TemplateViewResult>('templates'));
        this.setup();
    }

    private async setup(): Promise<void> {
        try {
            var entry = await this.entryInjector.load();
            if (!entry.canListTemplates()) {
                throw new Error("Error creating page: cannot list templates");
            }
            var templates = await entry.listTemplates();
            this.templatesModel.setData(templates.items, this.builder.createOnCallback(TemplateItemController));
        }
        catch (err) {
            alert('Cannot load templates, please try again later');
        }
    }
}

var builder = editorServices.createBaseBuilder();
builder.Services.tryAddTransient(TemplateItemController, TemplateItemController);
builder.Services.tryAddTransient(NewPageController, NewPageController);
builder.create("new", NewPageController);