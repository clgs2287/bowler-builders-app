create or replace view public.public_app_settings as
select
  id,
  case
    when id = 'reservation_state' then
      (value - 'reservationsByTournament' - 'reservations' - 'publicReservations') ||
      jsonb_build_object(
        'reservations', '[]'::jsonb,
        'publicReservations', '[]'::jsonb,
        'reservationsByTournament',
        coalesce(
          (
            select jsonb_object_agg(
              tournament_key,
              jsonb_build_object(
                'entriesOpen', coalesce(tournament_bucket->'entriesOpen', 'false'::jsonb),
                'tournamentName', coalesce(tournament_bucket->'tournamentName', '""'::jsonb),
                'tournamentDate', coalesce(tournament_bucket->'tournamentDate', '""'::jsonb),
                'tournamentStartTime', coalesce(tournament_bucket->'tournamentStartTime', '""'::jsonb),
                'tournamentCenter', coalesce(tournament_bucket->'tournamentCenter', '""'::jsonb),
                'tournamentAddress', coalesce(tournament_bucket->'tournamentAddress', '""'::jsonb),
                'reservationLimit', coalesce(tournament_bucket->'reservationLimit', '48'::jsonb),
                'reservationCount', coalesce(tournament_bucket->'reservationCount', '0'::jsonb),
                'publicTournamentInfo', coalesce(tournament_bucket->'publicTournamentInfo', 'null'::jsonb),
                'reservations', '[]'::jsonb,
                'publicReservations', '[]'::jsonb
              )
            )
            from jsonb_each(coalesce(value->'reservationsByTournament', '{}'::jsonb)) as reservation_bucket(tournament_key, tournament_bucket)
          ),
          '{}'::jsonb
        )
      )
    else value
  end as value
from public.app_settings
where id in ('schedule_locked', 'reservation_state');

grant select on public.public_app_settings to anon, authenticated;
