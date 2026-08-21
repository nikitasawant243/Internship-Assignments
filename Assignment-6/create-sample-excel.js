'use strict';
/**
 * Script to generate uploads/sample-vendors.xlsx
 * Run: node create-sample-excel.js
 */
const XLSX = require('xlsx');
const path = require('path');
const fs   = require('fs');

const rows = [
  // Row 1 — Valid domestic vendor, credit limit < ₹1 Cr → direct pending (no approval flags)
  {
    "Vendor Code"  : "VEND001",
    "Vendor Name"  : "Tata Consultancy Services Ltd",
    "PAN Number"   : "AABCT1234F",
    "GST Number"   : "27AABCT1234F1Z5",
    "Country"      : "IN",
    "Bank Account" : "12345678901234",
    "IFSC"         : "HDFC0001234",
    "Credit Limit" : 500000
  },
  // Row 2 — Foreign vendor → requires approval (country != IN)
  {
    "Vendor Code"  : "VEND002",
    "Vendor Name"  : "Accenture Global Solutions",
    "PAN Number"   : "AACCA5678G",
    "GST Number"   : "29AACCA5678G1Z3",
    "Country"      : "US",
    "Bank Account" : "98765432109876",
    "IFSC"         : "CITI0000001",
    "Credit Limit" : 750000
  },
  // Row 3 — Invalid GST number (wrong format) → validation error
  {
    "Vendor Code"  : "VEND004",
    "Vendor Name"  : "Infosys BPM Limited",
    "PAN Number"   : "AABCI9999P",
    "GST Number"   : "BADGST123456789",
    "Country"      : "IN",
    "Bank Account" : "11122233344455",
    "IFSC"         : "ICIC0000999",
    "Credit Limit" : 200000
  },
  // Row 4 — Duplicate PAN (same as Row 1) → duplicate error
  {
    "Vendor Code"  : "VEND005",
    "Vendor Name"  : "Wipro Technologies",
    "PAN Number"   : "AABCT1234F",    // DUPLICATE of Row 1
    "GST Number"   : "29AABWT4321F1Z2",
    "Country"      : "IN",
    "Bank Account" : "55566677788899",
    "IFSC"         : "SBIN0012345",
    "Credit Limit" : 300000
  },
  // Row 5 — Credit limit > ₹1 Crore → requires approval
  {
    "Vendor Code"  : "VEND006",
    "Vendor Name"  : "Reliance Industries Ltd",
    "PAN Number"   : "AAARL1234A",
    "GST Number"   : "27AAARL1234A1Z8",
    "Country"      : "IN",
    "Bank Account" : "77788899900011",
    "IFSC"         : "UTIB0001234",
    "Credit Limit" : 15000000   // ₹1.5 Crore — requires approval
  }
];

const ws = XLSX.utils.json_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Vendors');

const outDir  = path.join(__dirname, 'uploads');
const outFile = path.join(outDir, 'sample-vendors.xlsx');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
XLSX.writeFile(wb, outFile);

console.log('Created: ' + outFile);
