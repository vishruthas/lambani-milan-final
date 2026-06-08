import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import TermsModal from "../components/TermsModal";
import PrivacyModal from "../components/PrivacyModal";
import {
  CommunityIcon,
  KulGothraIcon,
  VerifiedIcon,
  ChatSecureIcon,
  PrivacyShieldIcon,
} from "../icons/OfferIcons";
import { Helmet } from "react-helmet";

import coupleImg from "../assets/about.webp";
import culture1 from "../assets/1_origin.webp";
import culture2 from "../assets/2_nomadic.webp";
import culture3 from "../assets/3_life.webp";
import culture4 from "../assets/4_marriage.webp";
import culture5 from "../assets/5_stages_of_wedding.webp";
import culture6 from "../assets/6_rituals.webp";
import logo from "../assets/logo2.webp";

export default function LandingPage() {
  const navigate = useNavigate();

  const aboutRef = useRef(null);
  const cultureRef = useRef(null);
  const howRef = useRef(null);
  const heroLeftRef = useRef(null);
  const cultureAnimatedRef = useRef(null);
  const [modal, setModal] = useState(null); 
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);


  const cultureItems = [
    {
      img: culture1,
      title: "The Origin",
      desc:
        "The people known as Lambani, Banjara, or Gor share a cultural lineage that traces back to the northern regions of India, particularly Rajasthan and Gujarat. Over time, their journeys carried them across many parts of the country, shaping a community that exists today in several regions while retaining a shared identity. At the heart of this identity is the spoken language Lambani, a blend of linguistic influences that reflects the community's movement, history, and cultural continuity.",
    },
    {
      img: culture2,
      title: "Nomadic Trade and Journey",
      desc:
        "For centuries, the Banjara or Lambani people were known for their role as traders and transporters, moving goods such as salt, grains, and other essentials across different regions of the subcontinent. Traveling in groups, they connected distant markets and settlements long before modern transportation systems existed. This mobile way of life shaped their resilience, adaptability, and strong communal bonds, leaving a lasting influence on their cultural identity.",
    },
    {
      img: culture3,
      title: "Life in the Tanda",
      desc:
        "Lambani families traditionally lived in settlements known as Tandas, which formed the center of social life and local governance. Each Tanda was guided by a leadership structure led by the Nayak, supported by the Dao, the Karbari, and respected elders who helped settle disputes and guide decisions within the community. Through this system the Tanda became more than a place to live. It functioned as a social institution where kinship, customs, and collective responsibility shaped everyday life.",
    },
    {
      img: culture4,
      title: "Marriage and Clan Structure",
      desc:
        "Marriage has traditionally been governed by a structured gotra system that defines lineage and kinship boundaries within the community. Members belonging to the same gotra are regarded as part of the same extended family and therefore cannot marry each other. This rule preserves lineage relationships and maintains social balance between clans.\n\nBecause of this structure, marriage arrangements are usually initiated through discussions between families, often guided by elders and leaders of the Tanda. These conversations help determine compatibility between lineages and ensure that the alliance respects customary norms. In this way, marriage becomes more than a union between two individuals, forming a social bond that connects families, clans, and the wider community.",
    },
    {
      img: culture5,
      title: "Stages of the Wedding",
      desc:
        "The wedding process traditionally unfolds through several structured stages that formally establish the alliance between families. It begins with Vat Boli, where the groom's family visits the bride's household to initiate discussions and request the marriage. Once both sides agree, the next stage known as Sagai confirms the engagement, often in the presence of elders and leaders of the Tanda, who acknowledge the agreement between the families.\n\nBefore the wedding ceremony itself, an important pre wedding ritual called Veelya Shastra, also known as Golkhayoro, takes place. During this ceremony jaggery is shared among relatives and guests as a symbol of sweetness and prosperity for the couple. The final stage, known as Vaya, marks the wedding ceremony where the union is formally recognized by the families and the wider community.",
    },
    {
      img: culture6,
      title: "Rituals and Celebrations",
      desc:
        "Wedding ceremonies include several distinctive rituals that reflect both symbolism and communal participation. One such ceremony is Vadayi, where the groom is formally initiated into social responsibility through a traditional marking ritual performed in the presence of elders and family members. The wedding space itself is prepared through a ceremonial structure known as Mandedo, which becomes the center of the celebrations and rituals.\n\nThroughout the festivities, music and traditional songs such as Dhaavalo are performed by women of the community, expressing blessings, emotions, and cultural memory. After the ceremonies conclude, families and relatives gather for shared celebrations including Balagada Oota, a festive meal that marks the joyful beginning of the couple's new life together.",
    },
  ];

  const perImage = 4000; 
  const animMs = 420; 
  const len = cultureItems.length;

  const [statuses, setStatuses] = useState(() =>
    cultureItems.map((_, i) => (i === 0 ? "active" : "hidden"))
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const options = { threshold: 0.18 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add("in-view");
        } else {
          el.classList.remove("in-view");
        }
      });
    }, options);

    const els = document.querySelectorAll(".animate-on-scroll");
    els.forEach((el) => observer.observe(el));

    if (cultureRef.current) observer.observe(cultureRef.current);
    if (aboutRef.current) observer.observe(aboutRef.current);
    if (heroLeftRef.current) observer.observe(heroLeftRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        advance();
      }, perImage);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, activeIndex]);

  const advance = () => {
    const prev = activeIndex;
    const next = (activeIndex + 1) % len;
    setStatuses((s) => {
      const copy = [...s];
      copy[prev] = "exit";
      copy[next] = "enter";
      return copy;
    });
    setTimeout(() => {
      setStatuses((s) => {
        const copy = [...s];
        copy[prev] = "hidden";
        copy[next] = "active";
        return copy;
      });
      setActiveIndex(next);
    }, animMs);
  };

  const prev = () => {
    const prevIndex = activeIndex;
    const nextIndex = (activeIndex - 1 + len) % len;
    setIsPaused(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatuses((s) => {
      const copy = [...s];
      copy[prevIndex] = "exit";
      copy[nextIndex] = "enter";
      return copy;
    });
    setTimeout(() => {
      setStatuses((s) => {
        const copy = [...s];
        copy[prevIndex] = "hidden";
        copy[nextIndex] = "active";
        return copy;
      });
      setActiveIndex(nextIndex);
      setTimeout(() => setIsPaused(false), perImage);
    }, animMs);
  };

  const goTo = (index) => {
    if (index === activeIndex) return;
    const prevIndex = activeIndex;
    const next = index;
    setIsPaused(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatuses((s) => {
      const copy = [...s];
      copy[prevIndex] = "exit";
      copy[next] = "enter";
      return copy;
    });
    setTimeout(() => {
      setStatuses((s) => {
        const copy = [...s];
        copy[prevIndex] = "hidden";
        copy[next] = "active";
        return copy;
      });
      setActiveIndex(next);
      setTimeout(() => setIsPaused(false), perImage);
    }, animMs);
  };

  const handleMouseEnterAnimated = () => {
    setIsPaused(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  const handleMouseLeaveAnimated = () => {
    setIsPaused(false);
  };

  const smoothScrollTo = (el) => {
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate("/landing#login");
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    navigate("/landing#register");
  };

  return (
   <>
  <Helmet>
    <title>
      Lambani Milan – Verified Lambani & Banjara Matrimony
    </title>

    <meta
      name="description"
      content="A trusted matrimony platform for the Lambani, Banjara, Gor, Sugali and Lambadi community. Find verified brides and grooms across India."
    />

    <meta
      name="keywords"
      content="Lambani Matrimony, Banjara Matrimony, Gor Matrimony, Sugali Matrimony, Lambadi Matrimony, Lambani Bride, Lambani Groom, Banjara Marriage, Lambani Community, Matrimony Site"
    />

    <meta
      property="og:title"
      content="Lambani Milan – Lambani & Banjara Matrimony"
    />

    <meta
      property="og:description"
      content="A trusted matrimony platform for the Lambani, Banjara, Gor, Sugali and Lambadi community. Find verified brides and grooms across India."
    />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Lambani Milan" />
    <meta property="og:url" content="https://lambanimilan.com/" />
    <meta property="og:image" content="https://lambanimilan.com/og-image.jpg" />

    <link rel="canonical" href="https://lambanimilan.com/" />
   
    <meta
      name="robots"
      content="index, follow"
    />
  </Helmet>


    <div className="lp-root2">
      <header className="lp-header">
        <div className="lp-header-inner">
          <div className="lp-brand">
            <div className="lp-logo">
              <img src={logo} alt="logo" />
            </div>
            <div className="lp-brand-text">
              <div className="lp-name">Lambani Milan</div>
            </div>
          </div>

          <nav className="lp-nav">
            <a
              className="lp-btn lp-btn-primary"
              href="/landing#register"
              onClick={(e) => {
                e.preventDefault();
                handleRegisterClick(e);
              }}
            >
              Register
            </a>
            <a
              className="lp-btn lp-btn-primary"
              href="/landing#login"
              onClick={(e) => {
                e.preventDefault();
                handleLoginClick(e);
              }}
            >
              Log in
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-hero-inner hero-centered">
            <div className="lp-hero-left" ref={heroLeftRef}>
              <div className="hero-left-inner animate-on-scroll">
                <div className="lp-logo2" >
                 <img src={logo} alt="logo" />
                </div>
                <h1 className="lp-hero-title">Lambani Milan</h1>
                 <div className="lp-tag"><h3>Where Lambani traditions inspire new journeys</h3></div>
                <p className="lp-hero-sub">
                  A platform created to bring our community together through shared traditions and values. Designed for a new generation while staying rooted in heritage. Helping meaningful connections grow across regions and families.
                </p>

                <div className="lp-hero-actions">
                  <a
                    href="#how"
                    className="lp-btn lp-btn-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      smoothScrollTo(howRef.current);
                    }}
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

    

        {/* About */}
        <section className="lp-about" id="about" ref={aboutRef}>
          <div className="about-header">
  <div className="about-top">
    <div className="lp-line"></div>
    <h2 className="lp-title">OUR STORY</h2>
  </div>

  <span className="lp-subtitle">
    Rooted In Heritage, <br />
    Built For Tomorrow.
    
          
  </span>
</div>
          <div className="lp-about-inner">
            <div className="about-left">
              <img className="about-couple animate-on-scroll" src={coupleImg} alt="couple" />
            </div>
            <div className="about-right animate-on-scroll">
              <p>
                Founded in 2026, Lambani Milan was created to provide a dedicated space for individuals within the community to meet and build meaningful relationships. As families and individuals spread across different cities and regions, finding the right match within the community can often be difficult.</p>

                <p>
                Our platform focuses on creating a safe and reliable environment through verified profiles, thoughtful matchmaking preferences, and private conversations. With a simple and modern approach, Lambani Milan aims to make the journey of finding the right partner more transparent and comfortable.
              </p>
            </div>
          </div>
        </section>

        {/* Culture animated area */}
        <section className="lp-culture" ref={cultureRef} id="culture">
          <div className="culture-header">
          <div className="culture-top">
          <div className="lp-line"></div>
          <h2 className="lp-title">OUR CULTURE & HERITAGE</h2>
          </div>
          <span className="lp-subtitle">
            Discover Traditions & <br />
            Spirit Of Lambani Life.
          </span>
          </div>
          
          <div
            className="culture-animated"
            ref={cultureAnimatedRef}
            onMouseEnter={handleMouseEnterAnimated}
            onMouseLeave={handleMouseLeaveAnimated}
          >
            {/* Slider column */}
            <div className="culture-slider" aria-hidden="false">
              {cultureItems.map((item, i) => {
                const s = statuses[i];
                return (
                  <div key={i} className={`slide ${s}`} aria-hidden={s === "hidden"}>
                    <img src={item.img} alt={item.title} />
                  </div>
                );
              })}
            </div>

            {/* Info panel column */}
            <div className="culture-info-panel" aria-live="polite">
              {cultureItems.map((item, i) => {
                const s = statuses[i];
                return (
                  <div key={i} className={`info-slide ${s}`} aria-hidden={s === "hidden"}>
                    <h3>{item.title}</h3>
                    <p style={{ whiteSpace: "pre-wrap" }}>{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Controls centered below both image and info */}
            <div className="culture-controls" role="group" aria-label="Culture slider controls">
              <button
                className="arrow-btn arrow-left"
                onClick={prev}
                aria-label="Previous slide"
                aria-disabled={activeIndex === 0}
                disabled={activeIndex === 0}
                type="button"
              >
                ‹
              </button>

              <div className="culture-dots" role="tablist" aria-label="Culture slides">
                {cultureItems.map((_, i) => (
                  <button
                    key={i}
                    className={`dot ${i === activeIndex ? "dot-active" : ""}`}
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-pressed={i === activeIndex}
                    type="button"
                  />
                ))}
              </div>

              <button
                className="arrow-btn arrow-right"
                onClick={advance}
                aria-label="Next slide"
                aria-disabled={activeIndex === len - 1}
                disabled={activeIndex === len - 1}
                type="button"
              >
                ›
              </button>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="lp-why">
          <div className="why-header">
          <div className="why-top">
          <div className="lp-line"></div>
          <h2 className="lp-title">WHAT WE OFFER</h2>
          </div>
          <span className="lp-subtitle">
          The Lambani Milan <br />
          Difference. 
                 
        </span>
          </div>
          <div className="why-grid">
            <div className="why-item animate-on-scroll">
              <div className="offer-icon">
               <CommunityIcon />
               </div>
              <h3>Built by the Lambani Community</h3>
              <p>Created by Lambanis to support, grow, and uplift our people.</p>
            </div>

            <div className="why-item animate-on-scroll">
              <div className="offer-icon">
              <KulGothraIcon />
              </div>
              <h3>All Kuls & Gothras Included</h3>
              <p>We respect the diversity within the community by supporting all Kuls and Gothras for better and suitable matchmaking.</p>
            </div>

            <div className="why-item animate-on-scroll">
              <div className="offer-icon">
              <VerifiedIcon />
              </div>
              <h3>Genuine & Verified Profiles</h3>
              <p>We focus on creating a trusted space with authentic profiles for serious marriage intentions.</p>
            </div>

            <div className="why-item animate-on-scroll">
              <div className="offer-icon">
              <ChatSecureIcon />
              </div>
              <h3>Secure Communication</h3>
              <p>Connect with interested profiles safely through a simple and user-friendly platform.</p>
            </div>

            <div className="why-item animate-on-scroll">
              <div className="offer-icon">
              <PrivacyShieldIcon />
              </div>
              <h3>Privacy & Data Protection</h3>
              <p>Control who can view your photos and profile details with privacy settings and strong data protection.</p>
            </div>
          </div>
        </section>

        {/* bottom login and register */}
        <section className="lp-how" ref={howRef} id="how">
          <div className="how-actions">
            <a
              href="/landing#register"
              className="lp-btn lp-btn-primary"
              onClick={(e) => {
                e.preventDefault();
                navigate("/landing#register");
              }}
            >
              Register
            </a>
            <a
              href="/landing#login"
              className="lp-btn lp-btn-primary"
              onClick={(e) => {
                e.preventDefault();
                navigate("/landing#login");
              }}
            >
              Log in
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="footer-brand">
            <div className="lp-logo">
              <img src={logo} alt="logo small" />
            </div>
            <div className="footer-text">
              <div className="lp-name">Lambani Milan</div>
              {/* <div className="lp-slogan">Where Lambani traditions inspire new journeys</div> */}
            </div>
          </div>
       
            <div className="contact">
                <p className="contact_p1" ><strong>Contact</strong></p>
                <p className="contact_p2">
                  Email :{""}
                  <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=lambanimilan2026@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-email"
                  >
                  lambanimilan2026@gmail.com
                  </a>
                  </p>
          </div>
          <div className="lp-footer-right">
            <div className="footer-links">
              
              <div className="legal">
                <p><strong>Legal</strong></p>
                <a
                  href="#privacy"
                  onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}
                >
                  Privacy Policy
                </a>
                <br />
                <a
                  href="#terms"
                  onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
                >
                  Terms &amp; Conditions
                </a>
                
              </div>
            </div>
          </div>
        </div>
        <p className="copy_right">This website is strictly for matrimonial purpose only and not a dating website.</p>
        <p className="copy_right2">
         .© {new Date().getFullYear()}  Lambani Milian 
        </p>
      </footer>

      {/* Modal overlay for Privacy / Terms */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
           
     
    </div>
    </>
  );
}