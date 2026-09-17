# Source-based directory corrections

Checked 2026-09-17. SQL: `scripts/verified-content-fixes.sql`. This document records field-level checks; it does not certify eligibility, current vacancies, or every field in a listing.

| Entry | Finding and correction | Official source |
| --- | --- | --- |
| PA CareerLink North, Suburban Station, West | Replace dead statewide website URL with Philadelphia center contacts. Existing North/Suburban phone and address match. | https://pacareerlinkphl.org/contact-us/ |
| PA CareerLink West | Old 3901 Market Street address is obsolete. Current location is 5548 Chestnut Street, Suite 101, Philadelphia PA 19139. Clear old coordinates rather than invent coordinates. | https://pacareerlinkphl.org/contact-us/ and https://pacareerlinkphl.org/wp-content/uploads/2026/03/PACL-West-Move-FAQ-FINAL-2-24.pdf |
| Horizon House Supported Employment | Replace dead About page with the organization's employment services page. | https://www.hhinc.org/behavioral-health-services/employment-and-education-services/ |
| Help at Home | Philadelphia office site lists 267-866-7526. Replace unsupported conflation with Pennsylvania's OPTIONS program with general in-home care description, and remove unrelated homelessness tag. Hours and eligibility still need confirmation. | https://www.helpathome.com/location-finder/philadelphia/ and https://www.helpathome.com/pennsylvania/ |
| Money Smart | URL had been imported as description, leaving no actionable course link. Use the actual FDIC learning platform. | https://playmoneysmart.fdic.gov/ |
| Cordelia Homes | No official source could connect the supplied organization name, Philadelphia address, New Jersey phone, and Simple Homes website. Move to draft pending staff confirmation; absence of a search result is not proof the organization does not exist. | Existing imported record; no corroborated source |

The initial scan covers 103 directory rows and 47 course rows in `content-review.csv`. Website HTTP success is not verification of claims. A 403 or timeout is not proof that an organization is closed. Of the 47 courses, 36 were already hidden; 11 were visible. Among visible courses, Money Smart was the only record with no web/video field or tasks, and its description contained the official URL. Hidden content is now also denied by database SELECT policies and direct app routes.
