CodeWise – Intelligent Programming Learning Platform

CodeWise is a full-stack learning platform designed to help students master programming logic through structured practice, training exams, notes, and analytics.
It supports students, content managers, and admins with clearly separated roles and workflows.

Project Overview

CodeWise provides an end-to-end system for:

Learning programming concepts step by step

Practicing curated coding problems

Taking structured training exams

Managing content with review and approval workflows

Monitoring platform activity through analytics and audit logs

The platform is built with scalability, role isolation, and professional UX in mind.

Key Features
Student Module

Language-wise practice modules

Topic and subtopic based question flow

Training exams visible only after admin approval

Progress tracking and recently solved history

Notes access with enabled or disabled visibility

Profile section with issue reporting

Content Manager Module

Create and manage:

Languages

Topics and subtopics

Practice questions

Notes (PDF uploads)

Training exams

Structured exam creation flow:

Exam details

English, Mathematics, and Coding sections

Question assignment per section

Submit content for admin review

No direct publishing access

Separate “Report Issue” module

Admin Module

Centralized Admin Console

Review and approve:

Exams

Questions

Notes

Enable or disable:

Languages

Content

Content managers

Restore disabled content

Full audit logging of admin actions

Dedicated issue management module

Training Exam Workflow

Content Manager creates a Training Exam

Exam is structured into three sections:

English

Mathematics

Coding

Questions are added per section:

Correct answers stored securely

Answers hidden from students

Exam is submitted for admin review

Admin approves and publishes

Exam becomes visible in Student Training Exams

Feedback and Issue Reporting

Users can report issues via a simple form:

Screenshot upload

Issue description

Reports appear in the Admin Panel:

Title view

Full image preview

User name and email

Detailed description

Available for:

Students (Profile section)

Content Managers (Dedicated module)

UI and UX Principles

White-first professional UI

Glassmorphism effects for:

Navigation

Sidebars

Action buttons

Clean card-based layouts

Smooth transitions and hover states

Consistent design across dashboards

No dark mode dependency

Tech Stack
Frontend

React.js

Tailwind CSS

Modern component-based architecture

Responsive layouts

Backend

Node.js

Express.js

REST APIs

Role-based access control

Database

MySQL

Structured relational schema

Audit logging tables

Status-driven content lifecycle

Other Integrations

Formspree for feedback submission

Secure file upload handling

Role-specific route protection

Role-Based Access Control
Role	Capabilities
Student	Practice, exams, notes, progress tracking
Content Manager	Create content, submit for review
Admin	Review, publish, disable, audit
Project Structure (High Level)

frontend/

components

pages

dashboards

backend/

controllers

routes

middleware

database/

schemas

migrations

Status Flow

All major content follows this lifecycle:

Draft → Submitted → Approved → Published
Disabled content can be restored by Admin.

Audit Logging

Every admin action is logged with:

Admin identity

Action type

Target entity

Timestamp

Action details

This ensures traceability and accountability.

Future Enhancements

Advanced analytics dashboards

AI-assisted question recommendations

Student performance insights

Notification system

Multi-language UI support

How to Run Locally

Clone the repository

Install frontend and backend dependencies

Configure environment variables

Run database migrations

Start backend and frontend servers

Project Purpose

This project was built to demonstrate:

Full-stack system design

Role-based enterprise workflows

Scalable education platform architecture

Clean UX and professional UI standards

Author

Developed by vishnu3821
Role: Full Stack Developer / Student
