// src/utils/invoicePdf.js
//
// Builds a clean, properly-aligned order PDF: shop header, customer
// details, an itemized table (qty / unit price / amount right-aligned),
// and totals. Used by CheckoutPage for the WhatsApp share, the "email
// the admin" draft, and the plain download button.

import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { SHOP_NAME, SHOP_TAGLINE, SHOP_ADDRESS_LINES, SHOP_PHONES, ADMIN_EMAIL } from '../config/tenant';

const inr = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

/**
 * @param {object} order
 * @param {string} order.orderId
 * @param {{name:string, phone:string, address:string, notes?:string}} order.customer
 * @param {{name:string, qty:number, unitPrice:number}[]} order.items
 * @param {number} order.subtotal
 * @param {{label:string, amount:number}=} order.coupon
 * @param {number} order.total
 * @returns {jsPDF}
 */
export function buildInvoicePdf({ orderId, customer, items, subtotal, coupon, total }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW  = doc.internal.pageSize.getWidth();
  const margin = 40;
  const rightX = pageW - margin;

  // ── Header ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(217, 4, 41);
  doc.text(SHOP_NAME, margin, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Sivakasi Direct — Licensed Fireworks', margin, 64);
  // Address uses the dash-free form of each line: jsPDF's built-in
  // Helvetica can't render the en dash (–) and would print garbage.
  const addrLines = SHOP_ADDRESS_LINES.map(l => l.replace(/\u2013/g, '-'));
  doc.text(addrLines, margin, 78);
  let leftY = 78 + addrLines.length * 11 + 4;
  doc.text(`Phone: ${SHOP_PHONES.join('  ·  ')}`, margin, leftY);
  if (ADMIN_EMAIL) {
    leftY += 13;
    doc.text(`Email: ${ADMIN_EMAIL}`, margin, leftY);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text('ORDER SUMMARY', rightX, 48, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Order ID: ${orderId || 'Pending confirmation'}`, rightX, 64, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleString('en-IN')}`, rightX, 76, { align: 'right' });

  const headerBottom = Math.max(leftY + 20, 100);
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, headerBottom, rightX, headerBottom);

  // ── Bill To ──
  let y = headerBottom + 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text('BILL TO', margin, y);
  y += 15;
  doc.setFont('helvetica', 'normal');
  doc.text(customer.name, margin, y);            y += 13;
  doc.text(customer.phone, margin, y);            y += 13;
  const custAddrLines = doc.splitTextToSize(customer.address, pageW - margin * 2 - 20);
  doc.text(custAddrLines, margin, y);
  y += custAddrLines.length * 12 + 4;
  if (customer.notes) {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    const noteLines = doc.splitTextToSize(`Note: ${customer.notes}`, pageW - margin * 2 - 20);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 12 + 4;
    doc.setTextColor(20, 20, 20);
  }

  // ── Items table (this is the "proper alignment" part — qty/prices
  // are right-aligned in fixed columns instead of running text) ──
  autoTable(doc, {
    startY: y + 12,
    margin: { left: margin, right: margin },
    head: [['#', 'Item', 'Qty', 'Unit Price', 'Amount']],
    body: items.map((it, i) => [
      String(i + 1),
      it.name,
      String(it.qty),
      inr(it.unitPrice),
      inr(it.unitPrice * it.qty),
    ]),
    styles: { fontSize: 9, cellPadding: 6, textColor: [30, 30, 30] },
    headStyles: { fillColor: [217, 4, 41], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 26 },
      2: { halign: 'center', cellWidth: 46 },
      3: { halign: 'right',  cellWidth: 90 },
      4: { halign: 'right',  cellWidth: 90 },
    },
    alternateRowStyles: { fillColor: [250, 246, 244] },
    // jspdf-autotable only applies columnStyles' halign to body cells,
    // not the header row — without this, "Qty"/"Unit Price"/"Amount"
    // sit left-aligned while the numbers under them are right/center
    // aligned, which is the exact misalignment this feature exists to
    // avoid. Force the header cells to match their column.
    didParseCell: (data) => {
      if (data.section === 'head') {
        const col = data.column.index;
        if (col === 0 || col === 2) data.cell.styles.halign = 'center';
        if (col === 3 || col === 4) data.cell.styles.halign = 'right';
      }
    },
  });

  let ty = doc.lastAutoTable.finalY + 22;
  const labelX = rightX - 150;

  const totalsRow = (label, value, bold = false, color = [80, 80, 80]) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 12 : 10);
    doc.setTextColor(...color);
    doc.text(label, labelX, ty);
    doc.text(value, rightX, ty, { align: 'right' });
    ty += bold ? 18 : 15;
  };

  totalsRow('Subtotal', inr(subtotal));
  if (coupon?.amount > 0) totalsRow(`Coupon (${coupon.label})`, `- ${inr(coupon.amount)}`, false, [15, 157, 88]);
  doc.setDrawColor(220, 220, 220);
  doc.line(labelX, ty, rightX, ty);
  ty += 14;
  totalsRow('To Pay', inr(total), true, [217, 4, 41]);

  ty += 24;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(130, 130, 130);
  doc.text('Delivery charge depends on location & parcel weight — confirmed by our team on call.', margin, ty);
  ty += 12;
  doc.text('This is a computer-generated order summary, not a tax invoice.', margin, ty);

  return doc;
}


