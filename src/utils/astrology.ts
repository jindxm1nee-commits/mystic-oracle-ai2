export interface AstroProfile {
  zodiacName: string;
  zodiacLatin: string;
  element: string;
  rulingPlanet: string;
  dayOfWeekThai: string;
  dayPlanet: string;
  buddhistYear: number;
  formattedThaiDate: string;
  solarLongitudeDeg: string;
  lunarPhaseLabel: string;
  summaryContext: string;
}

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const THAI_DAYS = [
  { name: 'วันอาทิตย์', planet: 'ดาวอาทิตย์ (๑) พลังแห่งผู้นำและเกียรติยศ' },
  { name: 'วันจันทร์', planet: 'ดาวจันทร์ (๒) พลังแห่งเมตตามหานิยมและจินตนาการ' },
  { name: 'วันอังคาร', planet: 'ดาวอังคาร (๓) พลังแห่งความกล้าหาญและการลงมือทำ' },
  { name: 'วันพุธ', planet: 'ดาวพุธ (๔) พลังแห่งสติปัญญาและการสื่อสาร' },
  { name: 'วันพฤหัสบดี', planet: 'ดาวพฤหัสบดี (๕) พลังแห่งคุรุ ปัญญา และความสำเร็จ' },
  { name: 'วันศุกร์', planet: 'ดาวศุกร์ (๖) พลังแห่งความรัก ศิลปะ และโภคทรัพย์' },
  { name: 'วันเสาร์', planet: 'ดาวเสาร์ (๗) พลังแห่งความมั่นคงและความอดทน' },
];

