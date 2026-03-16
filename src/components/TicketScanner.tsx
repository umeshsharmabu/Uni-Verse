import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import * as db from "@/lib/localDb";
import { useApp } from "@/contexts/AppContext";
import { X, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LocalEvent } from "@/lib/localDb";

interface Props {
  event: LocalEvent;
  onClose: () => void;
}

type ScanResult = {
  status: "valid" | "invalid" | "already_scanned";
  message: string;
  attendeeName?: string;
} | null;

export default function TicketScanner({ event, onClose }: Props) {
  const { userId } = useApp();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [result, setResult] = useState<ScanResult>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        scanner.pause();
        setScanning(false);

        const ticketId = decodedText.replace("campusdistrict://ticket/", "");

        const reg = db.getRegistrationWithProfile(ticketId, event.id);
        if (!reg) {
          setResult({ status: "invalid", message: "Ticket not found for this event" });
          return;
        }

        const existingScans = db.getScans(event.id, ticketId);
        if (existingScans.length > 0) {
          setResult({ status: "already_scanned", message: "This ticket has already been scanned" });
          return;
        }

        db.createScan({
          event_id: event.id,
          ticket_id: ticketId,
          scanned_by: userId || null,
        });

        setResult({ status: "valid", message: "Entry confirmed!", attendeeName: reg.profileName });
      },
      () => {}
    ).catch(console.error);

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [event.id, userId]);

  const resetScanner = () => {
    setResult(null);
    setScanning(true);
    scannerRef.current?.resume();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <h2 className="text-lg font-bold font-heading">Scan Tickets</h2>
          <p className="text-xs text-muted-foreground">{event.title}</p>
        </div>
        <button onClick={onClose} className="rounded-full bg-secondary p-2">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-secondary">
          <div id="qr-reader" className="w-full h-full" />
          {scanning && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ border: "3px solid hsl(var(--primary))", borderRadius: "1rem" }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`mt-6 w-full max-w-sm rounded-2xl p-5 text-center ${
                result.status === "valid"
                  ? "bg-success/20"
                  : result.status === "already_scanned"
                  ? "bg-warning/20"
                  : "bg-destructive/20"
              }`}
            >
              {result.status === "valid" && (
                <CheckCircle className="mx-auto h-10 w-10 text-success mb-2" />
              )}
              {result.status === "invalid" && (
                <XCircle className="mx-auto h-10 w-10 text-destructive mb-2" />
              )}
              {result.status === "already_scanned" && (
                <AlertTriangle className="mx-auto h-10 w-10 text-warning mb-2" />
              )}

              {result.attendeeName && (
                <p className="text-lg font-bold font-heading">{result.attendeeName}</p>
              )}
              <p className="text-sm text-muted-foreground">{result.message}</p>

              <Button
                onClick={resetScanner}
                className="mt-4 gradient-primary rounded-xl text-primary-foreground"
              >
                Scan Next
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
