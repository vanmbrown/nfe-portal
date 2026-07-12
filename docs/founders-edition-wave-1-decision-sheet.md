# Wave 1 Founder’s Edition — Decision Sheet

**Document type:** Internal operational planning only. Not public-facing.

**Status:** Operating blueprint approved. **No payment build, Shopify activation, invoice send, public pricing, or checkout behavior** until Vanessa completes this sheet and marks it **APPROVED FOR WAVE 1 ACTIVATION**.

**Activation gate:** The following must be finalized and approved on this sheet before any payment activation:
- Wave 1 unit cap
- Founder’s Edition price
- Shipping region
- Expected ship window
- Refund / cancellation policy

**Placeholder rule:** Use placeholders in internal planning only. **No placeholder values are public-facing.** Do not send invoices until final business decisions are approved on this sheet.

**Official payment architecture (Phase 2A):**
- Unpublished Shopify SKU: NFE Face Elixir — Founder’s Edition
- Manual Shopify draft orders for Wave 1
- Resend private invitation
- Shopify-hosted invoice checkout
- Supabase `founder_invitations` tracking
- No public product page, public price, public cart, or checkout on nfebeauty.com

**Approved language:** Founder’s Edition · private allocation · invitation · release wave · small batch · reserved invitation

**Avoid:** preorder · sale · discount · donation · sample · drop · clearance · shop now · limited-time offer · countdown language

---

## How to use this sheet

For each item:
1. Review the **recommended default**
2. Record **Vanessa’s final decision**
3. Note **where it appears operationally**
4. Confirm **systems affected**

When complete, mark the sheet **APPROVED FOR WAVE 1 ACTIVATION** at the bottom.

---

## Decision 1 — Wave 1 unit cap

| | |
|---|---|
| **Recommended default** | 25–50 units for first private allocation wave (small batch, operationally manageable for manual fulfillment) |
| **Vanessa’s final decision** | _________________ units |
| **Where it appears operationally** | Shopify inventory quantity on unpublished SKU; internal wave tracker; stop rule before additional invitations are sent |
| **Systems affected** | Shopify (inventory) · Supabase (`founder_invitations` wave count) · Fulfillment (batch size) |

**Notes:**

---

## Decision 2 — Founder’s Edition price

| | |
|---|---|
| **Recommended default** | Set privately on draft order only. Do not publish on nfebeauty.com. Confirm price includes/excludes shipping separately per Decision 4. |
| **Vanessa’s final decision** | $_________________ USD (product line item) |
| **Where it appears operationally** | Shopify draft order line item; Supabase `founder_invitations.price_cents` audit field; never on public site |
| **Systems affected** | Shopify (draft order / invoice) · Supabase (audit) |

**Shipping shown separately on invoice?** ☐ Yes ☐ No

**Notes:**

---

## Decision 3 — Shipping region

| | |
|---|---|
| **Recommended default** | United States domestic only for Wave 1 |
| **Vanessa’s final decision** | _________________ |
| **Where it appears operationally** | Shopify shipping zones; draft order shipping line; invitation disclosure copy |
| **Systems affected** | Shopify (zones/rates) · Resend (invitation copy) · Privacy / policies (shipping region disclosure) · Fulfillment (eligible addresses) |

**Excluded regions (if any):**

**Notes:**

---

## Decision 4 — Expected ship window

| | |
|---|---|
| **Recommended default** | Use a specific window once fulfillment timing is confirmed (e.g. “Ships between [Month] and [Month] [Year]”). Do not send invitations until this window is defensible. |
| **Vanessa’s final decision** | _________________________________________________ |
| **Where it appears operationally** | Resend invitation email; optional Shopify draft order note; Supabase `founder_invitations.ship_window_copy` |
| **Systems affected** | Resend · Shopify (draft note) · Supabase · Privacy / policies (if ship timing referenced on site later) |

**Notes:**

---

## Decision 5 — Refund / cancellation policy

