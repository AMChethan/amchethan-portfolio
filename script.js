/**
 * Portfolio Interactive Scripts
 * A M Chethan - Java Full Stack Developer
 */

document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       CANVAS BACKGROUND SYSTEM (TECH PARTICLES & CODE SNIPPETS)
       ========================================================================== */
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    
    // Particle settings
    const particles = [];
    const particleCount = Math.min(60, Math.floor((width * height) / 25000)); // Dynamic density
    const connectionDistance = 120;
    const mouse = { x: null, y: null, radius: 150 };
    
    const codeSnippets = ['Java', 'Spring', 'OOP', 'React', 'HTML', 'CSS', 'REST', 'SQL', 'Docker', 'Git', 'C', 'Python', '{}', '[]', '01'];
    
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2 + 1;
            
            // Randomly assign as a dot or a text snippet
            this.isText = Math.random() < 0.25;
            this.text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
            this.fontSize = Math.floor(Math.random() * 4) + 9; // 9px to 12px
            this.opacity = Math.random() * 0.4 + 0.15;
        }
        
        draw() {
            ctx.beginPath();
            if (this.isText) {
                ctx.font = `${this.fontSize}px 'Space Grotesk', monospace`;
                ctx.fillStyle = `rgba(0, 180, 216, ${this.opacity})`;
                ctx.fillText(this.text, this.x, this.y);
            } else {
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 245, 212, ${this.opacity})`;
                ctx.fill();
            }
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
            
            // Mouse repeller interaction (gentle push)
            if (mouse.x != null && mouse.y != null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.x += Math.cos(angle) * force * 1.2;
                    this.y += Math.sin(angle) * force * 1.2;
                }
            }
        }
    }
    
    // Initialize Particles
    function initParticles() {
        particles.length = 0;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // Draw lines connecting particles
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                
                if (dist < connectionDistance) {
                    // Alpha gets weaker the further apart they are
                    const alpha = (1 - dist / connectionDistance) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(0, 180, 216, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
            
            // Connect to mouse as well
            if (mouse.x !== null && mouse.y !== null) {
                const p = particles[i];
                const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                if (dist < mouse.radius) {
                    const alpha = (1 - dist / mouse.radius) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(0, 245, 212, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }
    
    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        connectParticles();
        requestAnimationFrame(animate);
    }
    
    // Event Listeners
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
    });
    
    initParticles();
    animate();
    
    
    /* ==========================================================================
       ANIMATED TYPING EFFECT
       ========================================================================== */
    const typingSpan = document.getElementById('typing-text');
    const roles = ["Java Full Stack Developer", "React Developer", "Problem Solver", "Open to Opportunities"];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function typeEffect() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            charIndex--;
            typingSpeed = 50; // Deleting is faster
        } else {
            charIndex++;
            typingSpeed = 100;
        }
        
        typingSpan.textContent = currentRole.substring(0, charIndex);
        
        if (!isDeleting && charIndex === currentRole.length) {
            // Full role typed. Wait before starting to delete.
            typingSpeed = 2000; 
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            // Move to next role
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 500; // Pause before typing next role
        }
        
        setTimeout(typeEffect, typingSpeed);
    }
    
    // Start Typing
    setTimeout(typeEffect, 1000);
    
    
    /* ==========================================================================
       MOBILE NAVIGATION SYSTEM
       ========================================================================== */
    const hamburger = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        // Prevent body scrolling when menu is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
    }
    
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Close mobile menu when a nav link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });
    
    
    /* ==========================================================================
       STICKY NAVBAR & SCROLL SPY
       ========================================================================== */
    const header = document.querySelector('.navbar-container');
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;
        
        // Sticky Header effect
        if (scrollPos > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Scroll Spy - Highlight active section link
        let currentSectionId = '';
        sections.forEach(sec => {
            const secTop = sec.offsetTop - 120; // Offset for sticky navbar
            const secHeight = sec.offsetHeight;
            if (scrollPos >= secTop && scrollPos < secTop + secHeight) {
                currentSectionId = sec.getAttribute('id');
            }
        });
        
        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
    
    
    /* ==========================================================================
       SCROLL-TRIGGERED FADE-IN & REVEAL SYSTEM
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px' // Reveal slightly before entering screen fully
    });
    
    revealElements.forEach(el => revealObserver.observe(el));
    
    
    /* ==========================================================================
       SKILL PROGRESS BARS MICRO-ANIMATION
       ========================================================================== */
    const progressBars = document.querySelectorAll('.skill-progress');
    const skillsSection = document.getElementById('skills');
    
    // Store original widths and reset to 0
    progressBars.forEach(bar => {
        const targetWidth = bar.style.width;
        bar.setAttribute('data-target-width', targetWidth);
        bar.style.width = '0%';
    });
    
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate bars to target widths
                progressBars.forEach(bar => {
                    const targetWidth = bar.getAttribute('data-target-width');
                    bar.style.width = targetWidth;
                });
                skillsObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });
    
    if (skillsSection) {
        skillsObserver.observe(skillsSection);
    }
    
    
    /* ==========================================================================
       CONTACT FORM SUBMISSION WITH SIMULATED BACKEND & TOAST
       ========================================================================== */
    const contactForm = document.getElementById('portfolio-contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const toastContainer = document.getElementById('toast-container');
    
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation';
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Trigger reflow for transition
        toast.offsetHeight;
        toast.classList.add('show');
        
        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, 4000);
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const subject = document.getElementById('form-subject').value.trim();
            const message = document.getElementById('form-message').value.trim();
            
            if (!name || !email || !subject || !message) {
                showToast('Please fill out all fields.', 'error');
                return;
            }
            
            // Disable button, show loading spinner/text
            submitBtn.disabled = true;
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                <span class="btn-text">Sending...</span>
                <span class="btn-icon"><i class="fa-solid fa-circle-notch fa-spin"></i></span>
            `;
            
            // Simulate API request
            setTimeout(() => {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                
                // Show success toast
                showToast(`Thank you, ${name}! Your message has been sent successfully.`);
                
                // Reset Form
                contactForm.reset();
            }, 1800);
        });
    }
    
    
    /* ==========================================================================
       DYNAMIC RESUME PLAIN-TEXT GENERATOR & DOWNLOAD
       ========================================================================== */
    const resumeTriggers = [
        document.getElementById('hero-resume-trigger'),
        document.querySelector('.desktop-resume'),
        document.querySelector('.mobile-resume')
    ];
    
    const resumeText = `==================================================
A M CHETHAN - JAVA FULL STACK DEVELOPER
==================================================
Email: amchethan61@gmail.com
Phone: +91-7483526212
LinkedIn: https://www.linkedin.com/in/a-m-chethan
GitHub: https://github.com/AMChethan
Location: Mysore, Karnataka, India

--------------------------------------------------
SUMMARY
--------------------------------------------------
Computer Science Engineering graduate with a CGPA of 8.7, passionate about full-stack development. Hands-on experience in Java, Spring Boot, React, and REST APIs. Skilled in building reliable, scalable software architectures and intuitive user interfaces.

--------------------------------------------------
SKILLS
--------------------------------------------------
* Programming Languages: Java, Python, C, JavaScript
* Frontend: HTML5, CSS3, JavaScript (ES6+), ReactJS
* Backend: Spring Boot, Spring, Hibernate, Servlets, JDBC, REST APIs, FastAPI
* Databases: MySQL, SQL
* Tools & DevOps: Docker, Git, VS Code, Eclipse
* Core Concepts: Data Structures, OOP, DBMS, Operating Systems

--------------------------------------------------
EXPERIENCE
--------------------------------------------------
Java Full Stack Developer Training (Jan 2026 - May 2026)
QSpiders (Test Yantra Software Solutions), Mysore
* Trained in Core Java, OOPs, ReactJS, HTML, CSS, JavaScript, MySQL.
* Built mini-projects covering CRUD operations, REST APIs, database design, and version control (Git).

--------------------------------------------------
PROJECTS
--------------------------------------------------
1. BugBuster IDE (AI-Powered Multi-Language IDE)
* Description: Intelligent full-stack development environment featuring automated error detection and patching powered by DeepSeek Coder 1.3B ML model. Utilized Spectrum-Based Fault Localization, FastAPI backend, and Docker containers for execution.
* Tech Stack: Python, FastAPI, HTML5, CSS3, JavaScript, Docker, AI/ML

2. YourStore (Responsive E-Commerce Platform)
* Description: Fully responsive electronic merchandise e-commerce portal supporting product catalog browsing, cart operations, wishlist management, and modern user dashboard.
* Tech Stack: HTML5, CSS3, JavaScript
* GitHub: https://github.com/AMChethan/YourStore
* Live Demo: https://amchethan.github.io/YourStore/

3. AI-Powered Chatbot (NLP Conversational Agent)
* Description: Chatbot implementing intent recognition and context-aware responses using Natural Language Processing.
* Tech Stack: Python, HTML5, CSS3, JavaScript, NLP

--------------------------------------------------
EDUCATION
--------------------------------------------------
* B.E. Computer Science & Engineering (2022 - 2026)
  Govt. Engineering College Chamarajanagara | CGPA: 8.7 / 10
* Pre-University College (2022)
  Sri Jayachamarajendra PU College, Mysore | Score: 90.3%
* 10th CBSE (2020)
  JSS Public School, Mysore | Score: 87%

--------------------------------------------------
CERTIFICATIONS & ACHIEVEMENTS
--------------------------------------------------
* Full Stack Development Certification - NoviTech Pvt. Ltd
* Active Volunteer - Youth for Seva NGO (Education, Environment, Health)
* Seva Sadhaka Award - Recognized for dedicated community volunteering service
`;

    function downloadResume(e) {
        e.preventDefault();
        
        // Create file blob
        const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Create link and simulate click
        const link = document.createElement('a');
        link.href = url;
        link.download = 'A_M_Chethan_Resume.txt';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show confirmation toast
        showToast('Resume downloaded successfully as A_M_Chethan_Resume.txt!');
    }
    
    resumeTriggers.forEach(trigger => {
        if (trigger) {
            trigger.addEventListener('click', downloadResume);
        }
    });

});
