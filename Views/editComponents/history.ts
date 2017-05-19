﻿///<amd-module name="edity.core.edit.components.history"/>

"use strict";

import * as controller from "hr.controller";
import * as navmenu from "edity.editorcore.navmenu";
import * as toggles from "hr.toggles";
import * as PageNumbers from "edity.editorcore.pagenumbers";
import * as Iterable from "hr.iterable";
import * as git from "edity.editorcore.GitService";
import * as editorServices from 'edity.editorcore.EditorServices';

class NavButtonController {
    private controller: HistoryController;

    constructor(bindings: controller.BindingCollection, controller: HistoryController) {
        this.controller = controller;
    }

    history(evt) {
        evt.preventDefault();
        this.controller.showHistory();
    }
}

class HistoryController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, git.GitService];
    }

    private dialog;

    private main;
    private load;
    private error;
    private toggleGroup;

    private historyModel;

    private pagedData;
    private pageNumbers;


    constructor(bindings: controller.BindingCollection, private GitService: git.GitService) {
        this.dialog = bindings.getToggle('dialog');

        this.main = bindings.getToggle('main');
        this.load = bindings.getToggle('load');
        this.error = bindings.getToggle('error');
        this.toggleGroup = new toggles.Group(this.main, this.load, this.error);

        this.historyModel = bindings.getModel('history');

        this.pagedData = GitService.createHistoryPager(window.location.pathname, 10);
        this.pagedData.updating.add((i) => this.dataUpdating());
        this.pagedData.updated.add((d) => this.dataUpdated(d));
        this.pagedData.error.add((e) => this.loadFailed());

        this.pageNumbers = new PageNumbers.PageNumbers(bindings.getModel('pageNumbers'), bindings);
        this.pageNumbers.resultsPerPage = this.pagedData.resultsPerPage;
        this.pageNumbers.pageChangeRequested.add((pageNum) => this.pageChangeRequested(pageNum));

        //Add to nav menu
        var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
        editMenu.add("HistoryNavItem", NavButtonController, this);
    }

    private dataUpdating() {
        this.toggleGroup.activate(this.load);
    }

    private dataUpdated(data) {
        this.historyModel.setData(new Iterable.Iterable<any>(data).select(function(item){
            item.when = new Date(item.when).toLocaleString();
            return item;
        }));
        this.toggleGroup.activate(this.main);
        this.pageNumbers.currentPage = this.pagedData.currentPage;
        this.pageNumbers.updatePages();
        this.toggleGroup.activate(this.main);
    }

    private loadFailed() {
        this.toggleGroup.activate(this.error);
    }

    private pageChangeRequested(pageNum: number) {
        this.pagedData.currentPage = pageNum;
        this.pagedData.updateData();
    }

    showHistory() {
        this.dialog.on();
        this.toggleGroup.activate(this.load);
        this.pagedData.updateData();
        this.GitService.historyCount(window.location.pathname)
            .then((data) => {
                this.pageNumbers.totalResults = data;
                this.pageNumbers.currentPage = 0;
                this.pageNumbers.updatePages();
            });
    }
}

var builder = editorServices.createBaseBuilder();
git.addServices(builder.Services);
builder.Services.tryAddTransient(HistoryController, HistoryController);
builder.create("history", HistoryController);