| | |
|---|---|
| **Recommended default** | Limited-allocation policy: unpaid invitations may be cancelled after expiry window (Decision 10). Paid orders: define refund window and condition (e.g. unopened, within X days of delivery) with legal review before Wave 1. |
| **Vanessa’s final decision** | _________________________________________________ |
| **Where it appears operationally** | Shopify store policies; Resend invitation disclosures; customer support replies; Supabase `cancellation_status` / `refunded_at` |
| **Systems affected** | Shopify (refunds, policy pages) · Resend · Privacy / policies · Fulfillment · Supabase |

**Legal review completed?** ☐ Yes ☐ No · Date: __________

**Notes:**

---

## Decision 6 — Wave 1 workflow: manual vs API-assisted

| | |
|---|---|
| **Recommended default** | **Fully manual** for Wave 1: Vanessa creates Shopify draft orders in Admin, copies invoice URL into Resend invitation, updates Supabase invitation status manually |
| **Vanessa’s final decision** | ☐ Fully manual · ☐ Partially API-assisted (describe): _________________ |
| **Where it appears operationally** | Vanessa’s weekly ops workflow; whether any portal admin tooling is built in Phase 2A |
| **Systems affected** | Shopify · Supabase · Resend · (Portal/API only if partially assisted) |

**Notes:**

---

## Decision 7 — Inventory readiness

| | |
|---|---|
| **Recommended default** | Do not send invoices until Wave 1 units are physically available or explicitly reserved for allocation (no invoicing ahead of stock) |
| **Vanessa’s final decision** | ☐ Physical stock on hand · ☐ Reserved production batch · ☐ Other: _________________ |
| **Units ready / reserved before first invoice:** | _________________ |
| **Where it appears operationally** | Shopify inventory; fulfillment queue; invitation send gate |
| **Systems affected** | Shopify (inventory) · Fulfillment · Supabase (invitation send criteria) |

**Notes:**

---

## Decision 8 — Shopify payment provider readiness

| | |
|---|---|
| **Recommended default** | Shopify Payments enabled (or approved gateway); complete one test draft order + test invoice before any live invitation |
| **Vanessa’s final decision** | Provider: _________________ · Test invoice completed: ☐ Yes ☐ No · Date: __________ |
| **Where it appears operationally** | Shopify Admin → Settings → Payments; invoice checkout experience |
| **Systems affected** | Shopify only |

**Notes:**

---

## Decision 9 — Tax / nexus setup

| | |
|---|---|
| **Recommended default** | Configure US tax collection for nexus states before first live invoice; confirm with accountant |
| **Vanessa’s final decision** | Nexus states approved: _________________ · Tax provider: _________________ · Accountant sign-off: ☐ Yes ☐ No |
| **Where it appears operationally** | Shopify tax settings; draft order tax lines on invoice checkout |
| **Systems affected** | Shopify · Privacy / policies (if tax disclosure needed elsewhere) |

**Notes:**

---

## Decision 10 — Unpaid invoice expiry window

| | |
|---|---|
| **Recommended default** | 7–14 days from invitation send; unpaid draft orders cancelled/voided and allocation released |
| **Vanessa’s final decision** | _________________ days |
| **Where it appears operationally** | Vanessa ops calendar; Shopify draft order cancellation; Supabase `invitation_status = expired` |
| **Systems affected** | Shopify · Supabase · Resend (optional reminder email before expiry — not required Wave 1) |

**Notes:**

---

## Supporting decisions (recommended before first invitation)

### A — Wave 1 selection criteria

| | |
|---|---|
| **Recommended default** | Start with `high_intent = true` Founder Access signups; Vanessa final approval on each invitee |
| **Vanessa’s final decision** | _________________________________________________ |
| **Systems affected** | Supabase (`founder_access_signups`) · Supabase (`founder_invitations`) |

---

### B — Invitation sender identity

| | |
|---|---|
| **Recommended default** | From: NFE Beauty · notifications@nfebeauty.com (or approved sender) · Reply-to: vanessa@nfebeauty.com |
| **Vanessa’s final decision** | From: _________________ · Reply-to: _________________ |
| **Systems affected** | Resend |

