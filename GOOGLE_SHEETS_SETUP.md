# Google Sheets Database Setup

Create a Google Sheet and add these tabs exactly:

1. `Users`
2. `Products`
3. `Vendors`
4. `Customers`
5. `Quotations`
6. `QuotationItems`
7. `Bills`
8. `BillItems`
9. `Payments`
10. `Settings`
11. `Reports`

Use the following headers in row 1:

## Users
`userId, name, username, password, role, phone, isActive, createdAt`

## Products
`productId, productName, category, price, stock, vendorId, description, isDeleted, deletedAt, createdAt`

## Vendors
`vendorId, vendorName, phone, address, gstNumber, isDeleted, deletedAt, createdAt`

## Customers
`customerId, customerName, phone, address, isDeleted, deletedAt, createdAt`

## Quotations
`quotationId, customerId, quotationDate, subtotal, discount, gst, total, status, isDeleted, deletedAt, createdAt`

## QuotationItems
`itemId, quotationId, productId, quantity, price, total`

## Bills
`billId, customerId, billDate, subtotal, gst, total, paymentStatus, isDeleted, deletedAt, createdAt`

## BillItems
`itemId, billId, productId, quantity, price, total`

## Payments
`paymentId, billId, amount, paymentMethod, paymentDate, status`

## Settings
`businessName, ownerName, phone, email, address, gstNumber, logo`

## Reports
`reportId, reportType, generatedAt, fileUrl`

---

## Sample Data

### Users
- `U001, Admin User, admin, admin123, Admin, 9922556171, true, 2026-05-01T10:00:00Z`
- `U002, Staff User, staff, staff123, Staff, 9922556172, true, 2026-05-01T10:00:00Z`

### Vendors
- `VND-1001, Power House, 9822000001, Pune, 27ABCDE1234F1Z9, 2026-05-01T10:00:00Z`

### Products
- `PRD-1001, Copper Wire 1.5mm, Wiring, 1200, 75, VND-1001, FR grade, false, , 2026-05-01T10:00:00Z`

### Customers
- `CST-1001, Rahul Patil, 9876543210, Baramati, 2026-05-01T10:00:00Z`

### Settings
- `Jarad Machinery & Electrical, जराड प्रशांत, 9922556171, , , ,`
