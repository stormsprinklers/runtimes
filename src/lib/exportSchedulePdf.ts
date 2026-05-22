import { weekdayLabels } from "@/data/wateringRestrictions";
import { brand } from "@/lib/brand";
import type {
  ControllerCalculatorResult,
  ProgramSchedule,
  TimelineEntry,
} from "@/types/watering-calculator";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const MARGIN = 14;
const FOOTER_HEIGHT = 38;
const PAGE_WIDTH = 210;
const CONTENT_BOTTOM = 297 - FOOTER_HEIGHT;

const navy = hexToRgb(brand.colors.navy);
const mediumBlue = hexToRgb(brand.colors.mediumBlue);
const lightBlue = hexToRgb(brand.colors.lightBlue);
const pink = hexToRgb(brand.colors.pink);

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch("/logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawPageHeader(doc: jsPDF, title: string) {
  doc.setFillColor(...navy);
  doc.rect(0, 0, PAGE_WIDTH, 28, "F");
  doc.setFillColor(...pink);
  doc.rect(0, 28, PAGE_WIDTH, 2.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Storm Sprinklers", MARGIN, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Controller watering program", MARGIN, 19);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, PAGE_WIDTH - MARGIN - titleWidth, 14);
}

function drawFooter(doc: jsPDF, page: number, pageCount: number, logoDataUrl: string | null) {
  const y = 297 - FOOTER_HEIGHT;
  doc.setFillColor(...lightBlue);
  doc.rect(0, y, PAGE_WIDTH, FOOTER_HEIGHT, "F");
  doc.setDrawColor(...mediumBlue);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

  const textX = logoDataUrl ? MARGIN + 32 : MARGIN;
  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Storm Sprinklers", textX, y + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(brand.address, textX, y + 16);
  doc.text(`${brand.phone}  ·  ${brand.email}`, textX, y + 21);
  doc.text(brand.siteUrl.replace("https://", ""), textX, y + 26);
  doc.setFontSize(7);
  doc.setTextColor(80, 90, 110);
  doc.text(brand.license, textX, y + 31);
  doc.text(
    "Utah County & Salt Lake County · Licensed and Insured",
    textX,
    y + 35,
  );

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", MARGIN, y + 5, 26, 26);
    } catch {
      /* logo format unsupported */
    }
  }

  doc.setFontSize(7);
  doc.setTextColor(100, 110, 130);
  doc.text(`Page ${page} of ${pageCount}`, PAGE_WIDTH - MARGIN, y + 35, {
    align: "right",
  });
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed <= CONTENT_BOTTOM) return y;
  doc.addPage();
  drawPageHeader(doc, "Watering schedule (continued)");
  return 36;
}

function sectionTitle(doc: jsPDF, y: number, text: string): number {
  doc.setFillColor(...lightBlue);
  doc.roundedRect(MARGIN, y, PAGE_WIDTH - MARGIN * 2, 8, 1, 1, "F");
  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(text, MARGIN + 3, y + 5.5);
  return y + 12;
}

function bodyText(
  doc: jsPDF,
  y: number,
  lines: string[],
  fontSize = 9,
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(...navy);
  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line, PAGE_WIDTH - MARGIN * 2);
    for (const w of wrapped) {
      y = ensureSpace(doc, y, 5);
      doc.text(w, MARGIN, y);
      y += fontSize * 0.45;
    }
  }
  return y + 2;
}

function programBlock(doc: jsPDF, program: ProgramSchedule, startY: number): number {
  let y = ensureSpace(doc, startY, 20);
  y = sectionTitle(doc, y, program.label);

  const days =
    program.wateringDays.length > 0
      ? program.wateringDays.map((d) => weekdayLabels[d]).join(", ")
      : "Per local rules";
  y = bodyText(doc, y, [
    `${program.daysPerWeek} day${program.daysPerWeek !== 1 ? "s" : ""} per week — ${days}`,
  ]);

  const startLabel =
    program.startTimes.length > 1 ? "Start times" : "Start time";
  y = bodyText(
    doc,
    y,
    [`${startLabel}: ${program.startTimes.join(", ")}`],
    9,
  );

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN, bottom: FOOTER_HEIGHT },
    head: [["Station", "Runtime", "Cycles", "Soak"]],
    body: program.stations.map((s) => [
      s.name,
      `${s.totalMinutes} min total`,
      `${s.cycles} × ${s.minutesPerCycle} min`,
      s.soakMinutes > 0 ? `${s.soakMinutes} min` : "—",
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: navy,
    },
    headStyles: {
      fillColor: mediumBlue,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [240, 248, 252] },
    theme: "striped",
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
    .finalY + 4;

  y = bodyText(doc, y, [
    `One program run ≈ ${program.totalRunMinutes} minutes (all stations in sequence)`,
  ]);

  if (program.usesCycleSoak) {
    y = ensureSpace(doc, y, 14);
    doc.setFillColor(235, 245, 250);
    doc.roundedRect(MARGIN, y, PAGE_WIDTH - MARGIN * 2, 14, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...navy);
    doc.text("Cycle-and-soak", MARGIN + 3, y + 5);
    doc.setFont("helvetica", "normal");
    const soakLines = doc.splitTextToSize(
      program.cycleSoakExplanation,
      PAGE_WIDTH - MARGIN * 2 - 6,
    );
    doc.text(soakLines, MARGIN + 3, y + 10);
    y += 14 + soakLines.length * 3;
  }

  const stationWarnings = program.stations.flatMap((s) => s.warnings);
  if (stationWarnings.length > 0) {
    y = bodyText(
      doc,
      y,
      stationWarnings.map((w) => `• ${w}`),
      8,
    );
  }

  return y + 6;
}