---

### C — Support contact for payment / shipping questions

| | |
|---|---|
| **Recommended default** | vanessa@nfebeauty.com |
| **Vanessa’s final decision** | _________________ |
| **Systems affected** | Resend (invitation copy) · Privacy / policies |

---

### D — Post-payment customer communications

| | |
|---|---|
| **Recommended default** | Shopify sends order confirmation; NFE does not duplicate. Optional personal founder note later (not required Wave 1). |
| **Vanessa’s final decision** | _________________________________________________ |
| **Systems affected** | Shopify · Resend (optional) |

---

### E — Beehiiv tagging after purchase (optional)

| | |
|---|---|
| **Recommended default** | Defer until after first paid wave; optional tag e.g. `founders-edition-purchaser` |
| **Vanessa’s final decision** | ☐ Defer · ☐ Tag: _________________ |
| **Systems affected** | Beehiiv · Supabase (optional) |

---

## Required disclosures checklist (must be true before send)

Every invitation must include:

- [ ] Founder’s Edition release (private, not general availability)
- [ ] Packaging may evolve
- [ ] Small-batch production
- [ ] Expected ship window (Decision 4 finalized)
- [ ] Refund / cancellation policy (Decision 5 finalized)
- [ ] Shipping region (Decision 3 finalized)
- [ ] Support contact (Decision C finalized)
- [ ] Cosmetic disclaimer (not medical advice)
- [ ] Patch-test guidance

---

## Guardrails confirmation

Before Wave 1 activation, confirm all remain true:

- [ ] No public product page for Founder’s Edition
- [ ] No public price on nfebeauty.com
- [ ] No public cart or checkout on nfebeauty.com
- [ ] No hidden product-link campaign
- [ ] No access-controlled private payment page (Phase 2B deferred)
- [ ] No automated invite blast without Vanessa wave approval
- [ ] No discount / sale / drop language

---

## Approval block

| Role | Name | Date | Signature / approval |
|------|------|------|----------------------|
| Founder | Vanessa McCaleb | | |
| Ops / technical readiness | | | |

**Sheet status:** ☐ Draft · ☐ Complete · ☐ **APPROVED FOR WAVE 1 ACTIVATION**

**Next step after approval:** Begin Shopify setup + Supabase `founder_invitations` migration (build phase — not started until explicitly authorized).

---

## Planning record — Founder Access closeout (pending Vanessa)

These items remain on record. They do not block Wave 1 planning, but should be confirmed before scaling Founder Access traffic.

### 1. Beehiiv dashboard confirmation (Vanessa)

Production sync works when newsletter consent is checked. Vanessa should visually confirm these custom fields exist in the Beehiiv dashboard:

- First Name
- Last Name
- Phone Number
- Product Interest
- Primary Skin Interest
- Topic Request
- Signup Date
- Consent Status
- Source Page
- High Intent

**Do not assume dashboard fields are complete unless Vanessa confirms them.**

### 2. Supabase dashboard confirmation (Vanessa)

Behavioral RLS verification passed. Vanessa should visually confirm `founder_access_signups`:

- RLS enabled
- Only one `service_role` policy
- No `anon` policy
- No `authenticated` policy

### 3. Inbox tone check (Vanessa)

Founder Access confirmation email is technically working. Vanessa should submit one real test and read the email in an actual inbox to confirm tone feels NFE: private, warm, restrained, founder-led, and not generic.

### 4. `/subscribe` redirect — strategic change

**Original decision:** Keep `/subscribe` separate for a simple email-only Private List path.

**Deployed behavior:** `/subscribe` redirects to `/founder-access`.

**Status:** Acceptable now that Founder Access is live and stable. Documented here as an **intentional strategic change**, not an accidental routing change.

### 5. Founder Access rate limit — monitor after first wave

The 3/hour per-IP limit on `/api/founder-access` may be strict during public traffic waves. **No change now.** Flag for review after the first real Founder Access traffic wave.

