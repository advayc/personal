import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import SiteLayout from "@/components/SiteLayout";
import { Microcontroller } from "@/components/systems/Electronics";
import { Chronograph, MaglevCube } from "@/components/systems/Mechanics";
import { Planetary } from "@/components/systems/PlanetaryGearbox";
import { PidController } from "@/components/systems/PidController";
import { KalmanFilter } from "@/components/systems/KalmanFilter";
const GpuFigure = dynamic(() => import("@/components/anatomy/GpuFigure"), {
  ssr: false,
});
function Study({
  id,
  title,
  sentence,
  children,
}: {
  id: string;
  title: string;
  sentence: string;
  children: ReactNode;
}) {
  return (
    <section className="system-study" id={id} aria-labelledby={`${id}-title`}>
      <div className="system-drawing">{children}</div>
      <div className="system-copy">
        <h2 id={`${id}-title`}>{title}</h2>
        <p>{sentence}</p>
      </div>
    </section>
  );
}
export default function Systems() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const sync = () =>
      setLight(
        ["white", "cream"].includes(
          document.documentElement.dataset.background || "",
        ),
      );
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-background"],
    });
    return () => observer.disconnect();
  }, []);
  return (
    <SiteLayout
      title="systems i find interesting"
      wide
      description="Interactive studies of circuits, watches, gears, PID control, and Kalman filtering."
    >
      <header className="page-intro">
        <h1>systems i find interesting.</h1>
      </header>
      <div
        className="systems-gallery iso"
        data-theme={light ? "paper" : undefined}
      >
        <Study
          id="atmega"
          title="ATmega128"
          sentence="An eight-bit register, made visible one pin at a time."
        >
          <Microcontroller />
        </Study>
        <Study
          id="cube"
          title="X-Man Tornado V3 MagLev"
          sentence="A study of the Pioneer’s magnetic alignment and spring-free tensioning."
        >
          <MaglevCube />
        </Study>
        <Study
          id="chronograph"
          title="Chronograph"
          sentence="A running movement, a clutch, and a stopwatch you can take apart."
        >
          <Chronograph />
        </Study>
        <Study
          id="planetary"
          title="Planetary gearbox"
          sentence="One set of gears; three ways to hold, drive, and take power out."
        >
          <Planetary />
        </Study>
        <Study
          id="pid"
          title="PID controller"
          sentence="Three gains shape how a motor follows a target."
        >
          <PidController />
        </Study>
        <Study
          id="kalman"
          title="Kalman filter"
          sentence="A moving estimate balances sensor noise against motion uncertainty."
        >
          <KalmanFilter />
        </Study>
        <Study
          id="gpu"
          title="GPU"
          sentence="A small factory showing how parallel work fills a frame."
        >
          <div className="legacy-system">
            <GpuFigure theme={light ? "paper" : "dark"} />
          </div>
        </Study>
      </div>
    </SiteLayout>
  );
}
