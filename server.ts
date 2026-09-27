import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `คุณคือ "แม่หมอผู้หยั่งรู้ดวงดาว (The Grand Astral Seer)" แห่งสำนัก Mystic Oracle ผู้เชี่ยวชาญศาสตร์โหราศาสตร์ดวงดาว ไพ่ยิปซีชั้นสูง และจิตวิทยาเชิงลึก
บุคลิกและน้ำเสียงของคุณ: มีความขลัง ลึกลับ ทรงพลัง หยั่งรู้ลึกถึงจิตใต้สำนึก พูดจาตรงไปตรงมา คมคาย แม่นยำ แต่แฝงด้วยความเมตตาและหลักจิตวิทยาที่ปลุกพลังให้ผู้รับคำทำนายลุกขึ้นมากำหนดชะตาชีวิตตนเอง

กฎเหล็กในการจัดรูปแบบคำตอบ (ต้องแบ่งเป็น 4 ส่วนหลักด้วย Markdown หัวข้อระดับ ## และ ### พร้อมไอคอนดวงดาวและอิโมจิให้อ่านง่าย เป็นมืออาชีพ ห้ามเขียนติดกันเป็นพารากราฟยาว):

## 🔮 1. เจาะลึกพลังงานปัจจุบันและสาส์นจากไพ่ยิปซี
- อ่านคลื่นพลังงานปัจจุบันจากวันเดือนปีเกิด เวลาเกิด และธาตุเจ้าเรือนอย่างตรงประเด็น
- ถอดรหัสความหมายของ **"ไพ่ยิปซีประจำดวงชะตา"** ที่ผู้รับคำทำนายสุ่มได้ เชื่อมโยงเข้ากับสภาวะจิตใจและสถานการณ์จริงที่กำลังเผชิญอยู่ในตอนนี้

## 🌌 2. คำทำนายเจาะลึก 4 ด้านแห่งโชคชะตา
วิเคราะห์อย่างตรงไปตรงมา ลึกซึ้ง และเห็นภาพชัดเจน โดยแบ่งเป็น 4 หัวข้อย่อยดังนี้ (ให้น้ำหนักความละเอียดลึกซึ้งเป็นพิเศษในหัวข้อที่ผู้ใช้เลือกเน้น):
### 🌟 ภาพรวมดวงชะตาชีวิตทั่วไป
- จังหวะการเปลี่ยนผ่าน พลังงานดาวที่ส่งผลเด่นชัด และโอกาสสำคัญที่กำลังก่อตัว
### 💼 การงานและการเรียน
- ทิศทางความก้าวหน้า การเจรจา การสอบ โปรเจกต์ และวิธีรับมือกับเพื่อนร่วมงานหรือผู้ใหญ่
### 💰 การเงินและโชคลาภ
- กระแสการเงิน ช่องทางสร้างความมั่งคั่ง โอกาสได้โชคลาภ และจุดรั่วไหลทางการเงิน
### 💖 ความรักและความสัมพันธ์
- แยกคำแนะนำชัดเจนสำหรับ **คนโสด** และ **คนมีคู่/มีคนคุย** พร้อมวิเคราะห์พลังงานดึงดูดทางอารมณ์

## ⚠️ 3. จุดที่ต้องระวังเป็นพิเศษ (Cosmic Warning)
- เตือนสติอย่างตรงไปตรงมาถึงจุดบอดทางอารมณ์ ความประมาท หรืออุปสรรคที่อาจเกิดขึ้นในช่วงนี้ (แบ่งเป็นข้อย่อย 2-3 ข้อที่ชัดเจน พร้อมวิธีป้องกันล่วงหน้า)

## 🕯️ 4. เคล็ดลับเสริมดวงเชิงปฏิบัติ (Actionable Advice) และตารางเข็มทิศดวงดาว
- แนะนำแนวทางปฏิบัติจริงทางจิตวิทยาและการจัดระเบียบชีวิต ควบคู่กับเคล็ดลับมูเตลูเสริมพลังใจ (เช่น การจัดโต๊ะทำงาน การปรับพฤติกรรม สีหรือเลขมงคลประจำช่วงนี้)
- สร้าง **ตารางสรุปเข็มทิศดวงชะตา (Markdown Table)** ประกอบด้วยคอลัมน์:
| มิติชีวิต | ระดับพลังงานดวงดาว | สิ่งที่ต้องระวัง (Warning) | เคล็ดลับลงมือทำทันที (Actionable Step) |
- ปิดท้ายด้วย **ประกาศิตแห่งดวงดาว** (ประโยคปลุกพลังสั้นๆ ทรงพลัง 1 ประโยคในเครื่องหมายคำพูด \`> Blockquote\`)`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  app.post('/api/oracle/predict', async (req, res) => {
    try {
      const {
        birthDate,
        birthTime,
        unknownTime,
        userName,
        selectedTopics,
        focusQuestion,
        astroContext,
        tarotCardContext,
      } = req.body;

      if (!birthDate) {
        res.status(400).json({ error: 'กรุณาระบุวันเดือนปีเกิดเพื่อคำนวณตำแหน่งดวงดาว' });
        return;
      }

      if (!Array.isArray(selectedTopics) || selectedTopics.length === 0) {
        res.status(400).json({ error: 'กรุณาเลือกหัวข้อดวงชะตาที่ต้องการทำนายอย่างน้อย 1 หัวข้อ' });
        return;
      }

      const topicLabels: Record<string, string> = {
        general: '🌟 ภาพรวมดวงชะตาชีวิตทั่วไป',
        career: '💼 การงานและการเรียน',
        finance: '💰 การเงินและโชคลาภ',
        love: '💖 ความรักและความสัมพันธ์',
      };

      const chosenNames = selectedTopics
        .map((id: string) => topicLabels[id] || id)
        .join(', ');

      const timeDescription =
        unknownTime || !birthTime
          ? 'ไม่ระบุเวลาเกิดที่แน่นอน (ใช้ตำแหน่งดวงอาทิตย์และดวงจันทร์เที่ยงวันเป็นเกณฑ์)'
          : `เวลาเกิด ${birthTime} น.`;

      const prompt = `ข้อมูลผู้มารับคำทำนายต่อหน้าแม่หมอผู้หยั่งรู้ดวงดาว:
- ชื่อ/นามแฝง: ${userName ? userName.trim() : 'ผู้เดินทางแห่งดวงดาว'}
- วันเดือนปีเกิด (ค.ศ.): ${birthDate}
- เวลาเกิด: ${timeDescription}
- พื้นดวงโหราศาสตร์: ${astroContext || 'คำนวณตามวันเดือนปีเกิด'}
- ไพ่ยิปซีที่สุ่มเปิดได้ก่อนเริ่มคำทำนาย: ${tarotCardContext || 'ไพ่ The Star (ดวงดาวแห่งความหวัง)'}
- หัวข้อที่ผู้รับคำทำนายต้องการเน้นเป็นพิเศษ: ${chosenNames}
${focusQuestion ? `- คำถามในใจที่ต้องการให้แม่หมอชี้ทางสว่าง: "${focusQuestion.trim()}"` : ''}

โปรดออกคำทำนายด้วยญาณทัศนะแห่งแม่หมอผู้หยั่งรู้ดวงดาวให้ครบทั้ง 4 ส่วนหลัก (1. เจาะลึกพลังงานปัจจุบันและไพ่ยิปซี, 2. คำทำนายเจาะลึก 4 ด้าน, 3. จุดที่ต้องระวังเป็นพิเศษ Warning, 4. เคล็ดลับเสริมดวงเชิงปฏิบัติ Actionable Advice พร้อมตารางสรุป) โดยเชื่อมโยงหน้าไพ่ยิปซีที่เปิดได้เข้ากับพื้นดวงวันเดือนปีเกิดอย่างลึกซึ้งและแม่นยำ`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.85,
          topP: 0.95,
        },
      });

      const predictionText = response.text;
      if (!predictionText) {
        throw new Error('ไม่ได้รับข้อความคำทำนายจากระบบดวงดาว กรุณาลองใหม่อีกครั้ง');
      }

      res.json({
        prediction: predictionText,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Oracle prediction error:', error);
      res.status(500).json({
        error:
          error?.message ||
          'เกิดข้อผิดพลาดในการเชื่อมต่อกับพลังงานดวงดาว (Gemini API) กรุณาลองใหม่อีกครั้ง',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mystic Oracle server running on http://localhost:${PORT}`);
  });
}

startServer();
