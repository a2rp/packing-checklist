import { useEffect, useState } from "react";
import PackingChecklist from "./components/packingChecklist/index.jsx";
import SiteFooter from "./components/siteFooter/index.jsx";
import SiteHeader from "./components/siteHeader/index.jsx";
import BackToTop from "./components/backToTop/index.jsx";
import styles from "./App.module.css";

const App = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const updateVisibility = () => setShowBackToTop(window.scrollY > 50);
        window.addEventListener("scroll", updateVisibility, { passive: true });
        updateVisibility();
        return () => window.removeEventListener("scroll", updateVisibility);
    }, []);

    return (
        <div className={styles.appShell} id="top">
            <SiteHeader />
            <main className={styles.pageContent}><PackingChecklist /></main>
            <SiteFooter />
            <BackToTop visible={showBackToTop} />
        </div>
    );
};

export default App;
