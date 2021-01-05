///<amd-module name="edity.theme.layouts.default"/>

import * as TreeMenu from 'hr.treemenu.TreeMenu';
import * as EditModeDetector from 'edity.editorcore.EditModeDetector';
import * as controller from 'hr.controller';
import * as bootstrap from 'hr.bootstrap.main';
import * as SidebarToggle from 'hr.sidebar.sidebartoggle';
import * as fetcher from 'hr.fetcher';
import * as hr from 'hr.main';
import * as windowFetch from 'hr.windowfetch';

//Activate htmlrapier
hr.setup();
bootstrap.setup();
SidebarToggle.activate();

//Only create tree menu if not in edit mode, otherwise the editor will create an editing tree menu instead
if (!EditModeDetector.IsEditMode()) {
    var builder = new controller.InjectedControllerBuilder();
    builder.Services.addShared(fetcher.Fetcher, s => new windowFetch.WindowFetch());
    TreeMenu.addServices(builder.Services);
    builder.create("treeMenu", TreeMenu.TreeMenu);
}
