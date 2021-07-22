import * as navmenu from '../../EditorCore/navmenu";

var editMenu = navmenu.getNavMenu("edit-nav-menu-items");
editMenu.addInjected("PreviewButton", navmenu.PageInfoStart + 0, undefined);