// Source: Google Maps Platform Code Assist
import React, { useState, useEffect } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow 
} from '@vis.gl/react-google-maps';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  Filter, 
  Info,
  Building2,
  Landmark
} from 'lucide-react';
import { firebaseConfig } from '../firebase';
import type { Report } from '../types';

interface MapTabProps {
  reports: Report[];
  onSelectTab: (tab: string) => void;
}

// Fixed coordinates for Ban Nong Bua Kham Mool Moo 4 center
const VILLAGE_CENTER = { lat: 18.7883, lng: 98.9853 };

// Key Village Landmarks
const VILLAGE_LANDMARKS = [
  {
    id: 'landmark-1',
    name: 'ศาลาประชาคมบ้านหนองบัวคำมูล ม.4',
    type: 'COMMUNITY_CENTER',
    lat: 18.7883,
    lng: 98.9853,
    description: 'ศูนย์กลางการประชุมประชาคม กองทุนหมู่บ้าน และจุดบริการราชการ',
    color: '#164B3C'
  },
  {
    id: 'landmark-2',
    name: 'วัดหนองบัวคำมูล',
    type: 'TEMPLE',
    lat: 18.7895,
    lng: 98.9870,
    description: 'ศูนย์รวมจิตใจ สถานที่จัดงานบุญประเพณี และลานกิจกรรมชุมชน',
    color: '#F39C12'
  },
  {
    id: 'landmark-3',
    name: 'โรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.) หนองบัว',
    type: 'HEALTH_CENTER',
    lat: 18.7865,
    lng: 98.9840,
    description: 'จุดตรวจรักษาเบื้องต้น ศูนย์ประสานงาน อสม. และบริการสาธารณสุข',
    color: '#E74C3C'
  },
  {
    id: 'landmark-4',
    name: 'จุดรวมพลและศูนย์ช่วยเหลือฉุกเฉิน ม.4',
    type: 'EVAC_POINT',
    lat: 18.7872,
    lng: 98.9880,
    description: 'จุดรวมพลยามเกิดภัยธรรมชาติ อัคคีภัย หรือเหตุฉุกเฉิน',
    color: '#3498DB'
  }
];

