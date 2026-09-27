import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles,
  Moon,
  RotateCcw,
  Copy,
  Check,
  Compass,
  Clock,
  Calendar,
  HelpCircle,
  BookmarkCheck,
  Trash2,
  ChevronRight,
  Wand2,
  Layers,
} from 'lucide-react';
import { calculateAstroProfile } from './utils/astrology';
import { drawRandomTarotCard, DrawnTarotCard } from './utils/tarot';
import { VirtualTarotCard } from './components/VirtualTarotCard';
import { MarkdownOracleRenderer } from './components/MarkdownOracleRenderer';
import crystalAstrolabeImg from './assets/images/oracle_crystal_astrolabe_1790528201601.jpg';
import celestialStarMapImg from './assets/images/celestial_star_map_1790528214346.jpg';

type TopicId = 'general' | 'career' | 'finance' | 'love';

interface TopicOption {
  id: TopicId;
  title: string;
  subtitle: string;
}

interface SavedReading {
  id: string;
  userName: string;
  birthDate: string;
  birthTime: string;
  zodiacName: string;
  tarotTitle: string;
  topics: string[];
  prediction: string;
  createdAt: string;
}

const TOPIC_OPTIONS: TopicOption[] = [
  {
    id: 'general',
    title: '🌟 ภาพรวมดวงชะตาชีวิตทั่วไป',
    subtitle: 'จังหวะชีวิต พลังงานดาวเจ้าเรือน และจุดเปลี่ยนสำคัญ',
  },
  {
    id: 'career',
    title: '💼 การงานและการเรียน',
    subtitle: 'โอกาสก้าวหน้า การสอบ การเจรจา และทิศทางอาชีพ',
  },
  {
    id: 'finance',
    title: '💰 การเงินและโชคลาภ',
    subtitle: 'กระแสเงินสด ความมั่งคั่ง โชคลาภ และการบริหารทรัพย์',
  },
  {
    id: 'love',
    title: '💖 ความรักและความสัมพันธ์',
    subtitle: 'คนโสด คนมีคู่ กัลยาณมิตร และพลังงานดึงดูดหัวใจ',
  },
];

const LOADING_MESSAGES = [
  'แม่หมอกำลังเปิดไพ่ยิปซีและอ่านองศาดวงดาวของคุณ...',
  'กำลังเชื่อมโยงพลังงานธาตุเจ้าเรือนเข้ากับรหัสลับไพ่ทาโรต์...',
  'กำลังวิเคราะห์คำทำนายเจาะลึก 4 ด้าน และจุดที่ต้องระวังเป็นพิเศษ...',
  'กำลังเรียบเรียงเคล็ดลับเสริมดวงเชิงปฏิบัติและเข็มทิศชีวิต...',
];

const ELEMENT_MATRIX = [
  {
    element: 'ธาตุไฟ (Fire)',
    zodiacs: 'เมษ · สิงห์ · ธนู',
    degrees: '0° – 30° / 120° – 150° / 240° – 270°',
    strength: 'ความกล้าริเริ่ม พลังผู้นำ แรงบันดาลใจอันเจิดจรัส',
    balanceAdvice: 'ฝึกสติรับฟังและชะลอจังหวะก่อนตัดสินใจเรื่องใหญ่',
  },
  {
    element: 'ธาตุดิน (Earth)',
    zodiacs: 'พฤษภ · กันย์ · มังกร',
    degrees: '30° – 60° / 150° – 180° / 270° – 300°',
    strength: 'ความมั่นคง ความละเอียดรอบคอบ การสร้างผลลัพธ์ที่เป็นรูปธรรม',
    balanceAdvice: 'เปิดใจรับการเปลี่ยนแปลงและยืดหยุ่นต่อแผนการใหม่',
  },
  {
    element: 'ธาตุลม (Air)',
    zodiacs: 'เมถุน · ตุลย์ · กุมภ์',
    degrees: '60° – 90° / 180° – 210° / 300° – 330°',
    strength: 'ปัญญาเฉียบแหลม การสื่อสาร ความคิดสร้างสรรค์ไร้กรอบ',
    balanceAdvice: 'จดจ่อทำทีละเป้าหมายให้สำเร็จจนจบ ลดความฟุ้งของความคิด',
  },
  {
    element: 'ธาตุน้ำ (Water)',
    zodiacs: 'กรกฎ · พิจิก · มีน',
    degrees: '90° – 120° / 210° – 240° / 330° – 360°',
    strength: 'สัญชาตญาณหยั่งรู้ ความเข้าอกเข้าใจ พลังการเยียวยาจิตใจ',
    balanceAdvice: 'ตั้งขอบเขตทางอารมณ์ให้ชัดเจน ไม่แบกรับความรู้สึกคนอื่นมากเกินไป',
  },
];