export function calculateAstroProfile(birthDate: string, birthTime?: string, unknownTime?: boolean): AstroProfile | null {
  if (!birthDate) return null;
  const parts = birthDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  const [year, month, day] = parts;
  const dateObj = new Date(year, month - 1, day);
  if (isNaN(dateObj.getTime())) return null;

  const buddhistYear = year + 543;
  const dayIndex = dateObj.getDay();
  const dayInfo = THAI_DAYS[dayIndex] || THAI_DAYS[0];

  // Determine Western/Tropical Zodiac Sign for immediate intuitive resonance
  let zodiacName = 'ราศีมังกร';
  let zodiacLatin = 'Capricorn';
  let element = 'ธาตุดิน (Earth)';
  let rulingPlanet = 'ดาวเสาร์ (Saturn)';

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    zodiacName = 'ราศีเมษ';
    zodiacLatin = 'Aries';
    element = 'ธาตุไฟ (Fire)';
    rulingPlanet = 'ดาวอังคาร (Mars)';
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    zodiacName = 'ราศีพฤษภ';
    zodiacLatin = 'Taurus';
    element = 'ธาตุดิน (Earth)';
    rulingPlanet = 'ดาวศุกร์ (Venus)';
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    zodiacName = 'ราศีเมถุน';
    zodiacLatin = 'Gemini';
    element = 'ธาตุลม (Air)';
    rulingPlanet = 'ดาวพุธ (Mercury)';
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    zodiacName = 'ราศีกรกฎ';
    zodiacLatin = 'Cancer';
    element = 'ธาตุน้ำ (Water)';
    rulingPlanet = 'ดวงจันทร์ (Moon)';
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    zodiacName = 'ราศีสิงห์';
    zodiacLatin = 'Leo';
    element = 'ธาตุไฟ (Fire)';
    rulingPlanet = 'ดวงอาทิตย์ (Sun)';
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    zodiacName = 'ราศีกันย์';
    zodiacLatin = 'Virgo';
    element = 'ธาตุดิน (Earth)';
    rulingPlanet = 'ดาวพุธ (Mercury)';
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    zodiacName = 'ราศีตุลย์';
    zodiacLatin = 'Libra';
    element = 'ธาตุลม (Air)';
    rulingPlanet = 'ดาวศุกร์ (Venus)';
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    zodiacName = 'ราศีพิจิก';
    zodiacLatin = 'Scorpio';
    element = 'ธาตุน้ำ (Water)';
    rulingPlanet = 'ดาวพลูโตและดาวอังคาร (Pluto & Mars)';
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    zodiacName = 'ราศีธนู';
    zodiacLatin = 'Sagittarius';
    element = 'ธาตุไฟ (Fire)';
    rulingPlanet = 'ดาวพฤหัสบดี (Jupiter)';
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    zodiacName = 'ราศีมังกร';
    zodiacLatin = 'Capricorn';
    element = 'ธาตุดิน (Earth)';
    rulingPlanet = 'ดาวเสาร์ (Saturn)';
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    zodiacName = 'ราศีกุมภ์';
    zodiacLatin = 'Aquarius';
    element = 'ธาตุลม (Air)';
    rulingPlanet = 'ดาวยูเรนัสและดาวเสาร์ (Uranus & Saturn)';
  } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    zodiacName = 'ราศีมีน';
    zodiacLatin = 'Pisces';
    element = 'ธาตุน้ำ (Water)';
    rulingPlanet = 'ดาวเนปจูนและดาวพฤหัสบดี (Neptune & Jupiter)';
  }

  // Approximate Solar Longitude and Lunar Phase for celestial ephemeris display
  const startOfYear = new Date(year, 0, 0);
  const diffDays = Math.floor((dateObj.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const solarDeg = (((diffDays + 280) % 365.25) * (360 / 365.25)).toFixed(2);

  // Synodic lunar cycle approximation
  const knownNewMoon = new Date(2000, 0, 6, 18, 14).getTime();
  const synodicMonth = 29.53058867 * 24 * 60 * 60 * 1000;
  const phaseRatio = (((dateObj.getTime() - knownNewMoon) % synodicMonth) + synodicMonth) % synodicMonth / synodicMonth;

  let lunarPhaseLabel = 'จันทร์เพ็ญ (Full Moon)';
  if (phaseRatio < 0.06 || phaseRatio > 0.94) lunarPhaseLabel = 'จันทร์ดับ (New Moon)';
  else if (phaseRatio < 0.22) lunarPhaseLabel = 'จันทร์เสี้ยวข้างขึ้น (Waxing Crescent)';
  else if (phaseRatio < 0.28) lunarPhaseLabel = 'จันทร์ครึ่งดวงข้างขึ้น (First Quarter)';
  else if (phaseRatio < 0.44) lunarPhaseLabel = 'จันทร์ค่อนดวงข้างขึ้น (Waxing Gibbous)';
  else if (phaseRatio < 0.56) lunarPhaseLabel = 'จันทร์เพ็ญเต็มดวง (Full Moon)';
  else if (phaseRatio < 0.72) lunarPhaseLabel = 'จันทร์ค่อนดวงข้างแรม (Waning Gibbous)';
  else if (phaseRatio < 0.78) lunarPhaseLabel = 'จันทร์ครึ่งดวงข้างแรม (Last Quarter)';
  else lunarPhaseLabel = 'จันทร์เสี้ยวข้างแรม (Waning Crescent)';

  const formattedThaiDate = `${day} ${THAI_MONTHS[month - 1]} พ.ศ. ${buddhistYear}`;
  const timeText = !unknownTime && birthTime ? `เวลาเกิด ${birthTime} น.` : 'ไม่ระบุเวลาเกิด';

  const summaryContext = `เกิด${dayInfo.name}ที่ ${formattedThaiDate} (${timeText}) | ${zodiacName} (${zodiacLatin}) | ${element} | ดาวเกษตรประจำราศี: ${rulingPlanet} | ดาวประจำวันเกิด: ${dayInfo.planet} | ดิถีจันทร์: ${lunarPhaseLabel}`;

  return {
    zodiacName,
    zodiacLatin,
    element,
    rulingPlanet,
    dayOfWeekThai: dayInfo.name,
    dayPlanet: dayInfo.planet,
    buddhistYear,
    formattedThaiDate,
    solarLongitudeDeg: `${solarDeg}°`,
    lunarPhaseLabel,
    summaryContext,
  };
}