/**
 * Sales / POS invoice. The shop identity in the header (name, address,
 * phones, email) comes straight from src/config/tenant.js — the master
 * setting — so changing SHOP_NAME there changes every printed invoice.
 * @param {object} sale  a sale record from salesAPI.getById (invoice_no,
 *   customer_name, customer_phone, sale_date, status, items[], subtotal,
 *   discount_amt, tax_amt, total_amt, payments[])
 * @returns {jsPDF}
 */
export function buildSalesInvoicePdf(sale = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW  = doc.internal.pageSize.getWidth();
  const margin = 40;
  const rightX = pageW - margin;
  const num = (n) => Number(parseFloat(n) || 0);

  // ── Header — identity from config/tenant.js (master setting) ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(217, 4, 41);
  doc.text(SHOP_NAME, margin, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`${SHOP_TAGLINE} - Licensed Fireworks`, margin, 64);
  const addrLines = SHOP_ADDRESS_LINES.map(l => l.replace(/\u2013/g, '-'));
  doc.text(addrLines, margin, 78);
  let leftY = 78 + addrLines.length * 11 + 4;
  doc.text(`Phone: ${SHOP_PHONES.join('  -  ')}`, margin, leftY);
  if (ADMIN_EMAIL) { leftY += 13; doc.text(`Email: ${ADMIN_EMAIL}`, margin, leftY); }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text('TAX INVOICE', rightX, 48, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Invoice: ${sale.invoice_no || '-'}`, rightX, 64, { align: 'right' });
  const dt = sale.sale_date ? new Date(sale.sale_date).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
  doc.text(`Date: ${dt}`, rightX, 76, { align: 'right' });
  if (sale.status) doc.text(`Status: ${String(sale.status).toUpperCase()}`, rightX, 88, { align: 'right' });

  const headerBottom = Math.max(leftY + 20, 104);
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, headerBottom, rightX, headerBottom);

  // ── Bill To ──
  let y = headerBottom + 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text('BILL TO', margin, y);
  y += 15;
  doc.setFont('helvetica', 'normal');
  doc.text(sale.customer_name || 'Walk-in', margin, y); y += 13;
  if (sale.customer_phone) { doc.text(String(sale.customer_phone), margin, y); y += 13; }

  // ── Items ──
  const items = sale.items || [];
  autoTable(doc, {
    startY: y + 12,
    margin: { left: margin, right: margin },
    head: [['#', 'Item', 'Qty', 'Rate', 'Tax', 'Amount']],
    body: items.map((it, i) => [
      String(i + 1),
      it.product_name || it.name || '',
      String(num(it.qty)),
      inr(it.unit_price),
      inr(it.tax_amt),
      inr(it.total_amt != null ? it.total_amt : num(it.unit_price) * num(it.qty)),
    ]),
    styles: { fontSize: 9, cellPadding: 6, textColor: [30, 30, 30] },
    headStyles: { fillColor: [217, 4, 41], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 26 },
      2: { halign: 'center', cellWidth: 42 },
      3: { halign: 'right',  cellWidth: 78 },
      4: { halign: 'right',  cellWidth: 64 },
      5: { halign: 'right',  cellWidth: 82 },
    },
    alternateRowStyles: { fillColor: [250, 246, 244] },
    didParseCell: (data) => {
      if (data.section === 'head') {
        const c = data.column.index;
        if (c === 0 || c === 2) data.cell.styles.halign = 'center';
        if (c >= 3) data.cell.styles.halign = 'right';
      }
    },
  });

  let ty = doc.lastAutoTable.finalY + 22;
  const labelX = rightX - 170;
  const row = (label, value, bold = false, color = [80, 80, 80]) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 12 : 10);
    doc.setTextColor(...color);
    doc.text(label, labelX, ty);
    doc.text(value, rightX, ty, { align: 'right' });
    ty += bold ? 18 : 15;
  };

  row('Subtotal', inr(sale.subtotal));
  if (num(sale.discount_amt) > 0) row('Discount', `- ${inr(sale.discount_amt)}`, false, [15, 157, 88]);
  if (num(sale.tax_amt) > 0)      row('GST', inr(sale.tax_amt));
  doc.setDrawColor(220, 220, 220);
  doc.line(labelX, ty, rightX, ty);
  ty += 14;
  row('Total', inr(sale.total_amt), true, [217, 4, 41]);

  // ── Payments ──
  const pays = sale.payments || [];
  if (pays.length) {
    ty += 12;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(20, 20, 20);
    doc.text('Payments', labelX, ty); ty += 15;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(80, 80, 80);
    let paid = 0;
    pays.forEach(p => {
      paid += num(p.amount);
      doc.text(p.method_name || 'Cash', labelX, ty);
      doc.text(inr(p.amount), rightX, ty, { align: 'right' });
      ty += 14;
    });
    const bal = num(sale.total_amt) - paid;
    if (bal > 0) {
      doc.setFont('helvetica', 'bold'); doc.setTextColor(217, 4, 41);
      doc.text('Balance', labelX, ty);
      doc.text(inr(bal), rightX, ty, { align: 'right' });
      ty += 16;
    }
  }

  ty += 20;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(130, 130, 130);
  doc.text('Thank you for your purchase. Goods once sold are subject to shop policy.', margin, ty);

  return doc;
}

/** Wraps a jsPDF document as a File, for downloads and Web Share. */
export function pdfToFile(doc, filename) {
  return new File([doc.output('blob')], filename, { type: 'application/pdf' });
}
