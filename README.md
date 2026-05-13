# Jarad Machinery & Electrical - Business Management Web App

Fully responsive Electrical Business Management system built with:

- HTML5 + CSS3 + Bootstrap 5
- Vanilla JavaScript (modular files)
- Google Sheets (database)
- Google Apps Script (single backend API endpoint)
- Netlify (hosting)

## Pages Included

- `login.html`
- `dashboard.html`
- `products.html`
- `vendors.html`
- `customers.html`
- `quotations.html`
- `billing.html`
- `payments.html`
- `reports.html`
- `settings.html`

## Login Credentials (sample)

- Admin: `admin / admin123`
- Staff: `staff / staff123`

> Add these in `Users` sheet first.

## Step 1: Create Google Sheet Tables

Follow `GOOGLE_SHEETS_SETUP.md` exactly and create all tabs + headers.

## Step 2: Deploy Google Apps Script API

1. Open your Google Sheet.
2. Go to **Extensions -> Apps Script**.
3. Paste `apps-script/Code.gs` content.
4. Save project.
5. Click **Deploy -> New deployment**.
6. Type: **Web app**
7. Execute as: **Me**
8. Who has access: **Anyone**
9. Deploy and authorize.
10. Copy the Web App URL.

## Step 3: Connect Frontend API

Set your Apps Script URL in browser console once:

```js
localStorage.setItem("apiBaseUrl", "https://script.google.com/macros/s/AKfycbzz16wMrI8E2LBo6SJc1sqhsAx38CEZcD3RpowbZXYKwFhcYyGpg48mA6vfDH75q5zP/exec");
```

Or directly edit `js/api.js` and replace:

- `https://script.google.com/macros/s/AKfycbzz16wMrI8E2LBo6SJc1sqhsAx38CEZcD3RpowbZXYKwFhcYyGpg48mA6vfDH75q5zP/exec`

## Step 4: Netlify Deployment

1. Zip this folder or push it to GitHub.
2. Open Netlify and choose **Add new site**.
3. Upload folder (or connect repository).
4. Build command: _none_
5. Publish directory: `.`
6. Deploy site.

No Node.js build step is required.

## API Actions (Single Endpoint)

Send POST JSON with `{ action: "..." }`:

- `login`
- `getProducts`, `addProduct`, `updateProduct`, `deleteProduct`
- `getVendors`, `addVendor`, `updateVendor`, `deleteVendor`
- `getCustomers`, `addCustomer`, `updateCustomer`, `deleteCustomer`
- `createQuotation`, `getQuotations`
- `createBill`, `getBills`
- `addPayment`, `getPayments`
- `getReports`
- `getSettings`, `saveSettings`

### API Example (Frontend)

```js
const res = await fetch(API_URL, {
  method: "POST",
  headers: { "Content-Type": "text/plain;charset=utf-8" },
  body: JSON.stringify({ action: "getProducts" })
});
const data = await res.json();
```

## WhatsApp Integration (Free)

Implemented via click-to-chat:

- `https://wa.me/91XXXXXXXXXX?text=...`

No paid WhatsApp API is used.

## Email Integration (EmailJS Free)

EmailJS library is included on quotation page.  
To activate:

1. Create free EmailJS account.
2. Add your service + template.
3. Call:

```js
emailjs.init("YOUR_PUBLIC_KEY");
emailjs.send("YOUR_SERVICE", "YOUR_TEMPLATE", templateData);
```

## Notes

- UI supports English/Marathi toggle using `js/translations.js`.
- Language selection is stored in `localStorage`.
- Database records stay in English.
- Staff users can work normally but cannot delete protected records in UI.
