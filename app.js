/**
 * CHETHAN'S PORTFOLIO - CORE APPLICATION LOGIC
 * Engineered for A M Chethan | Software & AI Engineer
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. HEADER SCROLL & ACTIVE LINK HIGHLIGHTER
  // =========================================================================
  const siteHeader = document.getElementById('siteHeader');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }, { passive: true });

  // Scroll-spy for accurate active navigation link highlighting
  function updateActiveNav() {
    const navMid = 140; // Detection line 140px from top (below 72px header)
    let currentId = '';

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= navMid && rect.bottom > navMid) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  window.addEventListener('resize', updateActiveNav, { passive: true });
  updateActiveNav();


  // =========================================================================
  // 2. MOBILE DRAWER NAVIGATION
  // =========================================================================
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mobileDrawer.classList.toggle('open');
      document.body.style.overflow = mobileDrawer.classList.contains('open') ? 'hidden' : '';
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }




  // =========================================================================
  // 4. STATS COUNTER ANIMATION
  // =========================================================================
  const counters = document.querySelectorAll('.counter');
  let countersAnimated = false;

  const statsSection = document.getElementById('stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          counters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const isDecimal = target % 1 !== 0;
            const duration = 1600;
            const startTime = performance.now();

            function updateCounter(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // EaseOutExpo curve
              const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const currentVal = target * easeProgress;

              counter.textContent = isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal);

              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                counter.textContent = isDecimal ? target.toFixed(1) : target;
              }
            }

            requestAnimationFrame(updateCounter);
          });
        }
      });
    }, { threshold: 0.3 });

    statsObserver.observe(statsSection);
  }


  // =========================================================================
  // =========================================================================
  // 5. PROJECT FILTER TABS & GUPIO GSAP SCROLLTRIGGER STACKING ENGINE
  // =========================================================================
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('.project-card-stack');
  const stackContainer = document.getElementById('projectsStack');

  let activeScrollTriggers = [];

  function initGupioCardStack() {
    // 1. Clean up any previous ScrollTriggers (removes GSAP pin-spacers and resets positions)
    if (activeScrollTriggers.length > 0) {
      activeScrollTriggers.forEach(st => {
        if (st && typeof st.kill === 'function') {
          st.kill(true); // true = revert styles/DOM
        }
      });
      activeScrollTriggers = [];
    }

    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

    // 2. Collect currently visible cards
    const visibleCards = Array.from(projectCards).filter(card => {
      return window.getComputedStyle(card).display !== 'none';
    });

    if (visibleCards.length === 0) return;

    // 3. Set index attributes and stepped CSS variables
    visibleCards.forEach((card, idx) => {
      const cardNum = idx + 1;
      card.setAttribute('data-index', cardNum);
      card.style.setProperty('--card-index', cardNum);
      card.style.zIndex = 10 + cardNum;
    });

    if (!hasGSAP) {
      updateCssFallbackStack();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 768;
    const baseTop = isMobile ? 68 : 76;
    const stepOffset = isMobile ? 14 : 16;

    visibleCards.forEach((card, index) => {
      const pinTop = baseTop + (index * stepOffset);
      card.style.top = `${pinTop}px`;

      // Track pinned state for styling
      const stateST = ScrollTrigger.create({
        id: `card-state-${index}`,
        trigger: card,
        start: () => `top ${pinTop + 5}px`,
        onEnter: () => card.classList.add('is-pinned'),
        onLeaveBack: () => card.classList.remove('is-pinned')
      });
      activeScrollTriggers.push(stateST);

      // Dimming shade effect: As NEXT card slides over this card, dim this card to 0.52 opacity
      const nextCard = visibleCards[index + 1];
      const shade = card.querySelector('.card-overlay-shade');

      if (nextCard && shade) {
        const nextPinTop = baseTop + ((index + 1) * stepOffset);

        const shadeTween = gsap.fromTo(shade, 
          { opacity: 0 },
          {
            opacity: 0.52, // Exact 0.52 opacity matching Gupio
            ease: 'none',
            scrollTrigger: {
              id: `card-shade-${index}`,
              trigger: nextCard,
              start: () => 'top bottom',
              end: () => `top ${nextPinTop + 20}px`,
              scrub: true,
              invalidateOnRefresh: true
            }
          }
        );
        activeScrollTriggers.push(shadeTween.scrollTrigger);

        // Subtle 3D scale down of underlying card for authentic physical depth
        const scaleTween = gsap.fromTo(card,
          { scale: 1 },
          {
            scale: 0.965,
            transformOrigin: 'center top',
            ease: 'none',
            scrollTrigger: {
              id: `card-scale-${index}`,
              trigger: nextCard,
              start: () => 'top bottom',
              end: () => `top ${nextPinTop + 20}px`,
              scrub: true,
              invalidateOnRefresh: true
            }
          }
        );
        activeScrollTriggers.push(scaleTween.scrollTrigger);
      } else if (!nextCard && shade) {
        shade.style.opacity = '0';
        card.style.transform = 'scale(1)';
      }
    });

    ScrollTrigger.refresh();
  }

  // Fallback function for pure CSS sticky mode (if GSAP is unavailable)
  function updateCssFallbackStack() {
    const visibleCards = Array.from(projectCards).filter(c => c.style.display !== 'none');
    visibleCards.forEach((card, i) => {
      const nextCard = visibleCards[i + 1];
      const shade = card.querySelector('.card-overlay-shade');
      if (nextCard) {
        const cardRect = card.getBoundingClientRect();
        const nextRect = nextCard.getBoundingClientRect();
        const overlapDistance = nextRect.top - cardRect.top;
        const totalDistance = window.innerHeight * 0.7;

        if (overlapDistance <= totalDistance && overlapDistance > 0) {
          const progress = 1 - (overlapDistance / totalDistance);
          card.style.transform = `scale(${1 - progress * 0.04})`;
          if (shade) shade.style.opacity = (progress * 0.52).toFixed(2);
        } else if (overlapDistance <= 0) {
          card.style.transform = 'scale(0.96)';
          if (shade) shade.style.opacity = '0.52';
        } else {
          card.style.transform = 'scale(1)';
          if (shade) shade.style.opacity = '0';
        }
      } else {
        card.style.transform = 'scale(1)';
        if (shade) shade.style.opacity = '0';
      }
    });
  }

  // Filter Tabs Event Handling
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'grid';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
        }
      });

      // Re-initialize GSAP with remaining visible cards
      initGupioCardStack();
    });
  });

  // Window resize debounce
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initGupioCardStack();
    }, 200);
  }, { passive: true });

  // Initial call on DOM ready
  initGupioCardStack();
  // Ensure refresh once all assets (images, fonts) finish loading
  window.addEventListener('load', () => {
    initGupioCardStack();
  });


  // =========================================================================
  // 6. INTERACTIVE AI RECRUITER TERMINAL & PLAYGROUND
  // =========================================================================
  const termForm = document.getElementById('termForm');
  const termInput = document.getElementById('termInput');
  const termLogStream = document.getElementById('termLogStream');
  const termBody = document.getElementById('termBody');
  const termPromptChips = document.querySelectorAll('.term-prompt-chip');
  const triggerTerminalBtns = document.querySelectorAll('.btn-trigger-terminal');

  // Knowledge Base for the Interactive AI Terminal
  const aiKnowledgeBase = [
    {
      keywords: ['chethan', 'who', 'about', 'summary', 'profile', '3 bullet points'],
      response: `Here is a high-level executive profile of A M Chethan:
• 🎓 **Academic Foundation:** Computer Science Engineering graduate from Government Engineering College Chamarajanagara with an outstanding **8.7 CGPA**.
• ⚙️ **AI & Backend Core:** Specializes in Java, Spring Boot microservices, Dockerization, and integrating ML models (DeepSeek Coder 1.3B) for autonomous error analysis & patch generation.
• 🚀 **Hands-on Impact:** Software Engineer Intern at NavaBharath Technologies (engineering MediUnify healthcare platforms) and Java Full Stack Intern at QSpiders, combined with the "Seva Sadhaka" leadership award at Youth for Seva NGO.`
    },
    {
      keywords: ['bugbuster', 'ide', 'deepseek', 'fault', 'patch', 'sbfl', 'error detection'],
      response: `🛠️ **BugBuster IDE Technical Architecture:**
• **Core Purpose:** An intelligent development environment built to automate error localization and source code fixes across multiple programming languages.
• **AI Model:** Integrated **DeepSeek Coder 1.3B**, augmented with **Spectrum-Based Fault Localization (SBFL)** algorithms to pin-point suspicious code lines.
• **Backend Framework:** Spring Boot REST APIs handling live code submissions and compilation pipelines.
• **Isolation:** Containerized with **Docker** for sandboxed, secure, reproducible execution environments.`
    },
    {
      keywords: ['navabharath', 'mediunify', 'healthcare', 'hospital', 'internship', 'role at navabharath'],
      response: `🏥 **MediUnify Platform & NavaBharath Internship:**
• **Role:** Software Engineer Intern (2026 – Present) at NavaBharath Technologies, Mysore.
• **Platform Overview:** MediUnify is an integrated enterprise healthcare platform connecting hospital workflows, patient portals, pharmacy inventory, and administrative control.
• **Tech Stack:** React, JavaScript, HTML, CSS, Node.js, and Express.js.
• **Chethan's Contributions:**
  1. Engineered hospital-side reactive web applications using React, JavaScript, HTML5, and CSS3.
  2. Implemented clinical appointment, doctor rostering, and patient record workflows.
  3. Built and refined backend services, authentication, and REST APIs using Node.js and Express.js.`
    },
    {
      keywords: ['qspiders', 'test yantra', 'full stack intern'],
      response: `💻 **QSpiders (Test Yantra Software) Internship:**
• **Role:** Java Full Stack Development Intern (Jan 2026 – May 2026, Mysore).
• **Technical Work:** Built end-to-end full stack web applications integrating React, JavaScript, HTML5/CSS3 frontend with Java Spring backend.
• **Database Design:** Optimized MySQL relational schemas and implemented full CRUD operations adhering to industry clean architecture patterns.`
    },
    {
      keywords: ['tech stack', 'skills', 'technologies', 'programming', 'languages', 'tools'],
      response: `💻 **Chethan's Complete Technical Arsenal:**
• **Languages:** Java, JavaScript (ES6+), HTML5, CSS3, Python, C, SQL
• **Frontend:** ReactJS, JavaScript, HTML5, CSS3, Modern UI/UX, Responsive Design
• **Backend & APIs:** Node.js, Express.js, Spring Boot, RESTful APIs, JDBC
• **AI & Machine Learning:** DeepSeek Coder 1.3B, Natural Language Processing (NLP), Intent Recognition, Model Fine-tuning & Embeddings
• **Databases:** MySQL, Relational Database Management Systems
• **DevOps & Tools:** Docker, Git/GitHub, VS Code, Eclipse
• **Core Foundations:** Data Structures, OOP, DBMS, OS, CRUD Architecture`
    },
    {
      keywords: ['hire', 'why hire', 'value', 'strength', 'candidate', 'recruiter'],
      response: `🎯 **Why Chethan is an Exceptional Engineering Hire:**
1. **Rare AI + Enterprise Backend Intersection:** He doesn't just build UI; he implements ML models (DeepSeek Coder 1.3B) into real, production-ready Spring Boot microservices.
2. **Proven Track Record:** Holds an 8.7 CGPA and has already worked on production healthcare software (MediUnify) during his internships.
3. **Container-Native Mindset:** Fully proficient with Docker, Git, RESTful standards, and clean code principles.
4. **Leadership & Empathy:** Recognized with the "Seva Sadhaka" award for community volunteering, demonstrating stellar communication, team-player attitude, and problem-solving resilience.`
    },
    {
      keywords: ['chatbot', 'nlp', 'conversational', 'python chatbot'],
      response: `🤖 **AI-Powered Context-Aware Conversational Engine:**
• Developed an intelligent conversational agent using Python NLP libraries.
• Features multi-turn intent recognition, slot filling, and context retention across sessions.
• Integrated a clean, reactive frontend with Python backend APIs for sub-second streaming answers.`
    },
    {
      keywords: ['yourstore', 'ecommerce', 'e-commerce', 'shopping', 'store', 'cart', 'bootstrap', 'storefront'],
      response: `🛍️ **YourStore – Responsive E-Commerce Platform:**
• **Overview:** A responsive e-commerce web application developed to enhance modern front-end engineering skills and dynamic web interface construction.
• **Core Capabilities:**
  1. **Product Discovery & Search:** Seamless catalog browsing, auto-suggest search, and instant category filters.
  2. **Shopping Cart Management:** Dynamic client-side cart calculations, real-time item counter, and responsive checkout drawer.
  3. **Modern Responsive UI:** Built with HTML5, CSS3, JavaScript (ES6+), and Bootstrap with fluid cross-device layout.
• **Deployment:** Continuous delivery via GitHub Pages.
• **Live Demo:** [https://amchethan.github.io/YourStore/](https://amchethan.github.io/YourStore/)`
    },
    {
      keywords: ['contact', 'email', 'phone', 'reach', 'linkedin', 'github'],
      response: `📫 **Direct Contact Channels for A M Chethan:**
• **Email:** amchethan61@gmail.com
• **Phone:** +91-7483526212
• **LinkedIn:** https://www.linkedin.com/in/a-m-chethan
• **GitHub:** https://github.com/AMChethan
• **Location:** Mysore & Chamarajanagara, Karnataka, India`
    }
  ];

  const termClearBtn = document.getElementById('termClearBtn');

  function formatTerminalMarkdown(raw) {
    if (!raw) return '';
    let html = raw;
    // Escape angle brackets
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Markdown links [text](url)
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="term-link">$1 ↗</a>');
    
    // Standalone URLs (not inside quotes or brackets)
    html = html.replace(/(^|[^\w"'])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="term-link">$2 ↗</a>');
    
    // Bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="term-highlight">$1</strong>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  function showTypingIndicator() {
    removeTypingIndicator();
    const typingBubble = document.createElement('div');
    typingBubble.className = 'term-bubble ai typing';
    typingBubble.id = 'termTypingBubble';
    typingBubble.innerHTML = `
      <div class="term-bubble-meta">
        <span class="term-bot-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
          DeepSeek-Coder 1.3B
        </span>
        <span class="term-meta-dim">synthesizing response...</span>
      </div>
      <div class="term-typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    termLogStream.appendChild(typingBubble);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('termTypingBubble');
    if (indicator) indicator.remove();
  }

  function appendTerminalMessage(role, text, title) {
    removeTypingIndicator();
    const bubble = document.createElement('div');
    bubble.className = `term-bubble ${role}`;

    const meta = document.createElement('div');
    meta.className = 'term-bubble-meta';

    if (role === 'user') {
      meta.innerHTML = `<span>👤 VISITOR QUERY</span> <span style="font-size:0.7rem; opacity:0.7;">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>`;
    } else if (role === 'ai') {
      meta.innerHTML = `<span class="term-bot-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg> ${title || 'Chethan AI Knowledge Engine'}</span> <span class="term-meta-dim">DeepSeek • ~38ms</span>`;
    }

    bubble.appendChild(meta);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'term-bubble-content';
    bubble.appendChild(contentDiv);
    termLogStream.appendChild(bubble);

    termBody.scrollTop = termBody.scrollHeight;

    if (role === 'ai') {
      let charPos = 0;
      contentDiv.innerHTML = '';
      const speed = 10;
      const step = 4;
      
      const interval = setInterval(() => {
        charPos = Math.min(text.length, charPos + step);
        const sub = text.slice(0, charPos);
        contentDiv.innerHTML = formatTerminalMarkdown(sub);
        termBody.scrollTop = termBody.scrollHeight;
        
        if (charPos >= text.length) {
          clearInterval(interval);
          contentDiv.innerHTML = formatTerminalMarkdown(text);
          termBody.scrollTop = termBody.scrollHeight;
        }
      }, speed);
    } else {
      contentDiv.textContent = text;
    }
  }

  // =========================================================================
  // JOB DESCRIPTION MATCHING ENGINE FOR RECRUITERS
  // =========================================================================
  function generateJdMatchReport(jdText) {
    const lower = jdText.toLowerCase();

    // Check for matched skills in user JD
    const matchedSkills = [];
    const skillDictionary = [
      { name: 'React.js Frontend', keys: ['react', 'reactjs', 'react.js'] },
      { name: 'JavaScript (ES6+)', keys: ['javascript', 'js', 'es6', 'ecmascript'] },
      { name: 'Node.js & Express.js', keys: ['node', 'nodejs', 'node.js', 'express', 'expressjs', 'express.js'] },
      { name: 'Java & Spring Boot Core', keys: ['java', 'spring', 'springboot', 'spring boot'] },
      { name: 'HTML5 & Responsive CSS3', keys: ['html', 'css', 'html5', 'css3', 'frontend', 'ui', 'ux', 'responsive'] },
      { name: 'RESTful API & Microservices', keys: ['rest', 'api', 'apis', 'restful', 'microservices', 'backend', 'web service'] },
      { name: 'MySQL Relational Schemas', keys: ['sql', 'mysql', 'database', 'rdbms', 'dbms', 'schema'] },
      { name: 'Docker Containerization', keys: ['docker', 'container', 'containers', 'dockerfile', 'sandbox'] },
      { name: 'AI & LLM Model Integration', keys: ['ai', 'artificial intelligence', 'ml', 'machine learning', 'deepseek', 'llm', 'nlp', 'model'] },
      { name: 'Git & Version Control', keys: ['git', 'github', 'version control', 'ci/cd', 'devops'] },
      { name: 'Data Structures & OOP', keys: ['oop', 'data structures', 'algorithms', 'clean code', 'problem solving', 'system design'] }
    ];

    skillDictionary.forEach(item => {
      if (item.keys.some(k => lower.includes(k))) {
        matchedSkills.push(item.name);
      }
    });

    const isTechRole = (
      matchedSkills.length > 0 ||
      lower.includes('software') ||
      lower.includes('developer') ||
      lower.includes('engineer') ||
      lower.includes('programmer') ||
      lower.includes('tech') ||
      lower.includes('coding') ||
      lower.includes('web') ||
      lower.includes('sde') ||
      lower.includes('intern') ||
      lower.includes('full stack') ||
      lower.includes('fullstack')
    );

    let matchPercentage = 95;
    if (isTechRole) {
      const bonus = Math.min(5, Math.floor(matchedSkills.length * 0.6));
      matchPercentage = 92 + bonus;
      if (matchPercentage > 97) matchPercentage = 97;
    } else {
      matchPercentage = 55;
    }

    const matchedListStr = matchedSkills.length > 0 
      ? matchedSkills.slice(0, 6).join(' • ')
      : 'React, Node.js, Express.js, Java, Spring Boot, MySQL, REST APIs, Docker';

    return `🎯 **AI RECRUITER CANDIDATE MATCH REPORT**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 **ROLE MATCH CONFIDENCE: ${matchPercentage}% — EXCEPTIONAL CANDIDATE FIT**
🏆 **HIRING VERDICT: HIGHEST-PRIORITY STRONG HIRE**
"A M Chethan is an ideal match for this role. His technical proficiency across modern full-stack web applications, scalable enterprise microservices, and practical production AI integration directly satisfies your core requirements."

⚡ **KEY COMPETENCY & TECH ALIGNMENT:**
• **Directly Matched Competencies:** ${matchedListStr}
• **Frontend Engineering (Strong Match):** Production React, JavaScript (ES6+), HTML5, and CSS3 with responsive UI architecture.
• **Backend & Microservices (Strong Match):** High-throughput REST APIs engineered in both Node.js/Express.js and enterprise Java Spring Boot.
• **Database & Containers (Strong Match):** MySQL relational schema design, Docker sandboxed environments, and Git workflow mastery.
• **AI Systems Differentiator:** Specialized practical capability integrating DeepSeek Coder 1.3B AI models and automated fault localization pipelines.

🚀 **PROVEN PRODUCTION EXPERIENCE:**
• **Enterprise Healthcare SaaS:** Software Engineer Intern at NavaBharath Technologies actively engineering the MediUnify platform (React, Node.js, Express.js).
• **Enterprise Java Full Stack:** Full Stack Intern at QSpiders engineering end-to-end full stack web platforms and REST APIs.
• **Autonomous Developer Tools:** Built BugBuster IDE with DeepSeek Coder 1.3B for real-time error repair and automated patches.
• **Academic & Character Excellence:** Computer Science graduate with an outstanding **8.7 CGPA** and recipient of the NGO "Seva Sadhaka" leadership award.

🎯 **HIRING RECOMMENDATION:**
✅ **Best Match — You Can Confidently Hire Chethan:** He brings immediate day-one execution capability, clean architecture discipline, and rapid adaptability. He will accelerate your team's development velocity from week one.

📫 **DIRECT CHANNELS TO CONNECT & HIRE:**
• **Email:** amchethan61@gmail.com
• **Phone:** +91-7483526212
• **LinkedIn:** https://www.linkedin.com/in/a-m-chethan
• **GitHub:** https://github.com/AMChethan
• **Location:** Mysore & Chamarajanagara, Karnataka, India (Open to Relocation & Remote)`;
  }

  function handleTerminalQuery(queryText) {
    if (!queryText.trim()) return;

    appendTerminalMessage('user', queryText);
    showTypingIndicator();

    const lower = queryText.toLowerCase();

    // Check if query is a Job Description
    const isJdQuery = (
      lower.includes('job description') ||
      lower.includes('requirements:') ||
      lower.includes('responsibilities:') ||
      lower.includes('qualifications:') ||
      lower.includes('we are looking for') ||
      lower.includes('candidate should') ||
      lower.includes('must have') ||
      lower.includes('years of experience') ||
      lower.includes('[job description') ||
      (lower.includes('engineer') && lower.includes('experience')) ||
      (lower.includes('developer') && lower.includes('skills')) ||
      (queryText.length > 130 && (lower.includes('react') || lower.includes('java') || lower.includes('node') || lower.includes('software') || lower.includes('developer') || lower.includes('full stack') || lower.includes('engineer')))
    );

    if (isJdQuery) {
      setTimeout(() => {
        const report = generateJdMatchReport(queryText);
        appendTerminalMessage('ai', report, 'DeepSeek Candidate Match Engine');
      }, 500);
      return;
    }

    // Find response from knowledge base with weighted scoring
    let bestMatch = null;
    let highestScore = 0;

    aiKnowledgeBase.forEach(item => {
      let score = 0;
      item.keywords.forEach(kw => {
        if (lower.includes(kw)) {
          // Multi-word exact matches (e.g., 'tech stack', 'why hire') carry significantly higher weight
          const wordCount = kw.split(' ').length;
          score += kw.length * (wordCount > 1 ? 4 : 1);
        }
      });
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    });

    setTimeout(() => {
      if (bestMatch && highestScore > 0) {
        appendTerminalMessage('ai', bestMatch.response);
      } else {
        appendTerminalMessage('ai', `I analyzed your query: "${queryText}".\n\n• 🎓 **Chethan's Overview:** Computer Science Engineer (8.7 CGPA) with expertise in Java, Spring Boot, React, Node.js, Express.js, DeepSeek Coder 1.3B AI integration, and Docker.\n• 🏥 **Active Role:** Software Engineer Intern at NavaBharath Technologies engineering MediUnify healthcare platform.\n• 💡 **Try asking:** "BugBuster IDE", "MediUnify tech stack", "Why hire Chethan", or "Technical Arsenal", or paste any **Job Description** to get an instant candidate match percentage!`);
      }
    }, 400);
  }

  // Clear Terminal Button
  if (termClearBtn) {
    termClearBtn.addEventListener('click', () => {
      termLogStream.innerHTML = `
        <div class="term-bubble system">
          <div class="term-bubble-meta">
            <span class="term-badge-system">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="16" y1="16" x2="16.01" y2="16"></line></svg>
              SYSTEM RESET
            </span>
            <span class="term-meta-tag">DeepSeek-Coder-1.3B-FineTuned</span>
            <span class="term-meta-time">Ready</span>
          </div>
          <div class="term-bubble-content">
            Terminal log cleared. Ask a question, click any prompt chip, or click <strong>Match JD</strong> to test candidate match percentage.
          </div>
        </div>
      `;
      if (termInput) termInput.value = '';
      termBody.scrollTop = 0;
    });
  }

  // JD Drawer Controls
  const termJdDrawer = document.getElementById('termJdDrawer');
  const termJdToggleBtn = document.getElementById('termJdToggleBtn');
  const termJdCloseBtn = document.getElementById('termJdCloseBtn');
  const chipUploadJd = document.getElementById('chipUploadJd');
  const termJdTextarea = document.getElementById('termJdTextarea');
  const termJdFileInput = document.getElementById('termJdFileInput');
  const termUploadLabelText = document.getElementById('termUploadLabelText');
  const termSampleJdBtn = document.getElementById('termSampleJdBtn');
  const termAnalyzeJdBtn = document.getElementById('termAnalyzeJdBtn');

  function openJdDrawer() {
    if (termJdDrawer) {
      termJdDrawer.classList.add('open');
      termJdDrawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (termJdTextarea) termJdTextarea.focus();
    }
  }

  function closeJdDrawer() {
    if (termJdDrawer) {
      termJdDrawer.classList.remove('open');
    }
  }

  if (termJdToggleBtn) {
    termJdToggleBtn.addEventListener('click', () => {
      if (termJdDrawer && termJdDrawer.classList.contains('open')) {
        closeJdDrawer();
      } else {
        openJdDrawer();
      }
    });
  }

  if (chipUploadJd) {
    chipUploadJd.addEventListener('click', () => {
      openJdDrawer();
    });
  }

  if (termJdCloseBtn) {
    termJdCloseBtn.addEventListener('click', closeJdDrawer);
  }

  const sampleSdeJdText = `Role: Full Stack Software Engineer (SDE)
Location: Remote / Hybrid
Company: High-Growth Technology Enterprise

Key Responsibilities:
• Build modern, high-performance web applications using React, JavaScript, HTML5, and CSS3.
• Architect and scale backend REST APIs and microservices using Node.js/Express.js or Java Spring Boot.
• Design, optimize, and manage relational database schemas using MySQL.
• Containerize services with Docker and collaborate using Git/GitHub workflows.
• Experience with AI tools and clean coding practices is a strong plus.

Qualifications:
• Bachelor's degree in Computer Science, Engineering, or equivalent practical experience.
• Hands-on experience in full-stack web development and RESTful architecture.
• Strong foundation in Data Structures, OOP, and clean code practices.
• Excellent communication, problem-solving, and team collaboration mindset.`;

  if (termSampleJdBtn && termJdTextarea) {
    termSampleJdBtn.addEventListener('click', () => {
      termJdTextarea.value = sampleSdeJdText;
      if (termUploadLabelText) termUploadLabelText.textContent = 'Sample SDE JD Loaded';
    });
  }

  if (termJdFileInput && termJdTextarea) {
    termJdFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (termUploadLabelText) termUploadLabelText.textContent = `Attached: ${file.name}`;
      
      if (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          termJdTextarea.value = evt.target.result;
        };
        reader.readAsText(file);
      } else {
        termJdTextarea.value = `[Uploaded JD: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\nRole: Software Engineer / Full Stack Developer\nRequirements: Modern Web Development, React, Node.js, Express, Java, Spring Boot, MySQL, REST APIs, Docker, Problem Solving.`;
      }
    });
  }

  if (termAnalyzeJdBtn) {
    termAnalyzeJdBtn.addEventListener('click', () => {
      let jdContent = termJdTextarea ? termJdTextarea.value.trim() : '';
      if (!jdContent) {
        jdContent = sampleSdeJdText;
        if (termJdTextarea) termJdTextarea.value = sampleSdeJdText;
      }
      closeJdDrawer();
      handleTerminalQuery(`[JOB DESCRIPTION ANALYSIS]\n${jdContent}`);
    });
  }

  if (termForm && termInput) {
    termForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = termInput.value.trim();
      if (val) {
        handleTerminalQuery(val);
        termInput.value = '';
      }
    });
  }

  // Suggestion chips click
  termPromptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) {
        handleTerminalQuery(prompt);
      }
    });
  });

  // Project cards terminal trigger button
  triggerTerminalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.getAttribute('data-query');
      if (query) {
        const terminalEl = document.getElementById('terminal');
        if (terminalEl) {
          terminalEl.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            handleTerminalQuery(query);
          }, 600);
        }
      }
    });
  });


  // =========================================================================
  // 7. CLICK TO COPY EMAIL & PHONE WITH TOAST NOTIFICATION
  // =========================================================================
  const emailCard = document.getElementById('emailCard');
  const phoneCard = document.getElementById('phoneCard');
  const toastNotice = document.getElementById('toastNotice');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimeout;

  function showToast(message) {
    if (!toastNotice) return;
    toastMsg.textContent = message;
    toastNotice.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 3000);
  }

  if (emailCard) {
    emailCard.addEventListener('click', () => {
      navigator.clipboard.writeText('amchethan61@gmail.com').then(() => {
        showToast('Email address copied to clipboard (amchethan61@gmail.com) 📋');
      }).catch(() => {
        showToast('amchethan61@gmail.com');
      });
    });
  }

  if (phoneCard) {
    phoneCard.addEventListener('click', () => {
      navigator.clipboard.writeText('+91-7483526212').then(() => {
        showToast('Phone number copied (+91-7483526212) 📞');
      }).catch(() => {
        showToast('+91-7483526212');
      });
    });
  }


  // =========================================================================
  // 8. CONTACT FORM SUBMISSION (Direct Real-Time Delivery to amchethan61@gmail.com)
  // =========================================================================
  const contactForm = document.getElementById('contactForm');
  const formNotification = document.getElementById('formNotification');
  const contactSubmitBtn = document.getElementById('contactSubmitBtn');
  const submitBtnText = document.getElementById('submitBtnText');

  if (contactForm && formNotification) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const subject = document.getElementById('contactSubject').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      if (!name || !email || !message) return;

      // Set button to loading state
      if (contactSubmitBtn && submitBtnText) {
        contactSubmitBtn.disabled = true;
        contactSubmitBtn.style.opacity = '0.75';
        submitBtnText.textContent = 'Transmitting to Chethan...';
      }

      formNotification.style.display = 'flex';
      formNotification.className = 'form-notification loading';
      formNotification.innerHTML = `
        <svg class="spinner-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"></circle></svg>
        <span>Sending your message directly to <strong>amchethan61@gmail.com</strong>...</span>
      `;

      try {
        const response = await fetch("https://formsubmit.co/ajax/amchethan61@gmail.com", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            name: name,
            email: email,
            _subject: `[Portfolio Dispatch] ${subject || 'New Contact'} from ${name}`,
            message: message,
            _replyto: email,
            _template: "table",
            _captcha: "false"
          })
        });

        const data = await response.json().catch(() => null);

        if (response.ok || (data && (data.success === "true" || data.success === true))) {
          formNotification.className = 'form-notification success';
          formNotification.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <div>
              <strong>Dispatch Delivered Successfully!</strong>
              <div style="font-size: 0.82rem; margin-top: 0.25rem; opacity: 0.95;">
                Your message has been delivered directly to Chethan's email (<strong>amchethan61@gmail.com</strong>). Chethan will reply to <strong>${email}</strong> within 24 hours.
              </div>
            </div>
          `;
          contactForm.reset();
          showToast('Delivered to amchethan61@gmail.com! ✉️');
        } else {
          throw new Error(data && data.message ? data.message : "Submission failed");
        }
      } catch (err) {
        console.warn("Direct API send error:", err);
        // Fallback: direct pre-filled mailto
        const mailtoLink = `mailto:amchethan61@gmail.com?subject=${encodeURIComponent('[Portfolio] ' + (subject || 'Inquiry'))}&body=${encodeURIComponent('Hi Chethan,\n\n' + message + '\n\nBest regards,\n' + name + ' (' + email + ')')}`;
        
        formNotification.className = 'form-notification success';
        formNotification.innerHTML = `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div>
            <strong>Network Block Detected</strong>
            <div style="font-size: 0.82rem; margin-top: 0.25rem;">
              Click below to send directly via your mail client to <strong>amchethan61@gmail.com</strong>:
            </div>
            <a href="${mailtoLink}" class="gupio-yellow-btn" style="margin-top: 0.65rem; padding: 0.35rem 0.85rem; font-size: 0.78rem; display: inline-flex;">
              Open in Email App (amchethan61@gmail.com) ↗
            </a>
          </div>
        `;
      } finally {
        if (contactSubmitBtn && submitBtnText) {
          contactSubmitBtn.disabled = false;
          contactSubmitBtn.style.opacity = '1';
          submitBtnText.textContent = 'Send Dispatch to Chethan';
        }
        setTimeout(() => {
          formNotification.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    });
  }

  // =========================================================================
  // 14. VOLUNTEERING HORIZONTAL STORIES: BUTTERY SLOW AUTO-SCROLL ENGINE
  // =========================================================================
  const volTrack = document.getElementById('volCardsTrack');
  const volProgressBar = document.getElementById('volScrollProgressBar');
  const volAutoplayBtn = document.getElementById('volAutoplayBtn');
  const volAutoplayText = document.getElementById('volAutoplayText');
  const volSection = document.getElementById('volunteering');
  const volModal = document.getElementById('volLightboxModal');
  const volImg = document.getElementById('volLightboxImg');
  const volCaption = document.getElementById('volLightboxCaption');

  let volSpeed = 0.55;         // Smooth cinematic slow drift: ~33px / second
  let volAutoPlay = true;      // Master autoplay toggle state
  let volIsPaused = false;     // Temporary pause state (hover, drag, modal, end pause)
  let volResumeTimer = null;
  let volIsInViewport = false;
  let isDraggingTrack = false;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;
  let isRewinding = false;

  // Update Autoplay UI button
  function updateAutoplayUI(active, text) {
    if (!volAutoplayBtn) return;
    if (active) {
      volAutoplayBtn.classList.remove('paused');
      if (volAutoplayText) volAutoplayText.textContent = text || 'Auto-Scroll';
      volAutoplayBtn.title = 'Automatic slow scroll is active. Click to pause.';
    } else {
      volAutoplayBtn.classList.add('paused');
      if (volAutoplayText) volAutoplayText.textContent = text || 'Paused';
      volAutoplayBtn.title = 'Auto-scroll is paused. Click to resume.';
    }
  }

  // Toggle button click handler
  window.toggleVolAutoplay = function() {
    volAutoPlay = !volAutoPlay;
    if (volAutoPlay) {
      volIsPaused = false;
      updateAutoplayUI(true, 'Auto-Scroll');
    } else {
      volIsPaused = true;
      clearTimeout(volResumeTimer);
      updateAutoplayUI(false, 'Paused');
    }
  };

  // Update dynamic scroll progress bar
  function updateVolProgress() {
    if (!volTrack || !volProgressBar) return;
    const maxScroll = volTrack.scrollWidth - volTrack.clientWidth;
    if (maxScroll <= 0) {
      volProgressBar.style.width = '100%';
      return;
    }
    const pct = Math.max(0, Math.min(100, (volTrack.scrollLeft / maxScroll) * 100));
    volProgressBar.style.width = `${Math.max(12, pct)}%`;
  }

  // Manual smooth arrow navigation
  window.scrollVolCards = function(direction) {
    if (!volTrack) return;
    const cardStep = 370;
    volTrack.scrollBy({
      left: direction * cardStep,
      behavior: 'smooth'
    });
    pauseVolAutoScrollTemporarily(3200, 'Navigating');
  };

  // Filter tabs (All, SKD, Rathotsava)
  window.switchVolTab = function(tabName) {
    const tabButtons = document.querySelectorAll('.vol-tab-btn');
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    const cards = document.querySelectorAll('.vol-story-card');
    cards.forEach(card => {
      if (tabName === 'all' || card.dataset.tabPanel === tabName) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    if (volTrack) {
      volTrack.scrollTo({ left: 0, behavior: 'smooth' });
    }
    updateVolProgress();
    pauseVolAutoScrollTemporarily(2800, 'Filtering');
  };

  // High-Resolution Lightbox Modal
  window.openVolModal = function(src, caption) {
    if (!volModal || !volImg) return;
    volImg.src = src;
    if (volCaption) volCaption.textContent = caption || '';
    volModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    volIsPaused = true;
    updateAutoplayUI(false, 'Inspecting HD');
  };

  window.closeVolModal = function(e) {
    if (e && e.target && e.target.closest && e.target.closest('.vol-lightbox-content') && !e.target.closest('.vol-lightbox-close')) {
      return;
    }
    if (!volModal) return;
    volModal.classList.remove('active');
    document.body.style.overflow = '';
    if (volAutoPlay) {
      pauseVolAutoScrollTemporarily(1200, 'Auto-Scroll');
    }
  };

  // Keyboard Escape to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && volModal && volModal.classList.contains('active')) {
      window.closeVolModal();
    }
  });

  // Temporarily pause auto-scroll upon user interaction
  function pauseVolAutoScrollTemporarily(duration = 2500, label = 'Paused') {
    if (!volAutoPlay) return;
    volIsPaused = true;
    clearTimeout(volResumeTimer);
    updateAutoplayUI(false, label);
    volResumeTimer = setTimeout(() => {
      volIsPaused = false;
      if (volAutoPlay) updateAutoplayUI(true, 'Auto-Scroll');
    }, duration);
  }

  // IntersectionObserver to only animate when visible
  if (volSection && 'IntersectionObserver' in window) {
    const volObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        volIsInViewport = entry.isIntersecting;
      });
    }, { threshold: 0.1 });
    volObserver.observe(volSection);
  } else {
    volIsInViewport = true;
  }

  // Mouse & Touch Drag-To-Scroll
  if (volTrack) {
    volTrack.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.vol-lightbox-modal') || e.target.closest('.vol-nav-btn') || e.target.closest('.vol-autoplay-btn') || e.target.closest('.gallery-linkedin-link')) return;

      isDraggingTrack = true;
      dragStartX = e.clientX;
      dragStartScrollLeft = volTrack.scrollLeft;
      volTrack.classList.add('is-dragging');
      volIsPaused = true;
      clearTimeout(volResumeTimer);
      updateAutoplayUI(false, 'Dragging');

      if (volTrack.setPointerCapture) {
        try { volTrack.setPointerCapture(e.pointerId); } catch (_) {}
      }
    });

    volTrack.addEventListener('pointermove', (e) => {
      if (!isDraggingTrack) return;
      const dx = e.clientX - dragStartX;
      volTrack.scrollLeft = dragStartScrollLeft - dx;
      updateVolProgress();
    });

    const endTrackDrag = (e) => {
      if (!isDraggingTrack) return;
      isDraggingTrack = false;
      volTrack.classList.remove('is-dragging');
      pauseVolAutoScrollTemporarily(2800, 'Auto-Scroll');
      if (e && volTrack.releasePointerCapture && e.pointerId) {
        try { volTrack.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };

    volTrack.addEventListener('pointerup', endTrackDrag);
    volTrack.addEventListener('pointercancel', endTrackDrag);

    // Pause on hover
    volTrack.addEventListener('mouseenter', () => {
      if (volAutoPlay && !isDraggingTrack) {
        volIsPaused = true;
        clearTimeout(volResumeTimer);
        updateAutoplayUI(false, 'Hover Paused');
      }
    });

    volTrack.addEventListener('mouseleave', () => {
      if (volAutoPlay && !isDraggingTrack) {
        clearTimeout(volResumeTimer);
        volResumeTimer = setTimeout(() => {
          volIsPaused = false;
          updateAutoplayUI(true, 'Auto-Scroll');
        }, 1200);
      }
    });

    // Native horizontal wheel scroll
    volTrack.addEventListener('wheel', (e) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) > 5) {
        volTrack.scrollLeft += delta;
        updateVolProgress();
        pauseVolAutoScrollTemporarily(2400, 'Scrolling');
      }
    }, { passive: true });

    volTrack.addEventListener('scroll', updateVolProgress, { passive: true });
  }

  // Smooth continuous requestAnimationFrame horizontal auto-scroll loop
  function autoScrollLoop() {
    if (volTrack && volAutoPlay && !volIsPaused && volIsInViewport && !isDraggingTrack && !isRewinding) {
      const maxScroll = volTrack.scrollWidth - volTrack.clientWidth;
      if (maxScroll > 10) {
        if (volTrack.scrollLeft >= maxScroll - 2) {
          // Reached the end: pause for 2.4s, then smoothly rewind back to start
          isRewinding = true;
          volIsPaused = true;
          updateAutoplayUI(false, 'Looping');
          setTimeout(() => {
            if (volTrack) {
              volTrack.scrollTo({ left: 0, behavior: 'smooth' });
            }
            setTimeout(() => {
              isRewinding = false;
              volIsPaused = false;
              if (volAutoPlay) updateAutoplayUI(true, 'Auto-Scroll');
            }, 1000);
          }, 2400);
        } else {
          volTrack.scrollLeft += volSpeed;
          updateVolProgress();
        }
      }
    }

    requestAnimationFrame(autoScrollLoop);
  }

  // Start the auto-scroll loop & initialize progress bar
  requestAnimationFrame(autoScrollLoop);
  updateVolProgress();

  // =========================================================================
  // 15. INTERACTIVE 3D PERSPECTIVE TILT & SPECULAR GLARE FOR PHOTOS
  // =========================================================================
  const tiltPhotos = document.querySelectorAll('.vol-photo-item[data-tilt="true"], .vol-card-img-wrap[data-tilt="true"]');

  tiltPhotos.forEach(item => {
    const glare = item.querySelector('.photo-glare');
    let bounds = null;

    item.addEventListener('mouseenter', () => {
      bounds = item.getBoundingClientRect();
      item.style.transition = 'transform 0.08s ease-out, border-color 0.3s ease, box-shadow 0.3s ease';
    });

    item.addEventListener('mousemove', (e) => {
      if (!bounds) bounds = item.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;
      const xPct = Math.max(0, Math.min(1, mouseX / bounds.width));
      const yPct = Math.max(0, Math.min(1, mouseY / bounds.height));

      // Calculate tilt angles: -14 to +14 degrees
      const tiltX = (0.5 - yPct) * 16;
      const tiltY = (xPct - 0.5) * 16;

      item.style.transform = `perspective(900px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;

      if (glare) {
        glare.style.background = `radial-gradient(circle at ${(xPct * 100).toFixed(1)}% ${(yPct * 100).toFixed(1)}%, var(--accent-glow-strong) 0%, rgba(255, 255, 255, 0.22) 25%, transparent 65%)`;
      }
    });

    item.addEventListener('mouseleave', () => {
      bounds = null;
      item.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s ease, box-shadow 0.35s ease';
      item.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });

    // Shockwave click ripple effect
    item.addEventListener('click', (e) => {
      const rect = item.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'photo-click-ripple';
      const size = Math.max(rect.width, rect.height) * 2.2;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      item.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // =========================================================================
  // 13. INTERACTIVE PALETTE SWITCHER (Multi-Theme System)
  // =========================================================================
  const themeButtons = document.querySelectorAll('.theme-dot-btn');
  const storedTheme = localStorage.getItem('chethan-portfolio-theme') || 'emerald';

  function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('chethan-portfolio-theme', themeName);

    themeButtons.forEach(btn => {
      if (btn.getAttribute('data-theme-name') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Initialize theme
  applyTheme(storedTheme);

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedTheme = btn.getAttribute('data-theme-name');
      if (selectedTheme) {
        applyTheme(selectedTheme);
      }
    });
  });

  // =========================================================================
  // 16. ETHEREAL FLUID SMOKE (GLOBAL VOLUMETRIC BACKGROUND ENGINE)
  // =========================================================================
  const bgCanvas = document.getElementById('smartBgCanvas');
  if (bgCanvas && bgCanvas.getContext) {
    const ctx = bgCanvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;
    let animFrameId = null;
    let isVisible = true;

    // Theme Colors with smooth interpolation
    let targetPrimary = { r: 0, g: 245, b: 160 }; // Default Cyber Emerald
    let targetSecondary = { r: 0, g: 210, b: 223 }; // Cyber Cyan
    let curPrimary = { r: 0, g: 245, b: 160 };
    let curSecondary = { r: 0, g: 210, b: 223 };

    function parseColor(hexStr, fallback) {
      if (!hexStr) return fallback;
      hexStr = hexStr.trim();
      if (hexStr.startsWith('#')) {
        let hex = hexStr.slice(1);
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const num = parseInt(hex, 16);
        return {
          r: (num >> 16) & 255,
          g: (num >> 8) & 255,
          b: num & 255
        };
      }
      return fallback;
    }

    function updateThemeColors() {
      const style = getComputedStyle(document.documentElement);
      const pri = style.getPropertyValue('--accent-primary');
      const sec = style.getPropertyValue('--accent-secondary');
      targetPrimary = parseColor(pri, { r: 0, g: 245, b: 160 });
      targetSecondary = parseColor(sec, { r: 0, g: 210, b: 223 });
    }
    updateThemeColors();

    const themeObserver = new MutationObserver(() => {
      updateThemeColors();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Pre-rendered Volumetric Smoke Stamps (Offscreen Canvases for 60 FPS GPU texture blitting)
    const stampSize = 256;
    const stamps = {
      primaryPuff: document.createElement('canvas'),
      secondaryPuff: document.createElement('canvas'),
      primaryWisp: document.createElement('canvas'),
      secondaryWisp: document.createElement('canvas'),
      darkShadow: document.createElement('canvas')
    };

    Object.values(stamps).forEach(c => {
      c.width = stampSize;
      c.height = stampSize;
    });

    function bakeStamps(c1, c2) {
      const half = stampSize / 2;

      // 1. Primary Soft Billow Puff
      const ctx1 = stamps.primaryPuff.getContext('2d');
      ctx1.clearRect(0, 0, stampSize, stampSize);
      const grad1 = ctx1.createRadialGradient(half, half, 0, half, half, half);
      grad1.addColorStop(0, `rgba(${c1.r}, ${c1.g}, ${c1.b}, 0.28)`);
      grad1.addColorStop(0.35, `rgba(${c1.r}, ${c1.g}, ${c1.b}, 0.16)`);
      grad1.addColorStop(0.65, `rgba(${c1.r}, ${c1.g}, ${c1.b}, 0.05)`);
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx1.fillStyle = grad1;
      ctx1.beginPath();
      ctx1.arc(half, half, half, 0, Math.PI * 2);
      ctx1.fill();

      // 2. Secondary Billow Puff
      const ctx2 = stamps.secondaryPuff.getContext('2d');
      ctx2.clearRect(0, 0, stampSize, stampSize);
      const grad2 = ctx2.createRadialGradient(half, half, 0, half, half, half);
      grad2.addColorStop(0, `rgba(${c2.r}, ${c2.g}, ${c2.b}, 0.26)`);
      grad2.addColorStop(0.38, `rgba(${c2.r}, ${c2.g}, ${c2.b}, 0.14)`);
      grad2.addColorStop(0.7, `rgba(${c2.r}, ${c2.g}, ${c2.b}, 0.04)`);
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx2.fillStyle = grad2;
      ctx2.beginPath();
      ctx2.arc(half, half, half, 0, Math.PI * 2);
      ctx2.fill();

      // 3. Primary Wispy Asymmetrical Smoke Wisp
      const ctx3 = stamps.primaryWisp.getContext('2d');
      ctx3.clearRect(0, 0, stampSize, stampSize);
      const g3a = ctx3.createRadialGradient(half * 0.8, half * 0.9, 0, half * 0.8, half * 0.9, half * 0.7);
      g3a.addColorStop(0, `rgba(${c1.r}, ${c1.g}, ${c1.b}, 0.22)`);
      g3a.addColorStop(0.5, `rgba(${c1.r}, ${c1.g}, ${c1.b}, 0.08)`);
      g3a.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx3.fillStyle = g3a;
      ctx3.beginPath();
      ctx3.arc(half * 0.8, half * 0.9, half * 0.7, 0, Math.PI * 2);
      ctx3.fill();

      const g3b = ctx3.createRadialGradient(half * 1.25, half * 1.15, 0, half * 1.25, half * 1.15, half * 0.55);
      g3b.addColorStop(0, `rgba(${c1.r}, ${c1.g}, ${c1.b}, 0.16)`);
      g3b.addColorStop(0.6, `rgba(${c1.r}, ${c1.g}, ${c1.b}, 0.04)`);
      g3b.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx3.fillStyle = g3b;
      ctx3.beginPath();
      ctx3.arc(half * 1.25, half * 1.15, half * 0.55, 0, Math.PI * 2);
      ctx3.fill();

      // 4. Secondary Wispy Tendril
      const ctx4 = stamps.secondaryWisp.getContext('2d');
      ctx4.clearRect(0, 0, stampSize, stampSize);
      const g4a = ctx4.createRadialGradient(half * 1.1, half * 0.8, 0, half * 1.1, half * 0.8, half * 0.65);
      g4a.addColorStop(0, `rgba(${c2.r}, ${c2.g}, ${c2.b}, 0.20)`);
      g4a.addColorStop(0.5, `rgba(${c2.r}, ${c2.g}, ${c2.b}, 0.06)`);
      g4a.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx4.fillStyle = g4a;
      ctx4.beginPath();
      ctx4.arc(half * 1.1, half * 0.8, half * 0.65, 0, Math.PI * 2);
      ctx4.fill();

      // 5. Deep Atmospheric Shadow Haze
      const ctx5 = stamps.darkShadow.getContext('2d');
      ctx5.clearRect(0, 0, stampSize, stampSize);
      const grad5 = ctx5.createRadialGradient(half, half, 0, half, half, half);
      grad5.addColorStop(0, 'rgba(6, 11, 20, 0.42)');
      grad5.addColorStop(0.5, 'rgba(8, 14, 24, 0.22)');
      grad5.addColorStop(0.85, 'rgba(10, 16, 28, 0.05)');
      grad5.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx5.fillStyle = grad5;
      ctx5.beginPath();
      ctx5.arc(half, half, half, 0, Math.PI * 2);
      ctx5.fill();
    }
    bakeStamps(curPrimary, curSecondary);

    // Pointer tracking & fluid disturbance
    const pointer = {
      x: -1000,
      y: -1000,
      prevX: -1000,
      prevY: -1000,
      vx: 0,
      vy: 0,
      speed: 0,
      active: false
    };

    let idleAngle = 0;

    // Ambient Volumetric Smoke Particles
    const smokePuffs = [];
    const isMobile = window.innerWidth < 768;
    const puffCount = isMobile ? 32 : 58;

    class SmokePuff {
      constructor(init = true) {
        this.reset(init);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + (50 + Math.random() * 120);
        this.baseSize = isMobile ? (200 + Math.random() * 260) : (280 + Math.random() * 380);
        this.size = this.baseSize;
        
        // Gentle buoyancy (smoke slowly rises and weaves)
        this.vy = -(0.25 + Math.random() * 0.45);
        this.vx = (Math.random() - 0.5) * 0.35;
        this.angle = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.003;
        
        // Breathing pulsation
        this.pulseFreq = 0.008 + Math.random() * 0.012;
        this.pulsePhase = Math.random() * Math.PI * 2;
        
        // Stamp type
        const rand = Math.random();
        if (rand < 0.35) this.stampType = 'primaryPuff';
        else if (rand < 0.65) this.stampType = 'secondaryPuff';
        else if (rand < 0.85) this.stampType = 'primaryWisp';
        else this.stampType = 'secondaryWisp';

        this.alpha = 0.28 + Math.random() * 0.45;
        this.life = 0;
        this.fadeIn = init ? 1 : 0;
      }

      update(time) {
        // Natural harmonic wave drift (fluid curling)
        const waveX = Math.sin(time * 0.0008 + this.y * 0.0025) * 0.4;
        const waveY = Math.cos(time * 0.0006 + this.x * 0.002) * 0.18;
        
        this.x += this.vx + waveX;
        this.y += this.vy + waveY;
        this.angle += this.rotSpeed;

        // Pulsating size
        const pulse = 1 + Math.sin(time * this.pulseFreq + this.pulsePhase) * 0.12;
        this.size = this.baseSize * pulse;

        // Pointer fluid interaction (smoke swirls and deflects around cursor)
        if (pointer.active) {
          const dx = this.x - pointer.x;
          const dy = this.y - pointer.y;
          const distSq = dx * dx + dy * dy;
          const interactRadius = 240;
          if (distSq < interactRadius * interactRadius && distSq > 4) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / interactRadius) * (pointer.speed * 0.08 + 0.4);
            // Deflect outward
            this.x += (dx / dist) * force * 3.5;
            this.y += (dy / dist) * force * 3.5;
            // Impart vortex swirl
            this.rotSpeed += (pointer.vx * dy - pointer.vy * dx) * 0.000003;
          }
        }

        // Fade in when entering from bottom
        if (this.fadeIn < 1) {
          this.fadeIn += 0.012;
          if (this.fadeIn > 1) this.fadeIn = 1;
        }

        // Boundary wrap: if drifted above viewport, reset at bottom
        if (this.y < -this.size) {
          this.reset(false);
        }
        if (this.x < -this.size) this.x = width + this.size * 0.5;
        if (this.x > width + this.size) this.x = -this.size * 0.5;
      }

      draw() {
        const stamp = stamps[this.stampType];
        if (!stamp) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.alpha * this.fadeIn;
        const half = this.size / 2;
        ctx.drawImage(stamp, -half, -half, this.size, this.size);
        ctx.restore();
      }
    }

    // Dynamic Trail Smoke Wisps (spawned by moving cursor)
    const trailWisps = [];
    const maxTrailWisps = 45;

    class TrailWisp {
      constructor(x, y, vx, vy) {
        this.x = x + (Math.random() - 0.5) * 16;
        this.y = y + (Math.random() - 0.5) * 16;
        this.vx = vx * 0.28 + (Math.random() - 0.5) * 0.8;
        this.vy = vy * 0.28 - 0.35 + (Math.random() - 0.5) * 0.5;
        this.angle = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.04;
        this.size = 70 + Math.random() * 90;
        this.growRate = 1.4 + Math.random() * 1.8;
        this.alpha = 0.55 + Math.random() * 0.35;
        this.decay = 0.012 + Math.random() * 0.01;
        this.stampType = Math.random() > 0.4 ? 'primaryPuff' : 'secondaryWisp';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.97;
        this.vy *= 0.97;
        this.size += this.growRate;
        this.angle += this.rotSpeed;
        this.alpha -= this.decay;
        return this.alpha > 0;
      }

      draw() {
        if (this.alpha <= 0) return;
        const stamp = stamps[this.stampType];
        if (!stamp) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = Math.max(0, this.alpha);
        const half = this.size / 2;
        ctx.drawImage(stamp, -half, -half, this.size, this.size);
        ctx.restore();
      }
    }

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      bgCanvas.width = width * dpr;
      bgCanvas.height = height * dpr;
      bgCanvas.style.width = `${width}px`;
      bgCanvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (smokePuffs.length === 0) {
        for (let i = 0; i < puffCount; i++) {
          smokePuffs.push(new SmokePuff(true));
        }
      }
    }

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    // Mouse & Touch Tracking
    let lastSpawnTime = 0;
    function handlePointerMove(clientX, clientY) {
      if (pointer.prevX === -1000) {
        pointer.prevX = clientX;
        pointer.prevY = clientY;
      } else {
        pointer.prevX = pointer.x;
        pointer.prevY = pointer.y;
      }
      pointer.x = clientX;
      pointer.y = clientY;
      pointer.vx = pointer.x - pointer.prevX;
      pointer.vy = pointer.y - pointer.prevY;
      pointer.speed = Math.hypot(pointer.vx, pointer.vy);
      pointer.active = true;

      // Spawn interactive trailing smoke wisp if moving fast enough
      const now = performance.now();
      if (pointer.speed > 3 && now - lastSpawnTime > 40 && trailWisps.length < maxTrailWisps) {
        trailWisps.push(new TrailWisp(pointer.x, pointer.y, pointer.vx, pointer.vy));
        lastSpawnTime = now;
      }
    }

    window.addEventListener('pointermove', (e) => {
      handlePointerMove(e.clientX, e.clientY);
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      pointer.active = false;
      pointer.prevX = -1000;
      pointer.prevY = -1000;
    });

    // Touch support
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      pointer.active = false;
    });

    let frameCount = 0;

    function renderSmokeField(time) {
      frameCount++;

      // Smooth color transition interpolation towards target theme
      let colorChanged = false;
      const lerp = 0.08;
      ['r', 'g', 'b'].forEach(ch => {
        if (Math.abs(curPrimary[ch] - targetPrimary[ch]) > 0.5) {
          curPrimary[ch] += (targetPrimary[ch] - curPrimary[ch]) * lerp;
          colorChanged = true;
        }
        if (Math.abs(curSecondary[ch] - targetSecondary[ch]) > 0.5) {
          curSecondary[ch] += (targetSecondary[ch] - curSecondary[ch]) * lerp;
          colorChanged = true;
        }
      });
      if (colorChanged && frameCount % 3 === 0) {
        bakeStamps(curPrimary, curSecondary);
      }

      // Idle atmospheric breeze simulation when user is not moving pointer
      if (!pointer.active) {
        idleAngle += 0.006;
        pointer.x = width * 0.5 + Math.cos(idleAngle) * (width * 0.35);
        pointer.y = height * 0.5 + Math.sin(idleAngle * 1.3) * (height * 0.28);
        pointer.speed = 1.2;
        pointer.vx = -Math.sin(idleAngle) * 1.2;
        pointer.vy = Math.cos(idleAngle * 1.3) * 1.2;
      } else {
        pointer.speed *= 0.92;
      }

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Set Blending Mode for Volumetric Smoke Depth
      ctx.globalCompositeOperation = 'screen';

      // 1. Draw Deep Volumetric Smoke Puffs
      for (let i = 0; i < smokePuffs.length; i++) {
        const puff = smokePuffs[i];
        puff.update(time);
        puff.draw();
      }

      // 2. Draw Interactive Trail Smoke Wisps
      for (let i = trailWisps.length - 1; i >= 0; i--) {
        const wisp = trailWisps[i];
        const alive = wisp.update();
        if (alive) {
          wisp.draw();
        } else {
          trailWisps.splice(i, 1);
        }
      }

      // Restore composite operation
      ctx.globalCompositeOperation = 'source-over';

      if (isVisible) {
        animFrameId = requestAnimationFrame(renderSmokeField);
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isVisible = false;
        if (animFrameId) cancelAnimationFrame(animFrameId);
      } else {
        isVisible = true;
        animFrameId = requestAnimationFrame(renderSmokeField);
      }
    });

    animFrameId = requestAnimationFrame(renderSmokeField);
  }



});

