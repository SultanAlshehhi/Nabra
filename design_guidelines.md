# Nabra Design Guidelines

## Design Approach: Reference-Based (Duolingo + Calm App Fusion)

**Primary References**: Duolingo's gamification patterns + Calm's therapeutic color palette and gentle animations
**Core Principle**: Create a safe, encouraging, playful environment that reduces anxiety around speech therapy while maintaining clinical professionalism for therapists

---

## Color Palette

### Light Mode (Primary Interface)
- **Primary Brand**: 168 65% 58% (Soft teal-blue - calming, therapeutic)
- **Success/Progress**: 142 52% 56% (Gentle green - encouraging, growth)
- **Accent/Celebration**: 48 96% 65% (Warm yellow - joyful, playful)
- **Warning/Attention**: 25 85% 60% (Soft orange - friendly alerts)
- **Background**: 210 20% 98% (Off-white - clean, spacious)
- **Surface**: 0 0% 100% (Pure white cards)
- **Text Primary**: 220 13% 18% (Soft black - readable)
- **Text Secondary**: 220 9% 46% (Muted gray)

### Dark Mode (Optional for therapist dashboard)
- **Background**: 220 13% 18%
- **Surface**: 220 10% 24%
- Adjust other colors with increased luminosity

---

## Typography

**Font Stack**: 
- Primary: 'Poppins' (Google Fonts) - rounded, friendly, highly legible
- Weights: 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold)

**Type Scale**:
- Display (Hero): text-5xl to text-6xl, font-bold (for motivational headers)
- H1: text-4xl, font-semibold (page titles)
- H2: text-3xl, font-semibold (section headers)
- H3: text-2xl, font-medium (card titles)
- Body Large: text-lg, font-normal (reading sentences)
- Body: text-base, font-normal (general content)
- Small: text-sm, font-medium (labels, captions)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 to p-8
- Section spacing: py-12 to py-20
- Card spacing: p-6
- Button padding: px-6 py-3
- Icon margins: mr-2 or ml-2

**Container Strategy**:
- Max width: max-w-7xl for dashboard layouts
- Max width: max-w-4xl for recording interface (focused attention)
- Max width: max-w-2xl for results/feedback screens

**Grid Patterns**:
- Therapist dashboard: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Session cards: grid-cols-1 md:grid-cols-2 gap-6
- Patient info: Two-column layout (details | actions)

---

## Component Library

### Navigation
- **Patient Nav**: Floating bottom navigation (mobile-friendly) with large tap targets (h-16), icons + labels
- **Therapist Nav**: Traditional sidebar (w-64) with collapsible sections, active state with colored left border
- **Logo**: Playful mascot + wordmark (talking microphone character)

### Cards & Surfaces
- **Base Card**: rounded-2xl shadow-sm bg-white border border-gray-100
- **Hover State**: shadow-md scale-[1.02] transition-transform
- **Session Cards**: Include progress ring, date badge, result label with colored dot indicator
- **Patient Cards**: Avatar, name, last session date, quick action buttons

### Recording Interface Components
- **Sentence Display**: 
  - Large card (p-8) with sentence text (text-2xl font-medium)
  - Illustrative image above text (16:9 aspect ratio, rounded-xl)
  - Phoneme highlighting on specific sounds being tested
- **Record Button**: 
  - Circular (w-24 h-24), pulsing animation when active
  - Red when recording, teal when ready, gray when disabled
  - Microphone icon centered
- **Progress Bar**: 
  - Multi-step indicator (5 circles connected by lines)
  - Completed: filled teal, Current: outlined with pulse, Upcoming: gray outline
  - Include sentence number label below each step

### Results & Feedback
- **Radial Gauge**: 
  - Circular progress showing confidence score (0-100%)
  - Animated fill on page load (spring animation, 1.2s duration)
  - Color: gradient from yellow to teal based on score
  - Large centered percentage text (text-6xl font-bold)
- **Classification Label**: 
  - Rounded pill badge (px-6 py-2)
  - Color-coded by disorder type
  - Include small info icon for definition tooltip
- **Motivational Bullets**: 
  - Two encouraging messages in cards
  - Left-aligned with star/trophy icons
  - Soft background color (teal/10% opacity)
  - Gentle fade-in animation (stagger by 0.3s)

### Mascot Character
- **Style**: Friendly microphone with eyes and smile (vector illustration)
- **Placements**: 
  - Bottom right corner during recording (size: 120px, slight bob animation)
  - Top of results page (larger, 180px, celebratory pose)
  - Loading states (animated thinking pose)
