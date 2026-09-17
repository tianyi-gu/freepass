-- Official-source corrections checked 2026-09-17. No guessed facts.
-- Field-level evidence is in docs/audit/verified-content-changes.md.
begin;
do $$
declare affected integer;
begin
update public.resources set website = 'https://pacareerlinkphl.org/contact-us/'
where id in ('077283af-8f46-46a0-9f48-e3e870bfec7b', '7bb008c8-daad-480c-be7f-816b9c992b5b', 'bd3c1f9c-381a-4f19-98e1-b2e7827be69b');
get diagnostics affected = row_count;
if affected <> 3 then raise exception 'Content correction 1: expected 3 rows, got %', affected; end if;
update public.resources set address = '5548 Chestnut Street, Suite 101, Philadelphia, PA 19139', zip_code = '19139', latitude = null, longitude = null
where id = 'bd3c1f9c-381a-4f19-98e1-b2e7827be69b';
get diagnostics affected = row_count;
if affected <> 1 then raise exception 'Content correction 2: expected 1 rows, got %', affected; end if;
update public.resources set website = 'https://www.hhinc.org/behavioral-health-services/employment-and-education-services/'
where id = '9fd8140b-896f-475b-8c35-24d262c12e48';
get diagnostics affected = row_count;
if affected <> 1 then raise exception 'Content correction 3: expected 1 rows, got %', affected; end if;
update public.resources set website = 'https://www.helpathome.com/location-finder/philadelphia/', phone = '267-866-7526',
  description = 'Help at Home provides in-home care and support services. Contact the Philadelphia office to ask about services, costs, and eligibility.',
  tags = array['Home Care', 'Support Services']
where id = 'f66ee77d-d606-45ae-a3b3-2179df521c28';
get diagnostics affected = row_count;
if affected <> 1 then raise exception 'Content correction 4: expected 1 rows, got %', affected; end if;
update public.courses set web_link = 'https://playmoneysmart.fdic.gov/', description = 'Free financial education games from the FDIC.'
where id = '5b3ee275-1d78-496d-94f5-2361565561c0';
get diagnostics affected = row_count;
if affected <> 1 then raise exception 'Content correction 5: expected 1 rows, got %', affected; end if;
-- Inconsistent name/address/website could not be tied to an official source.
-- Preserve the row as a draft for staff verification before republishing.
update public.resources set is_published = false where id = '768d6170-1c9a-4233-ac78-cd0e0fa1a4b5';
get diagnostics affected = row_count;
if affected <> 1 then raise exception 'Content correction 6: expected 1 rows, got %', affected; end if;
end $$;
commit;
