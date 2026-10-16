# Five Star Real Estate

Real-estate page at https://fivestar.ie/real-estate/.

This repository is separate from Five-Star-International/fivestar.ie. The current `.github/workflows/deploy.yml` deploys pushes to `main` to the production real-estate directory. Feature branches and draft pull requests do not trigger that deployment. Review and approve changes before merging.

## Files and preview

`index.html` and `assets/` contain the static page, CSS, JavaScript and media. No build step or package installation is required to serve the page.

Run `python3 -m http.server 8000` and open http://localhost:8000/.

Reference preview: https://d1qq7f8dtbo6ib.cloudfront.net/previews/fivestar-realty/index.html

## Before publishing

- The popup posts to `/accounts/api/realEstateContact.php`. Verify successful delivery and failure handling against the production endpoint; HTTP acceptance is not evidence of a qualified lead or signed instruction.
- Preserve the approved design, service chooser, county and contact fields, and selected valuation purpose.
- Remove the preview noindex directive only for the production page. Keep staging excluded from indexing.
- Set the production canonical URL to https://fivestar.ie/real-estate/ and verify metadata and business structured data.
- Check asset paths when integrating into the existing website, mobile navigation, popup behaviour, keyboard access and tap-to-call links.
- Check mobile performance, production indexing and completed-enquiry tracking.

## Ownership

Initially created under shanegavin91. It can be transferred to Five-Star-International through GitHub repository Settings > General > Danger Zone > Transfer ownership, subject to organisation permissions. Update local remotes after transfer.

The inherited `favicon.ico` reference should use the production site's favicon during integration; that file is not included in this handover.

## Analytics repair

The 16 October 2026 live inspection found no Google tag or consent initialization on this standalone page, and no analytics events in its enquiry JavaScript. This patch reuses the main site's existing consent assets and GTM container `GTM-5LKD5NV6`; it does not modify that container, Ads campaigns, budgets or conversion goals. The verified GA4 stream is `G-N69L7WZ0NF`, property `255021730`.

`assets/analytics.js` sets consent defaults before loading GTM. Stored analytics and advertising choices remain independent, blocked storage defaults to denied, and production measurement is limited to `fivestar.ie`. GTM remains responsible for its existing GA4 configuration and consent updates; this page does not add another config/page-view command. The consent CSS/JS URLs were verified against the production homepage; keep them aligned when the shared consent UI is versioned.

On an HTTP 2xx JSON form response, the page emits `generate_lead` only with analytics consent and no reported server/validation error. It sends `lead_source=real_estate` and a `lead_type` of `property_sale`, `long_term_letting` or `property_valuation`. It sends no contact details, property addresses or invented monetary value. Failed, malformed, empty or explicit-error responses produce no lead event; repeated completion callbacks are ignored. This records endpoint acceptance, not verified email delivery, lead quality or a completed instruction.

Run `node --test tests/*.test.cjs` (Node 18+). Before declaring tracking fixed, use Tag Assistant to verify the existing consent UI/container on this page, correct production GA4 delivery and no duplicate page views. With an explicitly authorised test enquiry, confirm receipt in the real enquiry system and one matching event after success; test a server failure too. Register the `lead_source`/`lead_type` event parameters as GA4 custom dimensions if needed for reports. Any Ads import or primary-goal changes require a separate reviewed decision.
