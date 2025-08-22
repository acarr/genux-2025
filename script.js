/**
 * GENUX Conference 2025 - JavaScript
 * Handles scrolling text animations and interactive features
 */

// ==========================================================================
// Scrolling Text Animation System
// ==========================================================================

class ScrollingText {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      speed: options.speed || 50, // pixels per second
      direction: options.direction || 'left', // 'left' or 'right'
      pauseOnHover: options.pauseOnHover !== false, // default true
      ...options
    };
    
    this.init();
  }
  
  init() {
    if (!this.element) return;
    
    // Wrap the text content
    const text = this.element.textContent;
    this.element.innerHTML = `<span class="scrolling-text-inner">${text}</span>`;
    this.textElement = this.element.querySelector('.scrolling-text-inner');
    
    // Add CSS classes
    this.element.classList.add('scrolling-text');
    
    // Calculate animation duration based on text width and speed
    this.setupAnimation();
    
    // Add event listeners
    if (this.options.pauseOnHover) {
      this.addHoverListeners();
    }
    
    // Handle resize
    window.addEventListener('resize', () => this.setupAnimation());
  }
  
  setupAnimation() {
    // Wait for next frame to ensure DOM is updated
    requestAnimationFrame(() => {
      const textWidth = this.textElement.scrollWidth;
      const containerWidth = this.element.clientWidth;
      const totalDistance = textWidth + containerWidth;
      const duration = totalDistance / this.options.speed;
      
      // Apply animation
      this.textElement.style.animationDuration = `${duration}s`;
      
      if (this.options.direction === 'right') {
        this.textElement.style.animationDirection = 'reverse';
      }
    });
  }
  
  addHoverListeners() {
    this.element.addEventListener('mouseenter', () => {
      this.textElement.style.animationPlayState = 'paused';
    });
    
    this.element.addEventListener('mouseleave', () => {
      this.textElement.style.animationPlayState = 'running';
    });
  }
  
  // Public methods
  play() {
    this.textElement.style.animationPlayState = 'running';
  }
  
  pause() {
    this.textElement.style.animationPlayState = 'paused';
  }
  
  setSpeed(speed) {
    this.options.speed = speed;
    this.setupAnimation();
  }
  
  destroy() {
    this.element.innerHTML = this.element.textContent;
    this.element.classList.remove('scrolling-text');
  }
}

// ==========================================================================
// Animation Utilities
// ==========================================================================

// Intersection Observer for scroll-triggered animations
const createScrollObserver = (callback, options = {}) => {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px',
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Animation on scroll into view
const animateOnScroll = () => {
  const elements = document.querySelectorAll('[data-animate-on-scroll]');
  
  const observer = createScrollObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        // Optional: unobserve after animation
        if (entry.target.dataset.animateOnce !== 'false') {
          observer.unobserve(entry.target);
        }
      } else if (entry.target.dataset.animateOnce === 'false') {
        entry.target.classList.remove('animate-in');
      }
    });
  });
  
  elements.forEach(el => observer.observe(el));
};

// ==========================================================================
// Block Management
// ==========================================================================

class BlockManager {
  constructor() {
    this.blocks = document.querySelectorAll('.content-block');
    this.currentBlock = 0;
    this.scrollingTexts = [];
    
    this.init();
  }
  
  init() {
    this.initializeScrollingTexts();
    this.addScrollListener();
    animateOnScroll();
  }
  
  initializeScrollingTexts() {
    // Initialize scrolling text elements
    const scrollingElements = document.querySelectorAll('[data-scrolling-text]');
    
    scrollingElements.forEach(element => {
      const speed = parseInt(element.dataset.scrollingSpeed) || 50;
      const direction = element.dataset.scrollingDirection || 'left';
      
      const scrollingText = new ScrollingText(element, {
        speed,
        direction,
        pauseOnHover: element.dataset.scrollingPause !== 'false'
      });
      
      this.scrollingTexts.push(scrollingText);
    });
  }
  
  addScrollListener() {
    let ticking = false;
    
    const updateCurrentBlock = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      this.blocks.forEach((block, index) => {
        const blockTop = block.offsetTop;
        const blockHeight = block.offsetHeight;
        
        if (scrollY >= blockTop - windowHeight / 2 && 
            scrollY < blockTop + blockHeight - windowHeight / 2) {
          if (this.currentBlock !== index) {
            this.currentBlock = index;
            this.onBlockChange(index, block);
          }
        }
      });
      
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateCurrentBlock);
        ticking = true;
      }
    });
  }
  
  onBlockChange(index, block) {
    // Add active class to current block
    this.blocks.forEach(b => b.classList.remove('active'));
    block.classList.add('active');
    
    // Trigger any block-specific animations
    const blockAnimations = block.querySelectorAll('[data-block-animation]');
    blockAnimations.forEach(el => {
      el.classList.add('animate');
    });
    
    // Custom event for block changes
    document.dispatchEvent(new CustomEvent('blockChange', {
      detail: { index, block }
    }));
  }
  
  // Public methods
  getScrollingTexts() {
    return this.scrollingTexts;
  }
  
  getCurrentBlock() {
    return this.currentBlock;
  }
  
  scrollToBlock(index) {
    if (this.blocks[index]) {
      this.blocks[index].scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}

// ==========================================================================
// Performance Utilities
// ==========================================================================

// Debounce function for performance
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ==========================================================================
// Initialization
// ==========================================================================

// DOM Ready
const ready = (fn) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

// Initialize everything when DOM is ready
ready(() => {
  console.log('GENUX Conference 2025 - JavaScript initialized');
  
  // Initialize block manager
  window.blockManager = new BlockManager();
  
  // Handle reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('reduced-motion');
  }
  
  // Example: Listen for block changes
  document.addEventListener('blockChange', (e) => {
    console.log(`Entered block ${e.detail.index + 1}`);
  });
});

// ==========================================================================
// Global API for external use
// ==========================================================================

// Expose useful functions globally
window.GENUX = {
  ScrollingText,
  BlockManager,
  createScrollObserver,
  debounce,
  throttle,
  
  // Helper functions
  scrollToBlock: (index) => window.blockManager?.scrollToBlock(index),
  getCurrentBlock: () => window.blockManager?.getCurrentBlock(),
  getScrollingTexts: () => window.blockManager?.getScrollingTexts()
};
