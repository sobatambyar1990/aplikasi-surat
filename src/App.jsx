/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import logoSMK from './logo-smk.png';
import { Printer, Plus, Trash2, FileText, Mail, Info, Send, Upload, Save, CheckCircle, AlertCircle, Edit, X, Settings } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA1i7jP7VTFCqbCrDiqW-Wpt0viyjbfgSk",
  authDomain: "aplikasi-surat-sekolah.firebaseapp.com",
  projectId: "aplikasi-surat-sekolah",
  storageBucket: "aplikasi-surat-sekolah.firebasestorage.app",
  messagingSenderId: "725725420174",
  appId: "1:725725420174:web:931efd8bdb6a176fd9c7df",
  measurementId: "G-Y32JXY3NZ6"
};

let firebaseConfig = { ...DEFAULT_FIREBASE_CONFIG };
let isCanvas = false;
let canvasAppId = 'default-app-id';

try {
  const savedConfig = localStorage.getItem('customFirebaseConfig');
  if (savedConfig) {
    firebaseConfig = JSON.parse(savedConfig);
  } else if (typeof window.__firebase_config !== 'undefined') {
    firebaseConfig = JSON.parse(window.__firebase_config);
    isCanvas = true;
    if (typeof window.__app_id !== 'undefined') {
      canvasAppId = window.__app_id;
    }
  }
} catch (error) {
  console.error("Gagal membaca konfigurasi Firebase:", error);
}

let app, auth, db, initError;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase Initialization Error:", error);
  initError = error.message;
}

