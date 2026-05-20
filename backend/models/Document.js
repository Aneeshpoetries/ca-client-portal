const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  category: {
    type: String,
    enum: ['client_document', 'gst_return', 'itr', 'other_return'],
    required: true,
  },
  documentType: {
    type: String,
    enum: [
      'bank_statement', 'invoice', 'purchase_bill', 'ledger', 'balance_sheet',
      'profit_loss', 'tds_certificate', 'misc_client',
      'GSTR-1', 'GSTR-3B', 'GSTR-9', 'GSTR-9C', 'GSTR-2A', 'GSTR-2B',
      'ITR-1', 'ITR-2', 'ITR-3', 'ITR-4', 'ITR-5', 'ITR-6',
      'form_16', 'form_26AS', 'tax_audit',
      'sales_invoice', 'investment_details', 'fdr_statement', 'rental_income',
      'other',
    ],
    default: 'other',
  },
  period: {
    year: { type: Number, min: 2015, max: 2030 },
    month: { type: Number, min: 1, max: 12 },
    quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4', null] },
    financialYear: { type: String },
  },
  description: { type: String, trim: true },
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
