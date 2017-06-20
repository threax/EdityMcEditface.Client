///<amd-module name="edity.core.edit.components.compile"/>

"use strict";

import * as storage from "hr.storage";
import * as controller from "hr.controller";
import * as toggles from "hr.toggles";
import * as navmenu from "edity.editorcore.navmenu";
import * as CompileService from 'edity.editorcore.CompileService';
import * as editorServices from 'edity.editorcore.EditorServices';
import * as client from 'edity.editorcore.EdityHypermediaClient';
import * as git from "edity.editorcore.GitService";
import * as saveService from "edity.editorcore.SaveService";

class NavButtonController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [CompileController, client.EntryPointInjector, git.GitService];
    }

    constructor(private controller: CompileController, private entryInjector: client.EntryPointInjector, private gitService: git.GitService) {

    }

    public async compile(evt: Event): Promise<void> {
        evt.preventDefault();
        await saveService.saveNow();
        this.handleCompile();
    }

    private async handleCompile(): Promise<void> {
        var entry = await this.entryInjector.load();
        var beginPublish = await entry.beginPublish();
        if (beginPublish.canCommit()) {
            var commitResult = await this.gitService.commit("Before publishing you must commit any outstanding changes.");
            if (commitResult.Success) {
                this.handleCompile();
            }
        }
        else if (beginPublish.canBeginSync()) {
            var syncResult = await this.gitService.sync("Before publishing you must sync changes.");
            if (syncResult.Success) {
                this.handleCompile();
            }
        }
        else {
            this.controller.openDialog();
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
    private statusModel: controller.Model<StatusMessage>;

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
        this.compileService.onFailed.add(a => this.toggleGroup.activate(this.fail));
        this.compileService.onSuccess.add(a => this.toggleGroup.activate(this.success));
        this.statusModel = bindings.getModel<StatusMessage>("status");

        var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
        builder.Services.addSharedInstance(CompileController, this);
        editMenu.addInjected("CompileNavItem", builder.createOnCallback(NavButtonController));
    }

    runCompiler(evt) {
        evt.preventDefault();
        this.compileService.compile();
    }

    public async openDialog(): Promise<void> {
        this.statusModel.clear();
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
            console.log(err.message);
            this.toggleGroup.activate(this.fail);
        }
    }

    private compileStarted(arg: CompileService.CompilerServiceEventArgs) {
        this.toggleGroup.activate(this.compiling);
        this.statusModel.clear();
    }

    private statusUpdated(arg: CompileService.CompilerServiceStatusEventArgs) {
        this.statusModel.appendData(arg.status);
    }
}

(async () => {
    var builder = editorServices.createBaseBuilder();
    CompileService.addServices(builder.Services);
    builder.Services.tryAddTransient(CompileController, CompileController);
    builder.Services.tryAddTransient(NavButtonController, NavButtonController);

    //Check to see if we can publish
    var scope = builder.Services.createScope();
    var injector = scope.getRequiredService(client.EntryPointInjector);
    var entry = await injector.load();

    if (entry.canBeginPublish()) {
        builder.create("compile", CompileController);
    }
})();