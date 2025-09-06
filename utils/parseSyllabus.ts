export type TaskType = "assignment" | "exam" | "reading" | "quiz" | "homework" | "other";

export interface CalendarTask {
  id: string;
  title: string;
  type: TaskType;
  date: string; 
}

function detectTaskType(title: string): TaskType {
  const lower = title.toLowerCase();
  if (lower.includes("exam") || lower.includes("midterm") || lower.includes("final") || lower.includes("oral argument")) return "exam";
  if (lower.includes("quiz")) return "quiz";
  if (lower.includes("homework") || lower.includes("assignment") || lower.includes("due")) return "assignment";
  if (lower.includes("read") || lower.includes("reading")) return "reading";
  return "other";
}

function parseDateRange(dateStr: string): string[] {
  const monthNames: { [key: string]: number } = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };

  const rangeMatch = dateStr.match(/([A-Za-z]+)\.?\s+(\d{1,2})(?:-(\d{1,2}))?,?\s+(\d{4})/);
  if (!rangeMatch) return [];

  const month = monthNames[rangeMatch[1].slice(0,3)];
  const startDay = parseInt(rangeMatch[2]);
  const endDay = rangeMatch[3] ? parseInt(rangeMatch[3]) : startDay;
  const year = parseInt(rangeMatch[4]);

  const dates: string[] = [];
  for (let day = startDay; day <= endDay; day++) {
    const d = new Date(year, month, day);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export function parseSyllabus(text: string): CalendarTask[] {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const tasks: CalendarTask[] = [];
  let currentDates: string[] = [];
  let buffer: string[] = [];

  const flushBuffer = () => {
    if (buffer.length === 0) return;
    const title = buffer.join(" ");
    const type = detectTaskType(title);
    if (currentDates.length === 0) {
      tasks.push({ id: `${title}-no-date-${tasks.length}`, title, type, date: "" });
    } else {
      for (const date of currentDates) {
        tasks.push({ id: `${title}-${date}-${tasks.length}`, title, type, date });
      }
    }
    buffer = [];
  };

  for (const line of lines) {
    if (/NO CLASS/i.test(line)) {
      flushBuffer();
      currentDates = [];
      continue;
    }

    const dateMatch = line.match(/([A-Za-z]+\.?\s+\d{1,2}(?:-\d{1,2})?,?\s+\d{4})/);
    if (dateMatch) {
      flushBuffer();
      currentDates = parseDateRange(dateMatch[1]);
      continue;
    }

    if (line.startsWith("§") || line.startsWith("•") || /^(Read|Writing Assignment Due|ORAL ARGUMENTS)/i.test(line)) {
      flushBuffer();
      buffer.push(line.replace(/^•|§\s*/, "").trim());
      continue;
    }

    if (buffer.length > 0) 
      {
        buffer.push(line);
      }
  }

  flushBuffer();
  return tasks;
}
