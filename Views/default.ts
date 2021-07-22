import * as TreeMenu from 'htmlrapier.treemenu/src/TreeMenu';
import * as EditModeDetector from '../EditorCore/EditModeDetector';
import * as controller from 'htmlrapier/src/controller';
import * as bootstrap from 'htmlrapier.bootstrap/src/main';
import * as SidebarToggle from 'htmlrapier.sidebar/src/sidebartoggle';
import * as fetcher from 'htmlrapier/src/fetcher';
import * as hr from 'htmlrapier/src/main';
import * as windowFetch from 'htmlrapier/src/windowfetch';

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
