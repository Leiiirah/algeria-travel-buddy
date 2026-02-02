import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExpensesPdfData {
  expenses: Array<{
    date: string;
    category: string;
    description: string;
    vendor: string;
    paymentMethod: string;
    amount: number;
  }>;
  stats: {
    totalThisMonth: number;
    totalThisYear: number;
    totalAll: number;
  };
  language: 'fr' | 'ar';
  filterTotal: number;
}

// Function to load image and convert to base64
async function getLogoBase64(): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = () => reject(new Error('Could not load logo'));
    // Import the logo from assets
    img.src = new URL('../assets/logo-elhikma.png', import.meta.url).href;
  });
}

export async function generateExpensesPdf(data: ExpensesPdfData): Promise<void> {
  const doc = new jsPDF();
  const isArabic = data.language === 'ar';
  const pageWidth = doc.internal.pageSize.width;

  try {
    // Try to add logo
    const logoBase64 = await getLogoBase64();
    doc.addImage(logoBase64, 'PNG', (pageWidth - 40) / 2, 10, 40, 30);
  } catch (error) {
    console.warn('Could not load logo:', error);
  }

  // Company name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('EL HIKMA TOURISME ET VOYAGE', pageWidth / 2, 50, { align: 'center' });

  // Report title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(isArabic ? 'Rapport des Dépenses' : 'Rapport des Dépenses', pageWidth / 2, 60, { align: 'center' });

  // Date
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString(isArabic ? 'ar-DZ' : 'fr-FR')}`, pageWidth / 2, 68, { align: 'center' });

  // Summary section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const summaryY = 80;
  doc.text(isArabic ? 'Résumé:' : 'Résumé:', 14, summaryY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`• ${isArabic ? 'Ce mois' : 'Ce mois'}: ${data.stats.totalThisMonth.toLocaleString('fr-FR')} DZD`, 20, summaryY + 8);
  doc.text(`• ${isArabic ? 'Cette année' : 'Cette année'}: ${data.stats.totalThisYear.toLocaleString('fr-FR')} DZD`, 20, summaryY + 16);
  doc.text(`• ${isArabic ? 'Total global' : 'Total global'}: ${data.stats.totalAll.toLocaleString('fr-FR')} DZD`, 20, summaryY + 24);

  // Expenses table
  autoTable(doc, {
    startY: summaryY + 35,
    head: [[
      'Date',
      'Catégorie',
      'Description',
      'Fournisseur',
      'Mode',
      'Montant (DZD)',
    ]],
    body: data.expenses.map(exp => [
      exp.date,
      exp.category,
      exp.description,
      exp.vendor || '-',
      exp.paymentMethod,
      exp.amount.toLocaleString('fr-FR'),
    ]),
    styles: { 
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 25 },
      2: { cellWidth: 50 },
      5: { halign: 'right' },
    },
  });

  // Filter total at bottom
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Total des dépenses affichées: ${data.filterTotal.toLocaleString('fr-FR')} DZD`,
    14,
    finalY
  );

  // Footer with generation timestamp
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128);
  doc.text(
    `Généré le ${new Date().toLocaleString('fr-FR')}`,
    14,
    doc.internal.pageSize.height - 10
  );

  // Save the PDF
  doc.save(`depenses_${new Date().toISOString().split('T')[0]}.pdf`);
}
