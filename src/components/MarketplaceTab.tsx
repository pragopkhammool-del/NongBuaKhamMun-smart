import React, { useState, useRef } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Phone, 
  Tag, 
  MapPin, 
  Check, 
  Trash2, 
  Edit3,
  X, 
  Camera, 
  CheckCircle2, 
  Clock,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import type { MarketplaceItem, UserProfile } from '../types';
import { 
  createMarketplaceItem, 
  updateMarketplaceItem, 
  deleteMarketplaceItem 
} from '../services/villageService';

interface MarketplaceTabProps {
  items: MarketplaceItem[];
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

const MARKET_CATEGORIES = [
  'ทั้งหมด',
  'ผักและผลไม้',
  'สินค้าเกษตร',
  'อาหาร',
  'เครื่องดื่ม',
  'ของใช้ในบ้าน',
  'สินค้าท้องถิ่น/OTOP',
  'สินค้ามือสอง',
  'บริการต่าง ๆ'
];

export const MarketplaceTab: React.FC<MarketplaceTabProps> = ({
  items,
  currentUser,
  onOpenAuth
}) => {
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC'>('NEWEST');

  // Form fields
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [unit, setUnit] = useState('กิโลกรัม');
  const [category, setCategory] = useState(MARKET_CATEGORIES[1]);
  const [description, setDescription] = useState('');
  const [sellerName, setSellerName] = useState(currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : '');
  const [sellerPhone, setSellerPhone] = useState(currentUser?.phone || '');
  const [locationArea, setLocationArea] = useState(currentUser?.houseNumber ? `บ้านเลขที่ ${currentUser.houseNumber} ม.4` : 'ม.4');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'pragopkhammool@gmail.com';

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setPrice('');
    setUnit('กิโลกรัม');
    setCategory(MARKET_CATEGORIES[1]);
    setDescription('');
    setSellerName(currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : '');
    setSellerPhone(currentUser?.phone || '');
    setLocationArea(currentUser?.houseNumber ? `บ้านเลขที่ ${currentUser.houseNumber} ม.4` : 'ม.4');
    setImageUrl('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: MarketplaceItem) => {
    setEditingItem(item);
    setTitle(item.title || '');
    setPrice(item.price ?? '');
    setUnit(item.unit || 'กิโลกรัม');
    setCategory(item.category || MARKET_CATEGORIES[1]);
    setDescription(item.description || '');
    setSellerName(item.sellerName || '');
    setSellerPhone(item.sellerPhone || '');
    setLocationArea(item.locationArea || '');
    setImageUrl(item.imageUrl || '');
    setIsAddModalOpen(true);
  };

  // Compress & convert uploaded/captured image into web-optimized data URL
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้นครับ');
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setImageUrl(compressedDataUrl);
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        alert('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
        setIsProcessingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // reset input value so re-taking photo triggers onChange
    e.target.value = '';
  };

  const handleCreateOrUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!title.trim() || price === '' || !sellerPhone.trim()) {
      alert('กรุณากรอกชื่อสินค้า ราคา และเบอร์ติดต่อ');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateMarketplaceItem(editingItem.id, {
          title: title.trim(),
          price: Number(price),
          unit: unit.trim(),
          category,
          description: description.trim(),
          sellerName: sellerName.trim() || 'ชาวบ้าน ม.4',
          sellerPhone: sellerPhone.trim(),
          locationArea: locationArea.trim(),
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        });
      } else {
        await createMarketplaceItem({
          title: title.trim(),
          price: Number(price),
          unit: unit.trim(),
          category,
          description: description.trim(),
          sellerName: sellerName.trim() || 'ชาวบ้าน ม.4',
          sellerPhone: sellerPhone.trim(),
          sellerId: currentUser.uid,
          locationArea: locationArea.trim(),
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
          status: 'AVAILABLE',
          createdAt: new Date().toISOString()
        });
      }

      setIsAddModalOpen(false);
      setEditingItem(null);
      setTitle('');
      setPrice('');
      setDescription('');
      setImageUrl('');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลสินค้า: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsSold = async (item: MarketplaceItem) => {
    try {
      await updateMarketplaceItem(item.id, {
        status: item.status === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE'
      });
    } catch (err: any) {
      alert('ไม่สามารถอัปเดตสถานะได้: ' + err.message);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('ยืนยันลบประกาศสินค้านี้?')) return;
    try {
      await deleteMarketplaceItem(itemId);
    } catch (err: any) {
      alert('ไม่สามารถลบสินค้าได้: ' + err.message);
    }
  };

