# Time Tracker

A minimal, session-based time tracking application that calculates hours for time entries grouped by engagement and category.

![Time Tracker](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?style=flat-square&logo=tailwind-css)

## Features

- ⏱️ **Time Entry Tracking** - Add time entries with engagement, category, start time, and end time
- � **Hours Calculation** - Automatically calculates hours with half-up rounding
- �📈 **Hierarchical Reports** - View time breakdowns by engagement → category
- 📝 **Category Notes** - Add collapsible notes to any engagement/category combination
- 🎨 **Modern UI** - Clean, mobile-first design with Tailwind CSS
- 🚫 **No Persistence** - Session-only data (refresh clears everything)
- 🌐 **Client-Side Only** - Pure browser-based application with no backend

## Tech Stack

- **Framework:** Next.js 15.5 (App Router)
- **Runtime:** React 19.1
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x
- **State Management:** React useReducer
- **Package Manager:** Bun

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Main page component (orchestrator)
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ErrorAlert.tsx     # Error message display
│   ├── EntryForm.tsx      # Time entry form
│   ├── EntriesTable.tsx   # Entries list table
│   ├── ReportSection.tsx  # Report with breakdowns
│   └── EmptyState.tsx     # Empty state UI
├── lib/
│   ├── time.ts            # Time parsing, hours calculation, formatting
│   └── report.ts          # Report generation logic
├── state.ts               # State management (reducer & actions)
└── types.ts               # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Modern web browser

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd time-tracker

# Install dependencies
bun install
```

### Development

```bash
# Run development server
bun dev

# Build for production
bun run build

# Start production server
bun start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Adding Entries

1. Enter an **Engagement** (project name)
2. Enter a **Category** (activity type)
3. Select **Start Time** and **End Time**
4. Click **Add Entry**

### Viewing Reports

- Entries are automatically grouped by engagement, then by category
- Hours are prominently displayed for easy scanning
- View detailed breakdowns including entries count, minutes, and formatted time

### Managing Notes

- Click **Add Note** or **Edit Note** under any category
- Notes are saved automatically on blur
- Maximum 1000 characters per note

### Clearing Data

- Click **Clear All** to remove all entries and notes
- ⚠️ **Warning:** There's no undo - all data is lost on refresh

## Key Design Decisions

- ✅ **Session-only storage** - No database, localStorage, or persistence
- ✅ **Client-side rendering** - All logic runs in the browser
- ✅ **Time-only inputs** - Uses HH:MM format (supports cross-midnight entries)
- ✅ **Light mode only** - Optimized for clarity and readability
- ✅ **Mobile-first** - Responsive design prioritizing mobile experience
- ✅ **Component architecture** - Modular, reusable components

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

This is a personal project. See `spec.md` for the full specification.

## License

MIT
