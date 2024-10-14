// Create the context menu options when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'closeTabsToLeft',
        title: 'Close Tabs to the Left',
        contexts: ['page' as chrome.contextMenus.ContextType],
    });
    chrome.contextMenus.create({
        id: 'closeTabsToRight',
        title: 'Close Tabs to the Right',
        contexts: ['page' as chrome.contextMenus.ContextType],
    });
    chrome.contextMenus.create({
        id: 'moveTabsToOneTab',
        title: 'Move Tabs to One Tab',
        contexts: ['page' as chrome.contextMenus.ContextType],
    });
});

// Handle the context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'closeTabsToLeft') {
        closeTabsToLeft(tab!);
    } else if (info.menuItemId === 'closeTabsToRight') {
        closeTabsToRight(tab!);
    } else if (info.menuItemId === 'moveTabsToOneTab') {
        moveTabsToOneTab(tab!);
    }
});

// Close all tabs to the left of the current tab
function closeTabsToLeft(currentTab: chrome.tabs.Tab) {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const tabsToClose = tabs.filter(tab => tab.index < currentTab.index);
        closeAndMoveTabs(tabsToClose);
    });
}

// Close all tabs to the right of the current tab
function closeTabsToRight(currentTab: chrome.tabs.Tab) {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const tabsToClose = tabs.filter(tab => tab.index > currentTab.index);
        closeAndMoveTabs(tabsToClose);
    });
}

// Helper function to close and move tabs to "One Tab"
function closeAndMoveTabs(tabs: chrome.tabs.Tab[]) {
    const tabLinks = tabs.map(tab => ({
        tabId: tab.id,
        title: tab.title,
        url: tab.url,
    }));

    // Store the tabs in local storage
    chrome.storage.local.get('tabLinks', (data) => {
        const existingTabs = data.tabLinks || [];
        const updatedTabs = [...existingTabs, ...tabLinks];
        chrome.storage.local.set({ tabLinks: updatedTabs }, () => {
            // Remove the tabs after storing them
            chrome.tabs.remove(tabs.map(tab => tab.id!));
        });
    });
}

// Move only selected tabs to "One Tab"
function moveTabsToOneTab(currentTab: chrome.tabs.Tab) {
    chrome.storage.local.get('tabLinks', (data) => {
        const existingTabs = data.tabLinks || [];
        const newTab = { tabId: currentTab.id, title: currentTab.title, url: currentTab.url };
        const updatedTabs = [...existingTabs, newTab];

        chrome.storage.local.set({ tabLinks: updatedTabs }, () => {
            chrome.tabs.remove(currentTab.id!);
        });

        // Open "One Tab" view
        chrome.tabs.create({ url: chrome.runtime.getURL('tablist.html') });
    });
}