"use strict";

import * as edityClient from 'edity.editorcore.EdityClient';
import * as saveService from 'edity.editorcore.SaveService';
import { Fetcher } from 'hr.fetcher';
import * as editorServices from 'edity.editorcore.EditorServices';
import * as di from 'hr.di';

export class PageService {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [edityClient.PageClient];
    }

    private sourceAccessor;
    private needsSave = false;

    constructor(private client: edityClient.PageClient) {
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
            var content = this.getHtml();
            var blob = new Blob([content], { type: "text/html" });
            try {
                return await this.client.save(window.location.pathname, { fileName: window.location.pathname, data: blob }, null)
            }
            catch (err) {
                this.needsSave = true;
                throw err;
            }
        }
    }
}

export function addServices(services: di.ServiceCollection) {
    edityClient.addServices(services);
    services.tryAddShared(PageService, PageService);
}