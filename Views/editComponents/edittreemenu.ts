///<amd-module name="edity.core.edit.components.edittreemenu"/>

"use strict";

import * as controller from "hr.controller";
import * as toggles from "hr.toggles";
import * as http from "hr.http";
import * as saveService from "edity.editorcore.SaveService";
import * as EdityClient from 'edity.editorcore.EdityClient';
import * as Iter from 'hr.iterable';
import * as TreeMenu from 'hr.treemenu.TreeMenu';
import * as TreeMenuEditor from 'hr.treemenu.TreeMenuEditor';
import { Fetcher } from 'hr.fetcher';
import * as editorServices from 'edity.editorcore.EditorServices';

export class TreeMenuEditProvider extends TreeMenu.TreeMenuProvider {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [Fetcher, EdityClient.UploadClient];
    }

    private hasChanges = false;

    constructor(fetcher: Fetcher, private uploadClient: EdityClient.UploadClient) {
        super(fetcher);
        saveService.saveEvent.add(a => this.save());
    }

    public menuRebuilt() {
        this.hasChanges = true;
        saveService.requestSave();
    }

    private async save() {
        if (this.hasChanges) {
            this.hasChanges = false;
            var blob = new Blob([JSON.stringify(this.RootNode, this.menuJsonSerializeReplacer, 2)], { type: "application/json" });
            try {
                await this.uploadClient.upload(this.saveUrl, { data: blob, fileName: this.saveUrl }, null);
            }
            catch (err) {
                this.hasChanges = true;
            }
        }
    }

    private menuJsonSerializeReplacer(key, value) {
        if (key === 'parent' || key === 'expanded' || key === 'currentPage') {
            return undefined;
        }
        return value;
    }
}

var builder = editorServices.createBaseBuilder();
EdityClient.addServices(builder.Services);
builder.Services.addTransient(TreeMenu.TreeMenuProvider, TreeMenuEditProvider);
TreeMenuEditor.addServices(builder.Services);

builder.create("editTreeMenuItem", TreeMenuEditor.EditTreeMenuItemController);
builder.create("deleteTreeMenuItem", TreeMenuEditor.DeleteTreeMenuItemController);
builder.create("createTreeMenuItem", TreeMenuEditor.AddTreeMenuItemController);
builder.create("chooseTreeMenuItem", TreeMenuEditor.ChooseMenuItemController);

builder.create("treeMenu", TreeMenu.TreeMenu);