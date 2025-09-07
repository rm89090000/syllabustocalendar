"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const parse_1 = require("./api/parse");
const parseSyllabus_1 = require("./utils/parseSyllabus");
const app = (0, express_1.default)();
const upload = (0, multer_1.default)({ dest: "uploads/" });
const PORT = 3000;
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: "No file uploaded" });
        const buffer = fs_1.default.readFileSync(req.file.path);
        const pdfText = await (0, parse_1.parsePDFText)(buffer);
        const tasks = (0, parseSyllabus_1.parseSyllabus)(pdfText);
        fs_1.default.unlinkSync(req.file.path);
        return res.json({ events: tasks });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to parse PDF" });
    }
});
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
