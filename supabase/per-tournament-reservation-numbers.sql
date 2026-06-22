create or replace function public.create_public_reservation(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  next_id text := coalesce(nullif(payload->>'id', ''), gen_random_uuid()::text);
  next_tournament_id text := coalesce(nullif(payload->>'tournamentKey', ''), nullif(payload->>'tournament', ''), '');
  next_name text := lower(trim(coalesce(payload->>'name', '')));
  next_nickname text := lower(trim(coalesce(payload->>'nickname', '')));
  next_email text := lower(trim(coalesce(payload->>'email', '')));
  current_max_number integer := 0;
  next_number integer := 1;
  next_data jsonb;
begin
  if next_tournament_id = '' then
    raise exception 'Tournament is required.';
  end if;

  if next_name = '' and next_nickname = '' and next_email = '' then
    raise exception 'Reservation name or email is required.';
  end if;

  if exists (
    select 1
    from public.reservations
    where tournament_id = next_tournament_id
      and (
        (next_name <> '' and lower(trim(coalesce(name, ''))) = next_name)
        or (next_name <> '' and lower(trim(coalesce(data->>'name', ''))) = next_name)
        or (next_nickname <> '' and lower(trim(coalesce(data->>'nickname', ''))) = next_nickname)
      )
  ) then
    raise exception 'This bowler is already on the reservation list.';
  end if;

  select coalesce(max(greatest(
    case when coalesce(data->>'registrationNumber', '') ~ '^[0-9]+$' then (data->>'registrationNumber')::integer else 0 end,
    case when coalesce(data->>'confirmationNumber', '') ~ '^[0-9]+$' then (data->>'confirmationNumber')::integer else 0 end
  )), 0)
  into current_max_number
  from public.reservations
  where tournament_id = next_tournament_id;

  next_number := greatest(current_max_number + 1, 1);
  next_data := payload || jsonb_build_object(
    'id', next_id,
    'tournamentKey', next_tournament_id,
    'registrationNumber', next_number,
    'confirmationNumber', next_number
  );

  insert into public.reservations (id, data, tournament_id, name, email, phone, added_to_roster)
  values (
    next_id,
    next_data,
    next_tournament_id,
    coalesce(nullif(payload->>'nickname', ''), nullif(payload->>'name', ''), ''),
    coalesce(payload->>'email', ''),
    coalesce(payload->>'phone', ''),
    false
  );

  return next_data;
end;
$$;

grant execute on function public.create_public_reservation(jsonb) to anon, authenticated;
