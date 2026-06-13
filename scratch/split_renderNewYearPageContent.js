const fs = require('fs');
const path = require('path');

const pageJsPath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
const targetPath = path.join(__dirname, '..', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');

console.log("Reading page.js...");
const content = fs.readFileSync(pageJsPath, 'utf8');
const lines = content.split('\n');

// Line 4642 is index 4641, Line 11639 is index 11638
const startLine = 4642;
const endLine = 11639;

console.log(`Extracting lines ${startLine} to ${endLine}...`);
let extractedLines = lines.slice(startLine - 1, endLine);

// 첫 줄 'const renderNewYearPageContent = (page, ctx) => {'를 'export const renderNewYearPageContent = (page, ctx) => {'로 변경
if (extractedLines[0].includes('const renderNewYearPageContent =')) {
  extractedLines[0] = 'export ' + extractedLines[0];
} else {
  console.warn("Warning: start line does not match expected definition:", extractedLines[0]);
}

const header = `"use client";

import Link from "next/link";
import { Scroll, Printer, ArrowLeft, Heart, Compass, Shield, Sparkles, DollarSign, CalendarDays, Award, CheckSquare, AlertCircle } from "lucide-react";
import JobTable from "./JobTable";
import { getJobMatches } from "../utils";

`;

const fileContent = header + extractedLines.join('\n');

console.log("Writing to renderNewYearPageContent.js...");
fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log("Done extracting renderNewYearPageContent!");
