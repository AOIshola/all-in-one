import React, { useEffect, useState } from 'react'

interface TabLink {
    tabId: number;
    title: string;
    url: string;
}

function TabList() {

    const [tabs, setTabs] = useState<TabLink[]>([]);

    useEffect(() => {
        chrome.storage.local.get('tabLinks', (data) => {
            const storedTabs = data.tabLinks || [];
            setTabs(storedTabs);
        });
    }, []);

    const reopenTab = (currentTab: TabLink, e: React.MouseEvent) => {
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
                tab.tabId !== currentTab.tabId
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

// @ts-ignore
  return (
    <div>
      <h1>Your Tabs</h1>
      <ul>
        {tabs.length > 0 ? tabs.map((tab) => (
          <li key={tab.tabId}>
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