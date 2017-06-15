"use strict";

import * as saveService from 'edity.editorcore.SaveService';
import { Fetcher } from 'hr.fetcher';
import * as editorServices from 'edity.editorcore.EditorServices';
import * as di from 'hr.di';
import * as client from 'edity.editorcore.EdityHypermediaClient';
import * as uri from 'hr.uri';

export class PageService {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [client.EntryPointInjector];
    }

    private sourceAccessor;
    private needsSave = false;
    private currentPageInfo: client.PageInfoResult = null;

    constructor(private entryInjector: client.EntryPointInjector) {
        saveService.saveEvent.add(() => this.doSave());
    }

    setHtml(value) {
        this.sourceAccessor.setHtml(value);
        this.sourceUpdated();
    }

    getHtml() {
        return this.sourceAccessor.getHtml();
    }

    setSourceAccessor(value) {
        this.sourceAccessor = value;
    }

    sourceUpdated() {
        saveService.requestSave();
        this.needsSave = true;
    }

    private async doSave() {
        if (this.needsSave) {
            this.needsSave = false;
            try {
                if (this.currentPageInfo === null) {
                    var entry = await this.entryInjector.load();
                    if (!entry.canListPages()) {
                        throw new Error("Cannot list pages");
                    }
                    var url = new uri.Uri();
                    var pages = await entry.listPages({
                        file: url.path
                    });
                    if (pages.data.total === 0) {
                        throw new Error("Cannot find page " + url.path);
                    }
                    this.currentPageInfo = pages.items[0];
                }

                if (!this.currentPageInfo.canSavePage()) {
                    throw new Error("Cannot save page " + url.path);
                }

                var content = this.getHtml();
                await this.currentPageInfo.savePage({
                    content: new Blob([content], { type: "text/html" })
                });
            }
            catch (err) {
                this.needsSave = true;
                throw err;
            }
        }
    }
}

export function addServices(services: di.ServiceCollection) {
    services.tryAddShared(PageService, PageService);
}