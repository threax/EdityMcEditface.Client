"use strict";

import * as controller from 'hr.controller';
import { ActionEventDispatcher } from 'hr.eventdispatcher';
import * as di from 'hr.di';

export interface INavMenuItem {
    name: string;
    created: controller.CreateCallback;
}

var navMenus = {};

class NavMenu {
    private menuItems: INavMenuItem[] = [];
    private itemAddedEvent = new ActionEventDispatcher<INavMenuItem>();

    constructor(){
    
    }

    public get itemAdded() {
        return this.itemAddedEvent.modifier;
    }

    public addInjected(name: string, createOnCallback: controller.CreateCallback) {
        var item: INavMenuItem = {
            name: name,
            created: createOnCallback
        };
        this.menuItems.push(item);
        this.itemAddedEvent.fire(item);
    }

    public getItems(): INavMenuItem[] {
        return this.menuItems;
    }
}

export function getNavMenu(name: string): NavMenu {
    var menu = navMenus[name];
    if (menu === undefined) {
        navMenus[name] = menu = new NavMenu();
    }
    return menu;
}