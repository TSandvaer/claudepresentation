// Presentation Navigation System
class PresentationController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = document.querySelectorAll('.slide').length;
        this.slides = document.querySelectorAll('.slide');
        this.init();
    }

    init() {
        this.updateSlideCounter();
        this.updateProgressBar();
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();
        this.preloadSlides();
    }

    // Navigate to specific slide
    goToSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides) {
            return;
        }

        const direction = slideNumber > this.currentSlide ? 'next' : 'prev';

        // Remove active class from current slide
        this.slides[this.currentSlide - 1].classList.remove('active');

        // Add animation class based on direction
        if (direction === 'next') {
            this.slides[this.currentSlide - 1].classList.add('prev');
            this.slides[slideNumber - 1].classList.remove('prev');
        } else {
            this.slides[slideNumber - 1].classList.remove('prev');
        }

        // Update current slide
        this.currentSlide = slideNumber;

        // Add active class to new slide
        this.slides[this.currentSlide - 1].classList.add('active');

        this.updateSlideCounter();
        this.updateProgressBar();
        this.updateNavigationButtons();
    }

    // Navigate to next slide
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    // Navigate to previous slide
    previousSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    // Update slide counter display
    updateSlideCounter() {
        const currentSlideElement = document.querySelector('.current-slide');
        const totalSlidesElement = document.querySelector('.total-slides');

        if (currentSlideElement) {
            currentSlideElement.textContent = this.currentSlide;
        }
        if (totalSlidesElement) {
            totalSlidesElement.textContent = this.totalSlides;
        }
    }

    // Update progress bar
    updateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            const progress = (this.currentSlide / this.totalSlides) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }

    // Update navigation button states
    updateNavigationButtons() {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        if (prevBtn) {
            prevBtn.disabled = this.currentSlide === 1;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentSlide === this.totalSlides;
        }
    }

    // Setup keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                case 'PageDown':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                default:
                    // Handle number keys for direct slide navigation
                    if (e.key >= '1' && e.key <= '9') {
                        const slideNumber = parseInt(e.key);
                        if (slideNumber <= this.totalSlides) {
                            e.preventDefault();
                            this.goToSlide(slideNumber);
                        }
                    }
            }
        });
    }

    // Setup touch/swipe navigation
    setupTouchNavigation() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            this.handleSwipe();
        });

        const handleSwipe = () => {
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 50;

            // Check if horizontal swipe is more significant than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    // Swipe right - go to previous slide
                    this.previousSlide();
                } else {
                    // Swipe left - go to next slide
                    this.nextSlide();
                }
            }
        };

        this.handleSwipe = handleSwipe;
    }

    // Preload slides for smooth transitions
    preloadSlides() {
        // Add slight delays to slide content animations
        this.slides.forEach((slide, index) => {
            const content = slide.querySelector('.slide-content');
            if (content) {
                content.style.animationDelay = `${index * 0.1}s`;
            }
        });
    }

    // Toggle fullscreen mode
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Get current slide info
    getCurrentSlideInfo() {
        return {
            current: this.currentSlide,
            total: this.totalSlides,
            progress: (this.currentSlide / this.totalSlides) * 100
        };
    }
}

// Global navigation functions for button clicks
function nextSlide() {
    if (window.presentation) {
        window.presentation.nextSlide();
    }
}

function previousSlide() {
    if (window.presentation) {
        window.presentation.previousSlide();
    }
}

function goToSlide(slideNumber) {
    if (window.presentation) {
        window.presentation.goToSlide(slideNumber);
    }
}

// Auto-advance functionality (optional)
class AutoAdvance {
    constructor(presentation, interval = 10000) {
        this.presentation = presentation;
        this.interval = interval;
        this.timer = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.timer = setInterval(() => {
            if (this.presentation.currentSlide < this.presentation.totalSlides) {
                this.presentation.nextSlide();
            } else {
                this.stop();
            }
        }, this.interval);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isRunning = false;
    }

    toggle() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }
}

