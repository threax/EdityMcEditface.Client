///<amd-module name="edity.core.edit.components.preview"/>

import * as navmenu from "edity.editorcore.navmenu";

var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
editMenu.addInjected("PreviewButton", navmenu.PageInfoStart + 0, undefined);