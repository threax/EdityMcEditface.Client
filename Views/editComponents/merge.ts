///<amd-module name="edity.core.edit.components.merge"/>

"use strict";

import * as storage from "hr.storage";
import * as controller from "hr.controller";
import * as navmenu from "edity.editorcore.navmenu";
import * as git from "edity.editorcore.GitService";
import * as editorServices from 'edity.editorcore.EditorServices';

var CodeMirror = (<any>window).CodeMirror;

class MergeRow {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, git.GitService, MergeController, controller.InjectControllerData];
    }

    constructor(bindings: controller.BindingCollection, private GitService: git.GitService, private mergeController: MergeController, private data) {
        bindings.setListener(this);
    }

    merge(evt) {
        evt.preventDefault();
        this.mergeController.startUi();

        this.GitService.mergeInfo(this.data.filePath)
            .then((successData) => this.mergeController.initUI(this.data.filePath, successData))
            .catch((failData) => alert("Cannot read merge data, please try again later"));
    }
}

class MergeController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, git.GitService];
    }

    private dialog;
    private mergeModel;
    private dv;
    private savePath;

    constructor(bindings: controller.BindingCollection, private GitService: git.GitService) {
        this.dialog = bindings.getToggle('dialog');
        this.mergeModel = bindings.getModel('merge');

        GitService.determineCommitVariantEvent.add((d) => this.mergeVariant(d));
    }

    private mergeVariant(data) {
        if (data.state === "Conflicted") {
            var creator = builder.createOnCallback(MergeRow);
            return {
                variant: "Conflicted",
                rowCreated: (bindings, data) => creator(bindings, data)
            };
        }
    }

    startUi() {
        this.dialog.on();
    }

    initUI(path, data) {
        this.savePath = path;
        var target = document.getElementById("mergeViewArea");
        target.innerHTML = "";
        this.dv = CodeMirror.MergeView(target, {
            value: data.merged,
            origLeft: data.theirs,
            orig: data.mine,
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
        this.dv.rightOriginal().setSize(null, height);
        this.dv.wrap.style.height = height + "px";
        setTimeout(() => {
            this.dv.editor().refresh();
            this.dv.leftOriginal().refresh();
            this.dv.rightOriginal().refresh();
        }, 500);
    }

    save(evt) {
        evt.preventDefault();

        var content = this.dv.editor().getValue();
        this.GitService.resolve(this.savePath, content)
            .then((data) => this.dialog.off())
            .catch((data) => alert("Error saving merge. Please try again later."));
    }
}

var builder = editorServices.createBaseBuilder();
git.addServices(builder.Services);
builder.Services.tryAddShared(MergeController, MergeController);
builder.create("merge", MergeController);