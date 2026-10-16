# Kirana Keeper — multi-page demo

## Pages
- `index.html` — Overview dashboard
- `inventory.html` — Product list, search, category filters, add/remove products, restock controls, expiry dates, and per-product low-stock thresholds
- `sales.html` — Create itemised bills from inventory products, calculate totals, record payment and date/time, view saved bill details, and reduce inventory stock when a bill is saved
- `bills.html` — Search the saved bill archive, view/download individual HTML receipts, and export all bills as CSV
- `expenses.html` — Record expenses and see entries/totals update
- `assistant.html` — Shop tips with selectable questions

## Run on Windows
1. Extract the ZIP.
2. Open the extracted folder.
3. Double-click `index.html` to open the home page in a browser.
4. Use the sidebar to navigate between separate HTML pages.

No Node.js installation is needed. Inventory data is saved in this browser on this computer using local storage, so it remains after refresh in the same browser. It does not sync across devices or browsers. Bills and inventory are saved in this browser on this computer using local storage. The Bill Archive page lets you download individual HTML receipts and export all bill records as CSV. Create a folder named “Kirana Keeper Bills” on your computer and choose it when saving/moving receipt downloads. Browsers do not allow a static website to silently create or write to arbitrary folders. Bills themselves remain in this browser until you export them. Expenses and assistant interactions remain demo-only.

Bills access update: The Bill Archive sidebar item has been removed. Open the Overview page and use the envelope-shaped “All bills” card to view the date-grouped bills table. Bills are grouped by day, newest date first, with View and Download actions.

Weather alerts: Open Shop Assistant, enter a town/city (Hyderabad by default), then click Check weather. Requires internet access and uses the Open-Meteo forecast/geocoding APIs without an API key. The forecast checks the next 24 hours and displays a rain caution when precipitation is likely. This is advisory only.


STEP 6 — EXPIRY ALERTS
The website now checks saved inventory dates whenever a page is opened. If any product is already expired or expires within the next 7 days, a reminder banner appears under the top navigation on every page. It lists up to five products and links to Inventory. These are on-page reminders only; browser/background notifications are not enabled.


STEP 7 — BROWSER NOTIFICATIONS
On Overview, click “Enable notifications” and grant browser permission. Kirana Keeper checks low-stock and expiry alerts when a page is opened and shows each alert type at most once per day per browser. This is not a background service: notifications are not sent reliably while the website is fully closed. Browser permission may require localhost or HTTPS; opening files directly can limit support.


STEP 8 — OVERVIEW WEATHER CARD
The Rain Check weather widget is placed on the Overview page beside the All Bills quick-action card, not in the sidebar. Enter a city (Hyderabad is the default) and select Check to fetch the next 24-hour forecast using Open-Meteo. Requires internet access. It checks on demand; it is not an automatic background service.


Step 9 — Illustrated weather icons
The Rain Check card now uses illustrated SVG icons that change based on the forecast's weather code: minimal sun, partly cloudy, rain cloud, thunderstorm, drizzle, and fog/mist. The icon style is consistent and uses colors that fit the burgundy-and-ivory design. Internet is required for the forecast.

Step 10 update: the Rain Check card is now inside the burgundy hero/dashboard section, not in the lower white quick-actions section or sidebar. Weather SVGs now have explicit stroke/fill styles to prevent the black-circle rendering issue.

Placement correction: Rain Check is located only in the burgundy hero section beside the All Bills shelf button. Weather icon SVG styling is explicitly defined to prevent a black-circle fallback.


Step 12 — Sustainability page
- Added Sustainability to the sidebar across pages.
- Estimate electricity, water and waste-related emissions using editable illustrative factors.
- Record waste quantity, reason and handling method; records are stored in browser localStorage.
- Emission values are estimates, not audited results. Update factors to reliable local values for better estimates.


ADDED FEATURE — FREE LOCAL SHOP MANAGER
The Shop assistant page now includes a rule-based Shop Manager chat. It reads inventory (kiranaKeeperInventoryV1), saved bills (kiranaKeeperBillsV1), and sustainability records when available in this browser. It uses no AI API, no API key, and sends no records to an AI provider. This is not a generative AI model. Expense records are not yet available in a shared ledger, so the assistant does not fabricate expense/profit figures. The feature is added via ai-manager.js and additive CSS; existing pages and business logic are retained.


SHOP MANAGER RECORD INTEGRATION UPDATE
The free Shop Manager now reads the same browser localStorage records used by the app: inventory (kiranaKeeperInventoryV1), saved bills (kiranaKeeperBillsV1), expenses (kiranaKeeperExpensesV1), sustainability footprint (kkSustainabilityFootprintV1), and waste log (kkSustainabilityWasteV1). Expenses are now saved locally when entered, so the assistant can summarise them. The initial three demo expense rows are preserved as sample entries on first visit and labelled as sample data in the assistant response. Sales analysis includes saved bill totals, a last-7-days comparison when records exist, and top items by quantity. Restock suggestions are simple draft rules and must be reviewed by the owner. No external AI API is used.


SALES AND SAVINGS GRAPHS
The Sustainability page now includes three graphs: daily sales for the last 7 days, monthly sales for the last 6 months, and monthly savings for the last 6 months. Sales graphs use saved bills in kiranaKeeperBillsV1 and display empty states rather than inventing figures. Monthly savings are based only on amounts manually entered by the shop owner in the new savings form and stored in kkRecordedSavingsV1; these are estimates entered by the owner, not automatically calculated profit. Added files: shop-graphs.js and additive CSS in styles.css. Existing app features are retained.
