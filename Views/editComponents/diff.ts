///<amd-module name="edity.core.edit.components.diff"/>

"use strict";

import * as storage from "hr.storage";
import * as controller from "hr.controller";
import * as navmenu from "edity.editorcore.navmenu";
import * as git from "edity.editorcore.GitService";
import * as editorServices from 'edity.editorcore.EditorServices';
import * as client from 'edity.editorcore.EdityHypermediaClient';

var CodeMirror = (<any>window).CodeMirror;

class ConfirmRevertController{
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, git.GitService];
    }

    private reverter: client.UncommittedChangeResult;
    private dialog: controller.OnOffToggle;
    private info: controller.Model<string>;

    constructor(bindings: controller.BindingCollection, private gitService: git.GitService) {
        this.dialog = bindings.getToggle('dialog');
        this.info = bindings.getModel<string>('info');
    }

    async revert(evt: Event): Promise<void> {
        if (this.reverter && this.reverter.canRevert()) {
            var success = false;
            try {
                this.gitService.fireRevertStarted();
                await this.reverter.revert();
                success = true;
            }
            finally {
                this.gitService.fireRevertCompleted(success);
                this.dialog.off();
                this.reverter = null;
            }
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
        return [controller.BindingCollection, git.GitService, controller.InjectedControllerBuilder, client.EntryPointInjector];
    }

    private dialog: controller.OnOffToggle;
    private dv: any;
    private savePath: string;

    constructor(bindings, private GitService: git.GitService, private builder: controller.InjectedControllerBuilder, private entryInjector: client.EntryPointInjector) {
        GitService.determineCommitVariantEvent.add((d) => this.diffVariant(d))

        this.dialog = bindings.getToggle('dialog');
    }

    private diffVariant(result: client.UncommittedChangeResult): git.CommitVariant {
        if (result.data.state === client.GitFileStatus.Modified) {
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

        try {
            var entry = await this.entryInjector.load();
            if (!entry.canUploadFile()) {
                throw new Error("No upload link returned from entry point.");
            }

            var content = this.dv.editor().getValue();

            await entry.uploadFile({
                content: new Blob([content], { type: "text/html" }),
                file: this.savePath
            });
            this.dialog.off();
        }
        catch (err) {
            console.log("Error uploading diff " + err.message);
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