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
        return [controller.BindingCollection, git.GitService];
    }

    private targetFile;
    private dialog;
    private info;

    constructor(bindings: controller.BindingCollection, private GitService: git.GitService) {
        this.targetFile;
        this.dialog = bindings.getToggle('dialog');
        this.info = bindings.getModel('info');
    }

    revert() {
        this.GitService.revert(this.targetFile)
        .then((data) => {
            this.dialog.off();
        });
        this.targetFile = null;
    }

    confirm(file) {
        this.targetFile = file;
        this.info.setData(file);
        this.dialog.on();
    }
}

class DiffRow {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, controller.InjectControllerData, DiffController, git.GitService, ConfirmRevertController];
    }

    private result: client.UncommittedChangeResult;

    constructor(bindings: controller.BindingCollection, result: client.UncommittedChangeResult, private diffControllerInstance: DiffController, private GitService: git.GitService, private revertConfirmation: ConfirmRevertController) {
        this.result = result;
        bindings.setListener(this);
    }

    diff(evt) {
        evt.preventDefault();
        this.diffControllerInstance.openDialog();

        this.GitService.uncommittedDiff(this.result.data.filePath)
            .then((successData) => {
                this.diffControllerInstance.initUI(this.result.data.filePath, successData);
            })
            .catch((failData) => {
                alert("Cannot read diff data, please try again later");
            });
    }

    revert(evt) {
        evt.preventDefault();

        this.revertConfirmation.confirm(this.result.data.filePath);
    }
}

class DiffController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, git.GitService, controller.InjectedControllerBuilder, EdityClient.UploadClient];
    }

    private dialog;
    private diffModel;
    private dv;
    private savePath;

    constructor(bindings, private GitService: git.GitService, private builder: controller.InjectedControllerBuilder, private uploadClient: EdityClient.UploadClient) {
        GitService.determineCommitVariantEvent.add((d) => this.diffVariant(d))

        this.dialog = bindings.getToggle('dialog');
        this.diffModel = bindings.getModel('diff');
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

    initUI(path, data) {
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

    openDialog() {
        this.dialog.on();
    }

    async save(evt) {
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