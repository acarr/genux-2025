# GENUX Conference 2025

A modern, single-page website for the GENUX Conference taking place on **Friday, October 24, 2025** in Boston, MA.

## 🎯 Project Overview

This is a clean, semantic HTML website built with modern CSS best practices and vanilla JavaScript. The site features a hero section with brand logos and event details, followed by multiple content blocks that will showcase conference information.

### Event Details
- **Date**: Friday, October 24, 2025
- **Time**: 10AM – 3PM EDT  
- **Location**: 40 Cambridge St, Boston MA
- **Organizers**: GENUX, AIGA Boston, TELUS Digital

## 🛠 Technical Stack

- **HTML5**: Semantic markup with accessibility considerations
- **CSS3**: Modern features including CSS Grid, Flexbox, and Custom Properties
- **JavaScript**: Vanilla ES6+ with no external dependencies
- **Design**: Mobile-first responsive approach

## 📁 Project Structure

```
genux-2025/
├── index.html              # Main HTML file
├── styles.css              # All CSS styles and responsive design
├── script.js               # JavaScript functionality
├── assets/
│   └── images/             # Brand logos and hero background
├── reference/              # Design specifications and mockups
└── README.md              # This file
```

## ✨ Features

### Current Implementation
- **Hero Section**: Full-width hero with brand logos and event information
- **Block-based Layout**: 6 content sections ready for conference content
- **Scrolling Text Animations**: Smooth text scrolling with accessibility support
- **Responsive Design**: Mobile-first approach with fluid typography
- **Accessibility**: Screen reader support, reduced motion preferences, focus management

### Animation System
- Custom scrolling text component with speed control
- Intersection Observer for scroll-triggered animations
- Performance-optimized with throttling and debouncing
- Respects `prefers-reduced-motion` user preference

## 🎨 Design System

### Typography
- Fluid typography using `clamp()` for responsive scaling
- Primary font: System font stack (SF Pro, Segoe UI, etc.)
- Hero event details: Stinger font family (fallback to Arial Black)

### Layout
- CSS Grid and Flexbox for modern layouts
- CSS Custom Properties for maintainable theming
- Mobile-first responsive breakpoints at 768px, 1024px, and 1440px

### Brand Assets
- **GENUX**: Main conference brand
- **AIGA Boston**: Partner organization
- **TELUS Digital**: Sponsor/partner
- **Hero Background**: Conference branding image

## 🚀 Getting Started

1. **Clone or download** the project files
2. **Open `index.html`** in a modern web browser
3. **No build process required** - everything runs natively

### Development
- Edit content in `index.html`
- Modify styles in `styles.css`
- Add interactivity in `script.js`
- Replace placeholder content in blocks 2-6 as designs become available

## 📱 Browser Support

- Chrome 80+
- Firefox 72+
- Safari 13.1+
- Edge 80+

Features degrade gracefully in older browsers with progressive enhancement.

## 🎛 JavaScript API

The site exposes a global `GENUX` object with useful utilities:

```javascript
// Scroll to a specific block
GENUX.scrollToBlock(2);

// Get current visible block
const currentBlock = GENUX.getCurrentBlock();

// Create custom scrolling text
new GENUX.ScrollingText(element, { speed: 30 });
```

## 📋 Content Blocks

1. **Block 1**: Hero section (implemented)
2. **Block 2**: TBD - Conference information
3. **Block 3**: TBD - Speakers or agenda
4. **Block 4**: TBD - Additional content
5. **Block 5**: TBD - Additional content  
6. **Block 6**: TBD - Footer or contact information

## 🔧 Customization

### Adding Scrolling Text
Add the `data-scrolling-text` attribute to any element:

```html
<div data-scrolling-text data-scrolling-speed="50">
  Your scrolling text here
</div>
```

### Animation Options
- `data-scrolling-speed`: Pixels per second (default: 50)
- `data-scrolling-direction`: "left" or "right" (default: "left")
- `data-scrolling-pause`: "false" to disable pause on hover

## 📐 Design Specifications

Detailed design specifications and mockups are available in the `reference/` folder:
- `Hero.png`: Visual design mockup
- `Hero.specs.pdf`: Precise measurements and specifications
- `Hero.specs.png`: Specification overview

## 🎯 Next Steps

- [ ] Implement remaining content blocks based on provided designs
- [ ] Add conference-specific content (speakers, schedule, etc.)
- [ ] Integrate registration or ticket purchasing functionality
- [ ] Optimize images for web delivery
- [ ] Add font files for Stinger typography

## 📄 License

This project is for the GENUX Conference 2025. All brand assets and content are property of their respective owners.

---

**Built with ❤️ for the GENUX Conference 2025**