// Slide transitions with enhanced animations
class SlideTransitions {
    static fadeTransition(currentSlide, nextSlide, direction) {
        currentSlide.style.opacity = '0';
        setTimeout(() => {
            currentSlide.classList.remove('active');
            nextSlide.classList.add('active');
            nextSlide.style.opacity = '1';
        }, 250);
    }

    static slideTransition(currentSlide, nextSlide, direction) {
        const translateValue = direction === 'next' ? '-100%' : '100%';
        currentSlide.style.transform = `translateX(${translateValue})`;

        setTimeout(() => {
            currentSlide.classList.remove('active');
            currentSlide.style.transform = '';
            nextSlide.classList.add('active');
        }, 500);
    }
}

// Presentation Notes System (for presenter view)
class PresentationNotes {
    constructor() {
        this.notes = new Map();
        this.loadNotes();
    }

    addNote(slideNumber, note) {
        this.notes.set(slideNumber, note);
        this.saveNotes();
    }

    getNote(slideNumber) {
        return this.notes.get(slideNumber) || '';
    }

    loadNotes() {
        const saved = localStorage.getItem('presentation-notes');
        if (saved) {
            this.notes = new Map(JSON.parse(saved));
        }
    }

    saveNotes() {
        localStorage.setItem('presentation-notes', JSON.stringify([...this.notes]));
    }
}

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main presentation controller
    window.presentation = new PresentationController();

    // Initialize optional features
    window.autoAdvance = new AutoAdvance(window.presentation);
    window.notes = new PresentationNotes();
    window.backgroundAnimations = new BackgroundAnimations();

    // Add helpful keyboard shortcuts info
    console.log(`
    🎯 Presentation Controls:
    ← → Arrow Keys: Navigate slides
    Space/PageDown: Next slide
    PageUp: Previous slide
    Home: First slide
    End: Last slide
    1-9: Jump to slide number
    Esc: Toggle fullscreen

    📱 Touch: Swipe left/right to navigate
    `);

    // Optional: Add presentation info to window for debugging
    window.presentationInfo = () => window.presentation.getCurrentSlideInfo();
});

// Handle window resize for responsive design
window.addEventListener('resize', () => {
    // Recalculate any size-dependent elements if needed
    if (window.presentation) {
        window.presentation.updateProgressBar();
    }
});

// Handle visibility change (pause auto-advance when tab is not visible)
document.addEventListener('visibilitychange', () => {
    if (window.autoAdvance) {
        if (document.hidden) {
            window.autoAdvance.stop();
        }
        // Note: Don't auto-restart when visible to avoid unexpected behavior
    }
});

// Background Animation System
class BackgroundAnimations {
    constructor() {
        this.codeSnippets = [
            'const claude = new AI();',
            'function generateCode() {',
            'if (user.needsHelp) {',
            'claude.assist(task);',
            'return solution;',
            '}',
            'async await fetch()',
            'console.log("Hello World");',
            'import { useState } from "react";',
            'const [state, setState] = useState();',
            'git commit -m "feat: new feature"',
            'npm install @anthropic/claude',
            'python main.py --help',
            'SELECT * FROM projects;',
            'docker run -p 3000:3000',
            'let result = await claude.help();',
            'export default function App() {',
            'useEffect(() => {',
            'return () => cleanup();',
            'class PresentationApp {',
            'constructor(props) {',
            'this.state = { active: true };',
            'render() {',
            'background: linear-gradient();',
            'transform: translate3d(0,0,0);',
            'animation: slideIn 0.3s ease;',
            '@media (max-width: 768px) {',
            'grid-template-columns: 1fr;',
            'flex-direction: column;',
            'justify-content: center;'
        ];

        this.init();
    }

    init() {
        this.createFloatingCode();
        this.createParticles();
        this.createNetworkConnections();
        this.createAINodes();
        this.createDataCenterElements();
        this.setupMouseInteraction();
    }

