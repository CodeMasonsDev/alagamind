# AI Companion Improvement Plan

This document outlines the gaps identified in the `src/components/ai-companion/` directory and the strategy to improve the user experience and codebase architecture.

## 🔍 Identified Gaps

### 1. User Interface & Experience
- **Static Content:** `AssistantTextCard` lacks Markdown support (critical for AI responses).
- **Limited Input:** `Composer` uses a single-line input instead of a multi-line textarea.
- **Missing Feedback:** No "Copy to Clipboard" for messages or "Message Sent" status.
- **Sidebar Limitations:** No session renaming, searching, or date-grouping (e.g., "Today", "Yesterday").
- **Visual Polish:** Lack of skeleton loaders during history fetching.

### 2. Architecture & Code Quality
- **Tight Coupling:** Components import constants and types directly from the Page component.
- **Arbitrary Styling:** Excessive use of arbitrary Tailwind values (`text-[15px]`) instead of theme-based tokens.
- **Prop Drilling:** Some session-related state could be better managed via a Context Provider if the complexity grows.
- **Accessibility:** Missing ARIA labels on icon-only buttons and lack of keyboard focus management in the sidebar.

---

## 🛠️ Action Plan

### Phase 1: Foundation (Cleanup & Types)
- [ ] **Type Centralization:** Move all chat-related interfaces to `@/types/ai-companion.ts`.
- [ ] **Constants Migration:** Move `SUGGESTIONS` and configuration to `@/constants/ai-companion.ts`.
- [ ] **Design System:** Standardize typography and spacing in `tailwind.config.ts` to replace arbitrary values.

### Phase 2: Core Messaging Features
- [ ] **Markdown Support:** Implement `react-markdown` in `AssistantTextCard`.
- [ ] **Enhanced Composer:**
    - Change `input` to `textarea` with auto-resize.
    - Add character count and `Shift + Enter` support.
    - Implement a basic command trigger UI for `/`.
- [ ] **Message Actions:** Add "Copy" and "Regenerate" actions to assistant bubbles.

### Phase 3: Session & Sidebar UX
- [ ] **Session Renaming:** Add inline editing for session labels in the sidebar.
- [ ] **Search & Filter:** Add a search bar to the `SessionSidebar`.
- [ ] **Virtualized List:** Use `react-window` or similar if session history becomes large.

### Phase 4: Polish & Accessibility
- [ ] **Skeleton UI:** Create `MessageSkeleton` for a smoother loading experience.
- [ ] **A11y Audit:** Add `aria-labels`, `role="log"` for conversation area, and ensure full keyboard navigability.
- [ ] **Mobile Optimization:** Improve the sidebar drawer behavior on small screens.
