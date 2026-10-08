import { useEffect, useMemo, useRef, useState } from "react";
import { FaCheck, FaCheckCircle, FaChevronDown, FaCloud, FaPlus, FaSuitcase, FaTrash, FaUmbrella, FaUndoAlt } from "react-icons/fa";
import styles from "./styles.module.css";

const makeItems = (entries) => entries.map(([id, name, category, hint]) => ({ id, name, category, hint, packed: false, custom: false }));
const profiles = {
    coast: { name: "Coastal week", place: "Algarve, Portugal", days: "7 days", icon: FaUmbrella, items: makeItems([
        ["id-card", "Passport or ID", "Documents", "Check the expiry date"], ["tickets", "Tickets and booking details", "Documents", "Keep copies available offline"], ["wallet", "Wallet and bank card", "Documents", "Tell your bank if needed"], ["sunscreen", "SPF 30+ sunscreen", "Care", "Pack for daily reapplication"], ["medication", "Personal medication", "Care", "Keep essentials in your hand luggage"], ["swimwear", "Swimwear", "Clothing", "Two sets make beach days easier"], ["linen", "Light layers", "Clothing", "Add one layer for cool evenings"], ["walking-shoes", "Comfortable walking shoes", "Clothing", "Wear them in before the trip"], ["sunglasses", "Sunglasses and cap", "Clothing", "Useful for long days outside"], ["charger", "Phone charger", "Tech", "Check the plug type"], ["adapter", "Travel adapter", "Tech", "Choose the right outlet"], ["earbuds", "Headphones", "Tech", "Download a playlist"], ["toiletries", "Toiletry bag", "Care", "Use travel-size containers"], ["bottle", "Reusable water bottle", "Essentials", "Empty before airport security"], ["tote", "Foldable day bag", "Essentials", "Handy for market stops"], ["book", "Book or e-reader", "Essentials", "A quiet travel companion"],
    ]) },
    city: { name: "City weekend", place: "Lisbon, Portugal", days: "3 days", icon: FaSuitcase, items: makeItems([
        ["id-card", "Passport or ID", "Documents", "Check the expiry date"], ["tickets", "Tickets and booking details", "Documents", "Keep copies available offline"], ["wallet", "Wallet and bank card", "Documents", "Tell your bank if needed"], ["sneakers", "Comfortable city shoes", "Clothing", "Expect cobbled streets"], ["layers", "Light jacket", "Clothing", "For breezy evenings"], ["outfits", "Three easy outfits", "Clothing", "Choose pieces you can mix"], ["sunglasses", "Sunglasses", "Clothing", "For bright afternoons"], ["charger", "Phone charger", "Tech", "Pack a short cable too"], ["battery", "Power bank", "Tech", "Charge it before leaving"], ["earbuds", "Headphones", "Tech", "Good for the journey"], ["toiletries", "Toiletry bag", "Care", "Keep liquids travel size"], ["medication", "Personal medication", "Care", "Keep essentials close"], ["bottle", "Reusable water bottle", "Essentials", "Refill during the day"], ["tote", "Small day bag", "Essentials", "Room for a layer and water"],
    ]) },
    trail: { name: "Cabin and trail", place: "Dolomites, Italy", days: "5 days", icon: FaCloud, items: makeItems([
        ["id-card", "Passport or ID", "Documents", "Check the expiry date"], ["tickets", "Stay and travel details", "Documents", "Save a copy offline"], ["wallet", "Wallet and bank card", "Documents", "Carry a little local cash"], ["shell", "Waterproof outer layer", "Clothing", "Mountain weather can shift"], ["fleece", "Warm mid-layer", "Clothing", "Useful after sunset"], ["hiking", "Hiking shoes", "Clothing", "Check fit and laces"], ["socks", "Hiking socks", "Clothing", "Pack a spare pair"], ["sunhat", "Hat and sunglasses", "Clothing", "Sun is strong at altitude"], ["sunscreen", "SPF sunscreen", "Care", "Reapply on exposed trails"], ["medication", "Personal medication", "Care", "Keep essentials in your day pack"], ["charger", "Phone charger", "Tech", "Check the outlet type"], ["battery", "Power bank", "Tech", "Charge before each walk"], ["bottle", "Water bottle", "Essentials", "Bring enough for the route"], ["snacks", "Trail snacks", "Essentials", "Pack a few easy options"], ["headlamp", "Small headlamp", "Essentials", "Check the batteries"], ["first-aid", "Compact first-aid kit", "Essentials", "Add blister care"],
    ]) },
};
const categoryNames = ["Documents", "Clothing", "Care", "Tech", "Essentials"];
const defaultWorkspace = () => ({ trip: "coast", lists: Object.fromEntries(Object.entries(profiles).map(([key, profile]) => [key, profile.items])) });
const readWorkspace = () => {
    try {
        const saved = JSON.parse(localStorage.getItem("packwell-workspace") || "null");
        if (!saved || !profiles[saved.trip]) return defaultWorkspace();
        const defaults = defaultWorkspace();
        return { trip: saved.trip, lists: { ...defaults.lists, ...saved.lists } };
    } catch { return defaultWorkspace(); }
};

