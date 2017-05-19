﻿///<amd-module name="edity.core.edit.components.compile"/>

"use strict";

import * as storage from "hr.storage";
import * as controller from "hr.controller";
import * as toggles from "hr.toggles";
import * as navmenu from "edity.editorcore.navmenu";
import * as EdityClient from 'edity.editorcore.EdityClient';
import * as CompileService from 'edity.editorcore.CompileService';
import * as editorServices from 'edity.editorcore.EditorServices';

class NavButtonController {
    constructor(bindings: controller.BindingCollection, private controller: CompileController) {

    }

    compile(evt) {
        evt.preventDefault();
        this.controller.startCompile();
    }
}

interface StatusMessage {
    message: string;
}

class CompileController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, CompileService.CompilerService, EdityClient.CompileClient];
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

    constructor(bindings: controller.BindingCollection, private compileService: CompileService.CompilerService, private compileClient: EdityClient.CompileClient) {
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
        editMenu.add("CompileNavItem", NavButtonController, this);
    }

    runCompiler(evt) {
        evt.preventDefault();
        this.compileService.compile();
    }

    startCompile() {
        this.statusModel.clear();
        this.toggleGroup.activate(this.compiling);
        this.dialogToggle.on();
        this.compileClient.status(null)
            .then((data: any) => {
                this.infoModel.setData(data);
                this.changesModel.setData(data.behindHistory);
                this.toggleGroup.activate(this.start);
            })
            .catch((err) => {
                this.toggleGroup.activate(this.fail);
            });
    }

    private compileStarted(arg: CompileService.CompilerServiceEventArgs) {
        this.toggleGroup.activate(this.compiling);
        this.statusModel.clear();
    }

    private statusUpdated(arg: CompileService.CompilerServiceStatusEventArgs) {
        this.statusModel.appendData(arg.status);
    }
}

var builder = editorServices.createBaseBuilder();
CompileService.addServices(builder.Services);
builder.Services.tryAddTransient(CompileController, CompileController);

builder.create("compile", CompileController);