-- The public site never inserts enquiries with the anon key: POST /api/enquiries
-- (and /api/events/notify) validate, rate-limit and then insert with the
-- service-role client. The original public INSERT policy therefore only
-- offers a bypass: anyone holding the (public) anon key could write unvalidated
-- rows straight to the REST API. Drop it; service-role inserts are unaffected.
drop policy if exists "Public insert enquiries" on public.enquiries;
