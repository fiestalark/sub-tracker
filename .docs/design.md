# UI/UX Requirements (Vanilla CSS)

## 1. Design Principles
- **Clean & Minimal**  
  Use plain CSS (no frameworks). Leverage white space, clear typography, and simple layouts.  
- **Modern & Animated**  
  Subtle CSS transitions and keyframe animations to enhance feedback (e.g., button hovers, card fades).  
- **Responsive & Inclusive**  
  Mobile‑first media queries and fluid layouts; accessible colors & focus styles.  
- **Consistent & Predictable**  
  Reuse CSS variables for colors, spacing, typography; follow a naming convention (e.g. BEM or utility classes).

---

## 2. Global Layout & Navigation
1. **Header**  
   - Fixed at top, flex‑box layout  
   - Logo on left, nav links in center, user avatar on right  
   - Simple hover underline animations on links
2. **Main Content Area**  
   - Centered container (max-width: 1200px)  
   - 12‑column grid via CSS Grid for desktop; single column on mobile  
3. **Footer (optional)**  
   - Centered text, small font, muted color  

---

## 3. Page Flows & Wireframes

### 3.1 Login Page  
- **Hero Section:**  
  - Heading, subheading  
  - Centered `<button>` with Google icon  
  - CSS transition on hover (background‐color, box‐shadow)  
- **Error State:**  
  - Inline alert `<div>` with slide‐down animation  

### 3.2 OAuth Callback  
- **Full‐Screen Loader:**  
  - Centered spinner using CSS keyframes  
  - Message: “Signing you in…”  

### 3.3 Dashboard  
- **Header Bar:**  
  - Prominent total spend `<h1>`  
  - `<button>` “Refresh Emails” with ripple effect on click  
- **Sections:**  
  1. **Spending Overview Card**  
     - Fade‐in on load  
  2. **Upcoming Renewals**  
     - Table or card list; row hover highlight  
  3. **Category Breakdown**  
     - Simple bar/pie chart placeholder (can be SVG or Canvas)  
- **Empty State:**  
  - Illustrated SVG or CSS drawing + subtle bounce animation  

### 3.4 Subscription List  
- **Item Layout:**  
  - Flex layout: icon, text, next date, action icon  
  - “Ignore” icon with rotate‐on‐hover animation  

### 3.5 Settings  
- **Forms & Controls:**  
  - Styled `<input>`, `<select>`, and radio buttons with focus ring transitions  
  - Banner to re‑grant Gmail access with slide‐in animation  

### 3.6 Digest Preview (Modal)  
- **Modal Overlay:**  
  - Semi‑opaque backdrop  
  - Modal card slides down on open, slides up on close  

---

## 4. Components & Interactions

| Component                 | Vanilla CSS Notes                                                 |
|---------------------------|-------------------------------------------------------------------|
| `<button>`                | Reset browser styles; padding, border‐radius, transition on hover |
| `<card>` (div.container)  | White background, box‐shadow, border‐radius, padding              |
| `<input>`                 | Border‐bottom highlight on focus, transition                       |
| `.spinner`                | `<div>` with CSS keyframes for rotation                           |
| `.alert`                  | Red background, fade‐in/out, role="alert"                         |
| `.modal`                  | Fixed position, opacity transition, transform for slide effect     |

---

## 5. Style Guide

- **CSS Variables** (in :root):  
  <code>:root {  
    --color-bg: #ffffff;  
    --color-text: #1f2937;  
    --color-accent: #4f46e5;  
    --space-sm: 8px;  
    --space-md: 16px;  
    --space-lg: 24px;  
    --font-base: 16px;  
  }</code>

- **Colors**  
  - Background: <code>var(--color-bg)</code>  
  - Text: <code>var(--color-text)</code>  
  - Accent (buttons, links): <code>var(--color-accent)</code>  
- **Typography**  
  - Base font-size: <code>var(--font-base)</code> (1rem)  
  - Headings: scale 1.5–2rem, font-weight 600–700  
- **Spacing**  
  - Use <code>var(--space-*)</code> for margin/padding  

---

## 6. Accessibility & Responsiveness

- **Keyboard Navigation**  
  - Ensure `<button>` and `<a>` have visible focus styles  
- **ARIA Attributes**  
  - `<div role="alert">` for errors; `<div aria-busy="true">` during loads  
- **Media Queries**  
  <code>@media (min-width: 640px) { … }</code> mobile → tablet  
  <code>@media (min-width: 1024px) { … }</code> tablet → desktop  

---

## 7. Developer Handoff

- Provide simple HTML/CSS prototypes or code snippets  
- Share CSS variable file and reset stylesheet  
- Include comments in CSS for component sections and animations  
