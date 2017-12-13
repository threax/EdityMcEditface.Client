///<amd-module name="edity.core.editarea-ckeditor"/>

"use strict";

import * as storage from "hr.storage";
import * as controller from "hr.controller";
import * as navmenu from "edity.editorcore.navmenu";
import * as page from "edity.editorcore.PageService";
import { IBaseUrlInjector } from 'edity.editorcore.BaseUrlInjector';
import * as editorServices from 'edity.editorcore.EditorServices';
import * as client from 'edity.editorcore.EdityHypermediaClient';

class CkEditorManager {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [IBaseUrlInjector, page.PageService, client.EntryPointInjector];
    }

    private editor = undefined;

    constructor(private baseUrlInjector: IBaseUrlInjector, private pageService: page.PageService, private entryInjector: client.EntryPointInjector) {
        var CKEDITOR = (<any>window).CKEDITOR;

        CKEDITOR.editorConfig = (config) => {
            config.toolbarGroups = [
                { name: 'clipboard', groups: ['clipboard', 'undo'] },
                { name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing'] },
                { name: 'links', groups: ['links'] },
                { name: 'insert', groups: ['insert'] },
                { name: 'forms', groups: ['forms'] },
                { name: 'tools', groups: ['tools'] },
                { name: 'document', groups: ['mode', 'document', 'doctools'] },
                { name: 'others', groups: ['others'] },
                '/',
                { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
                { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph'] },
                { name: 'styles', groups: ['styles'] },
                { name: 'colors', groups: ['colors'] },
                { name: 'about', groups: ['about'] }
            ];

            config.removeButtons = 'Underline,Subscript,Superscript,Scayt,Maximize,Source,About,Add alert box';

            config.allowedContent = true;
            config.extraPlugins = 'colorbutton,youtube,edityimageupload,widgetbootstrap,tableresize';
            config.imageUploadUrl = baseUrlInjector.BaseUrl + '/edity/Asset/'; //Unfortunately ckeditor does not make it easy to use halcyon for this (although we could lookup the url somehow from the client, future enhancement)
        };

        CKEDITOR.on('instanceReady', (ev) => {
            this.editor = ev.editor;
            var keys = ["body", "head", "html", "title", "base", "command", "link", "meta", "noscript", "script", "style", "audio", "dd", "dt",
                "figcaption", "video", "address", "article", "aside", "blockquote", "details", "div", "dl", "fieldset", "figure",
                "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "main", "menu", "nav", "p", "pre",
                "section", "table", "ul", "center", "dir", "noframes", "caption", "col", "colgroup", "tbody", "td", "tfoot", "th", "thead", "tr", "br", "ol"];

            for (var i = 0; i < keys.length; ++i) {
                ev.editor.dataProcessor.writer.setRules(keys[i], {
                    indent: true,
                    breakBeforeOpen: true,
                    breakAfterOpen: false,
                    breakBeforeClose: false,
                    breakAfterClose: false
                });
            }

            this.editor.on('change', () => {
                this.pageService.sourceUpdated();
            });

            this.editor.on('fileUploadRequest', async (evt) => {
                // Prevented the default behavior. This completely bypasses ckeditor's xhr based uploads
                evt.stop();
                var loader = evt.data.fileLoader;
                var file = CkEditorManager.dataURItoFile(loader.data, loader.fileName);
                var entryPoint = await this.entryInjector.load();
                try {
                    var result = await entryPoint.addAsset({
                        upload: file
                    });
                    if (result.data.uploaded) {
                        loader.url = result.data.url;
                        loader.changeStatus('uploaded');
                    }
                    else {
                        loader.message = result.data.message;
                        loader.changeStatus('error');
                    }
                }
                catch (err) {
                    loader.message = err.message ? err.message : err;
                    loader.changeStatus('error');
                }
            });
        });

        this.pageService.setSourceAccessor({
            getHtml: () => {
                return this.editor.getData();
            },
            setHtml: (value) => {
                this.editor.setData(value);
            }
        });
    }

    static dataURItoBlob(dataURI: string) {
        //Thanks to john locke at https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata, added semicolins
        var byteString, mimestring;

        if (dataURI.split(',')[0].indexOf('base64') !== -1) {
            byteString = atob(dataURI.split(',')[1]);
        } else {
            byteString = decodeURI(dataURI.split(',')[1]);
        }

        mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0];

        var content = new Array();
        for (var i = 0; i < byteString.length; i++) {
            content[i] = byteString.charCodeAt(i);
        }

        return new Blob([new Uint8Array(content)], { type: mimestring });
    }

    static dataURItoFile(dataURI: string, fileName: string) {
        //Always send blobs, supported in all browsers correctly
        var blob = CkEditorManager.dataURItoBlob(dataURI);
        (<any>blob).fileName = fileName;
        return blob;
    }
}

var builder = editorServices.createBaseBuilder();
page.addServices(builder.Services);
builder.Services.addTransient(CkEditorManager, CkEditorManager);
builder.createUnbound(CkEditorManager);