export default function App() {
  const [jenisSurat, setJenisSurat] = useState('TUGAS');
  const [logoUrl, setLogoUrl] = useState(logoSMK);
  const [showFirebaseSettings, setShowFirebaseSettings] = useState(false);
  const [tempConfig, setTempConfig] = useState(firebaseConfig);

  const [formData, setFormData] = useState({
    nomorSurat: '001/ST/I/SMK-KES-PWR/2026',
    tanggalSurat: '10 Januari 2026',
    kepalaSekolah: 'Nuryadin, S.Sos., M.Pd.',
    dasarTugas: 'Undangan dari Panitia Pelaksanaan Lomba Kompetensi Siswa (LKS) SMK Tingkat Kabupaten Purworejo Tahun 2026',
    kegiatan: 'Mendampingi siswa dalam kegiatan Technical Meeting Lomba LKS',
    hariTanggalKegiatan: 'Senin, 12 Januari 2026',
    waktuKegiatan: '08.00 WIB s.d. Selesai',
    tempatKegiatan: 'SMK Negeri 1 Purworejo',
    acara: 'Technical Meeting LKS',
    namaKeterangan: 'Bunga Dinda Sabrina',
    ttlKeterangan: 'Purworejo, 15 Agustus 2008',
    identitasKeterangan: '212210001 (NIS)',
    kelasJabatanKeterangan: 'XII Keperawatan',
    isiKeterangan: 'Adalah benar-benar siswa aktif SMK Kesehatan Purworejo pada Tahun Pelajaran 2025/2026 dan berkelakuan baik.',
    lampiran: '-',
    hal: 'Undangan Rapat Wali Murid',
    tujuanSurat: 'Yth. Bapak/Ibu Orang Tua Wali Murid Kelas X\ndi Tempat',
    isiSuratPembuka: 'Dengan hormat,\nMengharap kehadiran Bapak/Ibu pada acara yang akan diselenggarakan pada:',
    isiSuratPenutup: 'Demikian surat undangan ini kami sampaikan. Atas perhatian dan kehadiran Bapak/Ibu, kami ucapkan terima kasih.',
    isiPermohonan: 'Dengan hormat,\nSehubungan dengan akan dilaksanakannya kegiatan Praktik Kerja Lapangan (PKL) Siswa SMK Kesehatan Purworejo Tahun Pelajaran 2025/2026, kami memohon kesediaan Bapak/Ibu untuk dapat menerima siswa kami melaksanakan PKL di instansi yang Bapak/Ibu pimpin.\n\nDemikian surat permohonan ini kami sampaikan. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.',
  });

  const [personil, setPersonil] = useState([
    { id: 1, nama: 'Lae Isriyana Nur Laela, S.Kep.', jabatan: 'Guru Keperawatan', keterangan: 'Pendamping' }
  ]);

  const [listSurat, setListSurat] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    if (!auth || initError) return;
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (error) { console.error("Auth Error:", error); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const getSuratCollection = () => {
    if (isCanvas && auth && auth.currentUser) {
      return collection(db, 'artifacts', canvasAppId, 'users', auth.currentUser.uid, 'surat');
    }
    return collection(db, 'surat');
  };

  const loadSurat = async () => {
    if (!db || !user || initError) return;
    try {
      const q = query(getSuratCollection(), where("createdBy", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(document => ({ id: document.id, ...document.data() }));
      data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setListSurat(data);
    } catch (error) { console.error("Gagal memuat histori:", error); }
  };

  useEffect(() => { if (user) loadSurat(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

  const handleConfigChange = (e) => setTempConfig({ ...tempConfig, [e.target.name]: e.target.value });

  const simpanKonfigurasiManual = () => {
    localStorage.setItem('customFirebaseConfig', JSON.stringify(tempConfig));
    alert('Konfigurasi Firebase berhasil disimpan. Aplikasi akan dimuat ulang.');
    window.location.reload();
  };

  const resetKonfigurasiKeDefault = () => {
    localStorage.removeItem('customFirebaseConfig');
    alert('Konfigurasi dikembalikan ke default. Aplikasi akan dimuat ulang.');
    window.location.reload();
  };

  const generateNomor = async (jenis) => {
    if (!db) return formData.nomorSurat;
    try {
      const snapshot = await getDocs(getSuratCollection());
      const total = snapshot.size + 1;
      const date = new Date();
      const bulan = date.getMonth();
      const romawi = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
      const tahun = date.getFullYear();
      let kode = 'ST';
      if (jenis === 'KETERANGAN') kode = 'SK';
      if (jenis === 'UNDANGAN') kode = 'SU';
      if (jenis === 'PERMOHONAN') kode = 'SP';
      return `${String(total).padStart(3,"0")}/${kode}/${romawi[bulan]}/SMK-KES-PWR/${tahun}`;
    } catch (e) { return formData.nomorSurat; }
  };

  const handleSimpanFirebase = async () => {
    if (initError || !db) { showNotification('error', 'Sistem database bermasalah. Cek Pengaturan Firebase.'); return; }
    if (!user) { showNotification('error', 'Anda belum terhubung ke sistem.'); return; }
    setIsSaving(true);
    try {
      let nomor = formData.nomorSurat;
      if (!editingId) nomor = await generateNomor(jenisSurat);
      const dataToSave = {
        jenisSurat,
        formData: { ...formData, nomorSurat: nomor },
        personil: jenisSurat === 'TUGAS' ? personil : [],
        updatedAt: new Date().toISOString(),
        createdBy: user.uid
      };
      const collRef = getSuratCollection();
      if (editingId) {
        await updateDoc(doc(collRef, editingId), dataToSave);
        showNotification('success', 'Berhasil memperbarui surat!');
        setEditingId(null);
      } else {
        dataToSave.createdAt = new Date().toISOString();
        await addDoc(collRef, dataToSave);
        showNotification('success', 'Berhasil disimpan ke Database!');
      }
      loadSurat();
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      showNotification('error', 'Gagal menyimpan. Periksa koneksi/aturan akses.');
    } finally { setIsSaving(false); }
  };

  const handleEdit = (data) => {
    setJenisSurat(data.jenisSurat);
    setFormData(data.formData);
    setPersonil(data.personil || []);
    setEditingId(data.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const batalEdit = () => setEditingId(null);

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus surat ini permanen?")) {
      try {
        await deleteDoc(doc(getSuratCollection(), id));
        showNotification('success', 'Surat berhasil dihapus.');
        if (editingId === id) batalEdit();
        loadSurat();
      } catch (error) {
        console.error("Gagal menghapus:", error);
        showNotification('error', 'Terjadi kesalahan saat menghapus.');
      }
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePersonilChange = (id, field, value) => setPersonil(personil.map(p => p.id === id ? { ...p, [field]: value } : p));
  const tambahPersonil = () => {
    const newId = personil.length > 0 ? Math.max(...personil.map(p => p.id)) + 1 : 1;
    setPersonil([...personil, { id: newId, nama: '', jabatan: '', keterangan: '' }]);
  };
  const hapusPersonil = (id) => setPersonil(personil.filter(p => p.id !== id));
  const handlePrint = () => window.print();
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setLogoUrl(URL.createObjectURL(file));
  };

  const renderFormFields = () => {
    switch (jenisSurat) {
      case 'TUGAS': return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dasar Tugas / Menimbang</label>
            <textarea name="dasarTugas" value={formData.dasarTugas} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-700">Daftar Pegawai Ditugaskan</label>
              <button onClick={tambahPersonil} className="text-sm flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"><Plus size={16} /> Tambah</button>
            </div>
            {personil.map((p) => (
              <div key={p.id} className="mb-3 p-3 bg-white border border-gray-200 rounded relative">
                <div className="absolute top-2 right-2 cursor-pointer text-red-500 hover:text-red-700" onClick={() => hapusPersonil(p.id)}><Trash2 size={16} /></div>
                <input type="text" placeholder="Nama Lengkap & Gelar" value={p.nama} onChange={(e) => handlePersonilChange(p.id, 'nama', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2 mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Jabatan/Guru..." value={p.jabatan} onChange={(e) => handlePersonilChange(p.id, 'jabatan', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2" />
                  <input type="text" placeholder="Keterangan..." value={p.keterangan} onChange={(e) => handlePersonilChange(p.id, 'keterangan', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2" />
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tugas / Untuk</label>
            <textarea name="kegiatan" value={formData.kegiatan} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hari, Tanggal</label><input type="text" name="hariTanggalKegiatan" value={formData.hariTanggalKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label><input type="text" name="waktuKegiatan" value={formData.waktuKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat Kegiatan</label><input type="text" name="tempatKegiatan" value={formData.tempatKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'KETERANGAN': return (
        <>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama (Siswa/Pegawai)</label><input type="text" name="namaKeterangan" value={formData.namaKeterangan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat, Tanggal Lahir</label><input type="text" name="ttlKeterangan" value={formData.ttlKeterangan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">NIS / NIP / Identitas</label><input type="text" name="identitasKeterangan" value={formData.identitasKeterangan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Kelas / Jabatan</label><input type="text" name="kelasJabatanKeterangan" value={formData.kelasJabatanKeterangan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Isi / Maksud Keterangan</label><textarea name="isiKeterangan" value={formData.isiKeterangan} onChange={handleInputChange} rows="4" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'UNDANGAN': return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Lampiran</label><input type="text" name="lampiran" value={formData.lampiran} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hal / Perihal</label><input type="text" name="hal" value={formData.hal} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kepada Yth. (Tujuan)</label><textarea name="tujuanSurat" value={formData.tujuanSurat} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kalimat Pembuka</label><textarea name="isiSuratPembuka" value={formData.isiSuratPembuka} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hari, Tanggal</label><input type="text" name="hariTanggalKegiatan" value={formData.hariTanggalKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label><input type="text" name="waktuKegiatan" value={formData.waktuKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat</label><input type="text" name="tempatKegiatan" value={formData.tempatKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Acara</label><input type="text" name="acara" value={formData.acara} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kalimat Penutup</label><textarea name="isiSuratPenutup" value={formData.isiSuratPenutup} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'PERMOHONAN': return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Lampiran</label><input type="text" name="lampiran" value={formData.lampiran} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hal / Perihal</label><input type="text" name="hal" value={formData.hal} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kepada Yth. (Tujuan)</label><textarea name="tujuanSurat" value={formData.tujuanSurat} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Isi Surat Permohonan Lengkap</label><textarea name="isiPermohonan" value={formData.isiPermohonan} onChange={handleInputChange} rows="8" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      default: return null;
    }
  };

  const renderPrintBody = () => {
    switch (jenisSurat) {
      case 'TUGAS': return (
        <>
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold underline m-0">SURAT TUGAS</h3>
            <p className="text-sm m-0">NOMOR : {formData.nomorSurat}</p>
          </div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4 indent-8">{formData.dasarTugas}. Kepala SMK Kesehatan Purworejo Kabupaten Purworejo Provinsi Jawa Tengah</p>
            <p className="font-bold text-center mb-4">MEMERINTAHKAN :</p>
            <div className="mb-6">
              <table className="w-full border-collapse border border-black text-sm">
                <thead><tr className="bg-gray-100"><th className="border border-black py-1 px-2 w-10">No.</th><th className="border border-black py-1 px-2 text-left">Nama</th><th className="border border-black py-1 px-2 text-left">Jabatan</th><th className="border border-black py-1 px-2 text-left">Keterangan</th></tr></thead>
                <tbody>{personil.map((p, index) => (<tr key={p.id}><td className="border border-black py-1 px-2 text-center align-top">{index + 1}.</td><td className="border border-black py-1 px-2 align-top">{p.nama}</td><td className="border border-black py-1 px-2 align-top">{p.jabatan}</td><td className="border border-black py-1 px-2 align-top">{p.keterangan}</td></tr>))}</tbody>
              </table>
            </div>
            <p className="mb-2">Untuk :</p>
            <p className="mb-4 pl-4 text-justify">{formData.kegiatan}, yang akan dilaksanakan pada:</p>
            <table className="mb-6 ml-8 text-sm"><tbody>
              <tr><td className="py-1 pr-4 align-top w-24">Hari, Tanggal</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.hariTanggalKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Waktu</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.waktuKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Tempat</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.tempatKegiatan}</td></tr>
            </tbody></table>
            <p className="mb-10">Demikian surat tugas ini untuk dapat dilaksanakan dengan penuh tanggung jawab.</p>
          </div>
        </>
      );
      case 'KETERANGAN': return (
        <>
          <div className="text-center mb-8"><h3 className="text-lg font-bold underline m-0">SURAT KETERANGAN</h3><p className="text-sm m-0">NOMOR : {formData.nomorSurat}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4">Yang bertanda tangan di bawah ini, Kepala SMK Kesehatan Purworejo menerangkan bahwa :</p>
            <table className="mb-6 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-36">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.namaKeterangan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Tempat, Tanggal Lahir</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.ttlKeterangan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">NIS / Identitas</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.identitasKeterangan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Kelas / Jabatan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.kelasJabatanKeterangan}</td></tr>
            </tbody></table>
            <p className="mb-4 indent-8">{formData.isiKeterangan}</p>
            <p className="mb-10">Demikian surat keterangan ini dibuat agar dapat dipergunakan sebagaimana mestinya.</p>
          </div>
        </>
      );
      case 'UNDANGAN': return (
        <>
          <div className="flex justify-between text-sm mb-6"><div><table className="text-sm"><tbody>
            <tr><td className="pr-4 py-0.5 align-top">Nomor</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.nomorSurat}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Lampiran</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.lampiran}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Hal</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top font-bold">{formData.hal}</td></tr>
          </tbody></table></div></div>
          <div className="text-sm mb-6 whitespace-pre-wrap"><p className="mb-0">Kepada Yth.</p><p className="font-semibold">{formData.tujuanSurat}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4 whitespace-pre-wrap">{formData.isiSuratPembuka}</p>
            <table className="mb-6 ml-8 text-sm"><tbody>
              <tr><td className="py-1 pr-4 align-top w-24">Hari, Tanggal</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.hariTanggalKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Waktu</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.waktuKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Tempat</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.tempatKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Acara</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.acara}</td></tr>
            </tbody></table>
            <p className="mb-10 whitespace-pre-wrap">{formData.isiSuratPenutup}</p>
          </div>
        </>
      );
      case 'PERMOHONAN': return (
        <>
          <div className="flex justify-between text-sm mb-6"><div><table className="text-sm"><tbody>
            <tr><td className="pr-4 py-0.5 align-top">Nomor</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.nomorSurat}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Lampiran</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.lampiran}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Hal</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top font-bold">{formData.hal}</td></tr>
          </tbody></table></div></div>
          <div className="text-sm mb-6 whitespace-pre-wrap"><p className="mb-0">Kepada Yth.</p><p className="font-semibold">{formData.tujuanSurat}</p></div>
          <div className="text-sm text-justify leading-relaxed whitespace-pre-wrap mb-10">{formData.isiPermohonan}</div>
        </>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none; }
          .no-print { display: none !important; }
          @page { size: 210mm 330mm; margin: 2cm; }
        }
      `}</style>

      {showFirebaseSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Settings size={20} /> Pengaturan Database Firebase</h2>
            <p className="text-sm text-gray-600 mb-6">Ubah konfigurasi jika ingin menyambungkan ke project Firebase lain.</p>
            {Object.keys(DEFAULT_FIREBASE_CONFIG).map((key) => (
              <div key={key} className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">{key}</label>
                <input type="text" name={key} value={tempConfig[key] || ''} onChange={handleConfigChange} className="w-full text-sm border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500 font-mono" placeholder={`Masukkan ${key}...`} />
              </div>
            ))}
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
              <button onClick={resetKonfigurasiKeDefault} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 text-sm font-semibold transition-colors">Gunakan Default</button>
              <button onClick={() => setShowFirebaseSettings(false)} className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-800 text-sm font-semibold transition-colors">Batal</button>
              <button onClick={simpanKonfigurasiManual} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow transition-colors flex items-center gap-2"><Save size={16} /> Simpan & Terapkan</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-xl shadow-lg p-6 h-fit no-print">
          <div className="flex items-center justify-between gap-2 mb-6 border-b pb-4">
            <div className="flex items-center gap-2"><FileText className="text-blue-600" size={24} /><h2 className="text-xl font-bold text-gray-800">Aplikasi Surat Sekolah</h2></div>
            <button onClick={() => setShowFirebaseSettings(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><Settings size={20} /></button>
          </div>

          {initError && (
            <div className="p-3 mb-6 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div><strong>Koneksi Database Gagal!</strong><br />Klik ikon gear (⚙️) untuk memperbaiki API Key.</div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {[['TUGAS','Tugas'],['KETERANGAN','Keterangan'],['UNDANGAN','Undangan'],['PERMOHONAN','Permohonan']].map(([val, label]) => (
              <button key={val} onClick={() => setJenisSurat(val)} className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors flex items-center gap-1 ${jenisSurat === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {val === 'TUGAS' && <BriefcaseIcon size={16} />}
                {val === 'KETERANGAN' && <Info size={16} />}
                {val === 'UNDANGAN' && <Mail size={16} />}
                {val === 'PERMOHONAN' && <Send size={16} />}
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-300 rounded-lg p-4 flex items-center justify-between mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Logo Kop Surat</label>
                <p className="text-xs text-gray-500">Logo sudah terpasang otomatis ✅</p>
              </div>
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-md text-sm font-medium flex items-center gap-2 border border-gray-300 transition-colors">
                <Upload size={16} /> Ganti Logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Nomor Surat</label><input type="text" name="nomorSurat" value={formData.nomorSurat} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Surat</label><input type="text" name="tanggalSurat" value={formData.tanggalSurat} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Kepala Sekolah</label><input type="text" name="kepalaSekolah" value={formData.kepalaSekolah} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white" /></div>
              </div>
            </div>

            {renderFormFields()}

            {notification.show && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-semibold mt-4 ${notification.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {notification.message}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button onClick={handleSimpanFirebase} disabled={isSaving || !!initError} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Save size={20} /> {isSaving ? 'Memproses...' : (editingId ? 'Update Surat' : 'Simpan Surat')}
              </button>
              <button onClick={handlePrint} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Printer size={20} /> Cetak / PDF
              </button>
              {editingId && (
                <button onClick={batalEdit} className="col-span-2 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mt-2">
                  <X size={20} /> Batal Edit Surat
                </button>
              )}
            </div>

            <div className="mt-8 border-t pt-6">
              <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">📂 Riwayat Surat Tersimpan</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {listSurat.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Belum ada surat yang tersimpan di sistem.</p>
                ) : (
                  listSurat.map((s) => (
                    <div key={s.id} className={`border p-4 bg-gray-50 rounded-lg flex justify-between items-center transition-colors ${editingId === s.id ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-100'}`}>
                      <div>
                        <div className="font-bold text-sm text-blue-800">{s.jenisSurat}</div>
                        <div className="text-xs text-gray-700 font-mono mt-1 font-semibold">{s.formData?.nomorSurat}</div>
                        <div className="text-xs text-gray-500 mt-1">{s.createdAt ? new Date(s.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(s)} className="text-blue-600 hover:bg-blue-200 bg-blue-100 p-2 rounded-md transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:bg-red-200 bg-red-100 p-2 rounded-md transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 overflow-auto flex justify-center pb-10">
          <div id="print-area" className="bg-white shadow-xl w-[210mm] min-h-[330mm] p-10 text-black mx-auto shrink-0 relative" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <div className="flex items-center border-b-[3px] border-double border-black pb-4 mb-6">
              <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
                <img src={logoUrl} alt="Logo SMK" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-1 text-center px-2">
                <h3 className="text-base font-bold m-0 leading-tight">YAYASAN BINA TANI BAGELEN PURWOREJO</h3>
                <h2 className="text-2xl font-bold m-0 leading-tight">SMK KESEHATAN PURWOREJO</h2>
                <p className="text-sm font-bold m-0 leading-tight">STATUS : TERAKREDITASI A</p>
                <p className="text-sm font-bold m-0 leading-tight">KOMPETENSI KEAHLIAN : KEPERAWATAN DAN FARMASI</p>
                <p className="text-[11px] m-0 leading-tight mt-1">Kampus 1 : Jl. Kesatrian No. 4 Purworejo</p>
                <p className="text-[11px] m-0 leading-tight">Kampus 2 : Jl. Mayjend. Sarbini Pangenjurutengah Purworejo Telp. (0275) 2971364</p>
                <p className="text-[11px] m-0 leading-tight">e-mail: smkkesehatan.pwr@gmail.com &nbsp;&nbsp;&nbsp; NPSN : 69888413</p>
              </div>
              <div className="w-24 flex-shrink-0"></div>
            </div>
            {renderPrintBody()}
            <div className="flex justify-end text-sm">
              <div className="text-center w-64">
                <p className="m-0">Purworejo, {formData.tanggalSurat}</p>
                <p className="m-0 mb-20">Kepala Sekolah</p>
                <p className="font-bold underline m-0">{formData.kepalaSekolah}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BriefcaseIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  );
}
