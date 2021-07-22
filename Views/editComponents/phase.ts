///<amd-module name="edity.core.edit.components.phase"/>

"use strict";

import * as controller from 'htmlrapier/src/controller';
import * as navmenu from 'edity.editorcore.navmenu';
import * as toggles from 'htmlrapier/src/toggles';
import * as editorServices from 'edity.editorcore.EditorServices';
import * as client from 'edity.editorcore.EdityHypermediaClient';
import * as iter from 'htmlrapier/src/iterable';

class NavButtonController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, client.EntryPointInjector, controller.InjectedControllerBuilder];
    }

    private phaseDropToggle: controller.OnOffToggle;
    private mainToggle: toggles.OnOffToggle;
    private loadToggle: toggles.OnOffToggle;
    private errorToggle: toggles.OnOffToggle;
    private toggleGroup: toggles.Group;
    private phaseModel: controller.Model<client.Phase>;
    private firstOpen: boolean = true;

    constructor(bindings: controller.BindingCollection, private entryPointInjector: client.EntryPointInjector, private builder: controller.InjectedControllerBuilder) {
        this.phaseDropToggle = bindings.getToggle("phaseDropToggle");

        this.mainToggle = bindings.getToggle("main");
        this.loadToggle = bindings.getToggle("load");
        this.errorToggle = bindings.getToggle("error");
        this.toggleGroup = new toggles.Group(this.mainToggle, this.loadToggle, this.errorToggle);

        this.phaseModel = bindings.getModel<PhaseModelData>("phase");
    }

    public async openPhaseDropdown(evt: Event): Promise<void> {
        evt.preventDefault();

        if (this.firstOpen) {
            this.firstOpen = false;
            this.toggleGroup.activate(this.loadToggle);
            try {
                var entry = await this.entryPointInjector.load();
                if (entry.canListPhases()) {
                    var phaseResult = await entry.listPhases();
                    var phases = new iter.Iterable(phaseResult.items).select(i => {
                        return {
                            name: i.data.name,
                            result: i
                        };
                    });
                    this.phaseModel.setData(phases, this.builder.createOnCallback(PhaseItem));
                    this.toggleGroup.activate(this.mainToggle);
                }
                else {
                    throw new Error("Cannot list phases.")
                }
            }
            catch (err) {
                this.toggleGroup.activate(this.errorToggle);
            }
        }
    }
}

interface PhaseModelData {
    name: string;
    result: client.PhaseResult;
}

class PhaseItem {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, controller.InjectControllerData];
    }

    constructor(bindings: controller.BindingCollection, private data: PhaseModelData) {

    }

    public async setMode(evt: Event): Promise<void> {
        evt.preventDefault();
        await this.data.result.setPhase();
        window.location.href = window.location.href;
    }
}

var builder = editorServices.createBaseBuilder();
var childBuilder = builder.createChildBuilder();
childBuilder.Services.addShared(NavButtonController, NavButtonController);
childBuilder.Services.addTransient(PhaseItem, PhaseItem);

var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
editMenu.addInjected("PhaseNavItem", navmenu.PublishStart + 20, childBuilder.createOnCallback(NavButtonController));