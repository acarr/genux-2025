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
// FAQ Accordion Management
// ==========================================================================

class FAQAccordion {
  constructor() {
    this.faqItems = document.querySelectorAll('.faq-item');
    this.init();
  }
  
  init() {
    this.faqItems.forEach((item, index) => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      
      if (question && answer) {
        // Add click event listener
        question.addEventListener('click', () => this.toggleFAQ(question, answer));
        
        // Add keyboard support
        question.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleFAQ(question, answer);
          }
        });
        
        // Set initial state based on aria-expanded
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        this.setFAQState(question, answer, isExpanded);
      }
    });
  }
  
  toggleFAQ(question, answer) {
    const isExpanded = question.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;
    
    this.setFAQState(question, answer, newState);
    
    // Custom event for FAQ toggle
    document.dispatchEvent(new CustomEvent('faqToggle', {
      detail: { question, answer, isExpanded: newState }
    }));
  }
  
  setFAQState(question, answer, isExpanded) {
    // Update ARIA attributes
    question.setAttribute('aria-expanded', isExpanded);
    answer.setAttribute('aria-hidden', !isExpanded);
    
    // Update classes for CSS transitions
    if (isExpanded) {
      answer.classList.add('faq-open');
    } else {
      answer.classList.remove('faq-open');
    }
  }
  
  // Public methods
  openFAQ(index) {
    const item = this.faqItems[index];
    if (item) {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      this.setFAQState(question, answer, true);
    }
  }
  
  closeFAQ(index) {
    const item = this.faqItems[index];
    if (item) {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      this.setFAQState(question, answer, false);
    }
  }
  
  closeAllFAQs() {
    this.faqItems.forEach((item) => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      this.setFAQState(question, answer, false);
    });
  }
}

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
    // Initialize general scrolling text elements (data-scrolling-text)
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
    
    // Initialize section scrolling ticker elements (CSS-only animations)
    const sectionScrollingContainers = document.querySelectorAll('.scrolling-section-container');
    
    // Scrolling tickers are now purely CSS-driven with no hover interactions
    // This ensures continuous, uninterrupted scrolling animations
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
  
  // Initialize FAQ accordion
  window.faqAccordion = new FAQAccordion();
  
  // Initialize hero carousel
  window.heroCarousel = new HeroCarousel();
  
  // Handle reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('reduced-motion');
  }
  
  // Example: Listen for block changes
  document.addEventListener('blockChange', (e) => {
    console.log(`Entered block ${e.detail.index + 1}`);
  });
  
  // Example: Listen for FAQ toggles
  document.addEventListener('faqToggle', (e) => {
    console.log(`FAQ toggled: ${e.detail.isExpanded ? 'opened' : 'closed'}`);
  });
});

// ==========================================================================
// Global API for external use
// ==========================================================================

// Navigation smooth scrolling
class NavigationManager {
  constructor() {
    this.init();
  }

  init() {
    // Add smooth scrolling to all navigation links
    const navLinks = document.querySelectorAll('.nav-link, .purchase-button');
    navLinks.forEach(link => {
      link.addEventListener('click', this.handleNavClick.bind(this));
    });
  }

  handleNavClick(event) {
    const href = event.currentTarget.getAttribute('href');
    
    // Only handle internal links (starting with #)
    if (href && href.startsWith('#')) {
      event.preventDefault();
      
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        this.smoothScrollToElement(targetElement);
      }
    }
  }

  smoothScrollToElement(element) {
    const headerHeight = document.querySelector('.header-block')?.offsetHeight || 0;
    const targetPosition = element.offsetTop - headerHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

// Initialize navigation manager
document.addEventListener('DOMContentLoaded', () => {
  window.navigationManager = new NavigationManager();
});

// ==========================================================================
// Hero Carousel
// ==========================================================================

class HeroCarousel {
  constructor() {
    this.emblaNode = document.querySelector('.hero-carousel[data-embla]');
    this.dots = document.querySelectorAll('.carousel-dot');
    this.emblaApi = null;
    this.autoplayPlugin = null;
    
    this.init();
  }

  init() {
    if (!this.emblaNode || typeof EmblaCarousel === 'undefined') {
      console.warn('Embla Carousel not found or not loaded');
      return;
    }

    // Initialize Embla with options
    const options = {
      loop: true,
      speed: 8,
      startIndex: 0,
      slidesToScroll: 1,
      containScroll: 'trimSnaps',
      dragFree: false,
    };

    // Initialize autoplay plugin
    this.autoplayPlugin = typeof EmblaCarouselAutoplay !== 'undefined' ? 
      EmblaCarouselAutoplay({ delay: 3000, stopOnInteraction: false }) : null;

    // Create Embla instance
    const plugins = this.autoplayPlugin ? [this.autoplayPlugin] : [];
    this.emblaApi = EmblaCarousel(this.emblaNode, options, plugins);

    // Setup event listeners
    this.setupEventListeners();
    
    // Initialize dots
    this.updateDots();
    
    console.log('Hero Carousel initialized');
  }

  setupEventListeners() {
    if (!this.emblaApi) return;

    // Listen for slide selection
    this.emblaApi.on('select', () => {
      this.updateDots();
    });

    // Add dot click handlers
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goToSlide(index);
      });
    });

    // Restart autoplay on user interaction
    this.emblaApi.on('pointerDown', () => {
      if (this.autoplayPlugin) {
        this.autoplayPlugin.stop();
      }
    });

    this.emblaApi.on('pointerUp', () => {
      if (this.autoplayPlugin) {
        this.autoplayPlugin.play();
      }
    });
  }

  updateDots() {
    if (!this.emblaApi) return;

    const selectedIndex = this.emblaApi.selectedScrollSnap();
    
    this.dots.forEach((dot, index) => {
      if (index === selectedIndex) {
        dot.classList.add('active');
        dot.setAttribute('aria-pressed', 'true');
      } else {
        dot.classList.remove('active');
        dot.setAttribute('aria-pressed', 'false');
      }
    });
  }

  goToSlide(index) {
    if (this.emblaApi) {
      this.emblaApi.scrollTo(index);
    }
  }

  getSelectedIndex() {
    return this.emblaApi ? this.emblaApi.selectedScrollSnap() : 0;
  }

  destroy() {
    if (this.emblaApi) {
      this.emblaApi.destroy();
    }
  }
}

// Expose useful functions globally
window.GENUX = {
  ScrollingText,
  BlockManager,
  FAQAccordion,
  NavigationManager,
  HeroCarousel,
  createScrollObserver,
  debounce,
  throttle,
  
  // Helper functions
  scrollToBlock: (index) => window.blockManager?.scrollToBlock(index),
  getCurrentBlock: () => window.blockManager?.getCurrentBlock(),
  getScrollingTexts: () => window.blockManager?.getScrollingTexts(),
  scrollToSection: (sectionId) => window.navigationManager?.smoothScrollToElement(document.getElementById(sectionId)),
  
  // FAQ functions
  openFAQ: (index) => window.faqAccordion?.openFAQ(index),
  closeFAQ: (index) => window.faqAccordion?.closeFAQ(index),
  closeAllFAQs: () => window.faqAccordion?.closeAllFAQs(),
  
  // Carousel functions
  goToSlide: (index) => window.heroCarousel?.scrollTo(index),
  getCarouselIndex: () => window.heroCarousel?.selectedScrollSnap(),
};
