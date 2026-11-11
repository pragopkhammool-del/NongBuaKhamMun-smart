import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
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
  Filter, 
  Building2,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Layers
} from 'lucide-react';
import { firebaseConfig } from '../firebase';
import type { Report } from '../types';

interface MapTabProps {
  reports: Report[];
  onSelectTab: (tab: string) => void;
}

// Center coordinates for Ban Nong Bua Kham Mool Moo 4 (ต.คูคำ อ.ซำสูง จ.ขอนแก่น)
const VILLAGE_CENTER = { lat: 16.505663, lng: 103.005112 };
const GOOGLE_MAPS_LINK = "https://maps.app.goo.gl/vP2DMndeGVAj5iKk6";

// Key Village Landmarks (บ้านหนองบัวคำมูล ม.4 ต.คูคำ อ.ซำสูง จ.ขอนแก่น)
const VILLAGE_LANDMARKS = [
  {
    id: 'landmark-1',
    name: 'ศาลาประชาคมบ้านหนองบัวคำมูล ม.4',
    type: 'COMMUNITY_CENTER',
    lat: 16.505663,
    lng: 103.005112,
    description: 'ศูนย์กลางการประชุมประชาคม กองทุนหมู่บ้าน และจุดบริการราชการ ต.คูคำ อ.ซำสูง',
    color: '#164B3C'
  },
  {
    id: 'landmark-2',
    name: 'วัดหนองบัวคำมูล',
    type: 'TEMPLE',
    lat: 16.506800,
    lng: 103.006500,
    description: 'ศูนย์รวมจิตใจ สถานที่จัดงานบุญประเพณี และลานกิจกรรมชุมชน',
    color: '#F39C12'
  },
  {
    id: 'landmark-3',
    name: 'โรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.) คูคำ',
    type: 'HEALTH_CENTER',
    lat: 16.504200,
    lng: 103.003800,
    description: 'จุดตรวจรักษาเบื้องต้น ศูนย์ประสานงาน อสม. และบริการสาธารณสุข',
    color: '#E74C3C'
  },
  {
    id: 'landmark-4',
    name: 'จุดรวมพลและศูนย์ช่วยเหลือฉุกเฉิน ม.4',
    type: 'EVAC_POINT',
    lat: 16.505100,
    lng: 103.007200,
    description: 'จุดรวมพลยามเกิดภัยธรรมชาติ อัคคีภัย หรือเหตุฉุกเฉิน',
    color: '#3498DB'
  }
];

// Error Boundary for Map Component to prevent white screen
class MapErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Google Maps Component error, falling back to Iframe view:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const MapTab: React.FC<MapTabProps> = ({ reports, onSelectTab }) => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<typeof VILLAGE_LANDMARKS[0] | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [mapMode, setMapMode] = useState<'INTERACTIVE' | 'EMBED'>('EMBED');

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
      case 'RECEIVED': return '#F39C12';
      case 'PENDING_CHECK': return '#E67E22';
      case 'IN_PROGRESS': return '#3498DB';
      case 'COORDINATED': return '#9B59B6';
      case 'RESOLVED': return '#27AE60';
      case 'CANNOT_PROCEED': return '#95A5A6';
      default: return '#E74C3C';
    }
  };

  const filteredReports = reports.filter(r => {
    if (!r.lat || !r.lng) return false;
    if (filterCategory === 'ALL') return true;
    return r.category === filterCategory;
  });

  // Iframe fallback component for 100% reliable rendering on Netlify / production
  const IframeMapFallback = (
    <div className="relative w-full h-[65vh] rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-100 flex flex-col items-center justify-center">
      <iframe
        title="แผนที่บ้านหนองบัวคำมูล ม.4"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={`https://maps.google.com/maps?q=${VILLAGE_CENTER.lat},${VILLAGE_CENTER.lng}&z=16&output=embed`}
      />
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-bold text-slate-800 flex items-center space-x-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>แผนที่ชุมชน ม.4 ต.คูคำ อ.ซำสูง จ.ขอนแก่น</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-20 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#2D6A4F] via-[#40916C] to-[#52B788] rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-200" />
            <h1 className="text-lg sm:text-xl font-extrabold">แผนที่ชุมชนบ้านหนองบัวคำมูล ม.4</h1>
          </div>
          <p className="text-xs text-emerald-100 mt-1">
            ต.คูคำ อ.ซำสูง จ.ขอนแก่น (แสดงจุดแจ้งเหตุ ไฟฟ้าดับ ถนนชำรุด และสถานที่สำคัญ)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-wrap">
          <a
            href={GOOGLE_MAPS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition-transform active:scale-95 flex items-center space-x-1.5"
            title="เปิดนำทางด้วยแอป Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>เปิด Google Maps</span>
          </a>

          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center space-x-1.5"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'ค้นหา...' : 'ตำแหน่งฉัน'}</span>
          </button>
        </div>
      </div>

      {/* Map View Mode & Filter Controls */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">กรองเหตุการณ์:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">ทั้งหมด ({reports.filter(r => r.lat && r.lng).length})</option>
            <option value="ถนนชำรุด">ถนนชำรุด</option>
            <option value="ไฟฟ้าส่องสว่างดับ">ไฟฟ้าส่องสว่างดับ</option>
            <option value="น้ำประปาไม่ไหล">น้ำประปาไม่ไหล</option>
            <option value="ขยะตกค้าง/ส่งกลิ่นเหม็น">ขยะตกค้าง</option>
            <option value="อุบัติเหตุ/จุดเสี่ยงทางถนน">อุบัติเหตุ/จุดเสี่ยง</option>
          </select>
        </div>

        {/* Map Type Switcher */}
        <div className="flex items-center space-x-2">
          <div className="inline-flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-bold">
            <button
              onClick={() => setMapMode('EMBED')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                mapMode === 'EMBED' ? 'bg-[#2D6A4F] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              แผนที่ดาวเทียม/ฝังในเว็บ
            </button>
            <button
              onClick={() => setMapMode('INTERACTIVE')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                mapMode === 'INTERACTIVE' ? 'bg-[#2D6A4F] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              แผนที่หมวดหมุดเหตุการณ์
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Viewport */}
      {mapMode === 'EMBED' ? (
        IframeMapFallback
      ) : (
        <MapErrorBoundary fallback={IframeMapFallback}>
          <div className="relative w-full h-[65vh] rounded-3xl overflow-hidden shadow-md border border-slate-200">
            <APIProvider apiKey={apiKey}>
              <Map
                defaultCenter={VILLAGE_CENTER}
                defaultZoom={15}
                mapId="DEMO_MAP_ID"
                className="w-full h-full"
                options={{
                  gestureHandling: 'greedy',
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true
                }}
              >
                {/* User location marker */}
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

                {/* Incident Report Markers */}
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
          </div>
        </MapErrorBoundary>
      )}

      {/* Landmarks & Reports Highlights List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {VILLAGE_LANDMARKS.map(lm => (
          <div
            key={lm.id}
            className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition-all flex items-start space-x-3"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-2xs"
              style={{ backgroundColor: lm.color }}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">{lm.name}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{lm.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
