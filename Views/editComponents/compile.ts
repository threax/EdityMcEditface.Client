"use strict";

import * as controller from 'htmlrapier/src/controller';
import * as toggles from 'htmlrapier/src/toggles';
import * as navmenu from '../../EditorCore/navmenu';
import * as CompileService from '../../EditorCore/CompileService';
import * as editorServices from 'edity.services.EditorServices';
import * as client from '../../EditorCore/EdityHypermediaClient';
import * as git from '../../EditorCore/GitService';
import * as saveService from '../../EditorCore/SaveService';

class NavButtonController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, CompileController, client.EntryPointInjector, git.GitService];
    }

    private load: controller.OnOffToggle;

    constructor(bindings: controller.BindingCollection, private controller: CompileController, private entryInjector: client.EntryPointInjector, private gitService: git.GitService) {
        this.load = bindings.getToggle("load");
        this.load.off();
    }

    public async compile(evt: Event): Promise<void> {
        evt.preventDefault();
        if (this.controller.isRunning) {
            this.controller.openDialog();
        }
        else {
            try {
                await saveService.saveNow();
                this.handleCompile();
            }
            catch (err) {
                this.load.off();
                console.log("General error compiling\nMessage:" + err.message);
            }
        }
    }

    private async handleCompile(): Promise<void> {
        try {
            this.load.on();
            var entry = await this.entryInjector.load();
            var beginPublish = await entry.beginPublish();
            if (beginPublish.canCommit()) {
                this.load.off();
                var commitResult = await this.gitService.commit("Before publishing you must commit any outstanding changes.");
                if (commitResult.Success) {
                    await this.handleCompile();
                }
            }
            else if (beginPublish.canBeginSync()) {
                this.load.off();
                var syncResult = await this.gitService.sync("Before publishing you must sync changes.");
                if (syncResult.Success) {
                    await this.handleCompile();
                }
            }
            else {
                this.load.off();
                this.controller.openDialog();
            }
        }
        catch (err) {
            this.load.off();
            throw err;
        }
    }
}

interface StatusMessage {
    message: string;
}

class CompileController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, CompileService.CompilerService, client.EntryPointInjector, controller.InjectedControllerBuilder];
    }

    private start;
    private success;
    private fail;
    private compiling;
    private toggleGroup: toggles.Group;
    private resultsModel;
    private changesModel;
    private infoModel;
    private dialogToggle;
    private messagesView: controller.IView<string>;
    private progressBar: controller.IView<number>;
    private fileProgress: controller.IView<CompileService.CompilerStatus>;
    private fileProgressToggle: controller.OnOffToggle;

    constructor(bindings: controller.BindingCollection, private compileService: CompileService.CompilerService, private entryInjector: client.EntryPointInjector, private builder: controller.InjectedControllerBuilder) {
        this.start = bindings.getToggle("start");
        this.success = bindings.getToggle("success");
        this.fail = bindings.getToggle("fail");
        this.compiling = bindings.getToggle("compiling");
        this.toggleGroup = new toggles.Group(this.start, this.success, this.fail, this.compiling);
        this.resultsModel = bindings.getModel("results");
        this.changesModel = bindings.getModel("changes");
        this.infoModel = bindings.getModel('info');
        this.dialogToggle = bindings.getToggle('dialog');
        this.compileService.onStarted.add(a => this.compileStarted(a));
        this.compileService.onStatusUpdated.add(a => this.statusUpdated(a));
        this.compileService.onFailed.add(a => {
            if (a.error) {
                this.messagesView.appendData(a.error);
            }
            this.toggleGroup.activate(this.fail)
        });
        this.compileService.onSuccess.add(a => this.toggleGroup.activate(this.success));
        this.messagesView = bindings.getView<string>("messages");
        this.progressBar = bindings.getView<number>("progress");
        this.fileProgress = bindings.getView<CompileService.CompilerStatus>("fileProgress");
        this.fileProgressToggle = bindings.getToggle("fileProgress");
        this.fileProgressToggle.off();

        var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
        builder.Services.addSharedInstance(CompileController, this);
        editMenu.addInjected("CompileNavItem", navmenu.PublishStart + 10, builder.createOnCallback(NavButtonController));
    }

    runCompiler(evt) {
        evt.preventDefault();
        this.compileService.compile();
    }

    public async openDialog(): Promise<void> {
        if (this.compileService.isRunning) {
            this.dialogToggle.on();
        }
        else {
            this.messagesView.clear();
            this.toggleGroup.activate(this.compiling);
            this.dialogToggle.on();
            try {
                var entry = await this.entryInjector.load();
                if (entry.canBeginPublish()) {
                    var result = await entry.beginPublish();
                    var data = result.data;
                    this.infoModel.setData(data);
                    this.changesModel.setData(data.behindHistory);
                    this.toggleGroup.activate(this.start);
                }
            }
            catch (err) {
                if (err.message) {
                    console.log(err.message);
                    this.messagesView.appendData(err.message);
                }
                this.toggleGroup.activate(this.fail);
            }
        }
    }

    private compileStarted(arg: CompileService.CompilerServiceEventArgs) {
        this.toggleGroup.activate(this.compiling);
        this.messagesView.clear();
    }

    private statusUpdated(arg: CompileService.CompilerServiceStatusEventArgs) {
        if (arg.status.percentComplete !== undefined) {
            this.progressBar.setData(arg.status.percentComplete, (b: controller.BindingCollection, w) => {
                var widthHandle = b.getHandle("width"); //Have to cheat to use handles, since we can't set the style any other way, and progress bars need to use style.
                widthHandle.setAttribute("style", "width:" + Number(w) + "%");
            });
        }
        if (arg.status.currentFile !== undefined && arg.status.totalFiles !== undefined) {
            this.fileProgress.setData(arg.status);
            this.fileProgressToggle.on();
        }
        else {
            this.fileProgressToggle.off();
        }
        this.messagesView.setData(arg.status.messages);
    }

    public get isRunning(): boolean {
        return this.compileService.isRunning;
    }
}

(async () => {
    var builder = editorServices.createBaseBuilder();
    CompileService.addServices(builder.Services);
    builder.Services.tryAddTransient(CompileController, CompileController);
    builder.Services.tryAddTransient(NavButtonController, NavButtonController);

    //Check to see if we can publish
    var injector = builder.createUnbound(client.EntryPointInjector);
    var entry = await injector.load();

    if (entry.canBeginPublish()) {
        builder.create("compile", CompileController);
    }
})();