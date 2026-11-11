import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Home, 
  CheckCircle2, 
  AlertTriangle,
  LogIn,
  UserPlus,
  ShieldCheck,
  KeyRound,
  Shield
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../firebase';
import { saveUserProfile, getUserProfile } from '../services/villageService';
import type { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [authMethod, setAuthMethod] = useState<'LOGIN' | 'REGISTER' | 'ADMIN_PIN'>('LOGIN');
  const [adminPin, setAdminPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [moo, setMoo] = useState('4');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleAdminPinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (adminPin.trim() === '43210344') {
      const adminProfile: UserProfile = {
        uid: 'admin-passcode-43210344',
        email: 'admin.moo4@village.local',
        displayName: 'ผู้ดูแลระบบ รหัส 43210344',
        firstName: 'ผู้ดูแลระบบ',
        lastName: 'บ้านหนองบัวคำมูล ม.4',
        houseNumber: '1',
        moo: '4',
        role: 'ADMIN',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('smart_moo4_admin_passcode_auth', '43210344');
      onAuthSuccess(adminProfile);
      onClose();
    } else {
      setErrorMessage('รหัสผู้ดูแลระบบไม่ถูกต้อง (รหัสคือ 43210344)');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      let profile = await getUserProfile(user.uid);
      if (!profile) {
        const names = (user.displayName || '').split(' ');
        const isDefaultAdmin = user.email === 'pragopkhammool@gmail.com';
        profile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          firstName: names[0] || 'ชาวบ้าน',
          lastName: names.slice(1).join(' ') || 'ม.4',
          houseNumber: houseNumber || '-',
          moo: '4',
          phone: user.phoneNumber || '',
          photoURL: user.photoURL || '',
          role: isDefaultAdmin ? 'ADMIN' : 'MEMBER',
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(profile);
      }
      onAuthSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setErrorMessage(err.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (authMethod === 'REGISTER') {
        if (!firstName.trim() || !lastName.trim() || !houseNumber.trim()) {
          setErrorMessage('กรุณากรอกชื่อ นามสกุล และบ้านเลขที่');
          setLoading(false);
          return;
        }

        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const isDefaultAdmin = email === 'pragopkhammool@gmail.com';
        const profile: UserProfile = {
          uid: cred.user.uid,
          email,
          displayName: `${firstName} ${lastName}`,
          firstName,
          lastName,
          houseNumber,
          moo: moo || '4',
          phone,
          role: isDefaultAdmin ? 'ADMIN' : 'MEMBER',
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(profile);
        onAuthSuccess(profile);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        let profile = await getUserProfile(cred.user.uid);
        if (!profile) {
          const isDefaultAdmin = cred.user.email === 'pragopkhammool@gmail.com';
          profile = {
            uid: cred.user.uid,
            email: cred.user.email || '',
            firstName: 'ชาวบ้าน',
            lastName: 'ม.4',
            houseNumber: '-',
            moo: '4',
            role: isDefaultAdmin ? 'ADMIN' : 'MEMBER',
            createdAt: new Date().toISOString()
          };
          await saveUserProfile(profile);
        }
        onAuthSuccess(profile);
      }
      onClose();
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMessage('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('อีเมลนี้ถูกใช้งานแล้วในระบบ กรุณาเข้าสู่ระบบแทน');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      } else {
        setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตน');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Top green accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#164B3C] via-[#23865B] to-[#4CAF50]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-4 mt-2">
          <button
            type="button"
            onClick={() => { setAuthMethod('LOGIN'); setErrorMessage(''); }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              authMethod === 'LOGIN' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod('REGISTER'); setErrorMessage(''); }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              authMethod === 'REGISTER' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
            }`}
          >
            ลงทะเบียน
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod('ADMIN_PIN'); setErrorMessage(''); }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
              authMethod === 'ADMIN_PIN' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-amber-800'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>รหัสผู้ดูแล</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center pb-3">
          <h2 className="text-lg font-extrabold text-slate-800">
            {authMethod === 'ADMIN_PIN' 
              ? 'เข้าสู่ระบบด้วยรหัสผู้ดูแลระบบ' 
              : authMethod === 'REGISTER' 
              ? 'ลงทะเบียนสมาชิกหมู่บ้าน' 
              : 'เข้าสู่ระบบ SMART MOO4'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            บ้านหนองบัวคำมูล หมู่ที่ 4
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Mode: ADMIN PIN (43210344) */}
        {authMethod === 'ADMIN_PIN' ? (
          <form onSubmit={handleAdminPinLogin} className="space-y-4 pt-1">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <KeyRound className="w-8 h-8 mx-auto text-amber-600 mb-2" />
              <p className="text-xs font-bold text-amber-900">
                สิทธิ์ผู้ดูแลระบบ (Admin Access)
              </p>
              <p className="text-[11px] text-amber-800 mt-1">
                กรอกรหัสผ่านผู้ดูแลระบบ 8 หลัก เพื่อเข้าสู่ระบบหลังบ้านและจัดการข้อมูลทุกโมดูลได้ทันที
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสผ่านผู้ดูแลระบบ (Admin PIN)
              </label>
              <input
                type="password"
                required
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="กรอกรหัสผ่าน 8 หลัก"
                className="w-full text-center text-lg tracking-widest font-mono px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
            </div>

            {/* Quick helper fill button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setAdminPin('43210344')}
                className="text-[11px] text-amber-800 hover:underline font-semibold"
              >
                ใส่รหัส 43210344 อัตโนมัติ
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.99]"
            >
              ปลดล็อกสิทธิ์ผู้ดูแลระบบ (ยืนยัน)
            </button>
          </form>
        ) : (
          <>
            {/* Google One-Click Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center space-x-2 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 mb-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>เข้าสู่ระบบด้วย Google ทันที</span>
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400">หรือใช้อีเมลและรหัสผ่าน</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {authMethod === 'REGISTER' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อจริง *</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="สมหมาย"
                        className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">นามสกุล *</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="คำมูล"
                        className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">บ้านเลขที่ *</label>
                      <div className="relative">
                        <Home className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={houseNumber}
                          onChange={(e) => setHouseNumber(e.target.value)}
                          placeholder="45/1"
                          className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">หมู่ที่</label>
                      <input
                        type="text"
                        value={moo}
                        disabled
                        className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-semibold text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="081-234-5678"
                        className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">อีเมล *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">รหัสผ่าน *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#23865B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#164B3C] hover:bg-[#23865B] text-white font-semibold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? 'กำลังดำเนินการ...' : authMethod === 'REGISTER' ? 'ยืนยันลงทะเบียนสมาชิก' : 'เข้าสู่ระบบ'}
              </button>
            </form>
          </>
        )}

        {/* Privacy Note */}
        <p className="text-[11px] text-slate-400 text-center mt-4">
          ข้อมูลส่วนบุคคลของท่านได้รับการคุ้มครองตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
        </p>
      </div>
    </div>
  );
};
