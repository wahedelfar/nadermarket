import { useEffect, useState } from "react";
import { Download, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const WELCOME_SEEN_KEY = "nader-market-welcome-seen";

function isStandaloneApp() {
  return window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

export default function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = isStandaloneApp();
    setIsStandalone(standalone);

    if (standalone && !sessionStorage.getItem(WELCOME_SEEN_KEY)) {
      setShowWelcome(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallEvent(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismissWelcome = () => {
    sessionStorage.setItem(WELCOME_SEEN_KEY, "1");
    setShowWelcome(false);
  };

  const handleInstall = async () => {
    if (!installEvent) return;

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    if (choice.outcome === "accepted") {
      setInstallEvent(null);
      setIsStandalone(true);
    }
  };

  return (
    <>
      {!isStandalone && installEvent && (
        <div className="fixed bottom-5 right-4 z-[60] sm:right-6">
          <Button
            type="button"
            onClick={handleInstall}
            className="group rounded-full border border-white/30 bg-gradient-to-l from-blue-700 via-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-blue-900/25 transition duration-200 hover:-translate-y-1 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-cyan-200 active:scale-95"
            aria-label="تثبيت الوحيد ماركت كتطبيق"
          >
            <Download className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" aria-hidden="true" />
            ثبّت التطبيق
          </Button>
        </div>
      )}

      {showWelcome && isStandalone && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-blue-950/60 px-5 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="pwa-welcome-title" className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-600 p-7 text-center text-white shadow-2xl">
            <button type="button" onClick={dismissWelcome} className="absolute left-3 top-3 rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="إغلاق">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
              <Sparkles className="h-8 w-8 text-amber-200" aria-hidden="true" />
            </div>
            <p className="mb-2 text-sm font-semibold text-cyan-100">تجربة تسوّق أذكى وأسرع</p>
            <h2 id="pwa-welcome-title" className="mb-3 text-3xl font-extrabold">أهلاً بك في الوحيد ماركت</h2>
            <p className="mb-6 leading-7 text-blue-50">يسعدنا وجودك معنا. كل احتياجاتك اليومية أصبحت أقرب إليك، بجودة نثق بها وتوصيل سريع إلى باب منزلك.</p>
            <Button type="button" onClick={dismissWelcome} className="w-full rounded-xl bg-white py-3 font-bold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50 active:scale-[0.98]">ابدأ التسوق</Button>
          </div>
        </div>
      )}
    </>
  );
}
