import React, { useEffect, useState } from 'react'

interface TabLink {
    tabId: number;
    title: string;
    url: string;
}

function TabList() {

    const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);

    useEffect(() => {
        chrome.storage.local.get('tabLinks', (data) => {
            const storedTabs = data.tabLinks || [];
            // storedTabs.filter((tab) => tab.url)
            setTabs(storedTabs);
        });
    }, []);

    const reopenTab = (currentTab: chrome.tabs.Tab, e: React.MouseEvent) => {
      e.preventDefault();
        chrome.tabs.create({ url: currentTab.url});

        // const updatedtabs = tabs.filter((tab: TabLink) => {
        //   tab.id !== currentTab.id;
        // });

        // chrome.storage.local.set({ "tabLinks": updatedtabs });
        // setTabs(updatedtabs);

        chrome.storage.local.get('tabLinks', (data) => {
          console.log(data)
            const updatedTabs = data.tabLinks.filter((tab: TabLink) =>
                // console.log(tab.id, currentTab.id)
                tab.tabId !== currentTab.id
            );
            console.log(updatedTabs)
            chrome.storage.local.set({ tabLinks: updatedTabs})
            setTabs(updatedTabs);
        });
    }

    const restoreAllTabs = () => {
        // restore each tab in the list of tabs
        tabs.forEach((tab) => {
            chrome.tabs.create({ url: tab.url});
        });

        // remove storedTabs from storage after restoring the tabs
        chrome.storage.local.remove('tabLinks');
        setTabs([]);
    };

    const deleteAllTabs = () => {

        // remove storedTabs from storage after restoring the tabs
        chrome.storage.local.remove('tabLinks');
        setTabs([]);
    }

    // const tabFavicon = (tab: chrome.tabs.Tab) => {
    //   if (tab.favIconUrl) {
    //     return chrome.runtime.getURL(tab.favIconUrl)
    //   }
    // }

// @ts-ignore
  return (
    <div>
      <h1>Your Tabs</h1>
      <ul>
        {tabs.length > 0 ? tabs.map((tab) => (
          <li key={tab.id}>
            {/* <img src={tabFavicon(tab)} style={{ width: '40px', height: '40px'}} alt="" /> */}
            <a href={tab.url} target='blank' onClick={(e) => reopenTab(tab, e)}>{tab.title}</a>
          </li>
        ))
        :
        <h1>No saved tabs here!</h1>
      }
      </ul>
      <button onClick={restoreAllTabs}>Restore All Tabs</button>
      <button onClick={deleteAllTabs}>Delete All Tabs</button>
    </div>
  );
}

export default TabList