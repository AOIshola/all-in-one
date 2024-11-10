import { useState, useEffect } from 'react';
import moveAllTabsToOneTab, { closeAllTabs } from './utils';
// eAllTabs from './utils';
// import { moveToOneTab } from './utils';

function Popup() {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      setTabs(tabs);
    });
  }, []);

  const closeTab = (tabId: number | undefined) => {
    if (tabId) {
        chrome.tabs.remove(tabId, () => {
          setTabs(tabs.filter((tab) => tab.id !== tabId));
        });
    }
  };

  const formatTime = (lastAccessed: number) => {
    return lastAccessed ? new Date(lastAccessed).toLocaleString() : "No Data"
  }

  return (
    <div className='pop-body'>
      <h1>Tab Manager</h1>
      <div className='div-header'>
        <button onClick={() => {closeAllTabs(tabs)}}>Close All Tabs</button>
        <span>{tabs && tabs.length} tabs open</span>
      </div>
      <ul className='tab-list'>
        {tabs.map((tab) => (
          <li key={tab.id}>
            <span>
              <img src={tab.favIconUrl} alt="" />
              {tab.title} - 
              {formatTime(tab.lastAccessed!)}
            </span>
            <button onClick={() => closeTab(tab.id)}>X</button>
            {/* <button onClick={() => moveToOneTab(tab)}>Move tab to One tab</button> */}
          </li>
        ))}
      </ul>
      <button onClick={() => moveAllTabsToOneTab(tabs)}>Move All tabs to One tab</button>
    </div>
  );
}

export default Popup;