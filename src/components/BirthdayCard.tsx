import { Cake, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { waHref, formatMobileDisplay } from "@/services/phoneService";
import { logFollowup } from "@/services/followupService";
import { useSettings } from "@/hooks/useQueries";
import type { Yuvak, Group } from "@/types";
import { motion } from "framer-motion";

export function BirthdayCard({
  yuvak,
  group,
  groupId,
  leaderName,
}: {
  yuvak: Yuvak;
  group?: Group;
  groupId?: string;
  leaderName?: string;
}) {
  const { data: settings } = useSettings();
  const wa = waHref(yuvak.mobile, settings?.birthdayMessage ?? "");
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-[#FFF9F0] to-[#FFF3E0] p-4 shadow-sm"
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold/15" />
      <div className="relative flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/20 text-maroon">
          <Cake className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-maroon">Birthday today</p>
          <p className="mt-0.5 truncate font-semibold text-foreground">{yuvak.name}</p>
          <p className="text-xs text-muted-foreground">
            {group?.leaderName ? `Group: ${group.leaderName}` : ""}
          </p>
          <p className="font-numeric text-xs text-muted-foreground">
            {formatMobileDisplay(yuvak.mobile)}
          </p>
        </div>
      </div>
      {wa ? (
        <Button
          asChild
          className="mt-3 h-11 w-full bg-success text-white hover:bg-success/90"
          onClick={() =>
            groupId &&
            leaderName &&
            void logFollowup(yuvak.id, groupId, leaderName, "birthday_whatsapp")
          }
        >
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            aria-label={`Send birthday wish to ${yuvak.name}`}
          >
            <MessageCircle className="mr-1.5 h-4 w-4" /> Send Birthday Wish
          </a>
        </Button>
      ) : (
        <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-center text-xs font-medium text-danger">
          Mobile number not available
        </p>
      )}
    </motion.div>
  );
}