export const MapTab: React.FC<MapTabProps> = ({ reports, onSelectTab }) => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<typeof VILLAGE_LANDMARKS[0] | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(true);

  // Maps API key from env or fallback to firebase config
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || firebaseConfig.apiKey || '';

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('เบราว์เซอร์ไม่รองรับ GPS');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('กรุณากดยินยอมเปิดการเข้าถึงตำแหน่งที่ตั้งในโทรศัพท์ของท่านครับ');
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const getMarkerColor = (status: Report['status']) => {
    switch (status) {
      case 'RECEIVED': return '#F39C12'; // Yellow/Orange
      case 'PENDING_CHECK': return '#E67E22';
      case 'IN_PROGRESS': return '#3498DB'; // Blue
      case 'COORDINATED': return '#9B59B6'; // Purple
      case 'RESOLVED': return '#27AE60'; // Green
      case 'CANNOT_PROCEED': return '#95A5A6';
      default: return '#E74C3C';
    }
  };

  const filteredReports = reports.filter(r => {
    if (!r.lat || !r.lng) return false;
    if (filterCategory === 'ALL') return true;
    return r.category === filterCategory;
  });

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#164B3C] to-[#23865B] rounded-3xl p-5 text-white shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-300" />
            <h1 className="text-lg sm:text-xl font-bold">แผนที่ชุมชนบ้านหนองบัวคำมูล ม.4</h1>
          </div>
          <p className="text-xs text-emerald-100 mt-1">
            แสดงจุดแจ้งเหตุ ถนนชำรุด ไฟฟ้าดับ สถานที่สำคัญ และจุดรวมพล
          </p>
        </div>

        {/* Locate Me button */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center space-x-1.5 flex-shrink-0"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isLocating ? 'ค้นหา...' : 'ตำแหน่งฉัน'}</span>
        </button>
      </div>

      {/* Filter and Legend Controls */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">กรองเหตุการณ์:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#23865B]"
          >
            <option value="ALL">ทั้งหมด ({reports.filter(r => r.lat && r.lng).length})</option>
            <option value="ถนนชำรุด">ถนนชำรุด</option>
            <option value="ไฟฟ้าส่องสว่างดับ">ไฟฟ้าส่องสว่างดับ</option>
            <option value="น้ำประปาไม่ไหล">น้ำประปาไม่ไหล</option>
            <option value="ขยะตกค้าง/ส่งกลิ่นเหม็น">ขยะตกค้าง</option>
            <option value="อุบัติเหตุ/จุดเสี่ยงทางถนน">อุบัติเหตุ/จุดเสี่ยง</option>
          </select>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-slate-500">
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showLandmarks}
              onChange={(e) => setShowLandmarks(e.target.checked)}
              className="rounded text-[#23865B] focus:ring-[#23865B]"
            />
            <span>สถานที่สำคัญ</span>
          </label>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>ดำเนินการ</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>แก้ไขแล้ว</span>
          </span>
        </div>
      </div>

      {/* Interactive Google Map Container */}
      <div className="relative w-full h-[65vh] rounded-3xl overflow-hidden shadow-md border border-slate-200">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={VILLAGE_CENTER}
            defaultZoom={15}
            mapId="DEMO_MAP_ID"
            className="w-full h-full"
            internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
            options={{
              gestureHandling: 'greedy',
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true
            }}
          >
            {/* User current location marker */}
            {userLocation && (
              <AdvancedMarker position={userLocation}>
                <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </AdvancedMarker>
            )}

            {/* Landmark Markers */}
            {showLandmarks && VILLAGE_LANDMARKS.map(lm => (
              <AdvancedMarker
                key={lm.id}
                position={{ lat: lm.lat, lng: lm.lng }}
                onClick={() => {
                  setSelectedLandmark(lm);
                  setSelectedReport(null);
                }}
              >
                <Pin 
                  background={lm.color} 
                  borderColor="#FFFFFF" 
                  glyphColor="#FFFFFF"
                  scale={1.1}
                />
              </AdvancedMarker>
            ))}

            {/* Incident Report Markers from Firestore */}
            {filteredReports.map(rep => (
              <AdvancedMarker
                key={rep.id}
                position={{ lat: rep.lat!, lng: rep.lng! }}
                onClick={() => {
                  setSelectedReport(rep);
                  setSelectedLandmark(null);
                }}
              >
                <Pin 
                  background={getMarkerColor(rep.status)} 
                  borderColor="#FFFFFF" 
                  glyphColor="#FFFFFF"
                  scale={1.2}
                />
              </AdvancedMarker>
            ))}

            {/* Report InfoWindow */}
            {selectedReport && selectedReport.lat && selectedReport.lng && (
              <InfoWindow
                position={{ lat: selectedReport.lat, lng: selectedReport.lng }}
                onCloseClick={() => setSelectedReport(null)}
              >
                <div className="p-2 max-w-xs text-slate-800">
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {selectedReport.reportNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {selectedReport.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">
                    {selectedReport.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {selectedReport.description}
                  </p>
                  {selectedReport.statusNote && (
                    <div className="mt-1.5 text-[10px] bg-slate-50 p-1.5 rounded border border-slate-100 text-slate-700">
                      <span className="font-semibold">ความคืบหน้า: </span>
                      {selectedReport.statusNote}
                    </div>
                  )}
                  <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {selectedReport.locationName || 'พิกัด ม.4'}
                    </span>
                    <button
                      onClick={() => onSelectTab('report')}
                      className="text-[11px] text-[#23865B] font-bold hover:underline"
                    >
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* Landmark InfoWindow */}
            {selectedLandmark && (
              <InfoWindow
                position={{ lat: selectedLandmark.lat, lng: selectedLandmark.lng }}
                onCloseClick={() => setSelectedLandmark(null)}
              >
                <div className="p-2 max-w-xs text-slate-800">
                  <div className="flex items-center space-x-1.5 mb-1 text-[#164B3C]">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase">สถานที่สำคัญในหมู่บ้าน</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">
                    {selectedLandmark.name}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {selectedLandmark.description}
                  </p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Floating Quick Action Button on Map */}
        <div className="absolute bottom-4 left-4 z-10">
          <button
            onClick={() => onSelectTab('report')}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl shadow-xl transition-transform active:scale-95"
          >
            <AlertCircle className="w-4 h-4" />
            <span>แจ้งเหตุตรงนี้</span>
          </button>
        </div>
      </div>
    </div>
  );
};
