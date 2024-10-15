// Create the context menu options when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'closeTabsToLeft',
        title: 'Move Tabs to the Left to One Tab',
        contexts: ['page' as chrome.contextMenus.ContextType],
    });
    chrome.contextMenus.create({
        id: 'closeTabsToRight',
        title: 'Move Tabs to the Right to One Tab',
        contexts: ['page' as chrome.contextMenus.ContextType],
    });
    chrome.contextMenus.create({
        id: 'moveTabToOneTab',
        title: 'Move This Tab to One Tab',
        contexts: ['page' as chrome.contextMenus.ContextType],
    });
    chrome.contextMenus.create({
        id: 'moveAllTabsExcept',
        title: 'Move All Tabs Except This to One Tab',
        contexts: ['page' as chrome.contextMenus.ContextType],
    });
});

// Handle the context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'closeTabsToLeft') {
        closeTabsToLeft(tab!);
    } else if (info.menuItemId === 'closeTabsToRight') {
        closeTabsToRight(tab!);
    } else if (info.menuItemId === 'moveTabToOneTab') {
        moveTabToOneTab(tab!);
    } else if (info.menuItemId === 'moveAllTabsExcept') {
        moveAllTabsExcept(tab!);
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

function moveAllTabsExcept(currentTab: chrome.tabs.Tab) {
    chrome.tabs.query({ currentWindow: true}, (tabs) => {
        const tabsToClose = tabs.filter((tab => tab.id !== currentTab.id));
        closeAndMoveTabs(tabsToClose);
    })
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
            chrome.tabs.remove(tabs.map(tab => tab.id!), () => {
                // Open "One Tab" view to show the stored tabs
                updateOrCreateOneTab();
            });
        });
    });
}

// Move only selected tabs to "One Tab"
function moveTabToOneTab(currentTab: chrome.tabs.Tab) {
    chrome.storage.local.get('tabLinks', (data) => {
        const existingTabs = data.tabLinks || [];
        const newTab = { tabId: currentTab.id, title: currentTab.title, url: currentTab.url };
        const updatedTabs = [...existingTabs, newTab];

        chrome.storage.local.set({ tabLinks: updatedTabs }, () => {
            chrome.tabs.remove(currentTab.id!, () => {
                // Open "One Tab" view to show the stored tabs
                updateOrCreateOneTab();
            });
        });
    });
}

// Helper function to check if a "One Tab" view is open and update it
function updateOrCreateOneTab() {
    const oneTabUrl = chrome.runtime.getURL('tablist.html');

    chrome.tabs.query({ url: oneTabUrl }, (tabs) => {
        if (tabs.length > 0) {
            // If a "One Tab" view exists, reload it to reflect the updated storage
            chrome.tabs.reload(tabs[0].id!);
        } else {
            // If no "One Tab" view exists, create a new tab
            chrome.tabs.create({ url: oneTabUrl });
        }
    });
}