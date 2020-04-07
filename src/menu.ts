import { Menu, MenuItem, remote, MenuItemConstructorOptions } from "electron";

function findMenuItemByLabel(items: MenuItem[], label: string): MenuItem {
  return items.find(item => item.label == label);
};

export function addMenuItem(menu: Menu, label: string, options: MenuItemConstructorOptions): void {
  const topMenuItem = findMenuItemByLabel(menu.items, label);
  let subMenuItem = findMenuItemByLabel(topMenuItem.submenu.items, options.label);

  if (subMenuItem) {
    subMenuItem = new remote.MenuItem(options);
  } else {
    subMenuItem = new remote.MenuItem(options);
    topMenuItem.submenu.append(subMenuItem);
  }
};
