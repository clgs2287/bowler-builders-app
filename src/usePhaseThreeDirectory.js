import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { normalizeDirectoryName, validateCenter } from "./reservationEligibility";

export function usePhaseThreeDirectory(adminId) {
  const table = "bowling_centers";
  const [rows, setRows] = useState([]);
  const [load, setLoad] = useState(null);

  useEffect(() => {
    if (!adminId || !supabase) return;
    let current = true;
    supabase.from(table).select("*").order("name").then(({ data, error }) => {
      if (!current) return;
      if (error) setLoad({ adminId, status: "This directory is unavailable. Check that the Phase 3 migration is installed." });
      else {
        setRows(data);
        setLoad({ adminId, status: "" });
      }
    });
    return () => { current = false; };
  }, [adminId, table]);

  const loaded = Boolean(adminId) && load?.adminId === adminId && !load.status;
  const status = load?.adminId === adminId ? load?.status : "";
  const save = async (id, draft) => {
    if (!loaded || !supabase) throw new Error(status || "Sign in as a tournament administrator first.");
    const values = validateCenter(draft);
    if (rows.some((row) => row.id !== id && normalizeDirectoryName(row.name) === normalizeDirectoryName(values.name))) {
      throw new Error("That name is already in the directory. Edit or reactivate the existing record.");
    }
    const query = id ? supabase.from(table).update(values).eq("id", id) : supabase.from(table).insert(values);
    const { data, error } = await query.select().single();
    if (error?.code === "23505") throw new Error("That name is already in the directory. Edit or reactivate the existing record.");
    if (error) throw new Error(error.message || "The record could not be saved.");
    setRows((current) => [...current.filter((row) => row.id !== data.id), data].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  };

  return { rows: loaded ? rows : [], status, loaded, enabled: Boolean(adminId), save };
}
