import type { ISourceOptions } from "@tsparticles/engine";
import Particles from "@tsparticles/react";
import { Sparkle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const baseOptions: ISourceOptions = {
  key: "star",
  name: "Star",
  particles: {
    number: { value: 20, density: { enable: false } },
    color: {
      value: ["#818cf8", "#a5b4fc", "#a855f7", "#c4b5fd", "#6366f1", "#e0e7ff", "#7c3aed"],
    },
    shape: {
      type: "star",
      options: { star: { sides: 4 } },
    },
    opacity: { value: 0.8 },
    size: { value: { min: 1, max: 4 } },
    rotate: {
      value: { min: 0, max: 360 },
      enable: true,
      direction: "clockwise",
      animation: { enable: true, speed: 10, sync: false },
    },
    links: { enable: false },
    reduceDuplicates: true,
    move: { enable: true, center: { x: 120, y: 45 } },
  },
  interactivity: { events: {} },
  smooth: true,
  fpsLimit: 120,
  background: { color: "transparent", size: "cover" },
  fullScreen: { enable: false },
  detectRetina: true,
  absorbers: [
    {
      enable: true,
      opacity: 0,
      size: { value: 1, density: 1, limit: { radius: 5, mass: 5 } },
      position: { x: 110, y: 45 },
    },
  ],
  emitters: [
    {
      autoPlay: true,
      fill: true,
      life: { wait: true },
      rate: { quantity: 5, delay: 0.5 },
      position: { x: 110, y: 45 },
    },
  ],
};

interface AiButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function AiButton({ onClick, disabled, children = "AI 면접 시작" }: AiButtonProps) {
  const [isReady, setIsReady] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const options = useMemo<ISourceOptions>(
    () => ({ ...baseOptions, autoPlay: isHovering && !disabled }),
    [isHovering, disabled]
  );

  const particlesLoaded = useCallback(async () => {
    setIsReady(true);
  }, []);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group/ai relative w-full rounded-full bg-linear-to-r from-indigo-300/30 via-indigo-500/30 via-40% to-violet-500/30 p-1 text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-indigo-400 via-indigo-500 via-40% to-violet-500 px-4 py-3.5 text-white">
        <Sparkle className="size-5 -translate-y-0.5 animate-sparkle fill-white" />
        <Sparkle
          style={{ animationDelay: "1s" }}
          className="absolute bottom-2.5 left-4 z-20 size-2 rotate-12 animate-sparkle fill-white"
        />
        <Sparkle
          style={{ animationDelay: "1.5s", animationDuration: "2.5s" }}
          className="absolute left-6 top-2.5 size-1 -rotate-12 animate-sparkle fill-white"
        />
        <Sparkle
          style={{ animationDelay: "0.5s", animationDuration: "2.5s" }}
          className="absolute left-4 top-3 size-1.5 animate-sparkle fill-white"
        />
        <span className="font-semibold text-[15px]">{children}</span>
      </div>
      <Particles
        id="ai-btn-particles"
        className={`pointer-events-none absolute -bottom-4 -left-4 -right-4 -top-4 z-0 opacity-0 transition-opacity ${
          isReady ? "group-hover/ai:opacity-100" : ""
        }`}
        particlesLoaded={particlesLoaded}
        options={options}
      />
    </button>
  );
}
