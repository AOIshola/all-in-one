import { useState, useEffect } from 'react';
import moveAllTabsToOneTab, { closeAllTabs } from './utils';
// eAllTabs from './utils';
// import { moveToOneTab } from './utils';

function Popup() {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);

  useEffect(() => {
    chrome.tabs.query({currentWindow: true}, (tabs) => {
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

  return (
    <div>
      <h1>Tab Manager</h1>
      <div className='div-header'>
        <button onClick={() => {closeAllTabs(tabs)}}>Close All Tabs</button>
        <span>{tabs && tabs.length} tabs open</span>
      </div>
      <ul>
        {tabs.map((tab) => (
          <li key={tab.id}>
            {tab.title}
            <button onClick={() => closeTab(tab.id)}>Close</button>
            {/* <button onClick={() => moveToOneTab(tab)}>Move tab to One tab</button> */}
          </li>
        ))}
      </ul>
      <button onClick={() => moveAllTabsToOneTab(tabs)}>Move All tabs to One tab</button>
    </div>
  );
}

export default Popup;