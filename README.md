# AeroMiles: End-to-End Frequent Flyer Operations Portal

A mission-critical digital Frequent Flyer Operations Terminal designed for airline floor staff, gate agents, and customer service managers to replace fragile paper-based workflows and Excel sheets.

## 🚀 Key Technical Features & TRD Compliance

### 1. Agile User Stories (The "Happy Path")
- **Instant Search & Roster**: Look up members immediately by Frequent Flyer Number (`FF-XXXXXX`), First/Last Name, Email, Passport Number, or Home Station (IATA code).
- **Profile & Tier Management**: Inspect full tier standing (Diamond, Platinum, Gold, Silver), flight history, and live miles balance.
- **Ledger Operations**: Accrue and redeem points for award flights, cabin upgrades, and lounge access with instant feedback.
- **Migration & Exchange**: Ingest legacy Excel sheets and export standardized CSV reports.

### 2. The "Unhappy Path" (Edge Case Handling)
- **Empty States**: If a filter or search query returns zero matching records, a dedicated accessible `EmptyState` displays with the clear `"No data found"` message and a single-click reset action (never a blank screen).
- **Bad Connectivity & Spotty Internet**: Includes a visual loading spinner (`LoadingIndicator`) during all asynchronous operations and network latency simulation modes (`Online`, `Slow 3G` ~1.2s delay, `Offline`). Offline updates are queued locally in `localStorage` with a sync counter and recovery button.
- **Invalid Form Inputs**: Submitting missing or malformed data prevents submission, sets `aria-invalid="true"`, triggers alert announcements, and highlights offending input borders and backgrounds in red (`border-error-border bg-error-light text-error-text`).

### 3. Non-Functional Requirements (NFRs)
- **Accessibility (a11y)**: Built to achieve 100% Lighthouse accessibility. Tested using `jest-axe` for 0 WCAG violations. Includes keyboard navigation (`tabIndex`, Enter/Space keybindings), skip link (`#main-content`), proper ARIA landmarks, roles (`table`, `row`, `dialog`, `alert`, `status`), and high-contrast color ratios.
- **Telemetry Simulation**: Emits the exact required analytics console log:
  `[Analytics] User interacted with End-to-End Frequent Flyer Portal: <Action> | <Metadata>`
  Maintains an in-memory buffer with an audit drawer for review.
- **Security & XSS Prevention**: Built-in sanitization engine (`sanitizeInput`, `sanitizeObject`) strips malicious scripts (`<script>`, active attributes `onerror`, `onload`, `javascript:`) before committing any state.
- **Design Handoff**: Monochromatic corporate palette (WCAG AAA compliant zinc/slate/black/white) with structured 8px/16px/24px/32px spacing steps and functional red alerts for form errors.

---

## 🧪 Jest Test Suite

The project includes a comprehensive Jest test suite covering unit, integration, validation, and accessibility tests:

| Test Suite | Purpose | Status |
| :--- | :--- | :--- |
| `sanitizer.test.ts` | XSS attack sanitization & script neutralization | ✅ Passing |
| `validators.test.ts` | Form input integrity & ledger redemption checks | ✅ Passing |
| `telemetry.test.ts` | Analytics console string format & audit buffer | ✅ Passing |
| `EmptyState.test.tsx` | "No data found" empty state & reset callback | ✅ Passing |
| `NetworkState.test.tsx` | Bad connectivity, Slow 3G spinner & offline sync | ✅ Passing |
| `MemberList.test.tsx` | Search, sorting, tier filtering & keyboard navigation | ✅ Passing |
| `MemberForm.test.tsx` | Form validation & red field highlighting | ✅ Passing |
| `Transactions.test.tsx` | Ledger balance accrual & redemption limits | ✅ Passing |
| `Accessibility.test.tsx`| `jest-axe` WCAG compliance & landmark audits | ✅ Passing |
| `exportImport.test.ts` | Excel CSV import/export & malicious cell sanitization | ✅ Passing |

### Running the Test Suite
```bash
# Run all Jest tests
npm test

# Run tests with code coverage report
npm run test:coverage
```

### Production Build (Code Freeze)
```bash
npm run build
```
The production bundle is generated in `/dist` ready for deployment.
