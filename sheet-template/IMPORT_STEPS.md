# Import Steps (Google Sheets)

1. Open Google Drive.
2. Create a new Google Spreadsheet.
3. Rename first sheet to `Users`.
4. Go to **File -> Import -> Upload** and upload `Users.csv`.
5. Choose **Replace current sheet**.
6. Click `+` to add a new sheet and rename it to `Products`.
7. Import `Products.csv` with **Replace current sheet**.
8. Repeat the same for all files:
   - `Vendors.csv`
   - `Customers.csv`
   - `Quotations.csv`
   - `QuotationItems.csv`
   - `Bills.csv`
   - `BillItems.csv`
   - `Payments.csv`
   - `Settings.csv`
   - `Reports.csv`

## Login Credentials

- Admin: `admin` / `admin123`
- Staff: `staff` / `staff123`

## Important

- Keep sheet tab names exactly same as file names (without `.csv`).
- After import, deploy Apps Script from your same spreadsheet and copy Web App URL to frontend (`localStorage.setItem("apiBaseUrl","https://script.google.com/macros/s/AKfycbzz16wMrI8E2LBo6SJc1sqhsAx38CEZcD3RpowbZXYKwFhcYyGpg48mA6vfDH75q5zP/exec")`).
