"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WelcomeScreen() {
  const router = useRouter();

  const [displayedText, setDisplayedText] = useState("");
  const [phase, setPhase] = useState<"typing1" | "blinking" | "typing2" | "done">("typing1");
  const [showLogo, setShowLogo] = useState(false);

  const full1 = "Empower the ";
  const highlight = "Player.";
  const full2 = " Elevate the Game.";

  useEffect(() => {
    if (phase === "typing1") {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(full1.slice(0, i + 1));
        i++;
        if (i === full1.length) {
          clearInterval(interval);
          setPhase("blinking");
        }
      }, 50);
      return () => clearInterval(interval);
    }

    if (phase === "blinking") {
      setDisplayedText(full1 + highlight); // set full line
      const timer = setTimeout(() => setPhase("typing2"), 1500);
      return () => clearTimeout(timer);
    }

    if (phase === "typing2") {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(full1 + highlight + full2.slice(0, i + 1));
        i++;
        if (i === full2.length) {
          clearInterval(interval);
          setPhase("done");
          setTimeout(() => setShowLogo(true), 400);
          setTimeout(() => router.push("/protected/test-dashboard"), 2500);
        }
      }, 45);
      return () => clearInterval(interval);
    }
  }, [phase, router, full1, highlight, full2]);

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-black text-white text-center px-4">
      <h1 className="relative z-10 text-2xl md:text-3xl font-semibold tracking-wide mb-4 h-10">
        {phase === "typing1" && (
          <>
            <span>{displayedText}</span>
            <span className="animate-pulse">|</span>
          </>
        )}
        {phase === "blinking" && (
          <>
            <span>{full1}</span>
            <span className="text-gold">{highlight}</span>
            <span className="animate-pulse">|</span>
          </>
        )}
        {phase === "typing2" && (
          <>
            <span>{full1}</span>
            <span className="text-gold">{highlight}</span>
            <span>{displayedText.substring((full1 + highlight).length)}</span>
            <span className="animate-pulse">|</span>
          </>
        )}
        {phase === "done" && (
          <>
            <span>{full1}</span>
            <span className="text-gold">{highlight}</span>
            <span>{full2}</span>
          </>
        )}
      </h1>

      {showLogo && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-96 bg-[url('/maxsM.png')] bg-contain bg-center bg-no-repeat opacity-80 translate-y-16" />
        </div>
      )}
    </div>
  );
} 