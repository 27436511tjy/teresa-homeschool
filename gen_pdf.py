#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from fpdf import FPDF
import os

pdf = FPDF()
pdf.add_page()
pdf.add_font('DejaVu', '', '/System/Library/Fonts/Supplemental/DejaVuSans.ttf', uni=True)
pdf.set_font('DejaVu', size=12)

# Title
pdf.set_font('DejaVu', 'B', 16)
pdf.cell(200, 10, txt="Teresa 18周 Homeschool 计划", ln=1, align='C')
pdf.ln(10)

# Student Info
pdf.set_font('DejaVu', 'B', 12)
pdf.cell(200, 10, txt="Student Info", ln=1)
pdf.set_font('DejaVu', size=11)
pdf.cell(200, 8, txt="Name: Teresa", ln=1)
pdf.cell(200, 8, txt="Age: 8.5 years old", ln=1)
pdf.cell(200, 8, txt="Grade: 3", ln=1)
pdf.cell(200, 8, txt="Route: International", ln=1)
pdf.ln(10)

# Daily Structure
pdf.set_font('DejaVu', 'B', 12)
pdf.cell(200, 10, txt="Daily Schedule", ln=1)
pdf.set_font('DejaVu', size=11)
daily = [
    ("English", "60 min", "Reading+Vocabulary+Speaking+Writing"),
    ("Math", "40 min", "Arithmetic+Logic+Chess"),
    ("Chinese", "30 min", "Reading+Writing"),
    ("PBL", "50 min", "Project-Based Learning-Diversified"),
    ("Review", "10 min", "Daily Summary"),
    ("Tennis", "60-90 min", "Offline Training"),
]
for subject, time, content in daily:
    pdf.cell(50, 8, subject)
    pdf.cell(30, 8, time)
    pdf.cell(110, 8, content, ln=1)
pdf.ln(5)

# PBL Options
pdf.set_font('DejaVu', 'B', 12)
pdf.cell(200, 10, txt="PBL Diversified Options", ln=1)
pdf.set_font('DejaVu', size=11)
pbl_options = [
    ("Animals", "Reptiles/Observation+Art"),
    ("Humanities", "Diary/Book Report/Speech"),
    ("Arts", "Drawing/Craft/Design"),
    ("Outdoor", "Nature Observation"),
]
for option, content in pbl_options:
    pdf.cell(50, 8, option)
    pdf.cell(150, 8, content, ln=1)
pdf.ln(10)

# 18 Week Plan
pdf.set_font('DejaVu', 'B', 12)
pdf.cell(200, 10, txt="18-Week Plan", ln=1)
pdf.set_font('DejaVu', size=10)

weeks = [
    ("Phase 1", "W1-4", "Self & Habits", "Animals/Humanities/Arts"),
    ("Phase 2", "W5-8", "Nature & Science", "Animals/Science/Outdoor"),
    ("Phase 3", "W9-12", "World Exploration", "Animals/Geography"),
    ("Phase 4", "W13-16", "Creation & Expression", "Arts/Humanities"),
    ("Phase 5", "W17-18", "Showcase & Review", "Humanities/Speech"),
]

for phase, week, theme, pbl in weeks:
    pdf.cell(30, 8, phase)
    pdf.cell(20, 8, week)
    pdf.cell(70, 8, theme)
    pdf.cell(70, 8, pbl, ln=1)

pdf.ln(10)

# Week 1 Details
pdf.set_font('DejaVu', 'B', 12)
pdf.cell(200, 10, txt="Week 1 Daily Tasks Example", ln=1)
pdf.set_font('DejaVu', size=11)
tasks = [
    ("English", "AR Reptile Reading 30 pages + 5 vocab + because sentences"),
    ("Math", "Pattern finding 10 questions + Chess 5 moves"),
    ("Chinese", "Reading 20 min + Diary 100 words"),
    ("PBL", "Draw snake + English introduction 3-5 sentences"),
    ("Review", "Today's summary + Tomorrow's plan"),
    ("Tennis", "Basic footwork + Forehand/Backhand (offline)"),
]
for subject, task in tasks:
    pdf.cell(30, 8, subject)
    pdf.cell(170, 8, task, ln=1)

# Save
output_path = os.path.expanduser("~/teresa_homeschool_plan.pdf")
pdf.output(output_path)
print(f"PDF saved to: {output_path}")