    createFloatingCode() {
        const codeBackground = document.getElementById('codeBackground');
        if (!codeBackground) return;

        // Create floating code snippets
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const codeElement = document.createElement('div');
                codeElement.className = 'floating-code';
                codeElement.textContent = this.codeSnippets[Math.floor(Math.random() * this.codeSnippets.length)];

                // Random positioning
                codeElement.style.top = Math.random() * 100 + '%';
                codeElement.style.left = '-200px';
                codeElement.style.animationDelay = Math.random() * 5 + 's';

                codeBackground.appendChild(codeElement);

                // Remove element after animation
                setTimeout(() => {
                    if (codeElement.parentNode) {
                        codeElement.parentNode.removeChild(codeElement);
                    }
                }, 30000);
            }, i * 2000);
        }

        // Keep generating new code snippets
        setInterval(() => {
            this.addFloatingCode();
        }, 3000);
    }

    addFloatingCode() {
        const codeBackground = document.getElementById('codeBackground');
        if (!codeBackground) return;

        const codeElement = document.createElement('div');
        codeElement.className = 'floating-code';
        codeElement.textContent = this.codeSnippets[Math.floor(Math.random() * this.codeSnippets.length)];

        codeElement.style.top = Math.random() * 100 + '%';
        codeElement.style.left = '-200px';
        codeElement.style.fontSize = (12 + Math.random() * 6) + 'px';

        codeBackground.appendChild(codeElement);

        setTimeout(() => {
            if (codeElement.parentNode) {
                codeElement.parentNode.removeChild(codeElement);
            }
        }, 30000);
    }



    createParticles() {
        const codeBackground = document.getElementById('codeBackground');
        if (!codeBackground) return;

        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';

                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 15 + 's';
                particle.style.animationDuration = (10 + Math.random() * 8) + 's';

                codeBackground.appendChild(particle);

                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 20000);
            }, i * 200);
        }

        // Keep generating particles
        setInterval(() => {
            this.addParticle();
        }, 1500);
    }

    addParticle() {
        const codeBackground = document.getElementById('codeBackground');
        if (!codeBackground) return;

        const particle = document.createElement('div');
        particle.className = 'particle';

        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (8 + Math.random() * 10) + 's';

        codeBackground.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 18000);
    }

    setupMouseInteraction() {
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Create mouse trail particles
            if (Math.random() > 0.95) {
                this.createMouseParticle(mouseX, mouseY);
            }
        });
    }

    createMouseParticle(x, y) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '3px';
        particle.style.height = '3px';
        particle.style.background = 'rgba(79, 172, 254, 0.8)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        particle.style.animation = 'particleFloat 2s linear forwards';

        document.body.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }

    // Data Center Network Methods
    createNetworkConnections() {
        const networkLayer = document.getElementById('networkLayer');
        if (!networkLayer) return;

        // Create horizontal network connections
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const connection = document.createElement('div');
                connection.className = 'network-connection';

                connection.style.top = Math.random() * 100 + '%';
                connection.style.left = Math.random() * 30 + '%';
                connection.style.width = (200 + Math.random() * 300) + 'px';
                connection.style.animationDelay = Math.random() * 8 + 's';
                connection.style.animationDuration = (6 + Math.random() * 4) + 's';

                networkLayer.appendChild(connection);
            }, i * 1000);
        }

        // Create diagonal connections
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const connection = document.createElement('div');
                connection.className = 'network-connection diagonal';

                const angle = Math.random() * 60 + 15; // 15-75 degrees
                connection.style.top = Math.random() * 80 + '%';
                connection.style.left = Math.random() * 40 + '%';
                connection.style.width = (150 + Math.random() * 200) + 'px';
                connection.style.transform = `rotate(${angle}deg)`;
                connection.style.animationDelay = Math.random() * 8 + 's';

                networkLayer.appendChild(connection);
            }, i * 1500);
        }

        // Create vertical connections
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const connection = document.createElement('div');
                connection.className = 'network-connection vertical';

                connection.style.top = Math.random() * 60 + '%';
                connection.style.left = Math.random() * 90 + '%';
                connection.style.height = (100 + Math.random() * 150) + 'px';
                connection.style.animationDelay = Math.random() * 8 + 's';

                networkLayer.appendChild(connection);
            }, i * 2000);
        }

        // Keep generating new connections
        setInterval(() => {
            this.addNetworkConnection();
        }, 8000);
    }

    addNetworkConnection() {
        const networkLayer = document.getElementById('networkLayer');
        if (!networkLayer) return;

        const connection = document.createElement('div');
        const types = ['', 'diagonal', 'vertical'];
        const type = types[Math.floor(Math.random() * types.length)];
        connection.className = `network-connection ${type}`;

        if (type === 'vertical') {
            connection.style.top = Math.random() * 60 + '%';
            connection.style.left = Math.random() * 90 + '%';
            connection.style.height = (100 + Math.random() * 150) + 'px';
        } else {
            connection.style.top = Math.random() * 100 + '%';
            connection.style.left = Math.random() * 30 + '%';
            connection.style.width = (150 + Math.random() * 250) + 'px';

            if (type === 'diagonal') {
                const angle = Math.random() * 60 + 15;
                connection.style.transform = `rotate(${angle}deg)`;
            }
        }

        connection.style.animationDuration = (5 + Math.random() * 6) + 's';
        networkLayer.appendChild(connection);

        setTimeout(() => {
            if (connection.parentNode) {
                connection.parentNode.removeChild(connection);
            }
        }, 15000);
    }

    createAINodes() {
        const aiNodesLayer = document.getElementById('aiNodesLayer');
        if (!aiNodesLayer) return;

        // Create main AI nodes
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const node = document.createElement('div');
                const isLarge = Math.random() > 0.7;
                node.className = `ai-node ${isLarge ? 'large' : ''}`;

                node.style.top = Math.random() * 90 + '%';
                node.style.left = Math.random() * 90 + '%';
                node.style.animationDelay = Math.random() * 4 + 's';
                node.style.animationDuration = (3 + Math.random() * 3) + 's';

                aiNodesLayer.appendChild(node);
            }, i * 800);
        }

        // Keep generating new nodes
        setInterval(() => {
            this.addAINode();
        }, 6000);
    }

    addAINode() {
        const aiNodesLayer = document.getElementById('aiNodesLayer');
        if (!aiNodesLayer) return;

        const node = document.createElement('div');
        const isLarge = Math.random() > 0.8;
        node.className = `ai-node ${isLarge ? 'large' : ''}`;

        node.style.top = Math.random() * 90 + '%';
        node.style.left = Math.random() * 90 + '%';
        node.style.animationDuration = (2 + Math.random() * 4) + 's';

        aiNodesLayer.appendChild(node);

        setTimeout(() => {
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
        }, 12000);
    }

    createDataCenterElements() {
        const networkLayer = document.getElementById('networkLayer');
        if (!networkLayer) return;

        // Create data streams in network layer instead
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const stream = document.createElement('div');
                stream.className = 'data-stream';

                stream.style.top = Math.random() * 80 + '%';
                stream.style.left = Math.random() * 90 + '%';
                stream.style.animationDelay = Math.random() * 6 + 's';
                stream.style.height = (60 + Math.random() * 80) + 'px';

                networkLayer.appendChild(stream);
            }, i * 800);
        }

        // Keep generating data center elements
        setInterval(() => {
            this.addDataCenterElement();
        }, 5000);
    }

    addDataCenterElement() {
        const networkLayer = document.getElementById('networkLayer');
        if (!networkLayer) return;

        // Only create data streams now
        const element = document.createElement('div');
        element.className = 'data-stream';

        element.style.top = Math.random() * 80 + '%';
        element.style.left = Math.random() * 90 + '%';
        element.style.animationDelay = Math.random() * 6 + 's';
        element.style.height = (60 + Math.random() * 80) + 'px';

        networkLayer.appendChild(element);

        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 15000);
    }
}

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PresentationController,
        AutoAdvance,
        SlideTransitions,
        PresentationNotes,
        BackgroundAnimations
    };
}