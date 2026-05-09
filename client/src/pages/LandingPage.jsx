import { useEffect, useRef, useState } from "react";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Section from "../components/ui/Section.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import heroBanner from "../assets/hero banner.webp";
import medicinesBg from "../assets/medicines.jpg";
import offerTwo from "../assets/offer 2.jpg";
import offerThree from "../assets/offer 3.avif";
import offerNewOne from "../assets/offer new 1.jpeg";
import offerNewTwo from "../assets/offer new 2.jpeg";
import offerNewThree from "../assets/offer new 3.jpeg";
import offerNewFour from "../assets/offer new 4.jpeg";
import med2 from "../assets/med2.png";
import med3 from "../assets/med3.png";
import painManagementIcon from "../assets/pain management.jpg";
import antibioticsIcon from "../assets/antibiotcs.webp";
import cardiologyIcon from "../assets/cardiology.jpg";
import diabetesIcon from "../assets/diabeties.webp";
import dermatologyIcon from "../assets/dermatology.webp";
import respiratoryIcon from "../assets/respiratory.webp";
import video1 from "../assets/video1.mp4";
import video2 from "../assets/video2.mp4";
import video3 from "../assets/video3.mp4";
import video4 from "../assets/video4.mp4";

const impactCards = [
  {
    title: "Integrity-first sourcing",
    description: "We partner only with compliant manufacturers and verified distributors.",
    type: "video",
    media: video1,
  },
  {
    title: "Quality without compromise",
    description: "Every batch is backed by documentation, audits, and cold-chain assurance.",
    type: "image",
    media: offerTwo,
  },
  {
    title: "Global scale, local speed",
    description: "Nationwide distribution with predictable lead times and proactive tracking.",
    type: "video",
    media: video2,
  },
  {
    title: "Innovation in care",
    description: "Therapeutic coverage across chronic and acute care segments.",
    type: "image",
    media: offerThree,
  },
];

const therapeuticAreas = [
  { name: "Pain Management", icon: painManagementIcon },
  { name: "Antibiotics", icon: antibioticsIcon },
  { name: "Cardiometabolic", icon: cardiologyIcon },
  { name: "Diabetes Care", icon: diabetesIcon },
  { name: "Dermatology", icon: dermatologyIcon },
  { name: "Respiratory", icon: respiratoryIcon },
];

const certifications = [
  "WHO aligned quality checks",
  "Good Manufacturing Practice (GMP)",
  "Cold-chain certified logistics",
  "ISO-aligned documentation workflows",
  "Batch traceability and recall readiness",
];

const insights = [
  {
    title: "Inside MedFlow",
    description: "Explore updates, research highlights, and supply chain insights.",
    image: offerNewFour,
  },
  {
    title: "Impact initiatives",
    description: "Programs supporting healthcare access across underserved regions.",
    image: offerNewTwo,
  },
  {
    title: "News & events",
    description: "Track partnerships, certifications, and product launches.",
    image: offerTwo,
  },
];

const stats = [
  { label: "Countries served", value: 45, suffix: "+" },
  { label: "Healthcare partners", value: 8000, suffix: "+" },
  { label: "Avg dispatch", value: 24, suffix: " hrs" },
];

