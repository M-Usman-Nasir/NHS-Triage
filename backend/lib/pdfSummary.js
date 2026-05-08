'use strict';

const PDFDocument = require('pdfkit');

function toStringValue(value, fallback = 'Not recorded') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

function buildSummaryPdfBuffer(summary) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('Care Path - Referral Summary');
    doc.moveDown(0.6);
    doc.fontSize(10).fillColor('#555555').text(`Generated: ${new Date().toISOString()}`);
    doc.moveDown();
    doc.fillColor('#000000').fontSize(12).text(`Consultation ID: ${toStringValue(summary.id)}`);
    doc.text(`Patient: ${toStringValue(summary.patient?.fullName)}`);
    doc.text(`Age/Gender: ${toStringValue(summary.patient?.age)} / ${toStringValue(summary.patient?.gender)}`);
    doc.text(`Pathway: ${toStringValue(summary.pathwayLabel || summary.pathway)}`);
    doc.text(`Outcome: ${toStringValue(summary.outcomeLabel || summary.outcome)}`);
    doc.moveDown(0.7);
    doc.fontSize(12).text('Outcome reason:', { underline: true });
    doc.fontSize(11).text(toStringValue(summary.outcomeReason));
    doc.moveDown(0.7);
    doc.fontSize(12).text('Referral recommendation:', { underline: true });
    doc.fontSize(11).text(toStringValue(summary.referralRecommendation?.instruction));

    if (Array.isArray(summary.referralRecommendation?.actions) && summary.referralRecommendation.actions.length > 0) {
      doc.moveDown(0.4);
      for (const action of summary.referralRecommendation.actions) {
        doc.text(`- ${action}`);
      }
    }

    if (Array.isArray(summary.pharmacistNotes) && summary.pharmacistNotes.length > 0) {
      doc.moveDown(0.8);
      doc.fontSize(12).text('Pharmacist notes:', { underline: true });
      doc.fontSize(10);
      for (const note of summary.pharmacistNotes) {
        doc.text(`- [${toStringValue(note.createdAt)}] ${toStringValue(note.pharmacistId)}: ${toStringValue(note.note)}`);
      }
    }

    doc.end();
  });
}

module.exports = {
  buildSummaryPdfBuffer,
};

