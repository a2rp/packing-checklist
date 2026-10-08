import { FaGithub, FaSuitcaseRolling } from "react-icons/fa";
import styles from "./styles.module.css";

const SiteHeader = () => (
    <header className={styles.siteHeader}>
        <a className={styles.brand} href="#top" aria-label="Packwell home"><span className={styles.brandIcon}><FaSuitcaseRolling aria-hidden="true" /></span><span>packwell</span></a>
        <nav className={styles.navigation} aria-label="Main navigation"><a href="#checklist">Checklist</a><a href="#packing-notes">Packing notes</a></nav>
        <a className={styles.repositoryLink} href="https://github.com/a2rp/packing-checklist" target="_blank" rel="noreferrer"><FaGithub aria-hidden="true" /><span>Repository</span></a>
    </header>
);

export default SiteHeader;
