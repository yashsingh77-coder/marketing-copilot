-- Daily streak tracking. Called once per app load; idempotent within a day.
create or replace function public.touch_streak()
returns table (streak_days integer, xp integer, is_new_day boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_last date;
  v_streak integer;
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  v_new boolean := false;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select p.last_active_on, p.streak_days into v_last, v_streak
  from public.profiles p where p.id = v_uid;

  if v_last is distinct from v_today then
    v_new := true;
    if v_last = v_today - 1 then
      v_streak := coalesce(v_streak, 0) + 1;
    else
      v_streak := 1;
    end if;
    update public.profiles
    set last_active_on = v_today, streak_days = v_streak
    where id = v_uid;

    -- small daily XP for showing up
    insert into public.xp_events (user_id, amount, reason) values (v_uid, 5, 'daily_streak');
    update public.profiles set xp = profiles.xp + 5 where id = v_uid;
  end if;

  return query
    select p.streak_days, p.xp, v_new from public.profiles p where p.id = v_uid;
end $$;