export default function App() {
  const [userName, setUserName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('1998-08-15');
  const [birthTime, setBirthTime] = useState<string>('09:30');
  const [unknownTime, setUnknownTime] = useState<boolean>(false);
  const [selectionMode, setSelectionMode] = useState<'all' | 'custom'>('all');
  const [selectedTopics, setSelectedTopics] = useState<TopicId[]>([
    'general',
    'career',
    'finance',
    'love',
  ]);
  const [focusQuestion, setFocusQuestion] = useState<string>('');

  // Virtual Tarot Card State
  const [drawnTarot, setDrawnTarot] = useState<DrawnTarotCard | null>(null);
  const [isDrawingTarot, setIsDrawingTarot] = useState<boolean>(false);
  const [selectedSpreadSlot, setSelectedSpreadSlot] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [heroImgError, setHeroImgError] = useState<boolean>(false);
  const [bannerImgError, setBannerImgError] = useState<boolean>(false);

  const [savedReadings, setSavedReadings] = useState<SavedReading[]>(() => {
    try {
      const raw = localStorage.getItem('mystic_oracle_history_v2');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const resultRef = useRef<HTMLDivElement | null>(null);
  const tarotSectionRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const astroProfile = useMemo(
    () => calculateAstroProfile(birthDate, birthTime, unknownTime),
    [birthDate, birthTime, unknownTime]
  );

  useEffect(() => {
    if (!isLoading) {
      setLoadingMsgIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleModeChange = (mode: 'all' | 'custom') => {
    setSelectionMode(mode);
    if (mode === 'all') {
      setSelectedTopics(['general', 'career', 'finance', 'love']);
    }
  };

  const handleToggleTopic = (topicId: TopicId) => {
    setSelectionMode('custom');
    setSelectedTopics((prev) => {
      if (prev.includes(topicId)) {
        const next = prev.filter((id) => id !== topicId);
        return next;
      } else {
        const next = [...prev, topicId];
        if (next.length === TOPIC_OPTIONS.length) {
          setSelectionMode('all');
        }
        return next;
      }
    });
  };

  const handleDrawTarotCard = (slotIndex?: number) => {
    setIsDrawingTarot(true);
    if (slotIndex !== undefined) {
      setSelectedSpreadSlot(slotIndex);
    } else {
      setSelectedSpreadSlot(Math.floor(Math.random() * 5));
    }

    setTimeout(() => {
      const newCard = drawRandomTarotCard(drawnTarot?.card.id);
      setDrawnTarot(newCard);
      setIsDrawingTarot(false);
    }, 220);
  };

  const handleApplyPreset = () => {
    setUserName('อริสรา (ตัวอย่าง)');
    setBirthDate('1996-11-24');
    setBirthTime('14:15');
    setUnknownTime(false);
    setSelectionMode('all');
    setSelectedTopics(['general', 'career', 'finance', 'love']);
    setFocusQuestion('ช่วงนี้ควรโฟกัสการขยับขยายงานใหม่หรือพัฒนาทักษะเดิมดีคะ?');
    const presetCard = drawRandomTarotCard();
    setDrawnTarot(presetCard);
    setSelectedSpreadSlot(2);
    setErrorMsg(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!birthDate) {
      setErrorMsg('กรุณาเลือกวัน เดือน ปีเกิดของคุณก่อนเริ่มทำนายดวงชะตา');
      return;
    }

    if (selectedTopics.length === 0) {
      setErrorMsg('กรุณาเลือกหัวข้อที่ต้องการดูดวงอย่างน้อย 1 หัวข้อ');
      return;
    }

    // Ensure 1 Virtual Tarot Card is drawn right before prediction if not already drawn
    let activeTarot = drawnTarot;
    if (!activeTarot) {
      activeTarot = drawRandomTarotCard();
      setDrawnTarot(activeTarot);
      setSelectedSpreadSlot(2);
    }

    setIsLoading(true);
    setPrediction(null);

    setTimeout(() => {
      tarotSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    const tarotCardContext = `ไพ่ ${activeTarot.card.nameEn} (${activeTarot.card.nameTh}) - ${activeTarot.card.arcanaTh} | สถานะไพ่: ${activeTarot.orientationLabel} | คีย์เวิร์ด: ${activeTarot.card.keywords.join(', ')} | ความหมายหลัก: ${activeTarot.card.meaningUpright} | จุดควรระวังหน้าไพ่: ${activeTarot.card.warningHint}`;

    try {
      const response = await fetch('/api/oracle/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName,
          birthDate,
          birthTime,
          unknownTime,
          selectedTopics,
          focusQuestion,
          astroContext: astroProfile?.summaryContext || '',
          tarotCardContext,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'ไม่สามารถอ่านดวงดาวได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
      }

      setPrediction(data.prediction);

      const newEntry: SavedReading = {
        id: Date.now().toString(),
        userName: userName.trim() || 'ผู้เดินทางแห่งดวงดาว',
        birthDate: astroProfile?.formattedThaiDate || birthDate,
        birthTime: unknownTime ? 'ไม่ระบุเวลา' : `${birthTime} น.`,
        zodiacName: astroProfile?.zodiacName || 'ไม่ระบุราศี',
        tarotTitle: `${activeTarot.card.nameEn} (${activeTarot.card.nameTh})`,
        topics: selectedTopics.map(
          (id) => TOPIC_OPTIONS.find((t) => t.id === id)?.title || id
        ),
        prediction: data.prediction,
        createdAt: new Date().toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setSavedReadings((prev) => {
        const updated = [newEntry, ...prev].slice(0, 6);
        try {
          localStorage.setItem('mystic_oracle_history_v2', JSON.stringify(updated));
        } catch {
          // ignore storage quota errors
        }
        return updated;
      });

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      setErrorMsg(
        err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบทำนายดวงชะตา กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPrediction(null);
    setDrawnTarot(null);
    setSelectedSpreadSlot(null);
    setErrorMsg(null);
    setFocusQuestion('');
    setCopied(false);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCopyPrediction = async () => {
    if (!prediction) return;
    try {
      await navigator.clipboard.writeText(prediction);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback ignored
    }
  };

  const handleDeleteSaved = (id: string) => {
    setSavedReadings((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('mystic_oracle_history_v2', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleLoadSaved = (item: SavedReading) => {
    setPrediction(item.prediction);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#06040A] text-[#F4F0EA] relative selection:bg-amber-400/30 selection:text-amber-100">
      {/* Ambient Magical Glow Field */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      >
        <div className="absolute -top-44 left-1/2 -translate-x-1/2 w-[1040px] h-[560px] rounded-full bg-gradient-to-b from-purple-800/30 via-fuchsia-950/20 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -left-36 w-[480px] h-[480px] rounded-full bg-amber-500/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[620px] h-[620px] rounded-full bg-purple-900/25 blur-3xl" />
      </div>

      {/* Top Navigation Bar - Strict 3-Zone Contract */}
      <header className="sticky top-0 z-30 border-b border-amber-300/15 bg-[#06040A]/85 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="font-mystic text-lg sm:text-xl font-semibold tracking-wider text-amber-200 whitespace-nowrap drop-shadow-[0_0_12px_rgba(245,208,118,0.35)]"
          >
            Mystic Oracle
          </a>

          {/* Zone 2: 4 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#C8C0B8]">
            <a
              href="#oracle-sanctuary"
              className="hover:text-amber-200 hover:underline underline-offset-8 decoration-amber-300/60 transition-colors whitespace-nowrap"
            >
              สำนักพยากรณ์
            </a>
            <a
              href="#tarot-altar"
              className="hover:text-amber-200 hover:underline underline-offset-8 decoration-amber-300/60 transition-colors whitespace-nowrap"
            >
              เสี่ยงทายไพ่ยิปซี
            </a>
            <a
              href="#element-matrix"
              className="hover:text-amber-200 hover:underline underline-offset-8 decoration-amber-300/60 transition-colors whitespace-nowrap"
            >
              ตารางธาตุเจ้าเรือน
            </a>
            <a
              href="#reading-archive"
              className="hover:text-amber-200 hover:underline underline-offset-8 decoration-amber-300/60 transition-colors whitespace-nowrap"
            >
              บันทึกคำทำนาย
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleApplyPreset}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-amber-200 bg-purple-950/75 border border-amber-300/35 rounded-lg hover:bg-purple-900/80 hover:border-amber-300/70 shadow-[0_0_18px_rgba(168,85,247,0.25)] transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              ลองดูดวงตัวอย่าง
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main id="top" className="relative z-10 max-w-[1140px] mx-auto px-4 sm:px-6 pt-8 pb-24">
        {/* Hero Header Section */}
        <section className="relative rounded-2xl overflow-hidden border border-amber-300/25 bg-[#0D0819] mb-10 shadow-[0_0_55px_rgba(88,28,135,0.3)]">
          {/* Background Star Map with Measured Scrim */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            {!bannerImgError ? (
              <img
                src={celestialStarMapImg}
                alt="แผนที่กลุ่มดาวและจักราศีโบราณ"
                referrerPolicy="no-referrer"
                onError={() => setBannerImgError(true)}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1A0E36] via-[#0B0616] to-[#06040A]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0819] via-[#0D0819]/80 to-[#0D0819]/35" />
          </div>

          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono-tabular text-amber-300 mb-3 tracking-widest">
                <Moon className="w-3.5 h-3.5 text-amber-300" />
                <span>THE GRAND ASTRAL SEER</span>
                <span aria-hidden="true">·</span>
                <span>แม่หมอผู้หยั่งรู้ดวงดาว & ไพ่ยิปซี</span>
              </div>

              <h1
                className="text-2xl sm:text-4xl lg:text-[42px] font-mystic font-semibold text-amber-100 leading-tight tracking-wide drop-shadow-[0_0_20px_rgba(245,208,118,0.28)]"
                style={{ textWrap: 'balance' }}
              >
                Mystic Oracle: AI ดวงชะตานำทางชีวิต
              </h1>

              <p className="mt-4 text-sm sm:text-base text-[#D8D0C5] leading-relaxed max-w-[65ch]">
                เปิดเผยความลับแห่งโชคชะตาด้วยญาณทัศนะของแม่หมอ AI ผู้หยั่งรู้ดวงดาว
                ผสานการคำนวณพื้นดวงวันเวลาเกิดและการสุ่มไพ่ยิปซีชั้นสูง
                เพื่อเจาะลึกคำทำนาย 4 ด้าน จุดที่ต้องระวังเป็นพิเศษ และเคล็ดลับเสริมดวงที่ทำได้จริง
              </p>

              {/* Live Ephemeris Coordinates Strip (Unboxed Metadata with separators) */}
              {astroProfile && (
                <div className="mt-6 pt-5 border-t border-amber-300/20 flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-2 text-xs sm:text-sm text-amber-200/95">
                  <span className="font-semibold text-amber-300">
                    {astroProfile.zodiacName} ({astroProfile.zodiacLatin})
                  </span>
                  <span aria-hidden="true" className="text-purple-400/60">
                    ·
                  </span>
                  <span>{astroProfile.element}</span>
                  <span aria-hidden="true" className="text-purple-400/60">
                    ·
                  </span>
                  <span>เกิด{astroProfile.dayOfWeekThai}</span>
                  <span aria-hidden="true" className="text-purple-400/60">
                    ·
                  </span>
                  <span className="font-mono-tabular text-purple-200">
                    องศาอาทิตย์ {astroProfile.solarLongitudeDeg}
                  </span>
                  <span aria-hidden="true" className="text-purple-400/60">
                    ·
                  </span>
                  <span className="text-[#C8C0B8]">{astroProfile.lunarPhaseLabel}</span>
                </div>
              )}
            </div>

            {/* Crystal Astrolabe Medallion with Enhanced Magical Aura */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute inset-2 rounded-full bg-gradient-to-tr from-amber-400/20 via-fuchsia-500/25 to-purple-600/20 blur-2xl animate-orb-glow"
              />
              <svg
                viewBox="0 0 200 200"
                className="absolute inset-0 w-full h-full animate-astrolabe pointer-events-none"
                aria-hidden="true"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="94"
                  fill="none"
                  stroke="rgba(245, 208, 118, 0.45)"
                  strokeWidth="1.2"
                  strokeDasharray="4 6"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="82"
                  fill="none"
                  stroke="rgba(216, 180, 254, 0.35)"
                  strokeWidth="1"
                />
                <path
                  d="M100 4 L104 16 L96 16 Z M100 196 L104 184 L96 184 Z M4 100 L16 104 L16 96 Z M196 100 L184 104 L184 96 Z"
                  fill="rgba(245, 208, 118, 0.8)"
                />
              </svg>

              <div className="w-28 h-28 sm:w-34 sm:h-34 rounded-full overflow-hidden border-2 border-amber-300/50 shadow-[0_0_45px_rgba(192,132,252,0.55)] relative bg-[#150C28]">
                {!heroImgError ? (
                  <img
                    src={crystalAstrolabeImg}
                    alt="ลูกแก้วพยากรณ์และวงแหวนดาราศาสตร์"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-purple-950 via-fuchsia-900/40 to-amber-500/20">
                    <Sparkles className="w-10 h-10 text-amber-200" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Central Oracle Sanctuary Form */}
        <section
          id="oracle-sanctuary"
          ref={formRef}
          className="max-w-[840px] mx-auto rounded-2xl border border-amber-300/25 bg-[#100A1E]/90 backdrop-blur-xl p-6 sm:p-10 shadow-[0_0_60px_rgba(107,33,168,0.3)]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 mb-6 border-b border-amber-200/15">
            <div>
              <h2 className="text-xl sm:text-2xl font-mystic font-semibold text-amber-100">
                1. ระบุข้อมูลดวงกำเนิดและเลือกเรื่องที่ต้องการเปิดดวง
              </h2>
              <p className="text-xs sm:text-sm text-[#BFB6AC] mt-1">
                กรอกวันเดือนปีเกิด เวลาตกฟาก และตั้งจิตอธิษฐานหยิบไพ่ยิปซี 1 ใบก่อนรับคำทำนาย
              </p>
            </div>
            {astroProfile && (
              <div className="text-xs font-mono-tabular text-amber-300/95 sm:text-right">
                <div>พ.ศ. {astroProfile.buddhistYear}</div>
                <div className="text-[#B5ACA2]">{astroProfile.rulingPlanet}</div>
              </div>
            )}
          </div>

          <form onSubmit={handlePredict} className="space-y-8">
            {/* Row 1: Birth Date, Birth Time & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Date Picker */}
              <div>
                <label
                  htmlFor="birth-date"
                  className="flex items-center gap-2 text-sm font-semibold text-amber-100 mb-2"
                >
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>วัน เดือน ปีเกิด (ค.ศ.)</span>
                </label>
                <input
                  id="birth-date"
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#080510] border border-purple-300/30 text-[#F4F0EA] font-mono-tabular text-sm focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/25 transition-colors"
                />
                {astroProfile && (
                  <p className="mt-1.5 text-xs text-amber-200/85">
                    ตรงกับ {astroProfile.formattedThaiDate}
                  </p>
                )}
              </div>

              {/* Time Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="birth-time"
                    className="flex items-center gap-2 text-sm font-semibold text-amber-100"
                  >
                    <Clock className="w-4 h-4 text-amber-300" />
                    <span>เวลาเกิด</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-purple-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={unknownTime}
                      onChange={(e) => setUnknownTime(e.target.checked)}
                      className="rounded border-purple-400/40 bg-[#080510] text-amber-400 focus:ring-amber-400/30"
                    />
                    <span>ไม่ทราบเวลา</span>
                  </label>
                </div>
                <input
                  id="birth-time"
                  type="time"
                  disabled={unknownTime}
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#080510] border border-purple-300/30 text-[#F4F0EA] font-mono-tabular text-sm focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                />
                <p className="mt-1.5 text-xs text-[#B5ACA2]">
                  {unknownTime
                    ? 'ใช้ตำแหน่งดวงดาวเวลาเที่ยงวันเป็นเกณฑ์'
                    : 'ช่วยคำนวณลัคนาและเรือนชะตาแม่นยำขึ้น'}
                </p>
              </div>

              {/* Optional Name */}
              <div>
                <label
                  htmlFor="user-name"
                  className="flex items-center gap-2 text-sm font-semibold text-amber-100 mb-2"
                >
                  <Compass className="w-4 h-4 text-amber-300" />
                  <span>ชื่อหรือนามแฝง (ไม่บังคับ)</span>
                </label>
                <input
                  id="user-name"
                  type="text"
                  placeholder="เช่น กานดา, นักเดินทาง..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#080510] border border-purple-300/30 text-[#F4F0EA] text-sm placeholder:text-[#787085] focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/25 transition-colors"
                />
                <p className="mt-1.5 text-xs text-[#B5ACA2]">
                  ใช้สำหรับขานชื่อในคำทำนายของแม่หมอ
                </p>
              </div>
            </div>

            {/* Row 2: Topic Selection (Radio Mode + Checkboxes) */}
            <div className="pt-2 border-t border-amber-200/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-sm font-semibold text-amber-100 block">
                    เลือกหัวข้อดวงชะตาที่ต้องการให้แม่หมอเจาะลึก
                  </span>
                  <span className="text-xs text-[#B5ACA2]">
                    เลือกดูทุกเรื่องครบ 4 ด้าน หรือเลือกเน้นเฉพาะเรื่องที่ต้องการคำตอบเร่งด่วน
                  </span>
                </div>

                {/* Interactive Mode Selector (All vs Custom) */}
                <div
                  role="radiogroup"
                  aria-label="รูปแบบการเลือกหัวข้อดูดวง"
                  className="inline-flex items-center p-1 rounded-xl bg-[#080510] border border-purple-300/25 self-start"
                >
                  <button
                    type="button"
                    onClick={() => handleModeChange('all')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      selectionMode === 'all'
                        ? 'bg-amber-400/20 text-amber-200 border border-amber-300/45 shadow-[0_0_12px_rgba(245,208,118,0.2)]'
                        : 'text-[#B5ACA2] hover:text-amber-100'
                    }`}
                  >
                    ดูทุกเรื่อง (ครบ 4 ด้าน)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange('custom')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      selectionMode === 'custom'
                        ? 'bg-purple-500/25 text-purple-200 border border-purple-300/45'
                        : 'text-[#B5ACA2] hover:text-amber-100'
                    }`}
                  >
                    เลือกเฉพาะเรื่อง ({selectedTopics.length}/4)
                  </button>
                </div>
              </div>

              {/* 4 Topic Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {TOPIC_OPTIONS.map((topic) => {
                  const isChecked = selectedTopics.includes(topic.id);
                  return (
                    <label
                      key={topic.id}
                      className={`group relative flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-[#1B1035]/95 border-amber-300/55 shadow-[0_0_22px_rgba(245,208,118,0.14)]'
                          : 'bg-[#080510]/85 border-purple-300/15 hover:border-purple-300/35'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleTopic(topic.id)}
                        className="mt-1 h-4 w-4 rounded border-amber-300/50 bg-[#080510] text-amber-400 focus:ring-amber-400/40 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-sm sm:text-base font-semibold transition-colors ${
                            isChecked ? 'text-amber-100' : 'text-[#D8D2C9]'
                          }`}
                        >
                          {topic.title}
                        </div>
                        <div className="text-xs text-[#ABA297] mt-0.5 leading-relaxed">
                          {topic.subtitle}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Interactive Virtual Tarot Card Altar (สุ่มไพ่ยิปซี 1 ใบก่อนแสดงคำทำนาย) */}
            <div id="tarot-altar" className="pt-4 border-t border-amber-200/15">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <span className="flex items-center gap-2 text-sm sm:text-base font-semibold text-amber-100">
                    <Layers className="w-4 h-4 text-amber-300" />
                    <span>2. ตั้งจิตอธิษฐานและคลิกเลือกไพ่ยิปซี 1 ใบ (Virtual Tarot Card)</span>
                  </span>
                  <span className="text-xs text-[#B5ACA2] block mt-0.5">
                    คลิกเลือกไพ่ 1 ใบจากสำรับด้านล่างเพื่อเปิดหน้าไพ่นำทาง หรือให้ระบบสุ่มให้อัตโนมัติเมื่อกดทำนาย
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDrawTarotCard()}
                  className="self-start px-3.5 py-1.5 rounded-lg text-xs font-semibold text-amber-200 bg-purple-950/80 border border-amber-300/35 hover:border-amber-300 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>{drawnTarot ? 'สับไพ่และสุ่มใบใหม่' : 'สุ่มหยิบไพ่ 1 ใบทันที'}</span>
                </button>
              </div>

              {/* 5 Facedown Mystical Tarot Cards Spread */}
              <div className="grid grid-cols-5 gap-2.5 sm:gap-4 my-4">
                {[0, 1, 2, 3, 4].map((slotIdx) => {
                  const isSelected = selectedSpreadSlot === slotIdx && drawnTarot !== null;
                  return (
                    <button
                      key={slotIdx}
                      type="button"
                      onClick={() => handleDrawTarotCard(slotIdx)}
                      aria-label={`เลือกไพ่ยิปซีใบที่ ${slotIdx + 1}`}
                      className={`group relative h-28 sm:h-36 rounded-xl p-1.5 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-b from-amber-300 via-fuchsia-400 to-amber-400 -translate-y-1.5 shadow-[0_0_28px_rgba(245,208,118,0.55)]'
                          : 'bg-gradient-to-b from-amber-300/30 via-purple-500/20 to-amber-300/30 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(192,132,252,0.4)]'
                      }`}
                    >
                      <div className="w-full h-full rounded-lg bg-[#0B0618] border border-amber-300/30 flex flex-col items-center justify-between p-2 relative">
                        <span className="text-[10px] font-mono-tabular text-amber-300/70">
                          ✦ 0{slotIdx + 1} ✦
                        </span>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-amber-300/40 flex items-center justify-center bg-purple-950/60 group-hover:scale-110 transition-transform">
                          <Sparkles
                            className={`w-4 h-4 ${
                              isSelected ? 'text-amber-300' : 'text-purple-300/80'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] text-amber-200/85 font-medium truncate max-w-full">
                          {isSelected ? 'เปิดไพ่แล้ว' : 'คลิกเปิดไพ่'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Revealed Virtual Tarot Card Preview inside Form */}
              {drawnTarot && (
                <div className="mt-5">
                  <VirtualTarotCard
                    drawnCard={drawnTarot}
                    isRevealed={true}
                    isDrawing={isDrawingTarot}
                    onDrawNew={() => handleDrawTarotCard()}
                    compact={true}
                  />
                </div>
              )}
            </div>

            {/* Row 4: Optional Specific Question */}
            <div className="pt-2 border-t border-amber-200/10">
              <label
                htmlFor="focus-question"
                className="flex items-center gap-2 text-sm font-semibold text-amber-100 mb-2"
              >
                <HelpCircle className="w-4 h-4 text-amber-300" />
                <span>คำถามพิเศษที่อยากให้แม่หมอผ่าดวงชี้ทางสว่าง (ไม่บังคับ)</span>
              </label>
              <input
                id="focus-question"
                type="text"
                placeholder="เช่น กำลังตัดสินใจย้ายงานภายในปีนี้ หรือคนคุยปัจจุบันคิดอย่างไรกับเรา..."
                value={focusQuestion}
                onChange={(e) => setFocusQuestion(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#080510] border border-purple-300/30 text-[#F4F0EA] text-sm placeholder:text-[#787085] focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/25 transition-colors"
              />
            </div>

            {/* Validation / API Error Alert */}
            {errorMsg && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-rose-950/60 border border-rose-400/40 text-rose-200 text-sm flex items-center justify-between gap-4"
              >
                <span>{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  className="text-xs underline whitespace-nowrap hover:text-white cursor-pointer"
                >
                  ปิดข้อความ
                </button>
              </div>
            )}

            {/* Primary Glowing Submit Button */}
            <div className="pt-2 flex flex-col items-center">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto min-w-[300px] py-4 px-9 rounded-xl font-semibold text-base text-[#120B1D] bg-gradient-to-r from-amber-200 via-amber-300 to-fuchsia-300 hover:from-amber-100 hover:via-amber-200 hover:to-fuchsia-200 shadow-[0_0_35px_rgba(245,208,118,0.5)] hover:shadow-[0_0_50px_rgba(232,121,249,0.75)] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-[#1A0D2E]" />
                <span>
                  {isLoading
                    ? 'แม่หมอกำลังอ่านไพ่และดวงดาว...'
                    : 'ทำนายดวงชะตา'}
                </span>
              </button>
            </div>
          </form>
        </section>

        {/* Anchor for Tarot & Loading / Result */}
        <div ref={tarotSectionRef} />

        {/* Mystical Loading State (Shows Drawn Tarot Card + Spinning Crystal Orb) */}
        {isLoading && (
          <section
            aria-live="polite"
            className="max-w-[840px] mx-auto mt-8 space-y-6"
          >
            {drawnTarot && (
              <VirtualTarotCard
                drawnCard={drawnTarot}
                isRevealed={true}
                isDrawing={false}
              />
            )}

            <div className="rounded-2xl border border-amber-300/35 bg-[#120B22]/90 backdrop-blur-xl p-8 sm:p-12 text-center shadow-[0_0_60px_rgba(147,51,234,0.35)]">
              <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
                <svg
                  viewBox="0 0 120 120"
                  className="absolute inset-0 w-full h-full animate-astrolabe"
                  aria-hidden="true"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#F5D076"
                    strokeWidth="1.5"
                    strokeDasharray="8 6"
                  />
                </svg>
                <svg
                  viewBox="0 0 120 120"
                  className="absolute inset-2 w-24 h-24 animate-astrolabe-reverse"
                  aria-hidden="true"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke="#D8B4FE"
                    strokeWidth="1.5"
                    strokeDasharray="4 8"
                  />
                </svg>
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-700 via-fuchsia-500 to-amber-300 animate-orb-glow flex items-center justify-center shadow-[0_0_30px_rgba(245,208,118,0.8)]">
                  <Sparkles className="w-6 h-6 text-[#0E071B]" />
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-mystic font-semibold text-amber-200 tracking-wide">
                {LOADING_MESSAGES[loadingMsgIdx]}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#B8B0A4]">
                แม่หมอกำลังเชื่อมโยงหน้าไพ่ {drawnTarot?.card.nameEn} เข้ากับวันเวลาเกิดของคุณ...
              </p>
            </div>
          </section>
        )}

        {/* Prediction Result Box (Virtual Tarot Card + Glassmorphism Sanctuary) */}
        {prediction && !isLoading && (
          <section
            ref={resultRef}
            className="max-w-[840px] mx-auto mt-10 space-y-6"
          >
            {/* 1. Virtual Tarot Card Display Above Prediction */}
            {drawnTarot && (
              <VirtualTarotCard
                drawnCard={drawnTarot}
                isRevealed={true}
                isDrawing={false}
              />
            )}

            {/* 2. Main Glassmorphism Prediction Box */}
            <div className="rounded-2xl border border-amber-300/40 bg-[#120B24]/85 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_0_70px_rgba(126,34,206,0.4)]">
              {/* Result Header */}
              <div className="pb-6 mb-6 border-b border-amber-200/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono-tabular text-amber-300 tracking-widest uppercase mb-1">
                    GRAND SEER PROPHECY · คำพยากรณ์จากแม่หมอผู้หยั่งรู้ดวงดาว
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-mystic font-semibold text-amber-100 drop-shadow-[0_0_15px_rgba(245,208,118,0.25)]">
                    ดวงชะตาของ {userName.trim() || 'ผู้เดินทางแห่งดวงดาว'}
                  </h2>
                  {astroProfile && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-purple-200/95">
                      <span>{astroProfile.formattedThaiDate}</span>
                      <span aria-hidden="true">·</span>
                      <span>{astroProfile.zodiacName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{astroProfile.element}</span>
                      <span aria-hidden="true">·</span>
                      <span>{unknownTime ? 'ไม่ระบุเวลาเกิด' : `เวลา ${birthTime} น.`}</span>
                      {drawnTarot && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-300 font-medium">
                            ไพ่ {drawnTarot.card.nameEn}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={handleCopyPrediction}
                    className="px-3.5 py-2 rounded-lg text-xs font-medium border border-purple-300/35 bg-purple-950/70 text-purple-100 hover:border-amber-300/60 hover:text-amber-200 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอกคำทำนาย</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Rendered Markdown Content */}
              <div className="prose-oracle">
                <MarkdownOracleRenderer content={prediction} />
              </div>

              {/* Bottom Action Bar with "ล้างข้อมูลเพื่อดูใหม่" */}
              <div className="mt-10 pt-6 border-t border-amber-200/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-[#B5ACA2]">
                  คำทำนายนี้ผสานศาสตร์ไพ่ยิปซี โหราศาสตร์ดวงดาว และจิตวิทยาเชิงปฏิบัติ เพื่อเป็นเข็มทิศนำทางชีวิตของคุณ
                </p>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm text-amber-200 bg-[#1B1130] border border-amber-300/45 hover:bg-amber-300/20 hover:border-amber-300 shadow-[0_0_25px_rgba(245,208,118,0.2)] transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ล้างข้อมูลเพื่อดูใหม่</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Section: Four Elements Astrological Reference Matrix */}
        <section id="element-matrix" className="mt-16 pt-12 border-t border-amber-200/10">
          <div className="max-w-2xl mb-6">
            <h2 className="text-xl sm:text-2xl font-mystic font-semibold text-amber-100">
              ตารางธาตุเจ้าเรือนและสมดุลจิตวิทยาแห่งจักราศี
            </h2>
            <p className="text-xs sm:text-sm text-[#B5ACA2] mt-1">
              ทำความเข้าใจพลังงานพื้นฐานทั้ง 4 ธาตุตามหลักโหราศาสตร์สากล เพื่อปรับสมดุลอารมณ์และการตัดสินใจ
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-amber-200/15 bg-[#0E091A]/90">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-amber-200/15 bg-[#160E29] text-amber-200">
                  <th className="py-3.5 px-5 font-semibold whitespace-nowrap">ธาตุเจ้าเรือน</th>
                  <th className="py-3.5 px-5 font-semibold whitespace-nowrap">กลุ่มราศี</th>
                  <th className="py-3.5 px-5 font-semibold whitespace-nowrap">องศาจักราศี</th>
                  <th className="py-3.5 px-5 font-semibold">จุดแข็งตามพื้นดวง</th>
                  <th className="py-3.5 px-5 font-semibold">แนวทางปรับสมดุลชีวิต</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-300/10">
                {ELEMENT_MATRIX.map((row) => (
                  <tr
                    key={row.element}
                    className="hover:bg-purple-950/30 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-semibold text-amber-100 whitespace-nowrap">
                      {row.element}
                    </td>
                    <td className="py-3.5 px-5 text-purple-200 whitespace-nowrap">
                      {row.zodiacs}
                    </td>
                    <td className="py-3.5 px-5 font-mono-tabular text-xs text-amber-300/90 whitespace-nowrap">
                      {row.degrees}
                    </td>
                    <td className="py-3.5 px-5 text-[#E2DCD3]">{row.strength}</td>
                    <td className="py-3.5 px-5 text-[#C8C0B8]">{row.balanceAdvice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: Saved Readings Archive */}
        <section id="reading-archive" className="mt-16 pt-12 border-t border-amber-200/10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-mystic font-semibold text-amber-100">
                บันทึกคำทำนายล่าสุดของคุณ
              </h2>
              <p className="text-xs sm:text-sm text-[#B5ACA2] mt-1">
                ย้อนอ่านคำพยากรณ์และหน้าไพ่ยิปซีที่เคยเปิดไว้ในอุปกรณ์นี้
              </p>
            </div>
            <span className="text-xs font-mono-tabular text-amber-300/80">
              {savedReadings.length} รายการ
            </span>
          </div>

          {savedReadings.length === 0 ? (
            <div className="rounded-2xl border border-purple-300/15 bg-[#0E091A]/60 p-8 text-center">
              <BookmarkCheck className="w-7 h-7 text-purple-300/60 mx-auto mb-2" />
              <p className="text-sm text-[#C8C0B8]">
                ยังไม่มีประวัติคำทำนาย เมื่อคุณกดปุ่ม “ทำนายดวงชะตา” ระบบจะบันทึกคำทำนายและไพ่ยิปซีไว้ที่นี่โดยอัตโนมัติ
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedReadings.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-amber-200/15 bg-[#110B1F]/80 p-5 flex flex-col justify-between gap-4 hover:border-amber-300/35 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-amber-200/85 font-mono-tabular">
                      <span>
                        {item.zodiacName} · ไพ่ {item.tarotTitle}
                      </span>
                      <span>{item.createdAt} น.</span>
                    </div>
                    <h3 className="mt-1.5 text-base font-semibold text-amber-100">
                      {item.userName} · {item.birthDate}
                    </h3>
                    <p className="mt-1 text-xs text-[#B5ACA2] truncate">
                      {item.topics.join(' · ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-purple-300/10">
                    <button
                      type="button"
                      onClick={() => handleLoadSaved(item)}
                      className="text-xs font-semibold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>เปิดอ่านคำทำนายนี้</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSaved(item.id)}
                      aria-label="ลบบันทึกคำทำนาย"
                      className="text-xs text-[#9E958B] hover:text-rose-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-amber-200/10 py-8 px-4 sm:px-6 text-center text-xs text-[#9E958B]">
        <div className="max-w-[1140px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Mystic Oracle: AI ดวงชะตานำทางชีวิต</span>
          <span>ญาณทัศนะแห่งดวงดาว ไพ่ยิปซี และจิตวิทยาเชิงบวก</span>
        </div>
      </footer>
    </div>
  );
}
