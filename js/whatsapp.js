function shareOnWhatsApp(phone, message) {
  whatsappShare(phone, message);
}

function buildQuotationMessage(q) {
  return `Quotation ${q.quotationId}\nTotal: ${q.total}\nStatus: ${q.status}\n- Jarad Machinery & Electrical`;
}

function buildInvoiceMessage(b) {
  return `Invoice ${b.billId}\nTotal: ${b.total}\nPayment: ${b.paymentStatus}\n- Jarad Machinery & Electrical`;
}

function buildPaymentReminderMessage(p) {
  return `Reminder: Bill ${p.billId} pending amount ${p.amount}. Please pay soon.`;
}
