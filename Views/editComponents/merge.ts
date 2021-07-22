"use strict";

import * as controller from 'htmlrapier/src/controller';
import * as git from '../../EditorCore/GitService';
import * as editorServices from 'edity.services.EditorServices';
import * as client from '../../EditorCore/EdityHypermediaClient';

var CodeMirror = (<any>window).CodeMirror;

class MergeRow {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, MergeController, controller.InjectControllerData, client.EntryPointInjector];
    }

    constructor(bindings: controller.BindingCollection, private mergeController: MergeController, private result: client.UncommittedChangeResult, private entryInjector: client.EntryPointInjector) {
        bindings.setListener(this);
    }

    public async merge(evt: Event): Promise<void> {
        evt.preventDefault();
        this.mergeController.startUi();

        try {
            var entry = await this.entryInjector.load();
            var successData = await entry.getMergeInfo({
                file: this.result.data.filePath
            });
            this.mergeController.initUI(successData);
        }
        catch (err) {
            console.log(err.message);
            alert("Cannot read merge data, please try again later");
        }
    }
}

class MergeController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, git.GitService];
    }

    private dialog: controller.OnOffToggle;
    private dv: any;
    private savePath: string;
    private currentMergeInfo: client.MergeInfoResult;

    constructor(bindings: controller.BindingCollection, GitService: git.GitService) {
        this.dialog = bindings.getToggle('dialog');

        GitService.determineCommitVariantEvent.add((d) => this.mergeVariant(d));
    }

    private mergeVariant(result: client.UncommittedChangeResult): git.CommitVariant {
        if (result.data.state === client.GitFileStatus.Conflicted) {
            var creator = builder.createOnCallback(MergeRow);
            return {
                variant: "Conflicted",
                rowCreated: (bindings, data) => creator(bindings, data)
            };
        }
    }

    public startUi(): void {
        this.dialog.on();
    }

    public initUI(result: client.MergeInfoResult): void {
        this.currentMergeInfo = result;
        var data = result.data;
        this.savePath = data.file;
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

    public async save(evt: Event): Promise<void> {
        evt.preventDefault();

        var content = this.dv.editor().getValue();
        try {
            var blob = new Blob([content], { type: "text/html" });
            var data = await this.currentMergeInfo.resolve({
                content: blob
            }); //Needs a file passed in
            this.dialog.off();
        }
        catch (err) {
            console.log(err.message);
            alert("Error saving merge. Please try again later.");
        }
    }
}

var builder = editorServices.createBaseBuilder();
git.addServices(builder.Services);
builder.Services.tryAddShared(MergeController, MergeController);
builder.Services.tryAddTransient(MergeRow, MergeRow);
builder.create("merge", MergeController);