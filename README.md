# Five Star Real Estate

Approved real-estate page preview for Pete to integrate and publish at https://fivestar.ie/real-estate/.

This is a standalone handover repository. It does not modify or deploy Five-Star-International/fivestar.ie. No automated deployment is configured.

## Files and preview

`site/` contains the approved static page, CSS, JavaScript, Five Star logo and Donnybrook Gardens photograph, copied from the AWS preview. No build step or package installation is required.

Run `python3 -m http.server 8000 --directory site` and open http://localhost:8000/.

Reference preview: https://d1qq7f8dtbo6ib.cloudfront.net/previews/fivestar-realty/index.html

## Before publishing

- Connect the popup enquiry form to the real enquiry system. The current form is demonstration-only and does not send enquiries. Test successful delivery and failure handling.
- Preserve the approved design, service chooser, county and contact fields, and selected valuation purpose.
- Remove the preview noindex directive only for the production page. Keep staging excluded from indexing.
- Set the production canonical URL to https://fivestar.ie/real-estate/ and verify metadata and business structured data.
- Check asset paths when integrating into the existing website, mobile navigation, popup behaviour, keyboard access and tap-to-call links.
- Check mobile performance, production indexing and completed-enquiry tracking.

## Ownership

Initially created under shanegavin91. It can be transferred to Five-Star-International through GitHub repository Settings > General > Danger Zone > Transfer ownership, subject to organisation permissions. Update local remotes after transfer.

The inherited `favicon.ico` reference should use the production site's favicon during integration; that file is not included in this handover.
