///<amd-module name="edity.core.edit.components.edittreemenu"/>

"use strict";

import * as controller from 'htmlrapier/src/controller';
import * as saveService from 'edity.editorcore.SaveService';
import * as TreeMenu from 'htmlrapier.treemenu/src/TreeMenu';
import * as TreeMenuEditor from 'htmlrapier.treemenu/src/TreeMenuEditor';
import { Fetcher } from 'htmlrapier/src/fetcher';
import * as editorServices from 'edity.editorcore.EditorServices';
import * as client from 'edity.editorcore.EdityHypermediaClient';

export class TreeMenuEditProvider extends TreeMenu.TreeMenuProvider {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [Fetcher, TreeMenu.TreeMenuStorage, client.EntryPointInjector];
    }

    private hasChanges = false;

    constructor(fetcher: Fetcher, menuStorage: TreeMenu.TreeMenuStorage, private entryInjector: client.EntryPointInjector) {
        super(fetcher, menuStorage);
        saveService.saveEvent.add(a => this.save());
    }

    public menuRebuilt() {
        this.hasChanges = true;
        saveService.requestSave();
    }

    private async save(): Promise<void> {
        if (this.hasChanges) {
            this.hasChanges = false;
            try {
                var entry = await this.entryInjector.load();
                if (!entry.canUploadFile()) {
                    throw new Error("Cannot upload tree menu, no upload link returned from entry point");
                }
                await entry.uploadFile({
                    file: this.saveUrl,
                    content: new Blob([JSON.stringify(this.RootNode, this.menuJsonSerializeReplacer, 2)], { type: "application/json" })
                });
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
builder.Services.addTransient(TreeMenu.TreeMenuProvider, TreeMenuEditProvider);
TreeMenuEditor.addServices(builder.Services);

builder.create("editTreeMenuItem", TreeMenuEditor.EditTreeMenuItemController);
builder.create("deleteTreeMenuItem", TreeMenuEditor.DeleteTreeMenuItemController);
builder.create("createTreeMenuItem", TreeMenuEditor.AddTreeMenuItemController);
builder.create("chooseTreeMenuItem", TreeMenuEditor.ChooseMenuItemController);

builder.create("treeMenu", TreeMenu.TreeMenu);