  // Filtering and sorting
  const filteredItems = items
    .filter(item => {
      const matchesCat = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'PRICE_ASC') return a.price - b.price;
      if (sortOrder === 'PRICE_DESC') return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6 pb-20 animate-fadeIn max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#164B3C] via-[#23865B] to-[#4CAF50] rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-emerald-200" />
            <h1 className="text-xl sm:text-2xl font-extrabold">ตลาดชุมชนบ้านหนองบัวคำมูล ม.4</h1>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            ซื้อขายผลผลิตสด ผลิตภัณฑ์แปรรูป และบริการภายในหมู่บ้าน ปลอดสาร ไม่ผ่านคนกลาง
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) onOpenAuth();
            else handleOpenAddModal();
          }}
          className="flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-md transition-transform active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ลงขายสินค้า</span>
        </button>
      </div>

      {/* Search & Sort Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาผักสด, ผลไม้, อาหาร, ผู้ขาย..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#23865B] shadow-xs"
            />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#23865B] shadow-xs font-medium text-slate-700"
          >
            <option value="NEWEST">ล่าสุดก่อน</option>
            <option value="PRICE_ASC">ราคา: ต่ำไปสูง</option>
            <option value="PRICE_DESC">ราคา: สูงไปต่ำ</option>
          </select>
        </div>

        {/* Category Filter Pills */}
        <div className="flex overflow-x-auto pb-1 gap-1.5 no-scrollbar">
          {MARKET_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-[#164B3C] text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-100 text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
            <p className="text-sm">ยังไม่มีสินค้าในหมวดหมู่นี้</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const isOwner = (currentUser && (currentUser.uid === item.sellerId || (currentUser.phone && item.sellerPhone && currentUser.phone === item.sellerPhone))) || isAdmin;
            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  item.status === 'SOLD' ? 'opacity-70 grayscale-30' : ''
                }`}
              >
                <div>
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    {item.status === 'SOLD' && (
                      <span className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white font-extrabold text-base tracking-widest uppercase">
                        ขายแล้ว (SOLD)
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-lg font-extrabold text-[#23865B]">
                        ฿{item.price}
                      </span>
                      {item.unit && (
                        <span className="text-xs text-slate-400">/{item.unit}</span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-slate-800 line-clamp-1 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                      <p className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{item.locationArea || 'ในหมู่ 4'}</span>
                      </p>
                      <p className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>ผู้ขาย: {item.sellerName}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 space-y-2">
                  <a
                    href={`tel:${item.sellerPhone}`}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#164B3C] font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>โทรติดต่อ: {item.sellerPhone}</span>
                  </a>

                  {/* Owner Controls */}
                  {isOwner && (
                    <div className="flex items-center space-x-2 pt-1.5 border-t border-slate-100">
                      <button
                        onClick={() => handleMarkAsSold(item)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-colors ${
                          item.status === 'SOLD'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {item.status === 'SOLD' ? 'เปิดขายอีกครั้ง' : 'ระบุว่าขายแล้ว'}
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-xl text-amber-700 hover:bg-amber-50 border border-amber-200 transition-colors flex items-center space-x-1 text-xs font-semibold"
                        title="แก้ไขประกาศ"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                        <span>แก้ไข</span>
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center space-x-1 text-xs font-semibold"
                        title="ลบประกาศ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบ</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingItem(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingItem ? 'แก้ไขประกาศสินค้าชุมชน ม.4' : 'ลงประกาศขายสินค้าชุมชน ม.4'}
            </h2>

            <form onSubmit={handleCreateOrUpdateItem} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อสินค้า/บริการ *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ผักบุ้งอินทรีย์, ไข่ไก่สด, กล้วยน้ำว้า"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ราคา (บาท) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="35"
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">หน่วยนับ</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="กิโลกรัม, กำ, หวี, ถุง"
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {MARKET_CATEGORIES.slice(1).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์ติดต่อ *</label>
                  <input
                    type="tel"
                    required
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อผู้ขาย/สวน</label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="เช่น ป้าทองคำ, สวนลุงสมหมาย"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">พื้นที่รับสินค้า/บ้านเลขที่</label>
                <input
                  type="text"
                  value={locationArea}
                  onChange={(e) => setLocationArea(e.target.value)}
                  placeholder="เช่น บ้านเลขที่ 15 ม.4, จัดส่งฟรีใน ม.4"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียดสินค้า</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="สดใหม่ เก็บตอนเช้า ปลอดสารพิษ..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                />
              </div>

              {/* Image Input Section (Upload, Camera or URL) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    รูปภาพสินค้า (ไม่บังคับ - ถ่ายภาพหรืออัปโหลดได้เลย)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowManualUrl(!showManualUrl)}
                    className="text-[11px] text-emerald-700 hover:underline flex items-center space-x-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{showManualUrl ? 'ซ่อนกรอก URL' : 'กรอกลิงก์ URL'}</span>
                  </button>
                </div>

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageFileChange}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileChange}
                />

                {/* Upload & Camera Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isProcessingImage}
                    className="flex items-center justify-center space-x-2 py-3 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#164B3C] border border-emerald-200 text-xs font-bold transition-all active:scale-95 shadow-2xs"
                  >
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>ถ่ายภาพด้วยกล้อง</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingImage}
                    className="flex items-center justify-center space-x-2 py-3 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all active:scale-95 shadow-2xs"
                  >
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>อัปโหลดรูปจากเครื่อง</span>
                  </button>
                </div>

                {isProcessingImage && (
                  <p className="text-xs text-amber-600 animate-pulse text-center py-1">
                    กำลังประมวลผลและย่อขนาดรูปภาพให้อัตโนมัติ...
                  </p>
                )}

                {/* Image Preview Box if image exists */}
                {imageUrl && (
                  <div className="relative mt-2 rounded-2xl overflow-hidden border border-emerald-200 bg-slate-50 p-1.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={imageUrl}
                        alt="Product preview"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                      />
                      <div className="text-left">
                        <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>แนบรูปภาพสินค้าแล้ว</span>
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">พร้อมบันทึกลงระบบทันที</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      ลบรูป
                    </button>
                  </div>
                )}

                {/* Manual URL Input (Optional) */}
                {showManualUrl && (
                  <div className="pt-1">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="หรือวางลิงก์รูปภาพ เช่น https://..."
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-3 rounded-2xl bg-[#164B3C] hover:bg-[#23865B] text-white font-bold text-sm shadow-md"
              >
                {isSubmitting ? 'กำลังบันทึกลงระบบ...' : (editingItem ? 'บันทึกการแก้ไข' : 'ยืนยันลงประกาศสินค้า')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