- **Speech Bubbles**: Rounded rectangles with small tail, contain tips/encouragement

### Forms & Inputs
- **Text Inputs**: rounded-lg border-2 border-gray-200 focus:border-teal-400 px-4 py-3
- **Select Dropdowns**: Matching style with chevron icon
- **Radio/Checkbox**: Large tap targets (w-5 h-5), teal accent color
- **Submit Buttons**: Full width on mobile, auto width on desktop

### Buttons
- **Primary CTA**: bg-teal-500 text-white rounded-full px-8 py-3 font-semibold shadow-md hover:bg-teal-600
- **Secondary**: bg-white text-teal-600 border-2 border-teal-500 rounded-full px-8 py-3 font-semibold
- **Ghost** (on images): bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full px-6 py-2.5
- **Icon Buttons**: rounded-full p-3 bg-gray-100 hover:bg-gray-200

### Therapist Dashboard Components
- **Stat Cards**: Grid of 3-4 cards showing total patients, sessions this week, pending reports
  - Large number (text-4xl font-bold)
  - Label below (text-sm text-gray-600)
  - Icon in top-right corner
- **Patient Table**: Striped rows, sticky header, sortable columns, search/filter bar
- **Report Viewer**: PDF embed with download/email buttons in floating action bar

---

## Animations & Interactions

**Animation Library**: Framer Motion for all animations

**Key Animations**:
- Page transitions: Fade + slide (x: 20px, duration: 0.3s)
- Success confetti: Trigger on classification complete (particles: 50, duration: 3s)
- Progress bar: Step completion with scale bounce (spring physics)
- Card hover: Subtle lift (translateY: -4px, duration: 0.2s)
- Button press: Scale down to 0.95 on active
- Mascot: Continuous gentle bob (translateY: 0 to -10px, 2s loop)

**Microinteractions**:
- Recording button: Ripple effect on click
- Audio playback: Waveform visualization (bars animate with audio)
- Form validation: Shake animation on error
- Tooltip: Fade in with slight scale (0.95 to 1)

**Performance Note**: Limit animations on therapist dashboard, prioritize data clarity

---

## Images & Illustrations

### Hero Section (Landing/Marketing Page)
- **Main Image**: Illustration of child with headphones smiling, therapist in background with dashboard
- Style: Flat illustration with soft gradients, rounded shapes
- Position: Right side of hero on desktop, above text on mobile
- Dimensions: 600x500px, object-fit: contain

### Recording Interface Images
- **Sentence Illustrations**: Simple, colorful scene depicting sentence context
  - "Kenny drank a tiny tin of coke" → Illustration of boy with soda can
  - "Sean the sheep was on the ship" → Cartoon sheep on boat
  - Style: Consistent with Duolingo's whimsical character art
  - Format: SVG or WebP, 800x450px
  - Placement: Above sentence text in card

### Dashboard Images
- **Empty States**: Friendly illustrations when no data
  - "No sessions yet" → Mascot waving with speech bubble
  - "No reports" → Mascot with clipboard looking puzzled
- **Success States**: Celebration graphics (trophy, stars, ribbons)

### Therapist Dashboard
- **Data Visualization**: Use Chart.js or Recharts for progress graphs
  - Line chart: Session frequency over time
  - Bar chart: Distribution of disorder classifications
  - Color scheme: Match brand colors (teal, green, yellow)

---

## Accessibility & Responsiveness

- **Focus States**: 2px solid teal ring with 2px offset
- **Min Touch Targets**: 44x44px (WCAG AAA)
- **Color Contrast**: Minimum 4.5:1 for body text, 3:1 for large text
- **Screen Reader**: Aria labels on all interactive elements, live regions for dynamic content
- **Responsive Breakpoints**: 
  - Mobile: < 640px (single column, bottom nav)
  - Tablet: 640px - 1024px (two columns, adaptive layouts)
  - Desktop: > 1024px (full multi-column, sidebar nav)

---

## Special Considerations

**Patient Experience**: 
- Large, clear text for reading sentences
- Minimal distractions during recording
- Immediate positive reinforcement
- Progress always visible

**Therapist Experience**: 
- Dense information displays acceptable
- Quick filters and search prominent
- Data export/download easily accessible
- Professional tone in reports while maintaining brand warmth

**Gamification Elements**:
- Streak counter (consecutive days)
- Achievement badges (first session, 10 sessions, perfect reading)
- Progress bars on everything
- Celebratory animations for milestones