function timelineTable(
  doc: jsPDF,
  label: string,
  primaryStart: string,
  entries: TimelineEntry[],
  startY: number,
): number {
  let y = ensureSpace(doc, startY, 16);
  y = sectionTitle(doc, y, `Run order — ${label}`);
  y = bodyText(doc, y, [
    `After first start time (${primaryStart}) on a watering day:`,
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN, bottom: FOOTER_HEIGHT },
    head: [["Time", "What happens"]],
    body: entries.map((e) => [e.time, e.label]),
    styles: { fontSize: 8, cellPadding: 2.5, textColor: navy },
    headStyles: {
      fillColor: mediumBlue,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [240, 248, 252] },
    theme: "striped",
  });

  return (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
    .finalY + 8;
}

function bulletList(doc: jsPDF, title: string, items: string[], startY: number): number {
  let y = ensureSpace(doc, startY, 12);
  y = sectionTitle(doc, y, title);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...navy);
  for (const item of items) {
    const lines = doc.splitTextToSize(`• ${item}`, PAGE_WIDTH - MARGIN * 2 - 4);
    for (const line of lines) {
      y = ensureSpace(doc, y, 5);
      doc.text(line, MARGIN + 2, y);
      y += 4;
    }
  }
  return y + 4;
}

export async function exportSchedulePdf(
  result: ControllerCalculatorResult,
): Promise<void> {
  const logoDataUrl = await loadLogoDataUrl();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const generated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  drawPageHeader(doc, "Program recommendation");

  let y = 36;
  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Controller Program Recommendation", MARGIN, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `${result.cityName} · ${result.programs.length} program${result.programs.length !== 1 ? "s" : ""} · ${result.stationOrder.length} station${result.stationOrder.length !== 1 ? "s" : ""}`,
    MARGIN,
    y,
  );
  y += 5;
  doc.setTextColor(100, 110, 130);
  doc.setFontSize(8);
  doc.text(`Generated ${generated} · ${result.badgeLabel}`, MARGIN, y);
  y += 10;

  y = sectionTitle(doc, y, "Local watering rule");
  y = bodyText(doc, y, [result.restrictionText]);
  y = bodyText(doc, y, [`Source: ${result.sourceLabel} — ${result.sourceUrl}`], 8);

  for (const program of result.programs) {
    y = programBlock(doc, program, y);
  }

  const primary = result.programs[0];
  if (primary && result.timeline.length > 0) {
    y = timelineTable(
      doc,
      primary.label,
      primary.primaryStartTime,
      result.timeline,
      y,
    );
  }

  if (result.hydrozoneWarnings.length > 0) {
    y = bulletList(doc, "Hydrozoning tips", result.hydrozoneWarnings, y);
  }

  const allNotes = [
    ...result.warnings.map((w) => w),
    ...result.notes.map((n) => n),
  ];
  if (allNotes.length > 0) {
    y = bulletList(doc, "Important notes", allNotes, y);
  }

  y = ensureSpace(doc, y, 12);
  doc.setFontSize(7);
  doc.setTextColor(120, 130, 145);
  doc.text(
    "Educational estimate only — verify current local watering ordinances before programming your controller.",
    MARGIN,
    y,
    { maxWidth: PAGE_WIDTH - MARGIN * 2 },
  );

  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    if (p > 1) drawPageHeader(doc, "Watering schedule (continued)");
    drawFooter(doc, p, pageCount, logoDataUrl);
  }

  const slug = result.cityName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const datePart = new Date().toISOString().slice(0, 10);
  doc.save(`storm-sprinklers-watering-${slug || "schedule"}-${datePart}.pdf`);
}
