# Product Requirements Document
## AI-Powered Vehicle Compatibility & Smart Parts Search

**Parts Unlimited**
Version 1.0 • February 14, 2026

---

## Document Information

| Field | Value |
|-------|-------|
| Document Title | PRD — AI-Powered Vehicle Compatibility & Smart Parts Search |
| Project | Parts Unlimited |
| Epic ID | TBD (to be assigned upon ADO creation) |
| Author | Sarah Chen, Product Manager |
| Contributors | David Kowalski (Engineering Lead), Maria Santos (UX Lead), James Hartley (VP of Sales) |
| Status | Draft |
| Version | 1.0 |
| Date | February 14, 2026 |
| Target Release | Q2 2026 (Phase 1 MVP) |

### Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-14 | Sarah Chen | Initial draft based on email thread discussions |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [Requirements](#5-requirements)
   - 5.1 [Functional Requirements](#51-functional-requirements)
   - 5.2 [Non-Functional Requirements](#52-non-functional-requirements)
6. [User Stories & Acceptance Criteria](#6-user-stories--acceptance-criteria)
7. [UX / Interaction Design](#7-ux--interaction-design)
8. [Technical Architecture](#8-technical-architecture)
9. [Data Requirements](#9-data-requirements)
10. [Dependencies & Integrations](#10-dependencies--integrations)
11. [Phased Delivery Plan](#11-phased-delivery-plan)
12. [Risks & Mitigations](#12-risks--mitigations)
13. [Open Questions](#13-open-questions)
14. [Appendix — Original Email Thread](#14-appendix--original-email-thread)

---

## 1. Executive Summary

Parts Unlimited is an online auto-parts retailer whose customers frequently purchase parts that are incompatible with their vehicles. Analysis of Q4 2025 support data reveals that **34% of product returns are caused by fitment mismatches**. This drives significant costs in reverse logistics, erodes customer trust, and depresses repeat purchase rates.

This PRD proposes an **AI-Powered Vehicle Compatibility & Smart Parts Search** feature that allows customers to identify their vehicle (year / make / model / engine), persist it in a "My Garage" profile, and receive real-time compatibility information on every product page and in search results. The feature leverages the industry-standard ACES fitment database and Azure AI Search for natural-language part queries.

The initiative targets a **60% reduction in fitment-related returns** within six months of launch, a measurable lift in conversion rate, and competitive parity with leading aftermarket retailers (AutoZone, RockAuto).

---

## 2. Problem Statement

Currently, Parts Unlimited's shopping experience is vehicle-agnostic. Customers browse a flat product catalog and must independently verify whether a part fits their vehicle. This creates three critical problems:

- **High return rate:** 34% of all returns are due to incompatible parts, costing the company an estimated $2.4M annually in reverse logistics, restocking, and customer support.
- **Poor conversion:** Customers who are unsure about fitment abandon their carts. Exit surveys indicate "not sure if it fits my car" is the #2 reason for cart abandonment.
- **Competitive disadvantage:** Major competitors (AutoZone, RockAuto, Advance Auto Parts) all offer vehicle-based filtering, making Parts Unlimited a less attractive option for buyers who want a guided experience.

---

## 3. Goals & Success Metrics

| Goal | Metric | Current Baseline | Target |
|------|--------|-----------------|--------|
| Reduce fitment-related returns | Return rate for fitment reasons | 34% of total returns | < 14% within 6 months |
| Increase conversion rate | Add-to-cart rate on PDPs | 4.2% | > 6.0% |
| Improve customer satisfaction | NPS score | 42 | > 55 |
| Drive repeat purchases | 90-day repeat purchase rate | 18% | > 25% |
| Achieve garage adoption | % of active users with ≥ 1 saved vehicle | 0% (feature does not exist) | > 40% within 6 months |

---

## 4. User Personas

- **DIY Dan** — Weekend mechanic who maintains 2–3 family vehicles. Knows basic part names but not exact part numbers. Wants to quickly confirm a part fits before buying. Values saving his vehicles for repeat visits.

- **Fleet Manager Fiona** — Manages a fleet of 20+ commercial vehicles. Orders parts in bulk and needs to switch between vehicles quickly. Requires high accuracy in fitment data to avoid costly downtime.

- **First-Time Buyer Alex** — Has no automotive knowledge. Searching online after a mechanic gave them a part name. Needs a guided, forgiving search experience — e.g., "brake pads for 2019 Honda Civic".

---

## 5. Requirements

### 5.1 Functional Requirements

| ID | Requirement | EARS Specification |
|----|------------|-------------------|
| FR-01 | Vehicle Selection | WHEN a user visits the site, THE SYSTEM SHALL display a vehicle selector (Year → Make → Model → Engine/Trim) that progressively narrows options based on the previous selection. |
| FR-02 | My Garage — Save Vehicle | WHEN an authenticated user confirms a vehicle selection, THE SYSTEM SHALL persist the vehicle in the user's "My Garage" profile, supporting up to 10 vehicles per account. |
| FR-03 | My Garage — Switch Vehicle | WHILE a user has multiple saved vehicles, THE SYSTEM SHALL provide a quick-switch dropdown in the site header to change the active vehicle without navigating away from the current page. |
| FR-04 | Compatibility Badge | WHEN a user has an active vehicle selected and views a product page, THE SYSTEM SHALL display a compatibility badge (Fits ✓ / Does Not Fit ✗ / Not Verified ?) above the fold, adjacent to the price. |
| FR-05 | Search Filtering | WHEN a user has an active vehicle selected and performs a product search, THE SYSTEM SHALL filter results to show only compatible parts by default, with an option to remove the filter. |
| FR-06 | Natural Language Search | WHEN a user types a natural-language query (e.g., "brake pads for 2019 Honda Civic EX"), THE SYSTEM SHALL parse the vehicle and part intent and return relevant, compatible results using Azure AI Search with semantic ranking. |
| FR-07 | Guest Vehicle Selection | WHEN an unauthenticated user selects a vehicle, THE SYSTEM SHALL store the selection in the browser session and offer to save it upon account creation or login. |
| FR-08 | First-Visit Prompt | WHEN a first-time visitor lands on the homepage, THE SYSTEM SHALL display a prominent "Select Your Vehicle" banner inviting them to choose their vehicle for a personalized experience. |
| FR-09 | Filter Chip | WHEN search results are filtered by vehicle, THE SYSTEM SHALL display a filter chip (e.g., "Showing results for: 2019 Honda Civic EX") with a one-click option to remove the filter. |
| FR-10 | Rewards Integration | WHERE the Membership and Rewards Program feature is active, THE SYSTEM SHALL allow members to save vehicles in My Garage as part of their membership profile, enabling vehicle-context-aware promotions. |

### 5.2 Non-Functional Requirements

| ID | Requirement |
|----|------------|
| NFR-01 | Compatibility badge lookup SHALL respond within 200 ms (p95) under normal load. |
| NFR-02 | Vehicle selector dropdowns SHALL load options within 300 ms. |
| NFR-03 | Natural-language search SHALL return results within 1 second (p95). |
| NFR-04 | The fitment database SHALL support ≥ 98% coverage of passenger vehicles sold in North America from model year 2000 onward. |
| NFR-05 | My Garage data SHALL be encrypted at rest and in transit. No PII beyond vehicle info is stored. |
| NFR-06 | The feature SHALL be accessible (WCAG 2.1 AA) on desktop and mobile viewports. |
| NFR-07 | System SHALL handle ≥ 500 concurrent vehicle-selection requests without degradation. |

---

## 6. User Stories & Acceptance Criteria

### US-01: Vehicle Selection
> As a customer, I want to select my vehicle so that I only see parts that fit.

**Acceptance Criteria:**
- Vehicle selector has cascading dropdowns: Year → Make → Model → Engine/Trim.
- Selecting a vehicle sets it as the "active vehicle" across the site.
- Unauthenticated users have the vehicle stored in session; authenticated users have it persisted.

### US-02: My Garage
> As a returning customer, I want to save multiple vehicles in "My Garage" so that I can quickly switch between them.

**Acceptance Criteria:**
- User can save up to 10 vehicles.
- A quick-switch dropdown is always visible in the site header.
- Switching vehicles updates compatibility badges in real time without a full page reload.

### US-03: Compatibility Badge
> As a customer viewing a product page, I want to see whether the part fits my active vehicle so that I can buy with confidence.

**Acceptance Criteria:**
- Green "Fits your vehicle ✓" badge shown when part is compatible.
- Red "Does not fit ✗" badge shown when part is incompatible.
- Gray "Not verified ?" badge shown when fitment data is unavailable.
- Badge is above the fold, adjacent to the product price.

### US-04: Natural Language Search
> As a customer, I want to search for parts using plain language (e.g., "oil filter for 2022 Ford F-150") so that I get accurate results without knowing part numbers.

**Acceptance Criteria:**
- System parses vehicle info and part intent from the query.
- Results are ranked by relevance using semantic search.
- If a garage vehicle is active, results are further filtered for compatibility.

---

## 7. UX / Interaction Design

Maria Santos (UX Lead) will deliver wireframes by February 21, 2026. Key design principles agreed upon:

- **Homepage:** Prominent "Select Your Vehicle" banner for first-time visitors.
- **Header:** Persistent vehicle selector showing the active vehicle with a dropdown for switching.
- **Product Detail Page (PDP):** Compatibility badge placed above the fold, next to the price. Uses color-coding: green (fits), red (does not fit), gray (not verified).
- **Search Results Page (SRP):** Filter chip displaying the active vehicle filter (e.g., "Showing results for: 2019 Honda Civic EX") with a one-click dismiss option.
- **Mobile:** Vehicle selector is accessible via a sticky bottom bar or hamburger menu item.
- **Accessibility:** All badges and selectors meet WCAG 2.1 AA. Color is not the sole indicator — icons and text labels are always present.

---

## 8. Technical Architecture

David Kowalski (Engineering Lead) outlined the following architecture:

### 8.1 Components

- **Vehicle Fitment Service:** New microservice exposing REST APIs for vehicle lookup, garage CRUD operations, and compatibility checks. Backed by a fitment database.
- **ACES Fitment Database:** Licensed ACES (Aftermarket Catalog Exchange Standard) data imported into Azure SQL or Cosmos DB. Covers year/make/model/engine-to-part-number mappings.
- **Azure AI Search:** Semantic search index over the product catalog enriched with fitment attributes. Supports natural-language queries with vehicle-aware ranking.
- **My Garage Profile Store:** Extension of the existing user profile service. Stores vehicle selections per user account (up to 10 vehicles).
- **Compatibility Badge API:** Thin endpoint that accepts a product SKU and a vehicle ID, returning a compatibility status (fits / does not fit / not verified) in < 200 ms.

### 8.2 Integration Points

- Product Catalog (Epic #170): Fitment attributes must be associated with each SKU.
- Membership & Rewards Program (Epic #168): My Garage is linked to member profiles.
- Notification (Epic #167): Optional alerts when saved-vehicle parts go on sale.
- Shopping Cart (Epic #163): Cart items display compatibility status.

---

## 9. Data Requirements

- **ACES Fitment Data:** Licensed from an approved ACES data provider. Updated quarterly. Covers make/model/year/engine → part number mappings for North American vehicles (2000+).
- **Vehicle Taxonomy:** Structured hierarchy: Year → Make → Model → Engine/Trim. Approx. 45,000 unique vehicle configurations.
- **SKU-to-Fitment Mapping:** Each product SKU is linked to one or more vehicle configurations via the ACES part-type and position attributes.
- **My Garage Records:** Per-user vehicle profiles. Schema: userId, vehicleId (internal), year, make, model, engine, trim, isActive, createdAt, updatedAt.

---

## 10. Dependencies & Integrations

| Dependency | Owner | Risk / Notes |
|-----------|-------|-------------|
| ACES data license | James Hartley / Procurement | Contract negotiation may take 4–6 weeks. Start immediately. |
| Product Catalog data model update (Epic #170) | David Kowalski | Adding fitment attributes to SKU records. Must be backward-compatible. |
| Azure AI Search provisioning | DevOps / Cloud team | Requires new search index with semantic configuration. |
| Membership profile schema update (Epic #168) | Backend team | Adding garage sub-document to user profile. |

---

## 11. Phased Delivery Plan

### Phase 1 — MVP (8 sprints, target: Q2 2026)
- Year / Make / Model / Engine dropdown vehicle selector.
- My Garage — save, switch, delete vehicles.
- Compatibility badge on product detail pages.
- Search results filtered by active vehicle.
- ACES data pipeline (import, transform, serve).

### Phase 2 — AI Search & Personalization (4 sprints, target: Q3 2026)
- Natural-language search ("brake pads for 2019 Honda Civic EX").
- Azure AI Search with semantic ranking.
- Vehicle-aware promotional recommendations.
- Integration with Membership & Rewards for personalized offers.

### Phase 3 — Advanced Features (3 sprints, target: Q4 2026)
- VIN (Vehicle Identification Number) decoder for one-step vehicle setup.
- Maintenance schedule reminders per saved vehicle.
- Community-contributed fitment confirmations ("I verified this fits my vehicle").

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| ACES data licensing delay | Medium | High | Start procurement in parallel with design. Identify backup providers. |
| Fitment data gaps for older/niche vehicles | High | Medium | Show "Not Verified" badge; allow community contributions in Phase 3. |
| Performance degradation at scale | Low | High | Use Cosmos DB with partition keys by make/model. Cache popular lookups with Azure Redis. |
| Low garage adoption by users | Medium | Medium | A/B test prompt placements. Incentivize garage setup with a rewards bonus. |

---

## 13. Open Questions

1. Which ACES data provider should we license from? *(Action: James Hartley to evaluate by Feb 28)*
2. Should guest users be limited to one session vehicle, or can they use the full garage without an account?
3. Do we need to support vehicles outside North America for international expansion?
4. What is the exact cost of fitment-related returns? *(Action: James Hartley to pull warehouse data)*
5. Should the compatibility badge link to a "Why doesn't this fit?" explanation page?

---

## 14. Appendix — Original Email Thread

The following email conversation among the project stakeholders initiated this PRD.

---

**From:** Sarah Chen (Product Manager)
**To:** David Kowalski (Engineering Lead), Maria Santos (UX Lead), James Hartley (VP of Sales)
**Date:** February 10, 2026
**Subject:** Idea: Vehicle Compatibility Search for Parts Unlimited

Hi team,

I've been reviewing our Q4 support tickets and noticed that 34% of returns are due to customers ordering incompatible parts. They're browsing the catalog, picking something that looks right, and then finding out it doesn't fit their vehicle.

I think we need an AI-powered vehicle compatibility and smart parts search feature. The idea is:

- Customers enter their vehicle (year, make, model, engine/trim).
- We store it in a "My Garage" profile.
- Every product page shows a clear "Fits your vehicle" / "Does not fit" badge.
- Search results are automatically filtered to compatible parts.

This would reduce returns, increase conversion, and put us on par with competitors like AutoZone and RockAuto who already offer this.

Thoughts? Worth exploring for the next planning cycle?

— Sarah

---

**From:** James Hartley (VP of Sales)
**To:** Sarah Chen, David Kowalski, Maria Santos
**Date:** February 10, 2026
**Subject:** RE: Idea: Vehicle Compatibility Search for Parts Unlimited

Sarah, this is a must-have. Our sales team hears about fitment issues constantly. The 34% return rate number is painful — that's real money lost on reverse logistics alone.

I'd also suggest we integrate this with the Membership and Rewards Program (Epic #168). Logged-in members could save multiple vehicles in their garage, making repeat purchases frictionless.

Can we get a rough estimate on data sourcing? We'd need a comprehensive vehicle-to-part fitment database.

— James

---

**From:** David Kowalski (Engineering Lead)
**To:** Sarah Chen, James Hartley, Maria Santos
**Date:** February 11, 2026
**Subject:** RE: Idea: Vehicle Compatibility Search for Parts Unlimited

Great idea. Here's my initial technical thinking:

1. **Fitment data:** We can license ACES (Aftermarket Catalog Exchange Standard) data, which is the industry standard. Covers year/make/model/engine mapping to part numbers.
2. **Smart search:** We can use Azure AI Search with semantic ranking so customers can type natural queries like "brake pads for 2019 Honda Civic EX" and get accurate results.
3. **"My Garage":** Store vehicle profiles per user account. We'll need a new microservice and a few new API endpoints, plus UI components on the product pages and search.
4. **Compatibility badge:** Real-time lookup against the fitment database when a user has an active garage vehicle selected.

Rough estimate: 8–10 sprints for an MVP (search + garage + badges). We could phase it — Phase 1 is basic year/make/model dropdown + compatibility filtering, Phase 2 adds AI-powered natural language search.

One dependency: this will touch the Product Catalog (Epic #170) data model since we need to associate fitment attributes with each SKU.

— David

---

**From:** Maria Santos (UX Lead)
**To:** Sarah Chen, David Kowalski, James Hartley
**Date:** February 12, 2026
**Subject:** RE: Idea: Vehicle Compatibility Search for Parts Unlimited

Love this direction. From a UX perspective:

- First-time visitors should get a prominent "Select Your Vehicle" banner on the homepage.
- Returning users see their saved vehicle with a quick-switch dropdown if they have multiple vehicles in the garage.
- On product pages, the compatibility badge should be above the fold, right next to the price. Green checkmark for "Fits", red X for "Does not fit", gray for "Not verified."
- Search results should show a filter chip like "Showing results for: 2019 Honda Civic EX" with a one-click option to remove the filter.

I can have wireframes ready by end of next week. Should I set up a design review?

— Maria

---

**From:** Sarah Chen (Product Manager)
**To:** David Kowalski, Maria Santos, James Hartley
**Date:** February 14, 2026
**Subject:** RE: Idea: Vehicle Compatibility Search for Parts Unlimited

This is all coming together nicely. Let me summarize the action items:

1. **Maria** — Wireframes for garage selector, product page badge, and search integration by Feb 21.
2. **David** — Spike on ACES data licensing and Azure AI Search feasibility, plus size the effort for Sprint planning.
3. **James** — Pull the exact return-rate-by-reason data from the warehouse team so we can build the business case.
4. **Sarah (me)** — I'll create the Epic on Azure DevOps with acceptance criteria and link it to the existing Product Catalog and Membership epics.

Target: Epic ready for backlog refinement by Feb 28. If the business case holds up, we aim for Phase 1 MVP in Q2 2026.

Thanks everyone — excited about the impact this could have!

— Sarah
