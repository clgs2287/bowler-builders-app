update public.app_settings
set value =
  jsonb_set(
    jsonb_set(
      value,
      '{openTournamentKeys}',
      coalesce(
        (
          select jsonb_agg(open_key)
          from jsonb_array_elements_text(coalesce(value->'openTournamentKeys', '[]'::jsonb)) as keys(open_key)
          where coalesce(nullif(split_part(open_key, '|', 2), ''), '9999-12-31')::date > current_date
        ),
        '[]'::jsonb
      ),
      true
    ),
    '{reservationsByTournament}',
    coalesce(
      (
        select jsonb_object_agg(
          tournament_key,
          case
            when coalesce(nullif(tournament_bucket->>'tournamentDate', ''), nullif(split_part(tournament_key, '|', 2), ''), '9999-12-31')::date <= current_date
              then jsonb_set(tournament_bucket, '{entriesOpen}', 'false'::jsonb, true)
            else tournament_bucket
          end
        )
        from jsonb_each(coalesce(value->'reservationsByTournament', '{}'::jsonb)) as buckets(tournament_key, tournament_bucket)
      ),
      '{}'::jsonb
    ),
    true
  ) || jsonb_build_object(
    'entriesOpen',
    case
      when coalesce(nullif(value->>'tournamentDate', ''), '9999-12-31')::date <= current_date then false
      else coalesce((value->>'entriesOpen')::boolean, false)
    end
  )
where id = 'reservation_state';

select public.refresh_public_app_settings('reservation_state');
