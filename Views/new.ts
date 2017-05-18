///<amd-module name="edity.core.new"/>

"use strict";

import * as http from "hr.http";
import * as uploader from "edity.editorcore.uploader";
import * as component from "hr.components";
import * as domQuery from "hr.domquery";
import * as controller from "hr.controller";
import { TemplateClient, Template, PageClient } from "edity.editorcore.EdityClient";
import { Fetcher } from 'hr.fetcher';
import * as editorServices from 'edity.editorcore.EditorServices';
import * as di from 'hr.di';
import { IBaseUrlInjector } from 'edity.editorcore.BaseUrlInjector';
import * as edityClient from 'edity.editorcore.EdityClient';

class TemplateItemController {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [controller.BindingCollection, controller.InjectControllerData, PageClient, TemplateClient];
    }

    constructor(bindings: controller.BindingCollection, private data: Template, private pageClient: PageClient, private templateClient: TemplateClient) {
        this.data = data;
    }

    create(evt) {
        evt.preventDefault();
        this.templateClient.getContent(this.data.path, null)
            .then((templateData) => {
                //Make a blob
                var blob = new Blob([templateData], { type: "text/html" });
                return this.pageClient.save(window.location.pathname, { data: blob, fileName: 'file.html' }, null);
            })
            .then(function (data) {
                window.location.href = window.location.href;
            })
            .catch(function (data) {
                alert('Could not create new page. Please try again later');
            });

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

var builder = new controller.InjectedControllerBuilder();

edityClient.addServices(builder.Services);

builder.Services.tryAddShared(PageClient, s => {
    var fetcher = s.getRequiredService(Fetcher);
    var shim = s.getRequiredService(IBaseUrlInjector);
    return new PageClient(shim.BaseUrl, fetcher);
});
builder.Services.tryAddShared(TemplateClient, s => {
    var fetcher = s.getRequiredService(Fetcher);
    var shim = s.getRequiredService(IBaseUrlInjector);
    return new TemplateClient(shim.BaseUrl, fetcher);
});
builder.Services.tryAddTransient(TemplateItemController, TemplateItemController);
builder.Services.tryAddTransient(NewPageController, NewPageController);
builder.create("new", NewPageController);