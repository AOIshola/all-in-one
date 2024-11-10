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
export function moveTabToOneTab(currentTab: chrome.tabs.Tab) {
    chrome.storage.local.get('tabLinks', (data) => {
        const existingTabs = data.tabLinks || [];
        const newTab = { tabId: currentTab.id, title: currentTab.title, url: currentTab.url };
        const filteredTabs = existingTabs.filter((tab: chrome.tabs.Tab) => tab.url !== newTab.url)
        const updatedTabs = [...filteredTabs, newTab];

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
            chrome.tabs.create({ url: oneTabUrl, pinned: true, index: 0 });
        }
    });
}

const updateTabAccessTab = (tabId: number) => {
    const accessTime = Date.now()
    chrome.storage.local.set({ [`tab-${tabId}`]: accessTime })
}

chrome.tabs.onActivated.addListener((activeInfo) => {
    updateTabAccessTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
        updateTabAccessTab(tabId);
    }
})

const INTERVAL_TO_REMOVE = 60 * 60 * 24 * 7 * 1000; // 1 week (ms)
// const INTERVAL_TO_REMOVE = 10000
const CHECK_INTERVAL = 60 * 24 // 1 day

chrome.alarms.create("inactiveTabChecker", { periodInMinutes: CHECK_INTERVAL });

const handleInactiveTabs = () => {
    console.log('Running handleInactiveTabs...');
    const oneTabUrl = chrome.runtime.getURL('tablist.html');
    chrome.tabs.query({ currentWindow: true, pinned: false, active: false }, (tabs) => {
        const currentTime = Date.now();

    //     // Only select all but the OneTab to check through
    //     const openTabs = tabs.filter((tab: chrome.tabs.Tab) => tab.url !== oneTabUrl)
    // // {
    // // THIS WAS PART OF THE initial implementation of openTabs
    // //     !(tab.url?.includes('chrome-extension://'))
    // // }

        tabs.forEach((tab) => {
            // if the tab is not current tab
            if (tab.url !== oneTabUrl) {
                // const lastAccessed = new Date(tab.lastAccessed!).toLocaleString()
                // console.log(`Checking tab: ${tab.title}, last accessed: ${lastAccessed}`);
                chrome.storage.local.get(`tab-${tab.id}`, (data) => {
                    const lastAccessed = data[`tab-${tab.id}`]
                    if (lastAccessed && currentTime - lastAccessed! > INTERVAL_TO_REMOVE) {
                        // move tab to One tab and remove
                        // moveTabToOneTab(tab);
                        // notify user about tab to be closed
                        // console.log("Should notify user soon...")
                        notifyUser(tab);
                    }
                })
            }
        });
    })
}

chrome.alarms.onAlarm.addListener((alarm: chrome.alarms.Alarm) => {
    // console.log("Alarm Created...")
    if (alarm.name === 'inactiveTabChecker') {
        handleInactiveTabs()
    }
});

const notifyUser = (tab: chrome.tabs.Tab) => {
    // console.log("notifyUser", "Notifying User")
    const iconUrl = chrome.runtime.getURL('/icon.png')
    chrome.notifications.create(`close-tab-${tab.id}`, {
        type: 'basic',
        title: "Inactive Tab Detected",
        iconUrl,
        message: `The tab "${tab.title}" has been inactive for a week. Do you want to close it?`,
        buttons: [
            { title: "Keep Tab" },
            { title: "Close Tab" }
        ],
        requireInteraction: true
    },
    (notificationId) => {
        chrome.storage.local.set({ [notificationId]: tab.id })
    });
    // console.log("Notification done")
}

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    chrome.storage.local.get(notificationId, (data) => {
        const tabId = data[notificationId];

        if (buttonIndex === 0) {
            chrome.storage.local.remove(notificationId)
        } else if (buttonIndex === 1) {
            chrome.tabs.get(tabId, (tab) => {
                if (tab) {
                    moveTabToOneTab(tab)
                }
                chrome.notifications.clear(notificationId);
                chrome.storage.local.remove(notificationId)
            })
        }
    })
})

// setInterval(handleInactiveTabs, CHECK_INTERVAL);