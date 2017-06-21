"use strict";

import * as controller from 'hr.controller';
import { ActionEventDispatcher } from 'hr.eventdispatcher';
import * as di from 'hr.di';

export interface INavMenuItem {
    name: string;
    created: controller.CreateCallback;
    rootNode: Node;
    order: number;
}

export interface INavMenuItemAddedArgs {
    added: INavMenuItem,
    insertBefore: INavMenuItem
}

export const StatusStart = 0;
export const GitStart = 100;
export const PublishStart = 200;
export const EditStart = 300;
export const PageInfoStart = 400;
export const ExternalStart = 1000;

var navMenus = {};

class NavMenu {
    private menuItems: INavMenuItem[] = [];
    private itemAddedEvent = new ActionEventDispatcher<INavMenuItemAddedArgs>();

    constructor(){
    
    }

    public get itemAdded() {
        return this.itemAddedEvent.modifier;
    }

    public addInjected(name: string, order: number, createOnCallback: controller.CreateCallback) {
        //Add item
        var item: INavMenuItem = {
            name: name,
            created: (bindings, data) => {
                createOnCallback(bindings, data);
                item.rootNode = bindings.rootElement;
            },
            rootNode: null,
            order: order
        };
        this.menuItems.push(item);

        //Sort menu
        this.menuItems.sort((a, b) => {
            return a.order - b.order;
        });

        //Find previous menu element
        var index = this.menuItems.indexOf(item);
        var insertBefore: INavMenuItem = null;
        if (index !== -1 && index + 1 < this.menuItems.length) {
            insertBefore = this.menuItems[index + 1];
        }

        //Add the item after that element
        this.itemAddedEvent.fire({
            added: item,
            insertBefore: insertBefore
        });
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