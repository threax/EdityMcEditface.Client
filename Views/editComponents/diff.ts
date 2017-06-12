///<amd-module name="edity.core.edit.components.diff"/>

"use strict";

import * as storage from "hr.storage";
import * as EdityClient from 'edity.editorcore.EdityClient';
import * as controller from "hr.controller";
import * as navmenu from "edity.editorcore.navmenu";
import * as git from "edity.editorcore.GitService";
import * as editorServices from 'edity.editorcore.EditorServices';
import * as client from 'edity.editorcore.EdityHypermediaClient';

var CodeMirror = (<any>window).CodeMirror;

class ConfirmRevertController{
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection];
    }

    private reverter: client.UncommittedChangeResult;
    private dialog: controller.OnOffToggle;
    private info: controller.Model<string>;

    constructor(bindings: controller.BindingCollection) {
        this.dialog = bindings.getToggle('dialog');
        this.info = bindings.getModel<string>('info');
    }

    async revert(evt: Event): Promise<void> {
        if (this.reverter && this.reverter.canRevert()) {
            await this.reverter.revert();
            this.dialog.off();
            this.reverter = null;
        }
    }

    public confirm(reverter: client.UncommittedChangeResult): void {
        this.reverter = reverter;
        this.info.setData(reverter.data.filePath);
        this.dialog.on();
    }
}

class DiffRow {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, controller.InjectControllerData, DiffController, ConfirmRevertController];
    }

    private result: client.UncommittedChangeResult;

    constructor(bindings: controller.BindingCollection, result: client.UncommittedChangeResult, private diffControllerInstance: DiffController, private revertConfirmation: ConfirmRevertController) {
        this.result = result;
        bindings.setListener(this);
    }

    public async diff(evt: Event): Promise<void> {
        evt.preventDefault();
        this.diffControllerInstance.openDialog();
        try {
            var diffResult = await this.result.getUncommittedDiff();
            this.diffControllerInstance.initUI(this.result.data.filePath, diffResult.data);
        }
        catch (err) {
            alert("Cannot read diff data, please try again later\nMessage: " + err.message);
        }
    }

    public revert(evt: Event): void {
        evt.preventDefault();
        this.revertConfirmation.confirm(this.result);
    }
}

class DiffController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, git.GitService, controller.InjectedControllerBuilder, EdityClient.UploadClient];
    }

    private dialog: controller.OnOffToggle;
    private dv: any;
    private savePath: string;

    constructor(bindings, private GitService: git.GitService, private builder: controller.InjectedControllerBuilder, private uploadClient: EdityClient.UploadClient) {
        GitService.determineCommitVariantEvent.add((d) => this.diffVariant(d))

        this.dialog = bindings.getToggle('dialog');
    }

    private diffVariant(result: client.UncommittedChangeResult): git.CommitVariant {
        if (result.data.state === "Modified") {
            var creator = this.builder.createOnCallback(DiffRow);
            return {
                variant: "ModifiedWithDiff",
                rowCreated: (bindings, data) => creator(bindings, data)
            };
        }
    }

    public initUI(path: string, data: client.DiffInfo): void {
        this.savePath = path;
        var target = document.getElementById("diffViewArea");
        target.innerHTML = "";
        this.dv = CodeMirror.MergeView(target, {
            value: data.changed,
            origLeft: data.original,
            lineNumbers: true,
            mode: "text/html",
            highlightDifferences: true,
            connect: true,
            collapseIdentical: true,
            theme: "edity"
        });

        var height = window.innerHeight - 250;
        this.dv.editor().setSize(null, height);
        this.dv.leftOriginal().setSize(null, height);
        this.dv.wrap.style.height = height + "px";
        setTimeout(() => {
            this.dv.editor().refresh();
            this.dv.leftOriginal().refresh();
        }, 500);
    }

    public openDialog(): void {
        this.dialog.on();
    }

    public async save(evt): Promise<void> {
        evt.preventDefault();

        var content = this.dv.editor().getValue();
        var blob = new Blob([content], { type: "text/html" });

        try {
            await this.uploadClient.upload(this.savePath, { data: blob, fileName: this.savePath }, null);
            this.dialog.off();
        }
        catch (err) {
            alert("Error saving merge. Please try again later.");
        }
    }
}

var builder = editorServices.createBaseBuilder();
git.addServices(builder.Services);
builder.Services.tryAddTransient(DiffRow, DiffRow);
builder.Services.tryAddShared(ConfirmRevertController, ConfirmRevertController);
builder.Services.tryAddShared(DiffController, DiffController);

builder.create("diff-revertFileConfirmation", ConfirmRevertController);
builder.create("diff", DiffController);