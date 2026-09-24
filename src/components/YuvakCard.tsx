import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { telHref, waHref, formatMobileDisplay } from "@/services/phoneService";
import { logFollowup } from "@/services/followupService";
import { useSettings } from "@/hooks/useQueries";
import type { Yuvak } from "@/types";
import { motion } from "framer-motion";
import { MoreVertical, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

export function YuvakCard({
  yuvak,
  groupId,
  leaderName,
  status,
  onStatusChange,
}: {
  yuvak: Yuvak;
  groupId: string;
  leaderName: string;
  status?: string;
  onStatusChange?: (status: string) => void;
}) {
  const { data: settings } = useSettings();
  const tel = telHref(yuvak.mobile);
  const wa = waHref(yuvak.mobile, settings?.reminderMessage ?? "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-saffron-soft font-semibold text-maroon">
          {yuvak.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{yuvak.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{yuvak.studyJob || "—"}</p>
          <p className="mt-0.5 font-numeric text-xs text-muted-foreground">
            {formatMobileDisplay(yuvak.mobile)}
          </p>
        </div>
        <div className="-mt-1 -mr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Status</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {["Coming", "Not Coming", "Maybe", "Call Not Received"].map((opt) => (
                <DropdownMenuItem
                  key={opt}
                  className="flex items-center justify-between"
                  onClick={() => onStatusChange?.(opt)}
                >
                  {opt}
                  {status === opt && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {yuvak.mobile ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            asChild
            variant="outline"
            className="h-11 border-saffron/40 text-saffron hover:bg-saffron-soft hover:text-saffron-deep"
            onClick={() => void logFollowup(yuvak.id, groupId, leaderName, "call")}
          >
            <a href={tel!} aria-label={`Call ${yuvak.name}`}>
              <Phone className="mr-1.5 h-4 w-4" /> Call
            </a>
          </Button>
          <Button
            asChild
            className="h-11 bg-success text-white hover:bg-success/90"
            onClick={() => void logFollowup(yuvak.id, groupId, leaderName, "whatsapp")}
          >
            <a href={wa!} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${yuvak.name}`}>
              <WhatsAppIcon className="mr-1.5 h-4 w-4" /> WhatsApp
            </a>
          </Button>
        </div>
      ) : (
        <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-center text-xs font-medium text-danger">
          Mobile number not available
        </p>
      )}
    </motion.div>
  );
}
