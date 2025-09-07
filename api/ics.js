"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ========== Parse PDF to Events ==========
app.post("/api/parse", upload.single("file"), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: "No file uploaded" });
        const data = await (0, pdf_parse_1.default)(req.file.buffer);
        const text = data.text;
        const events = [];
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Match dates like "Thu Jan 9, 2025"
            const dateMatch = line.match(/([A-Za-z]{3} [A-Za-z]{3} \d{1,2}, \d{4})/);
            if (dateMatch) {
                const dateStr = dateMatch[1];
                const date = new Date(dateStr);
                // Find title from previous non-empty line
                let title = "";
                for (let j = i - 1; j >= 0; j--) {
                    if (lines[j].trim() !== "") {
                        title = lines[j].trim();
                        break;
                    }
                }
                // Determine type
                let type = "lecture";
                if (/assignment/i.test(title))
                    type = "assignment";
                else if (/quiz|exam/i.test(title))
                    type = "exam";
                events.push({
                    title,
                    start: date.toISOString(),
                    end: date.toISOString(),
                    type
                });
            }
        }
        res.json({ events });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to parse syllabus" });
    }
});
// ========== Health Check ==========
app.get("/", (req, res) => {
    res.send("Server is running. Use POST /api/parse with a PDF file.");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running`));
