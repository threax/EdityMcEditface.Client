///<amd-module name="edity.core.edit.components.media"/>

"use strict";

import * as toggles from 'htmlrapier/src/toggles';
import * as Iterable from 'htmlrapier/src/iterable';
import * as controller from 'htmlrapier/src/controller';
import * as navmenu from 'edity.editorcore.navmenu';
import * as editorServices from 'edity.editorcore.EditorServices';
import * as di from 'htmlrapier/src/di';
import * as client from 'edity.editorcore.EdityHypermediaClient';

function getFileName(path) {
    return path.replace(/^.*?([^\\\/]*)$/, '$1');
}

interface FileBrowserItem {
    name: string;
    link?: string;
}

/**
 * Create a file browser
 */
function FileBrowser(bindings: controller.BindingCollection, entryInjector: client.EntryPointInjector) {
    var parentFolders = [];
    var currentFolder = undefined;

    var directoryModel: controller.Model<FileBrowserItem> = bindings.getModel<FileBrowserItem>('directories');
    var fileModel: controller.IView<FileBrowserItem> = bindings.getView<FileBrowserItem>('files');
    var listFilesUrl = directoryModel.getSrc();

    var upDir = bindings.getToggle('upDir');

    bindings.setListener({
        upDirectory: function () {
            currentFolder = parentFolders.pop();
            loadCurrentFolder();
        }
    });

    var load = bindings.getToggle('load');
    var main = bindings.getToggle('main');
    var fail = bindings.getToggle('fail');
    var toggleGroup = new toggles.Group(load, main, fail);

    var self = this;

    this.loadFiles = function (path) {
        if (currentFolder !== undefined) {
            parentFolders.push(currentFolder);
        }
        currentFolder = path;
        loadCurrentFolder();
    }

    this.getCurrentDirectory = function () {
        return currentFolder;
    }

    this.refresh = function () {
        loadCurrentFolder();
    }

    async function loadCurrentFolder(): Promise<void> {
        toggleGroup.activate(load);
        try {
            var entry = await entryInjector.load();
            if (!entry.canListUploadedFiles()) {
                throw new Error("Cannot list uploaded files.");
            }
            var files = await entry.listUploadedFiles({
                dir: currentFolder
            });
            getFilesSuccess(files);
        }
        catch (err) {
            getFilesFail(err);
        }
    }

    function getFilesSuccess(result: client.FileListResult) {
        toggleGroup.activate(main);

        var iter = new Iterable.Iterable(result.data.directories)
            .select(function (i) {
                return { name: getFileName(i), link: i };
            });

        directoryModel.setData(iter,
            function (created: controller.BindingCollection, data) {
                var link = data.link;
                created.setListener({
                    changeDirectory: function (evt) {
                        evt.preventDefault();
                        self.loadFiles(link);
                    }
                });
            });

        iter = new Iterable.Iterable(result.data.files)
            .select(function (i) {
                return { name: getFileName(i), link: encodeURI(i) };
            });

        fileModel.setData(iter);

        if (parentFolders.length === 0) {
            upDir.off();
        }
        else {
            upDir.on();
        }
    }

    function getFilesFail(data) {
        toggleGroup.activate(fail);
    }
};

class NavButtonController {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [controller.BindingCollection, MediaController];
    }

    private source: string;

    constructor(bindings: controller.BindingCollection, private mediaControllerInstance: MediaController) {
        this.source = bindings.getModel("browse").getSrc();
    }

    loadMedia(evt) {
        evt.preventDefault();
        this.mediaControllerInstance.loadMedia(this.source);
    }
}

class MediaController {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [controller.BindingCollection, controller.InjectedControllerBuilder, client.EntryPointInjector];
    }

    private fileBrowser;
    private uploadModel;
    private dialog;

    constructor(bindings: controller.BindingCollection, builder: controller.InjectedControllerBuilder, private entryInjector: client.EntryPointInjector) {
        var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
        builder.Services.addSharedInstance(MediaController, this);
        editMenu.addInjected("MediaNavItem", navmenu.EditStart + 99, builder.createOnCallback(NavButtonController));

        this.fileBrowser = new FileBrowser(bindings, entryInjector);
        this.uploadModel = bindings.getModel('upload');
        this.dialog = bindings.getToggle('dialog');
    }

    public async upload(evt: Event): Promise<void> {
        evt.preventDefault();

        var formData = new FormData();
        var file = this.uploadModel.getData()["file"];
        var filename = file.name;
        filename = getFileName(filename);
        try {
            var entry = await this.entryInjector.load();
            if (!entry.canUploadFile()) {
                throw new Error("Cannot upload files");
            }
            await entry.uploadFile({
                file: this.fileBrowser.getCurrentDirectory() + '/' + filename,
                content: file
            });

            this.fileBrowser.refresh();
        }
        catch (err) {
            console.log("Uploading file failed.\nMessage: " + err.message);
            alert("File Upload Failed\n" + err.message);
        }
    }

    loadMedia(source) {
        this.fileBrowser.loadFiles(source);
        this.dialog.on();
    }
}

var builder = editorServices.createBaseBuilder();
builder.Services.tryAddTransient(MediaController, MediaController);
builder.Services.tryAddTransient(NavButtonController, NavButtonController);
builder.create("media", MediaController);