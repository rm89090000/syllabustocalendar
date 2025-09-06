// utils/parseSyllabus.ts

// Define types here directly
export type TaskType = "assignment" | "exam" | "reading" | "quiz" | "homework" | "other";

export interface CalendarTask {
  id: string;
  title: string;
  type: TaskType;
  date: string; // formatted as YYYY-MM-DD
}

// Detect type function
function detectTaskType(title: string): TaskType {
  const lower = title.toLowerCase();
  if (lower.includes("exam") || lower.includes("midterm") || lower.includes("final")) return "exam";
  if (lower.includes("quiz")) return "quiz";
  if (lower.includes("homework") || lower.includes("assignment")) return "assignment";
  if (lower.includes("reading")) return "reading";
  return "other";
}

// Main parser function
export function parseSyllabus(text: string): CalendarTask[] {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const tasks: CalendarTask[] = [];
  let currentTitle = "";
  let currentType: TaskType = "other";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect task type
    if (/^(Assignment|Quiz|Homework|Exam|Final)/i.test(line)) {
      currentTitle = line;
      currentType = detectTaskType(line);
      continue;
    }

    // Detect date lines like "Fri Feb 28, 2025"
    const dateMatch = line.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
    if (dateMatch && currentTitle) {
      const monthNames: { [key: string]: number } = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      };
      const month = monthNames[dateMatch[2].slice(0,3)] ?? 0;
      const day = parseInt(dateMatch[3]);
      const year = parseInt(dateMatch[4]);
      const date = new Date(year, month, day);

      tasks.push({
        id: `${currentTitle}-${date.getTime()}`,
        title: currentTitle,
        type: currentType,
        date: date.toISOString().split("T")[0] // format YYYY-MM-DD
      });

      currentTitle = "";
      currentType = "other";
      continue;
    }

    // Append multi-line task descriptions
    if (currentTitle) {
      currentTitle += " " + line;
    }
  }

  return tasks;
}
