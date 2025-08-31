# Personal Website - macOS Style Enhancements

A personal website with macOS-like taskbar and terminal enhancements.

## Features

### 🎨 macOS-Style Taskbar
- **Dock-like Interface**: Floating taskbar with rounded icons similar to macOS dock
- **Hover Effects**: Icons scale and glow on hover with smooth animations
- **Tooltips**: macOS-style tooltips appear above icons when hovering
- **Backdrop Blur**: Modern glassmorphism effect with backdrop blur
- **Smooth Animations**: Framer Motion powered animations for fluid interactions

### 🖥️ Enhanced Terminal Movement
- **Header-Only Dragging**: Terminals can only be moved by dragging the white header bar
- **Smooth Movement**: Improved drag handling with proper constraints
- **No Selection Box Issues**: Fixed the selection box interference during dragging
- **macOS-like Behavior**: Windows behave like native macOS applications

### ✨ Enhanced File Glow Effects
- **Improved Visual Feedback**: Files now have enhanced glow effects on hover
- **Smooth Animations**: Scale and lift effects when hovering over files
- **Dynamic Shadows**: Glow effects that respond to accent color changes
- **Better Contrast**: Enhanced visibility and visual hierarchy

### 🎯 Key Improvements
- **Better UX**: More intuitive and polished user experience
- **Performance**: Optimized animations and interactions
- **Accessibility**: Improved focus states and keyboard navigation
- **Responsive**: Works seamlessly on both desktop and mobile devices

## Technical Implementation

### Components
- `MacOSTaskbar.tsx`: New macOS-style taskbar component
- `Terminal.tsx`: Completely rewritten with improved drag handling
- `File.tsx`: Enhanced with better glow effects and animations
- `globals.css`: Added macOS-style CSS animations and effects

### Technologies Used
- **React 18** with TypeScript
- **Framer Motion** for smooth animations
- **Tailwind CSS** for styling
- **Next.js** for the framework

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## Browser Support

- Modern browsers with support for:
  - CSS Grid and Flexbox
  - Backdrop Filter (for glassmorphism effects)
  - CSS Custom Properties
  - ES6+ JavaScript features