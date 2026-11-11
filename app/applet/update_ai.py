with open('src/components/AiAssistantTab.tsx', 'r') as f:
    content = f.read()

target = '''// Client-side Village Knowledge Base Engine (Fallback for static hosts like Netlify)
function generateClientVillageAnswer(
  prompt: string, 
  news: NewsItem[], 
  events: VillageEvent[], 
  committee: CommitteeMember[], 
  marketItems: MarketplaceItem[], 
  reports: Report[]
): string {
  const p = prompt.toLowerCase();
  if (p.includes('ผู้ใหญ่บ้าน') || p.includes('ประธาน') || p.includes('หัวหน้า') || p.includes('เสนบี้')) {'''

replacement = '''// Client-side Village Knowledge Base Engine (Fallback for static hosts like Netlify)
function generateClientVillageAnswer(
  prompt: string, 
  news: NewsItem[], 
  events: VillageEvent[], 
  committee: CommitteeMember[], 
  marketItems: MarketplaceItem[], 
  reports: Report[]
): string {
  const p = prompt.toLowerCase();

  if (p.includes('ส้มตำ') || p.includes('ตำส้ม') || p.includes('วิธีทำส้มตำ')) {
    return 'สูตรและวิธีทำ "ส้มตำ" แซ่บนัวสไตล์อีสานบ้านเราครับ:\\n\\n**วัตถุดิบและเครื่องปรุง:**\\n1. มะละกอดิบสับหรือขูดเส้นกรอบๆ 1 กำมือใหญ่\\n2. พริกขี้หนูสวน (ตามชอบ เผ็ดมากเผ็ดน้อย)\\n3. กระเทียมไทย 3-5 กลีบ\\n4. น้ำตาลปี๊บ 1 ช้อนโต๊ะ\\n5. น้ำปลาดี 1.5 ช้อนโต๊ะ\\n6. น้ำมะขามเปียก 1 ช้อนโต๊ะ และมะนาว 1 ซีก\\n7. มะเขือเทศสีดาหั่นชิ้น และถั่วฝักยาวหั่นท่อน\\n8. น้ำปลาร้าต้มสุกนัวๆ 1.5 ช้อนโต๊ะ\\n9. กุ้งแห้งและถั่วลิสงคั่ว (ถ้าชอบ)\\n\\n**วิธีทำ:**\\n1. โขลกกระเทียมและพริกขี้หนูพอแหลม\\n2. ใส่น้ำตาลปี๊บ น้ำปลา น้ำมะขามเปียก น้ำปลาร้า และบีบมะนาว คนให้น้ำตาลละลายชิมรสตามชอบ (เปรี้ยว หวาน เค็ม นัว)\\n3. ใส่ถั่วฝักยาวและมะเขือเทศ บุบพอช้ำ\\n4. ใส่มะละกอดิบลงไป ใช้ส้อมและทัพพีคลุกเคล้าตำเบาๆ ให้รสน้ำยำซึมเข้าเส้นมะละกอ\\n5. ตักใส่จาน โรยถั่วลิสงและกุ้งแห้ง พร้อมเสิร์ฟคู่ข้าวเหนียวร้อนๆ และผักสดครับ!';
  }

  if (p.includes('ข้าวสาร') || p.includes('มอด') || p.includes('เก็บข้าวสาร') || p.includes('ถนอมข้าวสาร')) {
    return 'วิธีดูแลและเก็บรักษา "ข้าวสาร" ให้อยู่ได้นาน ปลอดภัยจากมอดและแมลง:\\n\\n1. **ใช้ภาชนะมีฝาปิดสนิท:** เก็บข้าวสารในถังพลาสติกหรือโอ่งที่มีฝาปิดมิดชิด ป้องกันความชื้นและอากาศเข้า\\n2. **เคล็ดลับไล่มอดธรรมชาติ:**\\n   - ใส่ **พริกแห้ง** (ประมาณ 10-15 เม็ด) ลงไปในถังข้าวสาร ความเผ็ดร้อนช่วยไล่มอดได้ดีเยี่ยม\\n   - ใส่ **ใบมะกรูด** ฉีกหรือใบเตยสด เพื่อไล่แมลงและเพิ่มความหอม\\n   - ใส่ **ขิงหรือข่าหั่นแว่น** ก็ช่วยกันมอดได้เช่นกัน\\n3. **เก็บในที่แห้งและเย็น:** วางถังข้าวในที่ร่ม อากาศถ่ายเทสะดวก หลีกเลี่ยงบริเวณที่โดนแดดส่องถึงหรือมีความชื้นสูง\\n4. **เคล็ดลับเก็บนานเป็นปี:** หากซื้อข้าวสารมาตุนจำนวนมาก สามารถแบ่งใส่ถุงซิปล็อกแช่ช่องแข็ง (Freezer) ประมาณ 3-5 วันเพื่อฆ่าไข่มอด แล้วนำมาเก็บในอุณหภูมิปกติได้ยาวนานครับ';
  }

  if (p.includes('ผู้ใหญ่บ้าน') || p.includes('ประธาน') || p.includes('หัวหน้า') || p.includes('เสนบี้')) {'''

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/AiAssistantTab.tsx', 'w') as f:
        f.write(content)
    print('SUCCESS')
else:
    print('TARGET NOT FOUND')
