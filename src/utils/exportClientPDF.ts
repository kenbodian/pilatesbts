import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  InstructorClient, Exercise, ClientExerciseStatus,
  ExerciseStatus, Apparatus,
} from '../types/clientCards';
import { APPARATUS_LABELS, APPARATUS_ORDER } from '../types/clientCards';

const STATUS_LABEL: Record<ExerciseStatus, string> = {
  not_started: '—',
  introduced:  'Intro',
  developing:  'Devel',
  mastered:    '✓ Mastered',
};

// Status → RGB for cell shading
const STATUS_COLOR: Record<ExerciseStatus, [number, number, number]> = {
  not_started: [245, 245, 245],
  introduced:  [254, 243, 199],
  developing:  [219, 234, 254],
  mastered:    [220, 252, 231],
};

export function exportClientCardPDF(
  client: InstructorClient,
  exercises: Record<string, Exercise[]>,
  statusMap: Record<string, ClientExerciseStatus>,
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = margin;

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(`${client.first_name} ${client.last_name}`, margin, y + 6);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    pageW - margin,
    y + 6,
    { align: 'right' },
  );

  y += 14;

  // ── Client info box ──────────────────────────────────────────────────────────
  const infoLines: string[] = [];
  if (client.height || client.weight) {
    infoLines.push([client.height && `Ht: ${client.height}`, client.weight && `Wt: ${client.weight}`].filter(Boolean).join('   '));
  }
  if (client.pain_scale != null) infoLines.push(`Pain scale: ${client.pain_scale}/10`);
  if (client.goals) infoLines.push(`Goals: ${client.goals}`);
  if (client.injuries) infoLines.push(`Injuries/Considerations: ${client.injuries}`);
  if (client.notes) infoLines.push(`Notes: ${client.notes}`);

  if (infoLines.length > 0) {
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(margin, y, pageW - margin * 2, infoLines.length * 6 + 6, 2, 2, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    infoLines.forEach((line, i) => {
      doc.text(line, margin + 4, y + 5 + i * 6);
    });
    y += infoLines.length * 6 + 10;
  }

  // ── Stats row ────────────────────────────────────────────────────────────────
  const allEx = Object.values(exercises).flat();
  const total = allEx.length;
  const mastered = allEx.filter(e => statusMap[e.id]?.status === 'mastered').length;
  const developing = allEx.filter(e => statusMap[e.id]?.status === 'developing').length;
  const introduced = allEx.filter(e => statusMap[e.id]?.status === 'introduced').length;

  const statBoxW = (pageW - margin * 2) / 4 - 2;
  const stats = [
    { label: 'Total', value: String(total), color: [243, 244, 246] as [number,number,number] },
    { label: 'Introduced', value: String(introduced), color: [254, 243, 199] as [number,number,number] },
    { label: 'Developing', value: String(developing), color: [219, 234, 254] as [number,number,number] },
    { label: 'Mastered', value: String(mastered), color: [220, 252, 231] as [number,number,number] },
  ];
  stats.forEach((s, i) => {
    const x = margin + i * (statBoxW + 2.67);
    doc.setFillColor(...s.color);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(x, y, statBoxW, 12, 2, 2, 'FD');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(s.value, x + statBoxW / 2, y + 7, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(s.label, x + statBoxW / 2, y + 11, { align: 'center' });
  });
  y += 18;

  // ── Exercise tables by apparatus ─────────────────────────────────────────────
  const availableApparatus = APPARATUS_ORDER.filter(a => exercises[a]?.length > 0);

  availableApparatus.forEach(apparatus => {
    const exList = exercises[apparatus];
    if (!exList?.length) return;

    // Check if we need a new page (need at least 20mm for heading + a few rows)
    if (y > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      y = margin;
    }

    // Section heading
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 94, 89); // teal-800
    doc.text(APPARATUS_LABELS[apparatus], margin, y);
    y += 2;

    const tableData = exList.map(ex => {
      const sr = statusMap[ex.id];
      const status: ExerciseStatus = sr?.status ?? 'not_started';
      const springs = sr?.custom_springs ?? ex.springs ?? '';
      const notes = sr?.exercise_notes ?? '';
      const lastPracticed = sr?.last_practiced_at
        ? new Date(sr.last_practiced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
        : '';
      return [ex.name, springs, STATUS_LABEL[status], lastPracticed, notes];
    });

    autoTable(doc, {
      startY: y,
      head: [['Exercise', 'Springs', 'Status', 'Last done', 'Notes']],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [20, 184, 166], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 16, halign: 'center' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 'auto' },
      },
      didParseCell(data) {
        if (data.section === 'body' && data.column.index === 2) {
          const statusText = data.cell.raw as string;
          const lookup = Object.entries(STATUS_LABEL).find(([, v]) => v === statusText);
          if (lookup) {
            const rgb = STATUS_COLOR[lookup[0] as ExerciseStatus];
            data.cell.styles.fillColor = rgb;
          }
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 6;
  });

  // ── Footer on each page ──────────────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `${client.first_name} ${client.last_name} — Client Card  ·  Page ${p} of ${pageCount}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: 'center' },
    );
  }

  doc.save(`${client.first_name}-${client.last_name}-client-card.pdf`);
}
