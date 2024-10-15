// interface TabData {
//     tabId: number;
//     title: string;
//     url: string;
//     domain: string;
//     timeOpened: number;
//     category: string;
// }
export const closeAllTabs = (tabs: chrome.tabs.Tab[]) => {
    tabs.map((tab: chrome.tabs.Tab) => {
        chrome.tabs.remove(tab.id!)
    })
}


const moveAllTabsToOneTab = (tabs: chrome.tabs.Tab[]) => {
    const tabLinks = tabs.map((tab) => ({
        tabId: tab.id,
        title: tab.title,
        url: tab.url
    }));
    // store the list of tabs using chrome.storage API
    chrome.storage.local.set({ tabLinks });

    // create the new tab
    chrome.tabs.create({ url: chrome.runtime.getURL('tablist.html')});

    // close all tabs after storing all instances of open tabs
    // let tabIds: number[] = []
    // tabIds = tabs.map((tab) => {[...tabIds, tab.tabId]})
    // chrome.tabs.remove(tabIds.map((tab) => tab))
    chrome.tabs.remove(tabs.map((tab) => tab.id!))
    // console.log("move", tabs)
}

export const moveToOneTab = (tab: chrome.tabs.Tab) => {
    if (tab) {
        // Get the existing tab links stored in Chrome storage
        chrome.storage.local.get('tabLinks', (data) => {
            const existingTabs = data.tabLinks || [];

            // Add the current tab to the stored tabs
            const newTab = { tabId: tab.id, title: tab.title, url: tab.url };
            const updatedTabs = [...existingTabs, newTab];

            // Update Chrome storage with the new list of tabs
            chrome.storage.local.set({ tabLinks: updatedTabs }, () => {
                // Create or open the "One Tab" page after saving the tab
                chrome.tabs.create({ url: chrome.runtime.getURL('tablist.html') });

                // Close the current tab
                chrome.tabs.remove(tab.id!);
            });
        });
    }
};


export default moveAllTabsToOneTab;