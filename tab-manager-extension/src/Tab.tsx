import { StrictMode} from "react";
import { createRoot } from "react-dom/client";
import TabList from "./TabList";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <TabList />
    </StrictMode>,
)