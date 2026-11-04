# Snap2Learn AI — Hackathon Live Demo Script

**Target Audience:** Hackathon Judges, CSE Professors, and First-Year Students  
**Duration:** 3 - 5 Minutes  
**Backup Plan:** Built-in Guest Demo Mode works offline with pre-seeded engineering materials.

---

## 1. Opening Pitch (30 Seconds)
- "Good afternoon, judges! We are presenting **Snap2Learn AI** — with the motto: *Snap. Understand. Practice. Master.*"
- **Problem:** "As first-year CSE & AIML students, transitioning from school to engineering textbooks and messy blackboard lectures is daunting. Students spend hours deciphering handwritten notes, memorizing formulas without understanding, and struggling with complex terminology — especially students from regional language backgrounds."
- **Solution:** "Snap2Learn AI transforms any handwritten notebook page or textbook photo into crystal-clear step-by-step explanations, bilingual English & Telugu guides, interactive practice quizzes with deterministic grading, and smart flashcards."

---

## 2. Live Demo Flow (3 Minutes)

### Step 1: The Landing Page (20 Seconds)
- Show the dark modern UI inspired by top edtech platforms (Navy `#080B18`, electric purple & cyan accents).
- Point out the animated interactive preview: *Scan → Explain → Quiz → Master*.
- Click **"Start Learning Free"** or **"Explore Live Demo"**.

### Step 2: Smart Note Scanner (45 Seconds)
- Navigate to the **Scan Notes** tab.
- Click **"Use Camera"** to demonstrate live webcam viewfinder overlay. Highlight the privacy guarantee: *Camera stream is strictly user-activated and terminates cleanly on exit.*
- Or click **"Load Engineering Sample"** (or upload an image of handwritten notes on Linear Algebra/Eigenvalues).
- Highlight the **Editable OCR Confirmation Panel**:
  - Show how LaTeX equations ($$A v = \lambda v$$ and $$\det(A - \lambda I) = 0$$) are transcribed accurately.
  - Notice the identified subject: *Engineering Mathematics* and topic.
  - Click **"Generate Explanation"**.

### Step 3: Explanation Engine with Telugu Support (45 Seconds)
- Walk through the structured breakdown:
  1. **Core Concept Overview**
  2. **Step-by-Step Mathematical Proof**
  3. **Important Definitions & KaTeX Formulas**
  4. **Real-Life Engineering Application** (e.g. Google PageRank / PCA)
  5. **Common Student Mistakes** (highlighting pitfalls in red vs green)
  6. **Model University Exam Answer** (click *Copy Answer*)
- **Showcase Regional Language Feature:**
  - Switch the language toggle to **Bilingual (English + Telugu)** or **తెలుగు (Telugu)**.
  - Show authentic Telugu script explaining eigenvalues side-by-side with mathematical formulas.

### Step 4: AI Tutor Chat (30 Seconds)
- Click **"Chat With Tutor"**.
- Point out that the chat is already grounded in the notes just scanned.
- Click a suggested question pill: *"How do I calculate eigenvalues of a 2x2 matrix by hand?"*
- Show clean code blocks and formula outputs.

### Step 5: AI Quiz Arena & Deterministic Grading (40 Seconds)
- Click **"Take Quiz"**.
- Select 5 questions, Medium difficulty, Timed mode.
- Answer questions one-by-one.
- Show the submit modal:
  - Demonstrate deterministic scoring (e.g. 80% with confetti celebration).
  - Show mistake analysis explaining why the correct answer is right and why distractors are wrong.
  - Show the identified weak concept alert.

### Step 6: Smart Flashcards & Analytics (20 Seconds)
- Click **Flashcards**: Click to flip card in 3D and rate ease (*Easy / Medium / Hard*).
- Click **Progress Analytics**: Show real Recharts graphs displaying quiz accuracy trends and subject mastery percentages.

---

## 3. Resilience & Offline Fallback Plan
- **What if the internet is down during the presentation?**
  - The application automatically switches to **Autonomous Demo Mode** (`is_demo: true`).
  - Pre-seeded engineering modules on Linear Algebra, Convolutional Neural Networks, and Data Structures run seamlessly without any external API calls.
  - Deterministic quiz scoring is computed entirely in local code!
