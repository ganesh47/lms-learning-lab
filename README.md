# Lending Systems Lab

A public, static GitHub Pages learning app for Indian loan management systems, accounting, cashflows and co-lending.

**12 sequenced lessons · 120 flashcards · 160 explained MCQs · 15 worked cases.**

Study concepts before assessment. Case questions test calculation, event attribution and exception diagnosis. Every MCQ explains all three options. Interactive labs compare waterfall allocations and journal entries, lender principal versus interest entitlements, and contractual EMI versus an explicitly assumed qualifying-fee EIR carrying schedule.

Untimed study is the default. Optional whole-session or per-question timers persist exact deadlines, support explicit pause, and record expiry without awarding a false pass. Local progress separates views, solution exposure, helped first attempts, independent first attempts and repeats. It does not assert mastery or certification. Device-local timers are practice tools, not a secure examination system.

## Privacy and offline operation

No accounts, analytics, backend, credentials or customer data. Progress lives in browser localStorage and can be exported/imported. Corrupt or unknown-version saved bytes block automatic overwrite and offer download, temporary use and explicit backed-up reset. A service worker prepares an offline copy after a complete online visit. Updates activate on a later visit when old tabs close.

## Content and sources

The user-provided 42-page *Indian LMS, Accounting, Cashflows and Co-Lending Deep Research Guide* (27 June 2026 cutoff; OpenAI metadata author) is educational inspiration. It is not official regulatory authority. The original PDF and its extracted text are not in this repository or published app. The bank is paraphrased with original hypothetical examples and source-page provenance.

Current-rule questions were checked 4 October 2026 against scoped RBI entity-specific successor directions. The app visibly records the 28 November 2025 consolidation lineage and corrects five known handbook issues. Current prepayment/KFS/penal-charge details and unverified accounting generalizations are held out of current-law scoring. See Sources in the app and the source registry in `content/curriculum.json`.

Accounting, GST, allocation, schedules and EIR cases carry explicit illustrative assumptions. They do not prescribe production treatment for every bank, NBFC or HFC.

## Develop and validate

Node 24 is used in hosted CI. The app itself has no third-party runtime dependency. Development dependencies are pinned for Playwright and axe checks.

```sh
npm ci
npm run check
npm test
npm run build
node scripts/serve.mjs
npx playwright install chromium
npm run browser
```

`python3 scripts/author-content.py` reproduces the authored JSON. Keep generator and JSON together. Numerical tests include EMI final rounding, NPV root, EIR gross/fee/carrying bridge, waterfall conservation and partner entitlements. Browser tests cover mobile/keyboard/reduced-motion, Back and reload state, timer pause/expiry/relaunch, corruption recovery, offline availability and production-relative assets. Axe checks representative desktop/mobile routes.

## Publish

GitHub Pages serves the `dist` artifact through `.github/workflows/pages.yml`. Use the Actions Pages source. A draft PR is independently reviewed before guarded merge. `revision.json` records the deployed commit SHA. No source PDF is copied into `dist`.

## Learning coverage

1. Fundamentals and five views
2. LOS/LMS/CBS/payments/GL boundaries
3. PV, EMI, IRR, APR and EIR
4. Schedules, tranches, day count and actual exposure
5. Component balances and double entry
6. Receipt states, suspense and advances
7. Waterfalls and allocation reasoning
8. Prepayment, foreclosure and negotiated settlement
9. Delinquency, reversal, allowances and recovery
10. Co-lending shares and escrow
11. Reconciliation, idempotency, outbox and sagas
12. Scoped current Indian controls and source judgment

Worked cases add bounce-versus-scheduled POS, divergent waterfalls, lender entitlements, cash-once suspense allocation, disjoint foreclosure quotes, gross/net gateway settlement, advances, wrong-loan correction, failed payout, DPD restoration, fee-adjusted yield, settlement versus write-off, full EMI amortization, multi-period PV/dated yield and assumed-policy EIR.
