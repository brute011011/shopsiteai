import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { siteLimit } from "@/lib/pricing";
import { useProfile } from "./use-profile";

export function useSites() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("sites").select("id,name,published,updated_at").eq("user_id", u.user!.id).order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSite() {
  const profile = useProfile();
  const sites = useSites();
  const qc = useQueryClient();
  const navigate = useNavigate();
  return async (opts: { name?: string; html?: string; prompt?: string } = {}) => {
    const limit = siteLimit(profile.data?.plan ?? "free");
    if ((sites.data?.length ?? 0) >= limit) { toast.error(`Your plan allows ${limit} website${limit > 1 ? "s" : ""}. Upgrade in Settings for more.`); return false; }
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("sites").insert({ user_id: u.user!.id, name: opts.name ?? "My website", html: opts.html ?? "" }).select("id").single();
    if (error) { toast.error("Couldn't create the website"); return false; }
    qc.invalidateQueries({ queryKey: ["sites"] });
    navigate({ to: "/sites/$id", params: { id: data.id }, search: opts.prompt ? { prompt: opts.prompt } : {} });
    return true;
  };
}