export default function LandingPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeInsight, setActiveInsight] = useState(0);
  const [statValues, setStatValues] = useState(stats.map(() => 0));
  const statsRef = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem("medflow_seen_popup")) return undefined;
    const timer = setTimeout(() => setShowPopup(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      const progress = height > 0 ? Math.min((scrollTop / height) * 100, 100) : 0;
      setScrollProgress(progress);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = showPopup ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPopup]);

  useEffect(() => {
    const target = statsRef.current;
    if (!target) return undefined;
    let started = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started) return;
        started = true;
        const start = performance.now();
        const duration = 1200;

        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          setStatValues(stats.map((stat) => Math.round(stat.value * progress)));
          if (progress < 1) {
            requestAnimationFrame(step);
          }
        };

        requestAnimationFrame(step);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveInsight((prev) => (prev + 1) % insights.length);
    }, 5200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-950 text-slate-100">
      <div
        className="fixed left-0 top-0 z-50 h-1 bg-gradient-to-r from-secondary via-accent to-primary"
        style={{ width: `${scrollProgress}%` }}
      />
      <Navbar />

      <section className="relative overflow-hidden bg-slate-950 pb-12 pt-10">
        <div className="absolute inset-0">
          <img
            src={medicinesBg}
            alt=""
            className="h-full w-full object-cover opacity-55"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/70 to-slate-950" />
          <div className="absolute -right-20 top-8 h-64 w-64 rounded-full bg-secondary/20 blur-3xl float-slow" />
          <div className="absolute -left-20 top-32 h-64 w-64 rounded-full bg-primary/20 blur-3xl float-slower" />
        </div>
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div data-reveal className="reveal">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-secondary">
              The future of medicine
            </p>
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-slate-100 sm:text-5xl">
              We are revolutionising healthcare procurement.
            </h1>
            <p className="mt-4 text-base text-slate-300">
              MedFlow is a research-driven B2B pharma platform with a global outlook. We power trusted
              wholesale procurement for hospitals, pharmacies, and distributor networks across Pakistan.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button>Browse Products</Button>
              <Button variant="outline" onClick={() => setShowPopup(true)}>
                Talk to Sales
              </Button>
            </div>
            <div
              ref={statsRef}
              className="mt-8 grid grid-cols-2 gap-6 text-sm text-slate-300 sm:grid-cols-3"
            >
              {stats.map((stat, index) => (
                <div key={stat.label}>
                  <p className="text-lg font-semibold text-slate-100">
                    {statValues[index].toLocaleString("en-US")}{stat.suffix}
                  </p>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>

          </div>

          <Card data-reveal className="relative overflow-hidden p-6 reveal reveal-delay-2 hover-lift">
            <img
              src={heroBanner}
              alt="Pharmaceutical supply chain"
              className="h-64 w-full rounded-2xl object-cover"
              loading="lazy"
            />
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Verified sourcing</span>
                <span className="font-semibold text-secondary">100% compliant</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Procurement</p>
                  <p className="mt-2 text-sm text-slate-200">Quotes, orders, and reorder shortcuts.</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Visibility</p>
                  <p className="mt-2 text-sm text-slate-200">Live stock, tiered pricing, and audits.</p>
                </div>
              </div>
              <Button className="w-full">Get verified access</Button>
            </div>
          </Card>
        </div>
      </section>

      <div data-reveal className="reveal">
        <Section
          title="We deliver quality medicines with integrity"
          subtitle="Every order is backed by compliance, documentation, and proactive monitoring."
        >
          <div className="grid gap-6 lg:grid-cols-4">
            {impactCards.map((card) => (
              <Card key={card.title} className="overflow-hidden hover-lift">
                <div className="h-40 w-full">
                  {card.type === "video" ? (
                    <video
                      src={card.media}
                      className="h-full w-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={card.media}
                      alt={card.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-100">{card.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{card.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      </div>

      <div data-reveal className="reveal">
        <Section
          title="Innovation in therapeutic areas"
          subtitle="We manufacture and distribute medicines across critical care segments."
        >
          <div className="relative">
            <div className="pointer-events-none absolute right-0 -top-20 hidden md:block translate-x-1/3 -translate-y-1/2">
              <img
                src={med2}
                alt=""
                className="h-28 w-28 rounded-[2rem] object-cover shadow-card pop-bubble grow-slow pop-delay-1 md:h-32 md:w-32 lg:h-40 lg:w-40"
                loading="lazy"
              />
            </div>
            <div className="relative z-0 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {therapeuticAreas.map((area) => (
                <Card key={area.name} className="flex items-center gap-5 p-5 hover-lift">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/60">
                    <img
                      src={area.icon}
                      alt={area.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-100">{area.name}</p>
                    <p className="mt-1 text-xs text-slate-400">120+ listings</p>
                  </div>
                  <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                    Explore
                  </span>
                </Card>
              ))}
            </div>
          </div>
        </Section>
      </div>

      <div data-reveal className="reveal">
        <Section
          title="Supply chain in motion"
          subtitle="A closer look at packing, quality checks, and dispatch operations."
        >
          <div className="relative">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="overflow-hidden hover-lift">
                <div className="h-56 w-full">
                  <video
                    src={video3}
                    className="h-full w-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-100">Packaging assurance</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Automated checks and manual inspections before every shipment.
                  </p>
                </div>
              </Card>
              <Card className="overflow-hidden hover-lift">
                <div className="h-56 w-full">
                  <video
                    src={video4}
                    className="h-full w-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-100">Nationwide dispatch</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Temperature-aware logistics with live shipment tracking.
                  </p>
                </div>
              </Card>
            </div>
            <div className="pointer-events-none absolute left-0 bottom-0 hidden md:block -translate-x-1/3 translate-y-3/4">
              <img
                src={med3}
                alt=""
                className="h-24 w-24 rounded-[2rem] object-cover shadow-card pop-bubble grow-slow pop-delay-2 md:h-28 md:w-28 lg:h-36 lg:w-36"
                loading="lazy"
              />
            </div>
          </div>
        </Section>
      </div>

      <div data-reveal className="reveal">
        <Section title="Global presence" subtitle="Operating across 45+ markets with local supply strength.">
          <Card className="relative overflow-hidden p-8 hover-lift">
            <img
              src={medicinesBg}
              alt="Global coverage"
              className="absolute inset-0 h-full w-full object-cover opacity-20"
              loading="lazy"
            />
            <div className="relative grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Markets</p>
                <p className="mt-3 text-3xl font-semibold text-slate-100">45+</p>
                <p className="mt-2 text-sm text-slate-300">Coverage across APAC, MENA, and Africa.</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Shipments</p>
                <p className="mt-3 text-3xl font-semibold text-slate-100">2,000+</p>
                <p className="mt-2 text-sm text-slate-300">Monthly dispatches with cold-chain handling.</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Response time</p>
                <p className="mt-3 text-3xl font-semibold text-slate-100">24 hrs</p>
                <p className="mt-2 text-sm text-slate-300">Average fulfillment for core SKUs.</p>
              </div>
            </div>
          </Card>
        </Section>
      </div>

      <div data-reveal className="reveal">
        <Section title="Our certifications" subtitle="Global standards and ethical practices at every step.">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certifications.map((item) => (
              <Card key={item} className="p-5 hover-lift">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="material-symbols-rounded text-xl">verified</span>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-100">{item}</p>
                <p className="mt-2 text-xs text-slate-400">Audited and maintained year-round.</p>
              </Card>
            ))}
          </div>
        </Section>
      </div>

      <div data-reveal className="reveal">
        <Section title="Inside MedFlow" subtitle="Stories, research, and updates from our network.">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700"
              style={{ transform: `translateX(-${activeInsight * 100}%)` }}
            >
              {insights.map((card) => (
                <div key={card.title} className="w-full shrink-0 px-2">
                  <Card className="overflow-hidden hover-lift">
                    <div className="h-44 w-full">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-slate-100">{card.title}</h3>
                      <p className="mt-2 text-sm text-slate-300">{card.description}</p>
                      <button className="mt-4 text-sm font-semibold text-secondary hover:text-accent">
                        Learn more
                      </button>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              {insights.map((card, index) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => setActiveInsight(index)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    index === activeInsight ? "bg-accent" : "bg-white/30"
                  }`}
                  aria-label={`Show ${card.title}`}
                />
              ))}
            </div>
          </div>
        </Section>
      </div>

      <section className="py-16" data-reveal>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent px-6 py-10 text-white sm:px-10 hover-lift">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-3xl font-semibold">Start bulk ordering today</h2>
                <p className="mt-2 text-sm text-white/80">
                  Create your business account and unlock tiered pricing from verified suppliers.
                </p>
              </div>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Register Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            aria-label="Close popup"
            onClick={() => {
              sessionStorage.setItem("medflow_seen_popup", "true");
              setShowPopup(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                  Get verified access
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-100">
                  Unlock wholesale pricing
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("medflow_seen_popup", "true");
                  setShowPopup(false);
                }}
                className="text-slate-400 hover:text-slate-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Join verified buyers and suppliers to access tiered pricing, quotes, and priority dispatch.
            </p>
            <div className="mt-5 space-y-3">
              <input
                type="email"
                placeholder="Work email"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
              />
              <Button className="w-full" onClick={() => setShowPopup(false)}>
                Request access
              </Button>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              We will contact you within 24 hours with onboarding details.
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
