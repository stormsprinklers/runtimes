import { brand } from "@/lib/brand";
import { formatZoneRuntimeSummary } from "@/lib/zoneRuntimeDisplay";
import type {
  ControllerCalculatorResult,
  ProgramSchedule,
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

interface LogoAsset {
  dataUrl: string;
  width: number;
  height: number;
}

async function loadLogoAsset(): Promise<LogoAsset | null> {
  try {
    const res = await fetch("/logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const img = new Image();
        img.onload = () =>
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => reject(new Error("logo decode failed"));
        img.src = dataUrl;
      },
    );
    if (dimensions.width <= 0 || dimensions.height <= 0) return null;
    return { dataUrl, ...dimensions };
  } catch {
    return null;
  }
}

/** Fit logo in footer box without stretching (mm). */
function footerLogoSize(
  naturalWidth: number,
  naturalHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const aspect = naturalWidth / naturalHeight;
  let height = maxHeight;
  let width = height * aspect;
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspect;
  }
  return { width, height };
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

function drawFooter(
  doc: jsPDF,
  page: number,
  pageCount: number,
  logo: LogoAsset | null,
) {
  const y = 297 - FOOTER_HEIGHT;
  doc.setFillColor(...lightBlue);
  doc.rect(0, y, PAGE_WIDTH, FOOTER_HEIGHT, "F");
  doc.setDrawColor(...mediumBlue);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

  const LOGO_MAX_HEIGHT = 28;
  const LOGO_MAX_WIDTH = 40;
  const logoGap = 4;
  let logoBlockWidth = 0;
  if (logo) {
    const size = footerLogoSize(
      logo.width,
      logo.height,
      LOGO_MAX_WIDTH,
      LOGO_MAX_HEIGHT,
    );
    logoBlockWidth = size.width + logoGap;
  }

  const textX = logo ? MARGIN + logoBlockWidth : MARGIN;
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

  if (logo) {
    try {
      const size = footerLogoSize(
        logo.width,
        logo.height,
        LOGO_MAX_WIDTH,
        LOGO_MAX_HEIGHT,
      );
      const logoY = y + (FOOTER_HEIGHT - size.height) / 2;
      doc.addImage(logo.dataUrl, "PNG", MARGIN, logoY, size.width, size.height);
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
  if (!program.stations.length) return startY;

  let y = ensureSpace(doc, startY, 20);
  y = sectionTitle(doc, y, program.label);

  for (const station of program.stations) {
    y = bodyText(
      doc,
      y,
      [`${station.displayName}: ${formatZoneRuntimeSummary(station)}`],
      9,
    );
  }
  y = bodyText(doc, y, [`Watering days: ${program.scheduleLabel}`], 9);
  y = bodyText(
    doc,
    y,
    [
      `${program.startTimeCount} start time${program.startTimeCount !== 1 ? "s" : ""}: ${program.startTimes.join(", ")}`,
    ],
    9,
  );

  if (program.cycleSoakNote) {
    y = bodyText(doc, y, [program.cycleSoakNote], 8);
  }

  return y + 6;
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
  const logo = await loadLogoAsset();
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
    drawFooter(doc, p, pageCount, logo);
  }

  const slug = result.cityName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const datePart = new Date().toISOString().slice(0, 10);
  doc.save(`storm-sprinklers-watering-${slug || "schedule"}-${datePart}.pdf`);
}
