import { defineStore } from 'pinia';

export const sidebar = defineStore('menu', {
  state: () => ({
    menuItems: []
  }),
  actions: {
    addMenuItem(item) {
      this.menuItems.push(item);
    },
    removeMenuItem(label) {
      this.menuItems = this.menuItems.filter(item => item.label !== label);
    },
    removeAllMenuItems() {
      this.menuItems = [];
    }
  }
});
