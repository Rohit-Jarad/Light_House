function exportTableToCSV(filename, rows) {
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function exportJsonToExcel(filename, data) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, filename);
}

function exportTextToPdf(filename, lines) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  lines.forEach((line) => { doc.text(line, 10, y); y += 8; });
  doc.save(filename);
}