const PackingChecklist = () => {
    const [workspace, setWorkspace] = useState(readWorkspace);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("Everything");
    const [newItemName, setNewItemName] = useState("");
    const [newCategory, setNewCategory] = useState("Essentials");
    const [dialog, setDialog] = useState(null);
    const cancelButton = useRef(null);
    const currentItems = workspace.lists[workspace.trip];
    const profile = profiles[workspace.trip];
    const packedCount = currentItems.filter((item) => item.packed).length;
    const progress = currentItems.length ? Math.round((packedCount / currentItems.length) * 100) : 0;

    useEffect(() => { try { localStorage.setItem("packwell-workspace", JSON.stringify(workspace)); } catch { /* Saving remains available for this page session. */ } }, [workspace]);
    useEffect(() => {
        if (!dialog) return undefined;
        cancelButton.current?.focus();
        const handleKeyDown = (event) => { if (event.key === "Escape") setDialog(null); };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [dialog]);

    const updateItems = (update) => setWorkspace((current) => ({ ...current, lists: { ...current.lists, [current.trip]: update(current.lists[current.trip]) } }));
    const visibleItems = useMemo(() => currentItems.filter((item) => {
        const matchesText = `${item.name} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase());
        const matchesStatus = statusFilter === "Everything" || (statusFilter === "Packed" ? item.packed : !item.packed);
        return matchesText && matchesStatus;
    }), [currentItems, query, statusFilter]);
    const groupedItems = categoryNames.map((name) => ({ name, items: visibleItems.filter((item) => item.category === name) })).filter((group) => group.items.length > 0);

    const togglePacked = (id) => updateItems((items) => items.map((item) => item.id === id ? { ...item, packed: !item.packed } : item));
    const addItem = (event) => {
        event.preventDefault();
        const name = newItemName.trim();
        if (!name) return;
        updateItems((items) => [...items, { id: `custom-${Date.now()}`, name, category: newCategory, hint: "Added to this trip", packed: false, custom: true }]);
        setNewItemName("");
    };
    const confirmDialog = () => {
        if (dialog?.type === "delete") updateItems((items) => items.filter((item) => item.id !== dialog.id));
        if (dialog?.type === "reset") updateItems((items) => items.map((item) => ({ ...item, packed: false })));
        setDialog(null);
    };

    return (
        <section className={styles.packingChecklist} id="checklist">
            <div className={styles.pageHeading}>
                <div><p className={styles.label}>A clear plan for the suitcase</p><h1>Pack light.<br /><span>Leave ready.</span></h1></div>
                <p className={styles.headingNote}>A trip-specific list that keeps the small essentials from becoming last-minute surprises.</p>
            </div>

            <section className={styles.tripCard} aria-label="Current trip">
                <div className={styles.tripMark}><profile.icon aria-hidden="true" /></div>
                <div className={styles.tripDetails}><span className={styles.tripLabel}>YOUR PACKING LIST</span><strong>{profile.place}</strong><span>{profile.days} · {profile.name}</span></div>
                <label className={styles.profileSelect}><span>Trip profile</span><select value={workspace.trip} onChange={(event) => setWorkspace((current) => ({ ...current, trip: event.target.value }))}><option value="coast">Coastal week</option><option value="city">City weekend</option><option value="trail">Cabin and trail</option></select><FaChevronDown aria-hidden="true" /></label>
                <div className={styles.progressBox}><div className={styles.progressText}><span>PACKING PROGRESS</span><strong>{packedCount}<small> / {currentItems.length}</small></strong></div><div className={styles.progressTrack} role="progressbar" aria-label="Packing progress" aria-valuemin="0" aria-valuemax={currentItems.length} aria-valuenow={packedCount}><span style={{ width: `${progress}%` }} /></div><p>{progress === 100 ? "Everything is ready to go." : `${progress}% ready for the trip`}</p></div>
            </section>

            <div className={styles.workspaceHeading}>
                <div><p className={styles.label}>The checklist</p><h2>Everything in its place</h2></div>
                <button className={styles.resetButton} type="button" onClick={() => setDialog({ type: "reset" })}><FaUndoAlt aria-hidden="true" /> Reset checks</button>
            </div>

            <form className={styles.addItemForm} onSubmit={addItem}>
                <label className={styles.newItemField}><span className={styles.srOnly}>Add an item</span><FaPlus aria-hidden="true" /><input value={newItemName} onChange={(event) => setNewItemName(event.target.value)} placeholder="Add something to remember" maxLength={70} /></label>
                <label className={styles.categoryField}><span className={styles.srOnly}>Item category</span><select value={newCategory} onChange={(event) => setNewCategory(event.target.value)}>{categoryNames.map((name) => <option key={name}>{name}</option>)}</select><FaChevronDown aria-hidden="true" /></label>
                <button className={styles.addButton} type="submit" disabled={!newItemName.trim()}><FaPlus aria-hidden="true" /><span>Add item</span></button>
            </form>

            <div className={styles.listToolbar}>
                <label className={styles.searchField}><span className={styles.srOnly}>Filter checklist items</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an item" /></label>
                <div className={styles.statusFilters} role="group" aria-label="Filter items by packing status">{["Everything", "To pack", "Packed"].map((filter) => <button key={filter} type="button" onClick={() => setStatusFilter(filter)} className={statusFilter === filter ? styles.filterActive : styles.filter} aria-pressed={statusFilter === filter}>{filter}</button>)}</div>
                <span className={styles.itemCount}>{visibleItems.length} items</span>
            </div>

            <div className={styles.categoryGrid}>
                {groupedItems.map((group) => (
                    <section className={styles.categoryCard} key={group.name}>
                        <div className={styles.categoryHeader}><h3>{group.name}</h3><span>{group.items.filter((item) => item.packed).length}/{group.items.length}</span></div>
                        <ul>{group.items.map((item) => <li className={item.packed ? styles.packedItem : styles.checklistItem} key={item.id}>
                            <label className={styles.itemLabel}><input type="checkbox" checked={item.packed} onChange={() => togglePacked(item.id)} /><span className={styles.checkboxMark}><FaCheck aria-hidden="true" /></span><span className={styles.itemCopy}><strong>{item.name}</strong><small>{item.hint}</small></span></label>
                            {item.custom && <button className={styles.deleteItem} type="button" aria-label={`Remove ${item.name}`} onClick={() => setDialog({ type: "delete", id: item.id, name: item.name })}><FaTrash aria-hidden="true" /></button>}
                        </li>)}</ul>
                    </section>
                ))}
                {!groupedItems.length && <div className={styles.emptyState}><FaCheckCircle aria-hidden="true" /><strong>No items match that view.</strong><p>Change the filter or add an item to your list.</p></div>}
            </div>

            <aside className={styles.packingNote} id="packing-notes"><span><FaSuitcase aria-hidden="true" /></span><div><strong>One small reminder</strong><p>Keep medication, travel documents, and anything you need during the journey in your personal bag.</p></div><span className={styles.noteTag}>TRAVEL SMART</span></aside>

            {dialog && <div className={styles.dialogBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null); }}><section className={styles.confirmDialog} role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description"><p className={styles.label}>Please confirm</p><h2 id="confirm-title">{dialog.type === "delete" ? "Remove this item?" : "Reset the packing checks?"}</h2><p id="confirm-description">{dialog.type === "delete" ? `${dialog.name} will be removed from this trip's list.` : "Every packed check for this trip will be cleared. Your items will stay on the list."}</p><div className={styles.dialogActions}><button ref={cancelButton} className={styles.cancelButton} type="button" onClick={() => setDialog(null)}>Keep list</button><button className={styles.confirmButton} type="button" onClick={confirmDialog}>{dialog.type === "delete" ? "Remove item" : "Reset checks"}</button></div></section></div>}
        </section>
    );
};

export default PackingChecklist;
