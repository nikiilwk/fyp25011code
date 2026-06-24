import AnalyticsDashboard from './pages/AnalyticsDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Home from './pages/Home';
import MockExplorer from './pages/MockExplorer';
import ProducerDashboard from './pages/ProducerDashboard';
import SmartContractAudit from './pages/SmartContractAudit';
import WalletConnect from './pages/WalletConnect';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AnalyticsDashboard": AnalyticsDashboard,
    "BuyerDashboard": BuyerDashboard,
    "Home": Home,
    "MockExplorer": MockExplorer,
    "ProducerDashboard": ProducerDashboard,
    "SmartContractAudit": SmartContractAudit,
    "WalletConnect": WalletConnect,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};