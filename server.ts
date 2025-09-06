import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { parsePDFText } from "./api/parse";
import { parseSyllabus } from "./utils/parseSyllabus";

type TaskType = "assignment" | "exam" | "reading" | "quiz" | "homework" | "other";

interface CalendarTask {
  id: string;
  title: string;
  type: TaskType;
  date: string; // formatted as YYYY-MM-DD
}

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const buffer = fs.readFileSync(req.file.path);
    const pdfText = await parsePDFText(buffer);

    const tasks = parseSyllabus(pdfText);

    fs.unlinkSync(req.file.path);

    return res.json({ events: tasks });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to parse PDF" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
