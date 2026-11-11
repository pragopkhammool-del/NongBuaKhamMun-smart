-- ====================================================================
-- SMART MOO4 - ระบบแพลตฟอร์มบริหารจัดการหมู่บ้านอัจฉริยะ
-- ข่าวสาร บ้านหนองบัวคำมูล หมู่ที่ 4
-- DATABASE SCHEMA & INITIAL DATA (SQL INSERT SCRIPT)
-- รองรับ: MySQL, PostgreSQL, MariaDB และ Cloud SQL
-- ====================================================================

-- 1. ตารางข้อมูลแหล่งข่าวสาร (News Sources)
CREATE TABLE IF NOT EXISTS news_sources (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    agency VARCHAR(255),
    url VARCHAR(500),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางข่าวสารและประกาศหมู่บ้าน (Village News & Announcements)
CREATE TABLE IF NOT EXISTS news (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'NORMAL', -- NORMAL, IMPORTANT, URGENT
    is_pinned BOOLEAN DEFAULT FALSE,
    author VARCHAR(150) NOT NULL,
    news_source_id VARCHAR(64),
    news_source_name VARCHAR(255),
    source_url VARCHAR(500),
    cover_url VARCHAR(500),
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (news_source_id) REFERENCES news_sources(id) ON DELETE SET NULL
);

-- 3. ตารางทะเบียนประชากรและราษฎร (Residents Registry)
CREATE TABLE IF NOT EXISTS residents (
    id VARCHAR(64) PRIMARY KEY,
    resident_code VARCHAR(50) NOT NULL UNIQUE,
    prefix VARCHAR(20) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    house_number VARCHAR(50) NOT NULL,
    moo VARCHAR(10) DEFAULT '4',
    phone VARCHAR(30),
    household_count INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, MOVED_OUT, DECEASED
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ตารางผู้นำชุมชนและกรรมการหมู่บ้าน (Village Committee)
CREATE TABLE IF NOT EXISTS village_committee (
    id VARCHAR(64) PRIMARY KEY,
    prefix VARCHAR(20) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_category VARCHAR(50) NOT NULL, -- HEADMAN, ASSISTANT, COMMITTEE, HEALTH_VOLUNTEER, VOLUNTEER
    position VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    responsibilities TEXT,
    term_start VARCHAR(100),
    display_order INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ตารางเรื่องแจ้งเหตุและร้องเรียน Citizen Voice (Reports)
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(64) PRIMARY KEY,
    report_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    urgency VARCHAR(50) DEFAULT 'NORMAL', -- NORMAL, HIGH, EMERGENCY
    is_anonymous BOOLEAN DEFAULT FALSE,
    reporter_name VARCHAR(150),
    reporter_phone VARCHAR(30),
    reporter_id VARCHAR(64),
    location_name VARCHAR(255),
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7),
    image_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'RECEIVED', -- RECEIVED, PENDING_CHECK, IN_PROGRESS, COORDINATED, RESOLVED, CANNOT_PROCEED
    status_note TEXT,
    resolution_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ตารางตลาดสินค้าชุมชน (Marketplace)
CREATE TABLE IF NOT EXISTS marketplace_items (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'ชิ้น',
    category VARCHAR(100) NOT NULL,
    seller_name VARCHAR(150) NOT NULL,
    seller_phone VARCHAR(30) NOT NULL,
    seller_id VARCHAR(64),
    location_area VARCHAR(255),
    image_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, SOLD, CLOSED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. ตารางโครงการพัฒนาและงบประมาณ (Public Projects & Transparency)
CREATE TABLE IF NOT EXISTS public_projects (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    budget DECIMAL(12, 2) NOT NULL,
    budget_source VARCHAR(255),
    responsible_agency VARCHAR(255),
    description TEXT,
    start_date DATE,
    end_date DATE,
    progress INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    before_image_url VARCHAR(500),
    during_image_url VARCHAR(500),
    after_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. ตารางปฏิทินกิจกรรมหมู่บ้าน (Village Events)
CREATE TABLE IF NOT EXISTS village_events (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time VARCHAR(20),
    end_time VARCHAR(20),
    location VARCHAR(255),
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7),
    organizer VARCHAR(150),
    registered_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'UPCOMING',
    cover_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- INSERT INITIAL DATA
-- ====================================================================

-- ข้อมูลแหล่งข่าวสาร (News Sources)
INSERT INTO news_sources (id, name, category, agency, url) VALUES
('src-1', 'องค์การบริหารส่วนตำบล (อบต.)', 'ราชการส่วนท้องถิ่น', 'กองงานประชาสัมพันธ์ อบต.', 'https://localgov.example.go.th'),
('src-2', 'กรมอุตุนิยมวิทยา', 'พยากรณ์อากาศและเตือนภัย', 'ศูนย์อุตุนิยมวิทยาภาคเหนือ', 'https://www.tmd.go.th'),
('src-3', 'สำนักงานเกษตรอำเภอ', 'เกษตรและพืชผล', 'กระทรวงเกษตรและสหกรณ์', 'https://doae.example.go.th'),
('src-4', 'กรมป้องกันและบรรเทาสาธารณภัย (ปภ.)', 'เตือนภัยธรรมชาติ', 'ปภ. จังหวัด', 'https://disaster.example.go.th'),
('src-5', 'หอกระจายข่าวบ้านหนองบัวคำมูล ม.4', 'ข่าวประชาสัมพันธ์ในหมู่บ้าน', 'ผู้ใหญ่บ้านและคณะกรรมการ ม.4', NULL);

-- ข้อมูลผู้นำและคณะกรรมการหมู่บ้าน (15 ท่านอย่างเป็นทางการ)
INSERT INTO village_committee (id, prefix, first_name, last_name, role_category, position, phone, responsibilities, term_start, display_order) VALUES
('comm-1', 'นาย', 'ธนพล', 'เสนบี้', 'HEADMAN', 'ผู้ใหญ่บ้าน / ประธาน', '081-234-5678', 'ผู้ใหญ่บ้านและประธานกรรมการหมู่บ้าน เป็นผู้นำฝ่ายบริหารงานหมู่บ้าน ประสานงานหน่วยงานราชการ', '2565 - ปัจจุบัน', 1),
('comm-2', 'นาย', 'สำรอง', 'คำมูล', 'ASSISTANT', 'รองประธาน', '089-876-5432', 'รองประธานกรรมการหมู่บ้าน ช่วยเหลืองานประธาน ควบคุมดูแลการปฏิบัติงาน', '2565 - ปัจจุบัน', 2),
('comm-3', 'นาย', 'ทองพูล', 'คำมูล', 'ASSISTANT', 'รองประธาน (ถ้ามี)', '086-555-4321', 'รองประธานกรรมการหมู่บ้าน ดูแลระบบสาธารณูปโภค แหล่งน้ำ', '2565 - ปัจจุบัน', 3),
('comm-4', 'นาย', 'พิบูลย์', 'คำมูล', 'COMMITTEE', 'เลขานุการ', '084-111-2233', 'เลขานุการ รับผิดชอบงานเอกสาร งานสารบรรณ จัดทำรายงานการประชุม', '2565 - ปัจจุบัน', 4),
('comm-5', 'นาย', 'สุนทร', 'โนนทิง', 'COMMITTEE', 'เหรัญญิก', '082-333-4455', 'เหรัญญิก ดูแลการเงินและบัญชีกองทุนหมู่บ้าน จัดทำบัญชีรายรับ-รายจ่าย', '2565 - ปัจจุบัน', 5),
('comm-6', 'นาย', 'ประดิษฐ์', 'โสมนาวัตร', 'COMMITTEE', 'กรรมการ', '085-444-5566', 'กรรมการหมู่บ้าน ฝ่ายพัฒนาโครงสร้างพื้นฐานและงานสาธารณประโยชน์', '2565 - ปัจจุบัน', 6),
('comm-7', 'นาย', 'ดาวรุ่ง', 'โพธิ์ศรี', 'COMMITTEE', 'กรรมการ', '087-555-6677', 'กรรมการหมู่บ้าน ฝ่ายส่งเสริมอาชีพและการเกษตรอินทรีย์ชุมชน', '2565 - ปัจจุบัน', 7),
('comm-8', 'นาง', 'สุวรรณ', 'คำมูล', 'COMMITTEE', 'กรรมการ', '083-666-7788', 'กรรมการหมู่บ้าน ฝ่ายส่งเสริมกลุ่มสตรี สวัสดิการสังคม และผู้สูงอายุ', '2565 - ปัจจุบัน', 8),
('comm-9', 'นาง', 'คำปน', 'แก้วปัญญา', 'COMMITTEE', 'กรรมการ', '086-777-8899', 'กรรมการหมู่บ้าน ฝ่ายศาสนา วัฒนธรรม งานบุญประเพณี และการศึกษา', '2565 - ปัจจุบัน', 9),
('comm-10', 'นาย', 'ธนายุทธ', 'ก่านพรมมา', 'COMMITTEE', 'กรรมการ', '081-888-9900', 'กรรมการหมู่บ้าน ฝ่ายกิจกรรมเยาวชน กีฬา และการสื่อสารดิจิทัล', '2565 - ปัจจุบัน', 10),
('comm-11', 'นาย', 'นิยม', 'คำมูล', 'COMMITTEE', 'กรรมการ', '088-999-0011', 'กรรมการหมู่บ้าน ฝ่ายป้องกันและบรรเทาสาธารณภัย กิจการ อปพร.', '2565 - ปัจจุบัน', 11),
('comm-12', 'นาย', 'ประคอง', 'วรบุตร', 'COMMITTEE', 'กรรมการ', '089-000-1122', 'กรรมการหมู่บ้าน ฝ่ายงานรักษาความสงบเรียบร้อยและระเบียบวินัยชุมชน', '2565 - ปัจจุบัน', 12),
('comm-13', 'นาย', 'บุญฟุ้ง', 'สมภาร', 'COMMITTEE', 'กรรมการ', '082-111-2233', 'กรรมการหมู่บ้าน ฝ่ายโยธาและซ่อมบำรุงไฟฟ้าสาธารณะ ไฟส่องสว่างทางสัญจร', '2565 - ปัจจุบัน', 13),
('comm-14', 'นาย', 'ประหยัด', 'คำมูล', 'COMMITTEE', 'กรรมการ', '084-222-3344', 'กรรมการหมู่บ้าน ฝ่ายสิ่งแวดล้อม การจัดการขยะชุมชน และรักษาความสะอาด', '2565 - ปัจจุบัน', 14),
('comm-15', 'นาย', 'ประมวล', 'โพธิ์ศรี', 'COMMITTEE', 'กรรมการ', '087-333-4455', 'กรรมการหมู่บ้าน ฝ่ายตรวจสอบ ประเมินผล และรับฟังความคิดเห็นจากชาวบ้าน', '2565 - ปัจจุบัน', 15);

-- ข้อมูลทะเบียนประชากรเริ่มต้น
INSERT INTO residents (id, resident_code, prefix, first_name, last_name, house_number, moo, phone, household_count) VALUES
('res-1', 'RES-001-01', 'นาย', 'สมหมาย', 'คำมูล', '1', '4', '081-234-5678', 4),
('res-2', 'RES-012-01', 'นาย', 'ประสิทธิ์', 'สุขสมบูรณ์', '12', '4', '087-654-3210', 3),
('res-3', 'RES-025-01', 'นางสาว', 'จันทร์เพ็ญ', 'ศรีมณฑล', '25', '4', '083-999-8877', 2),
('res-4', 'RES-044-01', 'นาย', 'คำมูล', 'บัวคำมูล', '44', '4', '085-111-2233', 5);

-- ข้อมูลข่าวสารพร้อมบันทึกแหล่งข่าว
INSERT INTO news (id, title, content, category, priority, is_pinned, author, news_source_id, news_source_name, source_url) VALUES
('news-1', 'ประกาศนัดประชุมประชาคมหมู่บ้านประจำเดือน ครั้งที่ 1/2569', 'ขอเชิญพ่อแม่พี่น้องชาวบ้านหนองบัวคำมูล หมู่ที่ 4 ทุกหลังคาเรือน เข้าร่วมประชุมประชาคม ณ ศาลาประชาคมหมู่ 4 เวลา 18:00 น.', 'ข่าวประชาสัมพันธ์', 'IMPORTANT', TRUE, 'ผู้ใหญ่บ้านสมหมาย คำมูล', 'src-5', 'หอกระจายข่าวบ้านหนองบัวคำมูล ม.4', NULL),
('news-2', 'แจ้งเตือนเฝ้าระวังพายุฤดูร้อนและลมกระโชกแรงในสัปดาห์นี้', 'กรมอุตุนิยมวิทยาแจ้งเตือนพื้นที่ภาคเหนือตอนบนอาจมีพายุฝนฟ้าคะนอง ลมกระโชกแรง ขอให้ประชาชนตรวจตราหลังคาบ้านและระวังต้นไม้ใหญ่', 'ข่าวแจ้งเตือนภัย', 'URGENT', FALSE, 'ฝ่ายความมั่นคง ม.4', 'src-2', 'กรมอุตุนิยมวิทยา', 'https://www.tmd.go.th');

-- ข้อมูลเรื่องแจ้งเหตุ Citizen Voice
INSERT INTO reports (id, report_number, title, category, description, urgency, location_name, lat, lng, status, status_note) VALUES
('rep-1', 'MOO4-2026-00001', 'โคมไฟถนนดับ บริเวณปากซอย 3 หน้าบ้านลุงจันทร์', 'ไฟฟ้าส่องสว่างดับ', 'หลอดไฟ LED ดับสนิท มืดมากทำให้เสี่ยงต่อการเกิดอุบัติเหตุ', 'HIGH', 'ปากซอย 3 ถนนสายหลัก ม.4', 18.7878000, 98.9862000, 'IN_PROGRESS', 'ผู้ใหญ่บ้านประสานงานช่างไฟฟ้า อบต. เข้าตรวจสอบแล้ว'),
('rep-2', 'MOO4-2026-00002', 'ท่อส่งน้ำประปาหมู่บ้านแตกรั่ว น้ำไหลนองเต็มถนน', 'น้ำประปาไม่ไหล', 'ท่อ PVC เมนรองแตกรั่วข้างศาลาหมู่บ้าน', 'EMERGENCY', 'ข้างศาลาประชาคม ม.4', 18.7885000, 98.9850000, 'RESOLVED', 'ทีมช่างประปาทำการตัดต่อท่อใหม่เรียบร้อยแล้ว');
