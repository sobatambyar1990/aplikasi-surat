/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { Printer, Plus, Trash2, FileText, Mail, Info, Send, Save, CheckCircle, AlertCircle, Edit, X, Settings, Upload, Database, Download, Users, FileBadge, User, Reply, Bell, Paperclip, GraduationCap, ClipboardList, Map, Award, Image as ImageIcon, BookOpen, UserPlus, Landmark, UserMinus } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where, setDoc, getDoc } from 'firebase/firestore';

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
  const [logoUrl, setLogoUrl] = useState('');
  const [logoWidth, setLogoWidth] = useState(96);
  const [logoOffsetX, setLogoOffsetX] = useState(0);
  const [logoOffsetY, setLogoOffsetY] = useState(0);
  
  const [dataSiswa, setDataSiswa] = useState([]);
  const [dataGuru, setDataGuru] = useState([]);
  
  const [showFirebaseSettings, setShowFirebaseSettings] = useState(false);
  const [showDataMasterModal, setShowDataMasterModal] = useState(false);
  const [tempConfig, setTempConfig] = useState(firebaseConfig);

  const [formData, setFormData] = useState({
    nomorSurat: '',
    tanggalSurat: '10 Januari 2026',
    kepalaSekolah: 'Nuryadin, S.Sos., M.Pd.',
    nipKepalaSekolah: '-',
    pangkatKepalaSekolah: '-',
    alamatInstansi: 'Jl. Mayjend. Sarbini, Gang Kemuning Pangenjurutengah Purworejo',
    
    // TUGAS
    dasarTugas: 'Undangan dari Panitia Pelaksanaan Lomba Kompetensi Siswa (LKS) SMK Tingkat Kabupaten Purworejo Tahun 2026',
    kegiatan: 'Mendampingi siswa dalam kegiatan Technical Meeting Lomba LKS',
    hariTanggalKegiatan: 'Senin, 12 Januari 2026',
    waktuKegiatan: '08.00 WIB s.d. Selesai',
    tempatKegiatan: 'SMK Negeri 1 Purworejo',
    acara: 'Technical Meeting LKS',
    judulSuratTugasSingkat: 'SURAT TUGAS',
    namaPegawai: '',
    nipPegawai: '-',
    jabatanPegawai: '',
    tempatTugasPegawai: 'SMK Kesehatan Purworejo',
    
    // SPPD
    pejabatPerintah: 'Kepala SMK Kesehatan Purworejo',
    namaPesertaSPPD: '',
    maksudPerjalanan: 'Pengajuan Permohonan perubahan status kepegawaian yang tercantum dalam aplikasi Dapodik SMK Kesehatan Purworejo',
    kendaraan: 'Kendaraan Darat',
    tempatBerangkat: 'SMK Kesehatan Purworejo',
    tempatTujuan: 'Kantor Cabang Dinas Pendidikan Wilayah VIII',
    lamaPerjalanan: '1 hari',
    tanggalBerangkatSPPD: '04 Februari 2026',
    tanggalKembaliSPPD: '04 Februari 2026',
    bebanAnggaran: 'APBS SMK Kesehatan Purworejo',
    keteranganLain: 'Melaporkan hasil perjalanan dinas kepada Kepala Sekolah setelah selesai melaksanakan tugas',

    // KETERANGAN
    namaKeterangan: '',
    ttlKeterangan: 'Purworejo, 15 Agustus 2008',
    identitasKeterangan: '', // NIS/NISN
    kelasJabatanKeterangan: '',
    alamatKeterangan: 'Sawangan RT 01 RW 01 Girimulyo Kemiri Purworejo',
    isiKeterangan: 'Nama tersebut diatas benar-benar siswa kelas XI SMK Kesehatan Purworejo Tahun Ajaran 2025/2026',
    keperluanKeterangan: 'Surat Keterangan ini digunakan untuk persyaratan mengurus BPJS',
    fotoSiswaUrl: '',
    tujuanKeteranganFoto: 'Mengikuti POPDA Cabang Olahraga Pencak silat Tingkat Kabupaten Purworejo Tahun 2026 Kategori Kelas B Remaja Tanding.',
    
    // KETERANGAN AKTIF
    namaKetAktif: '',
    ttlKetAktif: '',
    nisKetAktif: '',
    kelasKetAktif: 'XII (Dua belas)',
    programKeahlian: 'Layanan Kesehatan Konsentrasi Keahlian Layanan Penunjang Keperawatan dan Caregiving',
    tahunAjaranAktif: '2025/2026',

    // KETERANGAN TELAH PENELITIAN
    namaMahasiswa: '',
    ttlMahasiswa: '',
    nimMahasiswa: '',
    prodiMahasiswa: 'Pendidikan Agama Islam pada Program Magister',
    judulPenelitian: 'KORELASI TINGKAT PENDIDIKAN ORANG TUA DAN MOTIVASI SISWA TERHADAP PRESTASI BELAJAR',
    tglMulaiPenelitian: '10 Januari 2026',
    tglSelesaiPenelitian: '20 Februari 2026',

    // KET KOLEKTIF & LAMPIRAN
    pembukaKetKolektif: 'Dengan ini menerangkan bahwa :',
    penutupKetKolektif: 'Adalah benar-benar Siswa SMK Kesehatan Purworejo pada Tahun Pelajaran 2025/2026.\nDemikian surat keterangan ini dibuat agar dapat dipergunakan sebagaimana mestinya.',
    isiKetLampiran: 'Menyatakan bahwa nama-nama tersebut dalam lampiran Surat Keterangan ini adalah benar-benar siswa SMK Kesehatan Purworejo Tahun Ajaran 2025/2026, dan telah mengikuti pembelajaran/pelatihan sesuai dengan unit-unit kompetensi yang tercantum dalam skema sertifikasi.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dapat dipergunakan dengan penuh tanggungjawab.',

    // REKOMENDASI
    tujuanRekomendasi: 'Poltekkes Kemenkes Jakarta I',
    prestasiRekomendasi: '1. Juara harapan 2 lomba paduan suara jenjang SMA sederajat se-Kabupaten dalam rangka memperingati HUT Kabupaten Purworejo ke-192;\n2. Sertifikat anggota Paskibra SMK kesehatan Purworejo tahun 2022/2023 dan 2023/2024;',

    // DISPENSASI & BALASAN
    halDispensasi: 'Permohonan Dispensasi',
    tujuanDispensasi: 'Yth. Bapak/Ibu Guru Pengampu Mapel\nKelas XI Farmasi SMK Kesehatan Purworejo\ndi\nTempat',
    pembukaDispensasi: 'Assalamu\'alaikum Warohmatullahi Wabarakatuh.\n\nDengan hormat,\nBahwa dalam memperlancar keikutsertaan perwakilan siswa SMK Kesehatan Purworejo dalam Event Fun Run Skanida kami mohon dispensasi :',
    teksBawahTabelDispensasi: 'Siswa tersebut di atas untuk diberikan dispensasi tidak mengikuti pelajaran pada :',
    penutupDispensasi: 'Demikian surat permohonan ini kami sampaikan, atas izin dan kerjasamanya kami ucapkan terima kasih.\n\nWassalamu\'alaikum Warohmatullahi Wabarakatuh.',
    
    // DISPENSASI EKSTERNAL (Fleksibel)
    tujuanDispEkst: 'Kepala SMP Negeri 24 Purworejo\ndi\nTempat',
    namaSiswaDispEkst: '',
    kelasSiswaDispEkst: '',
    pembukaDispEkst: 'Dengan hormat,\n\nSehubungan dengan adanya kegiatan POPDA Kabupaten Purworejo Cabang Olahraga Pencak Silat yang diselenggarakan pada :',
    alasanDispEkst: 'siswa tersebut mengikuti kegiatan POPDA Kabupaten Purworejo Cabang Olahraga Pencak Silat Kategori Kelas A Remaja Tanding sehingga tidak melaksanakan kegiatan Pengabdian UKS pada tanggal yang tertera.',
    penutupDispEkst: 'Demikian permohonan ini, untuk menjadi perhatian semua pihak dan kepada pihak-pihak terkait, kami mohon kerjasamanya untuk membantu kelancaran kegiatan tersebut. Atas dispensasi yang diberikan kami ucapkan terima kasih.',

    halBalasan: 'Jawaban Permohonan Dispensasi',
    tujuanBalasan: 'Kapolsek Kutoarjo Polres Purworejo Polda Jateng\nDi\nTempat',
    pembukaBalasan: 'Dengan hormat,\nMenindaklanjuti perihal Kegiatan Pertemuan Rutin Bayangkari Cabang Purworejo tanggal 18 Januari 2026. Maka Kepala SMK Kesehatan Purworejo dengan ini mohon maaf tidak dapat memberikan permohonan dispensasi kepada :',
    alasanTugas: 'dikarenakan mendapatkan tugas sebagai penanggungjawab kegiatan "Simulasi Ujian Kompetensi di SMK Kesehatan Purworejo" yang dilaksanakan pada:',
    
    halBalasanIzin: 'Balasan Permohonan Izin Penelitian',
    tujuanBalasanIzin: 'Direktur Program Pascasarjana UNU Surakarta\ndi SURAKARTA',
    pembukaBalasanIzin: 'Assalamu\'alaikum Warohmatullahi Wabarakatuh\n\nSalam silaturahmi kami sampaikan, semoga gerak dan aktifitas kita senantiasa mendapatkan Petunjuk dan Rahmat dari Allah SWT.\n\nSehubungan dengan surat yang kami terima tertanggal 31 Desember 2025, Nomor: I/A/PPS/UNU/426/XII/2025 tentang Permohonan Izin Penelitian mahasiswa :',
    namaPemohonIzin: '',
    identitasPemohonIzin: '',
    prodiPemohonIzin: '',
    judulPemohonIzin: '',
    poinBalasanIzin: '1. Pada prinsipnya kami tidak keberatan dan mengizinkan pelaksanaan penelitian tersebut di SMK Kesehatan Purworejo.\n2. Izin melakukan penelitian diberikan semata-mata untuk keperluan akademik.',
    penutupBalasanIzin: 'Demikian yang dapat kami sampaikan. Atas perhatiannya diucapkan terima kasih.\n\nWassalamu\'alaikum Warohmatullahi Wabarakatuh',

    // PEMBERITAHUAN & UNDANGAN & PERMOHONAN
    halPemberitahuan: 'Pemberitahuan',
    tujuanPemberitahuan: 'Yth. Tenaga Pendidik dan Kependidikan,\nOrang Tua/Wali dan Siswa Kelas X,\nXI & XII SMK Kesehatan Purworejo\ndi\nTempat',
    isiPemberitahuan: 'Assalamu\'alaikum Warohmatullahi Wabarakatuh.\n\nDengan ini kami beritahukan kepada Tenaga Pendidik dan Kependidikan, Orang Tua/Wali dan seluruh siswa SMK Kesehatan Purworejo bahwa : Hari Sabtu tanggal 18 Januari 2026 akan dilaksanakan kegiatan peningkatan kapabilitas bagi Tenaga Pendidik dan Kependidikan SMK Kesehatan Purworejo, sehubungan dengan hal tersebut kegiatan Belajar Mengajar ditiadakan, siswa kelas X, XI dan XII belajar di rumah.\n\nDemikian pemberitahuan ini disampaikan, atas perhatian dan kerjasamanya diucapkan terima kasih.',
    lampiran: '-',
    hal: 'Undangan Rapat Wali Murid',
    tujuanSurat: 'Yth. Bapak/Ibu Orang Tua Wali Murid Kelas X\ndi Tempat',
    isiSuratPembuka: 'Dengan hormat,\nMengharap kehadiran Bapak/Ibu pada acara yang akan diselenggarakan pada:',
    isiSuratPenutup: 'Demikian surat undangan ini kami sampaikan. Atas perhatian dan kehadiran Bapak/Ibu, kami ucapkan terima kasih.',
    isiPermohonan: 'Dengan hormat,\nSehubungan dengan akan dilaksanakannya kegiatan Praktik Kerja Lapangan (PKL) Siswa SMK Kesehatan Purworejo Tahun Pelajaran 2025/2026, kami memohon kesediaan Bapak/Ibu untuk dapat menerima siswa kami melaksanakan PKL di instansi yang Bapak/Ibu pimpin.\n\nDemikian surat permohonan ini kami sampaikan. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.',

    // PERMOHONAN DATA (Perubahan Status)
    halPermohonanData: 'Permohonan Perubahan Status',
    tujuanPermohonanData: 'Kepala Dinas Pendidikan dan Kebudayaan Provinsi Jawa Tengah\ndi SEMARANG',
    pembukaPermohonanData: 'Dengan hormat,\nBersama surat ini kami mengajukan permohonan kepada Kepala Dinas Pendidikan dan Kebudayaan Provinsi Jawa Tengah untuk merubah status kepegawaian yang tercantum dalam aplikasi Dapodik SMK Kesehatan Purworejo, atas nama:',
    namaPegawaiData: '',
    ttlPegawaiData: '',
    nikPegawaiData: '',
    agamaPegawaiData: 'Islam',
    ijazahPegawaiData: '',
    jurusanPegawaiData: '',
    jabatanPegawaiData: '',
    dataLamaLabel: 'Aplikasi Dapodik saat ini',
    dataLamaIsi: 'Status: Instruktur Kejuruan',
    dataBaruLabel: 'Perubahan',
    dataBaruIsi: 'Status: Laboran',
    listLampiranData: 'a. Fotokopi SK Pengangkatan Pertama\nb. Fotokopi SK Terakhir',
    penutupPermohonanData: 'Demikian kami sampaikan permohonan ini, atas perkenannya kami ucapkan terima kasih.',

    // TAMBAH PTK YAYASAN
    halTambahPTK: 'Permohonan Tambah PTK baru pada aplikasi Dapodik',
    tujuanTambahPTK: 'Ketua Yayasan Bina Tani\nBagelen Purworejo\ndi Tempat',
    namaPtk: '',
    ttlPtk: '',
    nikPtk: '',
    agamaPtk: 'Islam',
    ijazahPtk: 'S1-Pendidikan',
    jurusanPtk: 'Bimbingan Konseling/2024',
    jabatanPtk: 'Guru Bimbingan Konseling',
    lampiranPtk: '1. Formulir Isian Data PTK Dapodik;\n2. Fotocopi SK Pengangkatan dari Ketua Yayasan;\n3. Fotocopi SK Pembagian Tugas Mengajar;\n4. Fotocopi Ijazah/Akta terakhir;\n5. Fotocopi KTP.',

    // PERMOHONAN BANK
    halPermohonanBank: 'Permohonan Cetak Rekening Koran',
    tujuanPermohonanBank: 'Pimpinan Bank Jateng\nKantor Cabang Purworejo\ndi\nPURWOREJO',
    namaBank: 'Bank Jateng Cabang Purworejo',
    periodeCetak: 'Januari s.d. Desember 2025 dan Januari s.d. Februari 2026',
    noRekening: '1020-00963-9',
    namaRekening: 'BOS SMK Kesehatan Purworejo',
    keperluanRekening: 'Laporan Dana BOSP Tahun 2025 dan 2026',
  });

  const [personil, setPersonil] = useState([
    { id: 1, nama: '', jabatan: '', keterangan: 'Pendamping', identitas: '', ttl: '' }
  ]);

  const [listSurat, setListSurat] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const allMasterData = [...dataGuru, ...dataSiswa];

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

  const getSettingsDoc = (docName) => {
    if (isCanvas && auth && auth.currentUser) {
      return doc(db, 'artifacts', canvasAppId, 'settings', docName);
    }
    return doc(db, 'pengaturan_sekolah', docName);
  };

  const loadDataUtama = async () => {
    if (!db || !user || initError) return;
    try {
      const q = query(getSuratCollection(), where("createdBy", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(document => ({ id: document.id, ...document.data() }));
      data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setListSurat(data);
    } catch (error) { console.error("Gagal memuat histori:", error); }

    try {
      const logoDoc = await getDoc(getSettingsDoc('logo_sekolah'));
      if (logoDoc.exists()) {
        const data = logoDoc.data();
        if (data.image) setLogoUrl(data.image);
        if (data.width !== undefined) setLogoWidth(data.width);
        if (data.offsetX !== undefined) setLogoOffsetX(data.offsetX);
        if (data.offsetY !== undefined) setLogoOffsetY(data.offsetY);
      }
      
      const masterDoc = await getDoc(getSettingsDoc('master_data_csv'));
      if (masterDoc.exists()) {
        const data = masterDoc.data();
        setDataSiswa(data.siswa || []);
        setDataGuru(data.guru || []);
      }
    } catch (error) { console.error("Gagal memuat pengaturan:", error); }
  };

  useEffect(() => {
    if (user) loadDataUtama();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const fetchNomorOtomatis = async () => {
      if (!db || editingId) return; 
      try {
        const snapshot = await getDocs(getSuratCollection());
        const total = snapshot.size + 1;
        const date = new Date();
        const bulan = date.getMonth();
        const romawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        const tahun = date.getFullYear();
        
        let kode = 'ST';
        if (['KETERANGAN', 'KET_LAMPIRAN', 'KET_KOLEKTIF', 'KET_FOTO', 'KET_PENELITIAN'].includes(jenisSurat)) kode = 'SK';
        if (jenisSurat === 'KET_AKTIF') kode = 'SKet'; 
        if (jenisSurat === 'REKOMENDASI') kode = 'SRek';
        if (jenisSurat === 'UNDANGAN') kode = 'U';
        if (['PERMOHONAN', 'PERMOHONAN_DATA', 'TAMBAH_PTK', 'PERMOHONAN_BANK', 'DISPENSASI', 'DISP_EKSTERNAL', 'BALASAN_DISP', 'BALASAN_IZIN', 'PEMBERITAHUAN'].includes(jenisSurat)) kode = 'SP'; 
        if (jenisSurat === 'TUGAS_SISWA_SINGKAT') kode = formData.judulSuratTugasSingkat.includes('DISPENSASI') ? 'SDis' : 'ST';
        if (jenisSurat === 'SPPD') kode = 'SPPD';
        
        const newNomor = `${String(total).padStart(3, "0")}/${kode}/${romawi[bulan]}/SMK-KES-PWR/${tahun}`;
        setFormData(prev => ({ ...prev, nomorSurat: newNomor }));
      } catch (error) {}
    };
    fetchNomorOtomatis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jenisSurat, formData.judulSuratTugasSingkat, db, listSurat.length, editingId]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

  const handleConfigChange = (e) => setTempConfig({ ...tempConfig, [e.target.name]: e.target.value });
  const simpanKonfigurasiManual = () => { localStorage.setItem('customFirebaseConfig', JSON.stringify(tempConfig)); alert('Tersimpan. App akan dimuat ulang.'); window.location.reload(); };
  const resetKonfigurasiKeDefault = () => { localStorage.removeItem('customFirebaseConfig'); alert('Reset. App akan dimuat ulang.'); window.location.reload(); };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        let width = img.width; let height = img.height;
        if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/png', 0.8);
        setLogoUrl(compressedBase64);
        if (db) {
          try {
            await setDoc(getSettingsDoc('logo_sekolah'), { image: compressedBase64, width: logoWidth, offsetX: logoOffsetX, offsetY: logoOffsetY }, { merge: true });
            showNotification('success', 'Logo berhasil diunggah & tersimpan di database!');
          } catch (error) { showNotification('error', 'Gagal menyimpan logo ke database.'); }
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const simpanPengaturanLogo = async () => {
    if (!db) { showNotification('error', 'Database belum terhubung.'); return; }
    try {
      await setDoc(getSettingsDoc('logo_sekolah'), { image: logoUrl, width: logoWidth, offsetX: logoOffsetX, offsetY: logoOffsetY }, { merge: true });
      showNotification('success', 'Ukuran & Posisi Logo berhasil disimpan!');
    } catch (error) { showNotification('error', 'Gagal menyimpan pengaturan logo.'); }
  };
  
  const handleFotoSiswaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
       const img = new window.Image();
       img.onload = () => {
           const canvas = document.createElement('canvas');
           const MAX_WIDTH = 300; 
           let width = img.width; let height = img.height;
           if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
           canvas.width = width; canvas.height = height;
           const ctx = canvas.getContext('2d');
           ctx.drawImage(img, 0, 0, width, height);
           const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
           setFormData({ ...formData, fotoSiswaUrl: compressedBase64 });
       };
       img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const saveMasterDataToFirestore = async (siswaBaru, guruBaru) => {
    if (db) {
      try { await setDoc(getSettingsDoc('master_data_csv'), { siswa: siswaBaru, guru: guruBaru }); } 
      catch (error) { showNotification('error', 'Gagal menyimpan data master ke database.'); }
    }
  };

  const handleCsvUpload = (type) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = text.split('\n').filter(row => row.trim() !== '' && !row.toLowerCase().startsWith('sep='));
      const parsedData = rows.slice(1).map(row => {
        const cols = row.split(';');
        if (cols.length < 3) return null;
        return {
          nama: cols[0]?.trim() || '',
          tipe: cols[1]?.trim() || (type === 'guru' ? 'Guru' : 'Siswa'),
          identitas: cols[2]?.trim() || '',
          keterangan: cols[3]?.trim() || ''
        };
      }).filter(item => item !== null && item.nama);

      if (type === 'siswa') {
        const dataGabunganSiswa = [...dataSiswa, ...parsedData].reduce((acc, current) => {
          const isDuplicate = acc.find(item => item.nama.toLowerCase() === current.nama.toLowerCase());
          if (!isDuplicate) acc.push(current);
          return acc;
        }, []);
        setDataSiswa(dataGabunganSiswa);
        await saveMasterDataToFirestore(dataGabunganSiswa, dataGuru);
        showNotification('success', `Berhasil! Total ${dataGabunganSiswa.length} data Siswa tersimpan.`);
      } else if (type === 'guru') {
        const dataGabunganGuru = [...dataGuru, ...parsedData].reduce((acc, current) => {
          const isDuplicate = acc.find(item => item.nama.toLowerCase() === current.nama.toLowerCase());
          if (!isDuplicate) acc.push(current);
          return acc;
        }, []);
        setDataGuru(dataGabunganGuru);
        await saveMasterDataToFirestore(dataSiswa, dataGabunganGuru);
        showNotification('success', `Berhasil! Total ${dataGabunganGuru.length} data Guru/Staf tersimpan.`);
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const hapusSemuaData = async () => {
    if (window.confirm("Yakin ingin menghapus SEMUA data siswa & guru? Tindakan ini tidak bisa dibatalkan.")) {
      setDataSiswa([]); setDataGuru([]);
      if (db) {
        try {
          await setDoc(getSettingsDoc('master_data_csv'), { siswa: [], guru: [] });
          showNotification('success', 'Semua data master berhasil dihapus.');
        } catch (error) { showNotification('error', 'Gagal menghapus data master.'); }
      }
    }
  };

  const downloadContohCSV = () => {
    const csvContent = "sep=;\nNama;Kategori;NIS/NIP;Jabatan/Kelas\nBunga Dinda Sabrina;Siswa;212210001;XII Keperawatan\nLae Isriyana Nur Laela S.Kep.;Guru;199001012020122001;Guru Keperawatan\nNuryadin S.Sos. M.Pd.;Kepsek;198001012010121001;Kepala Sekolah";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Format_Master_Data_SMK.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSimpanFirebase = async () => {
    if (initError || !db) { showNotification('error', 'Sistem database bermasalah.'); return; }
    if (!user) { showNotification('error', 'Anda belum terhubung ke sistem.'); return; }
    setIsSaving(true);
    try {
      const dataToSave = {
        jenisSurat,
        formData: { ...formData },
        personil: ['TUGAS', 'TUGAS_TU', 'TUGAS_SISWA', 'TUGAS_SISWA_SINGKAT', 'DISPENSASI', 'KET_KOLEKTIF'].includes(jenisSurat) ? personil : [],
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
      loadDataUtama();
    } catch (error) {
      showNotification('error', 'Gagal menyimpan. Periksa aturan akses.');
    } finally { setIsSaving(false); }
  };

  const handleEdit = (data) => {
    setJenisSurat(data.jenisSurat); setFormData(data.formData); setPersonil(data.personil || []); setEditingId(data.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const batalEdit = () => setEditingId(null);
  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus surat ini permanen?")) {
      try {
        await deleteDoc(doc(getSuratCollection(), id));
        showNotification('success', 'Surat berhasil dihapus.');
        if (editingId === id) batalEdit();
        loadDataUtama();
      } catch (error) { showNotification('error', 'Terjadi kesalahan saat menghapus.'); }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updates = { [name]: value };
    
    if (name === 'namaKeterangan') {
      const match = allMasterData.find(d => d.nama.toLowerCase() === value.toLowerCase());
      if (match) { updates.identitasKeterangan = match.identitas; updates.kelasJabatanKeterangan = match.keterangan; }
    }
    if (name === 'namaKetAktif') {
      const match = dataSiswa.find(d => d.nama.toLowerCase() === value.toLowerCase());
      if (match) { updates.nisKetAktif = match.identitas; updates.kelasKetAktif = match.keterangan; }
    }
    if (name === 'namaSiswaDispEkst') {
      const match = dataSiswa.find(d => d.nama.toLowerCase() === value.toLowerCase());
      if (match) { updates.kelasSiswaDispEkst = match.keterangan; }
    }
    if (name === 'namaPegawai' || name === 'namaPesertaSPPD' || name === 'namaPtk') {
      const match = dataGuru.find(d => d.nama.toLowerCase() === value.toLowerCase());
      if (match) {
        if(name === 'namaPtk'){ updates.nikPtk = match.identitas; updates.jabatanPtk = match.keterangan; }
        else { updates.nipPegawai = match.identitas; updates.jabatanPegawai = match.keterangan; }
      }
    }
    if (name === 'namaPegawaiData') {
      const match = dataGuru.find(d => d.nama.toLowerCase() === value.toLowerCase());
      if (match) { updates.nikPegawaiData = match.identitas; updates.jabatanPegawaiData = match.keterangan; }
    }
    setFormData({ ...formData, ...updates });
  };

  const handlePersonilChange = (id, field, value) => {
    setPersonil(personil.map(p => {
      if (p.id === id) {
        let updates = { ...p, [field]: value };
        if (field === 'nama') {
          const match = allMasterData.find(d => d.nama.toLowerCase() === value.toLowerCase());
          if (match) { 
              if (jenisSurat === 'DISPENSASI') { updates.keterangan = match.keterangan; updates.jabatan = 'SMK Kesehatan Purworejo'; } 
              else if (jenisSurat === 'TUGAS_SISWA' || jenisSurat === 'KET_KOLEKTIF') { updates.identitas = match.identitas; updates.keterangan = match.keterangan; } 
              else if (jenisSurat === 'TUGAS_SISWA_SINGKAT') { updates.keterangan = match.keterangan; } 
              else if (jenisSurat === 'TUGAS_TU') { updates.keterangan = match.keterangan; updates.jabatan = 'SMK Kesehatan Purworejo'; } 
              else { updates.jabatan = match.keterangan; }
          }
        }
        return updates;
      }
      return p;
    }));
  };

  const tambahPersonil = () => {
    const newId = personil.length > 0 ? Math.max(...personil.map(p => p.id)) + 1 : 1;
    let defaultJabatan = ''; let defaultKet = '';
    if(jenisSurat === 'DISPENSASI' || jenisSurat === 'KET_KOLEKTIF') defaultJabatan = 'SMK Kesehatan Purworejo';
    if(jenisSurat === 'TUGAS_TU') { defaultJabatan = 'SMK Kesehatan Purworejo'; defaultKet = 'Tata Usaha'; }
    setPersonil([...personil, { id: newId, nama: '', jabatan: defaultJabatan, keterangan: defaultKet, identitas: '', ttl: '' }]);
  };
  const hapusPersonil = (id) => setPersonil(personil.filter(p => p.id !== id));
  const handlePrint = () => window.print();

  const renderFormFields = () => {
    switch (jenisSurat) {
      case 'TUGAS': return (
        <>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Dasar Tugas / Menimbang</label><textarea name="dasarTugas" value={formData.dasarTugas} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3"><label className="block text-sm font-semibold text-gray-700">Daftar Pegawai Ditugaskan</label><button onClick={tambahPersonil} className="text-sm flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"><Plus size={16} /> Tambah</button></div>
            {personil.map((p) => (
              <div key={p.id} className="mb-3 p-3 bg-white border border-gray-200 rounded relative shadow-sm">
                <div className="absolute top-2 right-2 cursor-pointer text-red-500 hover:text-red-700" onClick={() => hapusPersonil(p.id)}><Trash2 size={16} /></div>
                <input type="text" placeholder="Ketik/Pilih Nama Guru..." list="guru-list" value={p.nama} onChange={(e) => handlePersonilChange(p.id, 'nama', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2 mb-2 bg-yellow-50 focus:bg-white transition-colors" />
                <div className="grid grid-cols-2 gap-2"><input type="text" placeholder="Jabatan Otomatis..." value={p.jabatan} onChange={(e) => handlePersonilChange(p.id, 'jabatan', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2" /><input type="text" placeholder="Keterangan Tgs..." value={p.keterangan} onChange={(e) => handlePersonilChange(p.id, 'keterangan', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2" /></div>
              </div>
            ))}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tugas / Untuk</label><textarea name="kegiatan" value={formData.kegiatan} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Hari, Tanggal</label><input type="text" name="hariTanggalKegiatan" value={formData.hariTanggalKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label><input type="text" name="waktuKegiatan" value={formData.waktuKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat Kegiatan</label><input type="text" name="tempatKegiatan" value={formData.tempatKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'TUGAS_TU': return (
        <>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Dasar Tugas / Menimbang</label><textarea name="dasarTugas" value={formData.dasarTugas} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3"><label className="block text-sm font-semibold text-gray-700">Daftar Pegawai Ditugaskan</label><button onClick={tambahPersonil} className="text-sm flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"><Plus size={16} /> Tambah</button></div>
            {personil.map((p) => (
              <div key={p.id} className="mb-3 p-3 bg-white border border-gray-200 rounded relative shadow-sm">
                <div className="absolute top-2 right-2 cursor-pointer text-red-500 hover:text-red-700" onClick={() => hapusPersonil(p.id)}><Trash2 size={16} /></div>
                <input type="text" placeholder="Ketik/Pilih Nama Pegawai..." list="guru-list" value={p.nama} onChange={(e) => handlePersonilChange(p.id, 'nama', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2 mb-2 bg-yellow-50 focus:bg-white transition-colors" />
                <div className="grid grid-cols-2 gap-2"><input type="text" placeholder="Instansi..." value={p.jabatan} onChange={(e) => handlePersonilChange(p.id, 'jabatan', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2" /><input type="text" placeholder="Jabatan..." value={p.keterangan} onChange={(e) => handlePersonilChange(p.id, 'keterangan', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2" /></div>
              </div>
            ))}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tugas / Untuk</label><textarea name="kegiatan" value={formData.kegiatan} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Hari, Tanggal</label><input type="text" name="hariTanggalKegiatan" value={formData.hariTanggalKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label><input type="text" name="waktuKegiatan" value={formData.waktuKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat Kegiatan</label><input type="text" name="tempatKegiatan" value={formData.tempatKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'TUGAS_SISWA': return (
        <>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Dasar Tugas / Menimbang</label><textarea name="dasarTugas" value={formData.dasarTugas} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3"><label className="block text-sm font-semibold text-gray-700">Daftar Siswa Ditugaskan</label><button onClick={tambahPersonil} className="text-sm flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"><Plus size={16} /> Tambah</button></div>
            {personil.map((p) => (
              <div key={p.id} className="mb-3 p-3 bg-white border border-gray-200 rounded relative shadow-sm">
                <div className="absolute top-2 right-2 cursor-pointer text-red-500 hover:text-red-700" onClick={() => hapusPersonil(p.id)}><Trash2 size={16} /></div>
                <input type="text" placeholder="Ketik Nama Siswa (NISN & Kelas otomatis)..." list="siswa-list" value={p.nama} onChange={(e) => handlePersonilChange(p.id, 'nama', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2 mb-2 bg-yellow-50 focus:bg-white transition-colors" />
                <div className="grid grid-cols-3 gap-2"><input type="text" placeholder="Tempat, Tanggal Lahir" value={p.ttl} onChange={(e) => handlePersonilChange(p.id, 'ttl', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2" /><input type="text" placeholder="NISN..." value={p.identitas} onChange={(e) => handlePersonilChange(p.id, 'identitas', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2 bg-gray-100" /><input type="text" placeholder="Kelas..." value={p.keterangan} onChange={(e) => handlePersonilChange(p.id, 'keterangan', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2 bg-gray-100" /></div>
              </div>
            ))}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tugas / Untuk</label><textarea name="kegiatan" value={formData.kegiatan} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Hari, Tanggal</label><input type="text" name="hariTanggalKegiatan" value={formData.hariTanggalKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label><input type="text" name="waktuKegiatan" value={formData.waktuKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat Kegiatan</label><input type="text" name="tempatKegiatan" value={formData.tempatKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'TUGAS_SISWA_SINGKAT': return (
        <>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Judul Surat</label><select name="judulSuratTugasSingkat" value={formData.judulSuratTugasSingkat} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white"><option value="SURAT TUGAS">SURAT TUGAS</option><option value="SURAT DISPENSASI">SURAT DISPENSASI</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Dasar Tugas / Menimbang</label><textarea name="dasarTugas" value={formData.dasarTugas} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3"><label className="block text-sm font-semibold text-gray-700">Daftar Siswa</label><button onClick={tambahPersonil} className="text-sm flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"><Plus size={16} /> Tambah</button></div>
            {personil.map((p) => (
              <div key={p.id} className="mb-3 p-3 bg-white border border-gray-200 rounded relative shadow-sm">
                <div className="absolute top-2 right-2 cursor-pointer text-red-500 hover:text-red-700" onClick={() => hapusPersonil(p.id)}><Trash2 size={16} /></div>
                <input type="text" placeholder="Ketik Nama Siswa..." list="siswa-list" value={p.nama} onChange={(e) => handlePersonilChange(p.id, 'nama', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2 mb-2 bg-yellow-50 focus:bg-white transition-colors" />
                <input type="text" placeholder="Kelas (Otomatis)..." value={p.keterangan} onChange={(e) => handlePersonilChange(p.id, 'keterangan', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2 bg-gray-100" />
              </div>
            ))}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tugas / Untuk Mengikuti</label><textarea name="kegiatan" value={formData.kegiatan} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Hari, Tanggal</label><input type="text" name="hariTanggalKegiatan" value={formData.hariTanggalKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Waktu / Pukul</label><input type="text" name="waktuKegiatan" value={formData.waktuKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat Kegiatan</label><input type="text" name="tempatKegiatan" value={formData.tempatKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'TUGAS_INDIVIDU': return (
        <>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Dasar Tugas / Menimbang</label><textarea name="dasarTugas" value={formData.dasarTugas} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 my-4">
             <h3 className="font-bold text-sm text-yellow-800 mb-3">Data Pegawai Ditugaskan</h3>
             <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Pegawai</label><input type="text" name="namaPegawai" list="guru-list" value={formData.namaPegawai} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-yellow-500" placeholder="Ketik nama (NIP & Jabatan otomatis)..." /></div>
             <div className="grid grid-cols-2 gap-4 mt-2"><div><label className="block text-sm font-medium text-gray-700 mb-1">NIP / Identitas</label><input type="text" name="nipPegawai" value={formData.nipPegawai} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-yellow-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label><input type="text" name="jabatanPegawai" value={formData.jabatanPegawai} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-yellow-500" /></div></div>
             <div className="mt-2"><label className="block text-sm font-medium text-gray-700 mb-1">Unit Kerja / Tempat Tugas</label><input type="text" name="tempatTugasPegawai" value={formData.tempatTugasPegawai} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-yellow-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Hari, Tanggal</label><input type="text" name="hariTanggalKegiatan" value={formData.hariTanggalKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label><input type="text" name="waktuKegiatan" value={formData.waktuKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat Kegiatan</label><input type="text" name="tempatKegiatan" value={formData.tempatKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'SPPD': return (
        <>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4 space-y-3">
             <h3 className="font-bold text-sm text-purple-800">Detail Surat Perintah Perjalanan Dinas (SPPD)</h3>
             <div><label className="block text-sm font-medium text-gray-700 mb-1">1. Pejabat Yang Memberi Perintah</label><input type="text" name="pejabatPerintah" value={formData.pejabatPerintah} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div>
             <div><label className="block text-sm font-medium text-gray-700 mb-1">2. Nama Pegawai yang Diperintah</label><input type="text" name="namaPesertaSPPD" list="guru-list" value={formData.namaPesertaSPPD} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 bg-yellow-50" placeholder="Pilih/ketik nama pegawai..." /></div>
             <div><label className="block text-sm font-medium text-gray-700 mb-1">3. Maksud Perjalanan Dinas</label><textarea name="maksudPerjalanan" value={formData.maksudPerjalanan} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2" /></div>
             <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">4. Kendaraan</label><input type="text" name="kendaraan" value={formData.kendaraan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">7a. Lamanya Perjalanan</label><input type="text" name="lamaPerjalanan" value={formData.lamaPerjalanan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div></div>
             <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">5. Tempat Berangkat</label><input type="text" name="tempatBerangkat" value={formData.tempatBerangkat} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">6. Tempat Tujuan</label><input type="text" name="tempatTujuan" value={formData.tempatTujuan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div></div>
             <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">7b. Tanggal Berangkat</label><input type="text" name="tanggalBerangkatSPPD" value={formData.tanggalBerangkatSPPD} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">7c. Tanggal Harus Kembali</label><input type="text" name="tanggalKembaliSPPD" value={formData.tanggalKembaliSPPD} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div></div>
             <div><label className="block text-sm font-medium text-gray-700 mb-1">8. Pembebanan Anggaran</label><input type="text" name="bebanAnggaran" value={formData.bebanAnggaran} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div>
             <div><label className="block text-sm font-medium text-gray-700 mb-1">9. Keterangan Lain</label><textarea name="keteranganLain" value={formData.keteranganLain} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2" /></div>
          </div>
        </>
      );
      case 'KETERANGAN': return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama (Siswa/Pegawai)</label>
            <input type="text" name="namaKeterangan" list="siswa-guru-list" value={formData.namaKeterangan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-yellow-50 focus:bg-white transition-colors" placeholder="Ketik nama (Identitas & Kelas otomatis isi)..." />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat, Tanggal Lahir</label><input type="text" name="ttlKeterangan" value={formData.ttlKeterangan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">NIS / NIP / Identitas</label><input type="text" name="identitasKeterangan" value={formData.identitasKeterangan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Terisi Otomatis..." /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Kelas / Jabatan</label><input type="text" name="kelasJabatanKeterangan" value={formData.kelasJabatanKeterangan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Terisi Otomatis..." /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1 mt-3">Alamat</label><textarea name="alamatKeterangan" value={formData.alamatKeterangan} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Isi / Maksud Keterangan</label><textarea name="isiKeterangan" value={formData.isiKeterangan} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Keperluan (Opsional)</label><textarea name="keperluanKeterangan" value={formData.keperluanKeterangan} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'KET_AKTIF': return (
        <>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4 space-y-3">
             <h3 className="font-bold text-sm text-blue-800">Biodata Siswa Aktif</h3>
             <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Siswa</label><input type="text" name="namaKetAktif" list="siswa-list" value={formData.namaKetAktif} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 bg-yellow-50 focus:ring-blue-500" placeholder="Ketik nama siswa..." /></div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat/Tgl Lahir</label><input type="text" name="ttlKetAktif" value={formData.ttlKetAktif} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">NIS/NISN</label><input type="text" name="nisKetAktif" value={formData.nisKetAktif} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Kelas Aktif</label><input type="text" name="kelasKetAktif" value={formData.kelasKetAktif} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label><input type="text" name="tahunAjaranAktif" value={formData.tahunAjaranAktif} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
             </div>
             <div><label className="block text-sm font-medium text-gray-700 mb-1">Program/Konsentrasi Keahlian Lengkap</label><textarea name="programKeahlian" value={formData.programKeahlian} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
          </div>
        </>
      );
      case 'KET_PENELITIAN': return (
        <>
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-4 space-y-3">
             <h3 className="font-bold text-sm text-indigo-800">Data Penelitian Mahasiswa/Peneliti</h3>
             <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Mahasiswa</label><input type="text" name="namaMahasiswa" value={formData.namaMahasiswa} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat/Tgl Lahir</label><input type="text" name="ttlMahasiswa" value={formData.ttlMahasiswa} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">NIM / NIK</label><input type="text" name="nimMahasiswa" value={formData.nimMahasiswa} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div>
             </div>
             <div><label className="block text-sm font-medium text-gray-700 mb-1">Program Studi / Kampus</label><input type="text" name="prodiMahasiswa" value={formData.prodiMahasiswa} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div>
             <div><label className="block text-sm font-medium text-gray-700 mb-1">Judul Penelitian / Skripsi / Tesis</label><textarea name="judulPenelitian" value={formData.judulPenelitian} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2" /></div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tgl Mulai Penelitian</label><input type="text" name="tglMulaiPenelitian" value={formData.tglMulaiPenelitian} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tgl Selesai</label><input type="text" name="tglSelesaiPenelitian" value={formData.tglSelesaiPenelitian} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div>
             </div>
          </div>
        </>
      );
      case 'KET_FOTO': return (
        <>
          <div className="bg-pink-50 p-4 rounded-lg border border-pink-200 mb-4">
             <h3 className="font-bold text-sm text-pink-800 mb-2">Upload Pas Foto (Untuk Lomba/POPDA)</h3>
             <label className="cursor-pointer bg-white hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 border border-gray-300 transition-colors w-full">
                <ImageIcon size={16} /> Pilih Pas Foto (3x4)
                <input type="file" accept="image/*" onChange={handleFotoSiswaUpload} className="hidden" />
             </label>
             {formData.fotoSiswaUrl && <p className="text-xs text-green-600 mt-2 font-bold text-center">✓ Foto berhasil dimuat</p>}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Siswa</label><input type="text" name="namaKeterangan" list="siswa-list" value={formData.namaKeterangan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-yellow-50 focus:bg-white transition-colors" placeholder="Ketik nama (Identitas & Kelas otomatis isi)..." /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat/Tanggal Lahir</label><input type="text" name="ttlKeterangan" value={formData.ttlKeterangan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">NIS</label><input type="text" name="identitasKeterangan" value={formData.identitasKeterangan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Terisi Otomatis..." /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label><input type="text" name="kelasJabatanKeterangan" value={formData.kelasJabatanKeterangan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Terisi Otomatis..." /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1 mt-3">Tujuan Keterangan (Untuk Mengikuti...)</label><textarea name="tujuanKeteranganFoto" value={formData.tujuanKeteranganFoto} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'KET_KOLEKTIF': return (
        <>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
            <h3 className="font-bold text-sm text-green-800 mb-3">Data Tambahan Kepala Sekolah</h3>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">NIP Kepala Sekolah</label><input type="text" name="nipKepalaSekolah" value={formData.nipKepalaSekolah} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Pangkat/Golongan</label><input type="text" name="pangkatKepalaSekolah" value={formData.pangkatKepalaSekolah} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500" /></div></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kalimat Pembuka</label><textarea name="pembukaKetKolektif" value={formData.pembukaKetKolektif} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-2 mb-2">
            <div className="flex justify-between items-center mb-3"><label className="block text-sm font-semibold text-gray-700">Daftar Siswa Diterangkan</label><button onClick={tambahPersonil} className="text-sm flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"><Plus size={16} /> Tambah</button></div>
            {personil.map((p) => (
              <div key={p.id} className="mb-3 p-3 bg-white border border-gray-200 rounded relative shadow-sm">
                <div className="absolute top-2 right-2 cursor-pointer text-red-500 hover:text-red-700" onClick={() => hapusPersonil(p.id)}><Trash2 size={16} /></div>
                <input type="text" placeholder="Ketik Nama Siswa (NISN & Kelas otomatis)..." list="siswa-list" value={p.nama} onChange={(e) => handlePersonilChange(p.id, 'nama', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2 mb-2 bg-yellow-50 focus:bg-white transition-colors" />
                <div className="grid grid-cols-3 gap-2"><input type="text" placeholder="Tempat, Tanggal Lahir" value={p.ttl} onChange={(e) => handlePersonilChange(p.id, 'ttl', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2" /><input type="text" placeholder="NISN..." value={p.identitas} onChange={(e) => handlePersonilChange(p.id, 'identitas', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2 bg-gray-100" /><input type="text" placeholder="Kelas..." value={p.keterangan} onChange={(e) => handlePersonilChange(p.id, 'keterangan', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2 bg-gray-100" /></div>
              </div>
            ))}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kalimat Penutup</label><textarea name="penutupKetKolektif" value={formData.penutupKetKolektif} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'KET_LAMPIRAN': return (
        <>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Alamat Instansi</label><textarea name="alamatInstansi" value={formData.alamatInstansi} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Isi Keterangan Lengkap</label><textarea name="isiKetLampiran" value={formData.isiKetLampiran} onChange={handleInputChange} rows="8" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'REKOMENDASI': return (
        <>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Siswa</label><input type="text" name="namaKeterangan" list="siswa-list" value={formData.namaKeterangan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-yellow-50 focus:bg-white transition-colors" placeholder="Ketik nama (Identitas otomatis isi)..." /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat/Tanggal Lahir</label><input type="text" name="ttlKeterangan" value={formData.ttlKeterangan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">NISN / NIS</label><input type="text" name="identitasKeterangan" value={formData.identitasKeterangan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Terisi Otomatis..." /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1 mt-3">Rekomendasi Untuk (Tujuan Instansi)</label><input type="text" name="tujuanRekomendasi" value={formData.tujuanRekomendasi} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Daftar Prestasi Non-Akademik / Catatan Khusus</label><textarea name="prestasiRekomendasi" value={formData.prestasiRekomendasi} onChange={handleInputChange} rows="6" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'DISPENSASI': return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Lampiran</label><input type="text" name="lampiran" value={formData.lampiran} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hal / Perihal</label><input type="text" name="halDispensasi" value={formData.halDispensasi} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kepada Yth. (Tujuan)</label><textarea name="tujuanDispensasi" value={formData.tujuanDispensasi} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kalimat Pembuka & Acara</label><textarea name="pembukaDispensasi" value={formData.pembukaDispensasi} onChange={handleInputChange} rows="4" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-2 mb-2">
            <div className="flex justify-between items-center mb-3"><label className="block text-sm font-semibold text-gray-700">Daftar Siswa Dispensasi</label><button onClick={tambahPersonil} className="text-sm flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"><Plus size={16} /> Tambah</button></div>
            {personil.map((p) => (
              <div key={p.id} className="mb-3 p-3 bg-white border border-gray-200 rounded relative shadow-sm">
                <div className="absolute top-2 right-2 cursor-pointer text-red-500 hover:text-red-700" onClick={() => hapusPersonil(p.id)}><Trash2 size={16} /></div>
                <input type="text" placeholder="Ketik Nama Siswa..." list="siswa-list" value={p.nama} onChange={(e) => handlePersonilChange(p.id, 'nama', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2 mb-2 bg-yellow-50 focus:bg-white transition-colors" />
                <div className="grid grid-cols-2 gap-2"><input type="text" placeholder="Sekolah (Otomatis)..." value={p.jabatan} onChange={(e) => handlePersonilChange(p.id, 'jabatan', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2" /><input type="text" placeholder="Kelas (Otomatis)..." value={p.keterangan} onChange={(e) => handlePersonilChange(p.id, 'keterangan', e.target.value)} className="w-full text-sm border border-gray-300 rounded-md p-2" /></div>
              </div>
            ))}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Teks Bawah Tabel</label><textarea name="teksBawahTabelDispensasi" value={formData.teksBawahTabelDispensasi} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div className="grid grid-cols-2 gap-4 mt-2"><div><label className="block text-sm font-medium text-gray-700 mb-1">Hari, Tanggal Izin</label><input type="text" name="hariTanggalKegiatan" value={formData.hariTanggalKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label><input type="text" name="waktuKegiatan" value={formData.waktuKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat Kegiatan</label><input type="text" name="tempatKegiatan" value={formData.tempatKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kalimat Penutup</label><textarea name="penutupDispensasi" value={formData.penutupDispensasi} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'DISP_EKSTERNAL': return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Lampiran</label><input type="text" name="lampiran" value={formData.lampiran} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hal / Perihal</label><input type="text" name="halDispensasi" value={formData.halDispensasi} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kepada Yth. (Tujuan Instansi Luar)</label><textarea name="tujuanDispEkst" value={formData.tujuanDispEkst} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kalimat Pembuka</label><textarea name="pembukaDispEkst" value={formData.pembukaDispEkst} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>

          <div className="bg-yellow-50 p-4 mt-2 rounded-lg border border-yellow-100">
            <h3 className="font-bold text-sm text-yellow-800 mb-2">Detail Jadwal Kegiatan</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Hari Kegiatan</label><input type="text" name="hariTanggalKegiatan" value={formData.hariTanggalKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-yellow-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat Kegiatan</label><input type="text" name="tempatKegiatan" value={formData.tempatKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-yellow-500" /></div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-2 mb-2">
            <h3 className="font-bold text-sm text-gray-800 mb-2">Data Siswa Yang Izin</h3>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Siswa</label><input type="text" name="namaSiswaDispEkst" list="siswa-list" value={formData.namaSiswaDispEkst} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 bg-white" placeholder="Ketik nama siswa..." /></div>
            <div className="mt-2"><label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label><input type="text" name="kelasSiswaDispEkst" value={formData.kelasSiswaDispEkst} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 bg-gray-100" /></div>
          </div>

          <div><label className="block text-sm font-medium text-gray-700 mb-1">Alasan Izin (Teks Bawah Tabel)</label><textarea name="alasanDispEkst" value={formData.alasanDispEkst} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kalimat Penutup</label><textarea name="penutupDispEkst" value={formData.penutupDispEkst} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'BALASAN_DISP': return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Lampiran</label><input type="text" name="lampiran" value={formData.lampiran} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hal / Perihal</label><input type="text" name="halBalasan" value={formData.halBalasan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kepada Yth. (Tujuan)</label><textarea name="tujuanBalasan" value={formData.tujuanBalasan} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kalimat Pembuka & Alasan Penolakan</label><textarea name="pembukaBalasan" value={formData.pembukaBalasan} onChange={handleInputChange} rows="4" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 my-4">
             <h3 className="font-bold text-sm text-yellow-800 mb-3">Data Pegawai Yang Tidak Diizinkan</h3>
             <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Pegawai</label><input type="text" name="namaPegawai" list="guru-list" value={formData.namaPegawai} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-yellow-500" placeholder="Ketik nama (Jabatan otomatis)..." /></div>
             <div className="grid grid-cols-2 gap-4 mt-2"><div><label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label><input type="text" name="jabatanPegawai" value={formData.jabatanPegawai} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-yellow-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat Tugas</label><input type="text" name="tempatTugasPegawai" value={formData.tempatTugasPegawai} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-yellow-500" /></div></div>
          </div>

          <div><label className="block text-sm font-medium text-gray-700 mb-1">Alasan Penugasan di Sekolah</label><textarea name="alasanTugas" value={formData.alasanTugas} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          
          <div className="grid grid-cols-2 gap-4 mt-2"><div><label className="block text-sm font-medium text-gray-700 mb-1">Hari, Tanggal Penugasan</label><input type="text" name="hariTanggalKegiatan" value={formData.hariTanggalKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label><input type="text" name="waktuKegiatan" value={formData.waktuKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat Kegiatan</label><input type="text" name="tempatKegiatan" value={formData.tempatKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </>
      );
      case 'BALASAN_IZIN': return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Lampiran</label><input type="text" name="lampiran" value={formData.lampiran} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hal / Perihal</label><input type="text" name="halBalasanIzin" value={formData.halBalasanIzin} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kepada Yth. (Tujuan)</label><textarea name="tujuanBalasanIzin" value={formData.tujuanBalasanIzin} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kalimat Pembuka</label><textarea name="pembukaBalasanIzin" value={formData.pembukaBalasanIzin} onChange={handleInputChange} rows="4" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 my-4">
             <h3 className="font-bold text-sm text-yellow-800 mb-3">Data Pemohon/Mahasiswa</h3>
             <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemohon</label><input type="text" name="namaPemohonIzin" value={formData.namaPemohonIzin} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div>
             <div className="grid grid-cols-2 gap-4 mt-2"><div><label className="block text-sm font-medium text-gray-700 mb-1">NIM / NIK</label><input type="text" name="identitasPemohonIzin" value={formData.identitasPemohonIzin} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label><input type="text" name="prodiPemohonIzin" value={formData.prodiPemohonIzin} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" /></div></div>
             <div className="mt-2"><label className="block text-sm font-medium text-gray-700 mb-1">Judul Penelitian / Acara</label><textarea name="judulPemohonIzin" value={formData.judulPemohonIzin} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2" /></div>
          </div>

          <div><label className="block text-sm font-medium text-gray-700 mb-1">Poin-poin Keputusan / Keterangan</label><textarea name="poinBalasanIzin" value={formData.poinBalasanIzin} onChange={handleInputChange} rows="4" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kalimat Penutup</label><textarea name="penutupBalasanIzin" value={formData.penutupBalasanIzin} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
        </>
      );
      case 'PEMBERITAHUAN': return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Lampiran</label><input type="text" name="lampiran" value={formData.lampiran} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hal / Perihal</label><input type="text" name="halPemberitahuan" value={formData.halPemberitahuan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kepada Yth. (Tujuan)</label><textarea name="tujuanPemberitahuan" value={formData.tujuanPemberitahuan} onChange={handleInputChange} rows="4" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Isi Surat Pemberitahuan</label><textarea name="isiPemberitahuan" value={formData.isiPemberitahuan} onChange={handleInputChange} rows="10" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
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
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Hari, Tanggal</label><input type="text" name="hariTanggalKegiatan" value={formData.hariTanggalKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label><input type="text" name="waktuKegiatan" value={formData.waktuKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div></div>
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
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Isi Surat Permohonan Lengkap</label><textarea name="isiPermohonan" value={formData.isiPermohonan} onChange={handleInputChange} rows="6" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          
          <div className="bg-blue-50 p-4 mt-2 rounded-lg border border-blue-100">
            <h3 className="font-bold text-sm text-blue-800 mb-2">Jadwal Acara (Opsional)</h3>
            <p className="text-xs text-gray-600 mb-3">Isi jika surat permohonan Anda membutuhkan detail jadwal acara (seperti file PDF 018).</p>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Hari, Tanggal</label><input type="text" name="hariTanggalKegiatan" value={formData.hariTanggalKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label><input type="text" name="waktuKegiatan" value={formData.waktuKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div></div>
            <div className="mt-3"><label className="block text-sm font-medium text-gray-700 mb-1">Tempat</label><input type="text" name="tempatKegiatan" value={formData.tempatKegiatan} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          </div>
        </>
      );
      case 'PERMOHONAN_BANK': return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Lampiran</label><input type="text" name="lampiran" value={formData.lampiran} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hal / Perihal</label><input type="text" name="halPermohonanBank" value={formData.halPermohonanBank} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kepada Yth. (Tujuan)</label><textarea name="tujuanPermohonanBank" value={formData.tujuanPermohonanBank} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
          
          <div className="bg-green-50 p-4 mt-2 mb-2 rounded-lg border border-green-100">
            <h3 className="font-bold text-sm text-green-800 mb-2">Data Permohonan Cetak</h3>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank Cabang Tujuan</label><input type="text" name="namaBank" value={formData.namaBank} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500" /></div>
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label><input type="text" name="noRekening" value={formData.noRekening} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 font-mono" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Atas Nama Rekening</label><input type="text" name="namaRekening" value={formData.namaRekening} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500" /></div>
            </div>
            <div className="mt-2"><label className="block text-sm font-medium text-gray-700 mb-1">Periode Cetak (Mulai Bulan - Tahun)</label><input type="text" name="periodeCetak" value={formData.periodeCetak} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500" /></div>
            <div className="mt-2"><label className="block text-sm font-medium text-gray-700 mb-1">Guna Kepentingan / Keperluan</label><input type="text" name="keperluanRekening" value={formData.keperluanRekening} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500" /></div>
          </div>
        </>
      );
      case 'PERMOHONAN_DATA': return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Lampiran</label><input type="text" name="lampiran" value={formData.lampiran} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hal / Perihal</label><input type="text" name="halPermohonanData" value={formData.halPermohonanData} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kepada Yth. (Tujuan)</label><textarea name="tujuanPermohonanData" value={formData.tujuanPermohonanData} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kalimat Pembuka</label><textarea name="pembukaPermohonanData" value={formData.pembukaPermohonanData} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
          
          <div className="bg-blue-50 p-4 mt-2 mb-2 rounded-lg border border-blue-100">
            <h3 className="font-bold text-sm text-blue-800 mb-2">Data Pegawai</h3>
            <input type="text" name="namaPegawaiData" list="guru-list" placeholder="Nama Pegawai (Ketik otomatis)..." value={formData.namaPegawaiData} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 mb-2 bg-yellow-50" />
            <div className="grid grid-cols-2 gap-2 mb-2"><input type="text" name="ttlPegawaiData" placeholder="Tempat, Tgl. Lahir..." value={formData.ttlPegawaiData} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /><input type="text" name="nikPegawaiData" placeholder="NIK..." value={formData.nikPegawaiData} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
            <div className="grid grid-cols-2 gap-2 mb-2"><input type="text" name="agamaPegawaiData" placeholder="Agama..." value={formData.agamaPegawaiData} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /><input type="text" name="ijazahPegawaiData" placeholder="Ijazah Terakhir..." value={formData.ijazahPegawaiData} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
            <div className="grid grid-cols-2 gap-2 mb-2"><input type="text" name="jurusanPegawaiData" placeholder="Jurusan/Tahun Lulus..." value={formData.jurusanPegawaiData} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /><input type="text" name="jabatanPegawaiData" placeholder="Jabatan..." value={formData.jabatanPegawaiData} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
          </div>
          
          <div className="bg-yellow-50 p-4 mt-2 mb-2 rounded-lg border border-yellow-200">
            <h3 className="font-bold text-sm text-yellow-800 mb-2">Perbandingan Data (Kiri vs Kanan)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><input type="text" name="dataLamaLabel" value={formData.dataLamaLabel} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 mb-1 font-semibold" /><textarea name="dataLamaIsi" value={formData.dataLamaIsi} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2" /></div>
              <div><input type="text" name="dataBaruLabel" value={formData.dataBaruLabel} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 mb-1 font-semibold" /><textarea name="dataBaruIsi" value={formData.dataBaruIsi} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2" /></div>
            </div>
          </div>
          
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Daftar Lampiran Berkas</label><textarea name="listLampiranData" value={formData.listLampiranData} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kalimat Penutup</label><textarea name="penutupPermohonanData" value={formData.penutupPermohonanData} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
        </>
      );
      case 'TAMBAH_PTK': return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hal / Perihal</label><input type="text" name="halTambahPTK" value={formData.halTambahPTK} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Kepada Yth. (Tujuan)</label><textarea name="tujuanTambahPTK" value={formData.tujuanTambahPTK} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
          </div>
          
          <div className="bg-blue-50 p-4 mt-2 mb-2 rounded-lg border border-blue-100">
            <h3 className="font-bold text-sm text-blue-800 mb-2">Data PTK / Pegawai Baru</h3>
            <input type="text" name="namaPtk" list="guru-list" placeholder="Nama Pegawai Baru..." value={formData.namaPtk} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 mb-2 bg-white" />
            <div className="grid grid-cols-2 gap-2 mb-2"><input type="text" name="ttlPtk" placeholder="Tempat, Tgl. Lahir..." value={formData.ttlPtk} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /><input type="text" name="nikPtk" placeholder="NIK..." value={formData.nikPtk} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
            <div className="grid grid-cols-2 gap-2 mb-2"><input type="text" name="agamaPtk" placeholder="Agama..." value={formData.agamaPtk} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /><input type="text" name="ijazahPtk" placeholder="Ijazah Terakhir..." value={formData.ijazahPtk} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
            <div className="grid grid-cols-2 gap-2 mb-2"><input type="text" name="jurusanPtk" placeholder="Jurusan/Tahun Lulus..." value={formData.jurusanPtk} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /><input type="text" name="jabatanPtk" placeholder="Jabatan..." value={formData.jabatanPtk} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
          </div>
          
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Daftar Lampiran Berkas</label><textarea name="lampiranPtk" value={formData.lampiranPtk} onChange={handleInputChange} rows="5" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500" /></div>
        </>
      );
      default: return null;
    }
  };

  const renderPrintBody = () => {
    switch (jenisSurat) {
      case 'TUGAS': return (
        <>
          <div className="text-center mb-8"><h3 className="text-lg font-bold underline m-0">SURAT TUGAS</h3><p className="text-sm m-0">NOMOR : {formData.nomorSurat}</p></div>
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
      case 'TUGAS_TU': return (
        <>
          <div className="text-center mb-8"><h3 className="text-lg font-bold underline m-0">SURAT TUGAS</h3><p className="text-sm m-0">NOMOR : {formData.nomorSurat}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4 indent-8">{formData.dasarTugas}</p>
            <p className="font-bold text-center mb-4">MEMERINTAHKAN :</p>
            <div className="mb-6">
              <table className="w-full border-collapse border border-black text-sm">
                <thead><tr className="bg-gray-100"><th className="border border-black py-1 px-2 w-10">No.</th><th className="border border-black py-1 px-2 text-left">Nama</th><th className="border border-black py-1 px-2 text-left">Instansi</th><th className="border border-black py-1 px-2 text-left">Jabatan</th></tr></thead>
                <tbody>{personil.map((p, index) => (<tr key={p.id}><td className="border border-black py-1 px-2 text-center align-top">{index + 1}.</td><td className="border border-black py-1 px-2 align-top">{p.nama}</td><td className="border border-black py-1 px-2 align-top">{p.jabatan}</td><td className="border border-black py-1 px-2 align-top">{p.keterangan}</td></tr>))}</tbody>
              </table>
            </div>
            <p className="mb-2">Untuk {formData.kegiatan} pada :</p>
            <table className="mb-6 ml-8 text-sm"><tbody>
              <tr><td className="py-1 pr-4 align-top w-24">Hari, Tanggal</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.hariTanggalKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Waktu</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.waktuKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Tempat</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.tempatKegiatan}</td></tr>
            </tbody></table>
            <p className="mb-10">Demikian surat tugas ini untuk dapat dilaksanakan dengan penuh tanggung jawab.</p>
          </div>
        </>
      );
      case 'TUGAS_SISWA': return (
        <>
          <div className="text-center mb-8"><h3 className="text-lg font-bold underline m-0">SURAT TUGAS</h3><p className="text-sm m-0">NOMOR : {formData.nomorSurat}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4 indent-8">{formData.dasarTugas}. SMK Kesehatan Purworejo Kabupaten Purworejo Provinsi Jawa Tengah</p>
            <p className="font-bold text-center mb-4">MEMERINTAHKAN :</p>
            <div className="mb-6">
              <table className="w-full border-collapse border border-black text-sm">
                <thead><tr className="bg-gray-100"><th className="border border-black py-1 px-2 w-10">No.</th><th className="border border-black py-1 px-2 text-left">Nama<br/>TTL</th><th className="border border-black py-1 px-2 text-left">NISN</th><th className="border border-black py-1 px-2 text-left">Kelas</th></tr></thead>
                <tbody>{personil.map((p, index) => (<tr key={p.id}><td className="border border-black py-1 px-2 text-center align-top">{index + 1}.</td><td className="border border-black py-1 px-2 align-top"><span className="font-semibold">{p.nama}</span><br/>{p.ttl}</td><td className="border border-black py-1 px-2 align-top">{p.identitas}</td><td className="border border-black py-1 px-2 align-top">{p.keterangan}</td></tr>))}</tbody>
              </table>
            </div>
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
      case 'TUGAS_SISWA_SINGKAT': return (
        <>
          <div className="text-center mb-8"><h3 className="text-lg font-bold underline m-0">{formData.judulSuratTugasSingkat}</h3><p className="text-sm m-0">NOMOR : {formData.nomorSurat}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4 indent-8">{formData.dasarTugas}</p>
            <p className="font-bold text-center mb-4">MEMERINTAHKAN :</p>
            <div className="mb-6 ml-8 mr-8">
              <table className="w-full border-collapse border border-black text-sm">
                <thead><tr className="bg-gray-100"><th className="border border-black py-1 px-2 w-10">No.</th><th className="border border-black py-1 px-2 text-left">Nama</th><th className="border border-black py-1 px-2 text-left">Kelas</th></tr></thead>
                <tbody>{personil.map((p, index) => (<tr key={p.id}><td className="border border-black py-1 px-2 text-center align-top">{index + 1}.</td><td className="border border-black py-1 px-2 align-top">{p.nama}</td><td className="border border-black py-1 px-2 align-top">{p.keterangan}</td></tr>))}</tbody>
              </table>
            </div>
            <p className="mb-2">Untuk {formData.kegiatan} pada :</p>
            <table className="mb-6 ml-8 text-sm"><tbody>
              <tr><td className="py-1 pr-4 align-top w-24">Hari, Tanggal</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.hariTanggalKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Pukul</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.waktuKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Tempat</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.tempatKegiatan}</td></tr>
            </tbody></table>
            <p className="mb-10">Demikian {formData.judulSuratTugasSingkat.toLowerCase()} ini untuk dapat dilaksanakan dengan penuh tanggung jawab.</p>
          </div>
        </>
      );
      case 'TUGAS_INDIVIDU': return (
        <>
          <div className="text-center mb-8"><h3 className="text-lg font-bold underline m-0">SURAT TUGAS</h3><p className="text-sm m-0">NOMOR : {formData.nomorSurat}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-6 text-justify">{formData.dasarTugas}, Kepala SMK Kesehatan Purworejo dengan ini memberikan tugas kepada :</p>
            
            <table className="mb-6 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-24">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.namaPegawai}</td></tr>
              <tr><td className="py-1 pr-4 align-top">NIP</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.nipPegawai}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Jabatan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.jabatanPegawai}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Unit Kerja</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.tempatTugasPegawai}</td></tr>
            </tbody></table>

            <p className="mb-2">Untuk mengikuti kegiatan tersebut pada :</p>
            <table className="mb-6 ml-8 text-sm"><tbody>
              <tr><td className="py-1 pr-4 align-top w-24">Hari, Tanggal</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.hariTanggalKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Waktu</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.waktuKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Tempat</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.tempatKegiatan}</td></tr>
            </tbody></table>
            <p className="mb-10">Demikian surat tugas ini untuk dapat dilaksanakan dengan penuh tanggung jawab.</p>
          </div>
        </>
      );
      case 'SPPD': return (
        <>
          <div className="flex justify-end text-sm mb-4">
            <table className="text-sm"><tbody><tr><td className="pr-2 align-top">Lembar ke</td><td className="align-top">: </td></tr><tr><td className="pr-2 align-top">Nomor</td><td className="align-top">: {formData.nomorSurat}</td></tr></tbody></table>
          </div>
          <div className="text-center mb-6"><h3 className="text-lg font-bold underline m-0">SURAT PERINTAH PERJALANAN DINAS</h3></div>
          <div className="text-sm text-justify leading-relaxed ml-4 mr-4">
            <table className="w-full text-sm mb-6">
              <tbody>
                <tr><td className="w-8 align-top py-1">1.</td><td className="w-64 align-top py-1">Pejabat Yang Memberi Perintah</td><td className="w-4 align-top py-1">:</td><td className="align-top py-1 font-semibold">{formData.pejabatPerintah}</td></tr>
                <tr><td className="w-8 align-top py-1">2.</td><td className="align-top py-1">Nama Peserta yang diperintah</td><td className="align-top py-1">:</td><td className="align-top py-1 font-semibold">{formData.namaPesertaSPPD}</td></tr>
                <tr><td className="w-8 align-top py-1">3.</td><td className="align-top py-1">Maksud Perjalanan Dinas</td><td className="align-top py-1">:</td><td className="align-top py-1 whitespace-pre-wrap">{formData.maksudPerjalanan}</td></tr>
                <tr><td className="w-8 align-top py-1">4.</td><td className="align-top py-1">Kendaraan yang Dipergunakan</td><td className="align-top py-1">:</td><td className="align-top py-1">{formData.kendaraan}</td></tr>
                <tr><td className="w-8 align-top py-1">5.</td><td className="align-top py-1">Tempat Berangkat</td><td className="align-top py-1">:</td><td className="align-top py-1">{formData.tempatBerangkat}</td></tr>
                <tr><td className="w-8 align-top py-1">6.</td><td className="align-top py-1">Tempat Tujuan</td><td className="align-top py-1">:</td><td className="align-top py-1 font-semibold">{formData.tempatTujuan}</td></tr>
                <tr><td className="w-8 align-top py-1">7.</td><td className="align-top py-1">Lamanya Perjalanan Dinas<br/>Tanggal Berangkat<br/>Tanggal Harus Kembali</td><td className="align-top py-1">:<br/>:<br/>:</td><td className="align-top py-1">{formData.lamaPerjalanan}<br/>{formData.tanggalBerangkatSPPD}<br/>{formData.tanggalKembaliSPPD}</td></tr>
                <tr><td className="w-8 align-top py-1">8.</td><td className="align-top py-1">Pembebanan Anggaran</td><td className="align-top py-1">:</td><td className="align-top py-1">{formData.bebanAnggaran}</td></tr>
                <tr><td className="w-8 align-top py-1">9.</td><td className="align-top py-1">Keterangan lain</td><td className="align-top py-1">:</td><td className="align-top py-1 whitespace-pre-wrap">{formData.keteranganLain}</td></tr>
              </tbody>
            </table>
            
            <div className="flex justify-end text-sm mt-4">
              <div className="text-center w-64">
                <p className="m-0 text-left">(SPPD)</p>
                <p className="m-0 mt-4">Ditetapkan di: Purworejo</p>
                <p className="m-0 mb-20">Pada tanggal {formData.tanggalBerangkatSPPD}</p>
                <p className="font-bold underline m-0">{formData.kepalaSekolah}</p>
                {formData.nipKepalaSekolah !== '-' && <p className="m-0">NIP. {formData.nipKepalaSekolah}</p>}
              </div>
            </div>
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
              <tr><td className="py-1 pr-4 align-top">Kelas / Komp. Keahlian</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.kelasJabatanKeterangan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">NIS / NISN</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.identitasKeterangan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Alamat</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top whitespace-pre-wrap">{formData.alamatKeterangan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Keterangan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top whitespace-pre-wrap">{formData.isiKeterangan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Keperluan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top whitespace-pre-wrap">{formData.keperluanKeterangan}</td></tr>
            </tbody></table>
            <p className="mb-10">Demikian Surat Keterangan ini dibuat dengan sebenar-benarnya, untuk dipergunakan dengan penuh tanggungjawab.</p>
          </div>
        </>
      );
      case 'KET_AKTIF': return (
        <>
          <div className="text-center mb-8"><h3 className="text-lg font-bold underline m-0">SURAT KETERANGAN AKTIF</h3><p className="text-sm m-0">No. {formData.nomorSurat}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4">Yang bertanda tangan di bawah ini :</p>
            <table className="mb-6 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-36">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.kepalaSekolah}</td></tr>
              <tr><td className="py-1 pr-4 align-top">NIP</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.nipKepalaSekolah}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Pangkat / Golongan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.pangkatKepalaSekolah}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Jabatan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">Kepala Sekolah</td></tr>
              <tr><td className="py-1 pr-4 align-top">Instansi</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">SMK Kesehatan Purworejo</td></tr>
            </tbody></table>
            
            <p className="mb-4">Dengan ini menerangkan :</p>
            <table className="mb-6 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-36">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.namaKetAktif}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Tempat / tanggal lahir</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.ttlKetAktif}</td></tr>
              <tr><td className="py-1 pr-4 align-top">NIS/NISN</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.nisKetAktif}</td></tr>
            </tbody></table>

            <p className="mb-8 text-justify">
               bahwa yang bersangkutan saat ini aktif mengikuti pendidikan di Kelas {formData.kelasKetAktif} Program Keahlian {formData.programKeahlian} di SMK Kesehatan Purworejo Tahun Ajaran {formData.tahunAjaranAktif}.<br/><br/>
               Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.
            </p>
          </div>
        </>
      );
      case 'KET_PENELITIAN': return (
        <>
          <div className="text-center mb-8"><h3 className="text-lg font-bold underline m-0">SURAT KETERANGAN</h3><p className="text-sm m-0">NOMOR : {formData.nomorSurat}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4">Yang bertanda tangan di bawah ini :</p>
            <table className="mb-6 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-36">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.kepalaSekolah}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Jabatan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">Kepala SMK Kesehatan Purworejo</td></tr>
              <tr><td className="py-1 pr-4 align-top">Unit Kerja</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top whitespace-pre-wrap">{formData.alamatInstansi}</td></tr>
            </tbody></table>
            
            <p className="mb-4">menerangkan dengan sesungguhnya bahwa :</p>
            <table className="mb-6 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-40">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.namaMahasiswa}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Tempat/tanggal lahir</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.ttlMahasiswa}</td></tr>
              <tr><td className="py-1 pr-4 align-top">NIM / NIK</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.nimMahasiswa}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Program Studi</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.prodiMahasiswa}</td></tr>
            </tbody></table>

            <p className="mb-4 text-justify">Telah mengadakan penelitian di SMK Kesehatan Purworejo dalam rangka penyusunan tesis/skripsi dengan judul "{formData.judulPenelitian}" mulai {formData.tglMulaiPenelitian} sampai {formData.tglSelesaiPenelitian}.</p>
            <p className="mb-10">Demikian Surat Keterangan ini dibuat untuk dipergunakan sebagai mestinya.</p>
          </div>
        </>
      );
      case 'KET_FOTO': return (
        <>
          <div className="text-center mb-8"><h3 className="text-lg font-bold underline m-0">SURAT KETERANGAN</h3><p className="text-sm m-0">NOMOR : {formData.nomorSurat}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4">Yang bertanda tangan dibawah ini :</p>
            <table className="mb-6 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-36">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.kepalaSekolah}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Jabatan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">Kepala SMK Kesehatan Purworejo</td></tr>
              <tr><td className="py-1 pr-4 align-top">Alamat Instansi</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top whitespace-pre-wrap">{formData.alamatInstansi}</td></tr>
            </tbody></table>
            <p className="mb-4">dengan ini menerangkan dengan sesungguhnya bahwa :</p>
            
            <div className="flex mb-6 ml-8 gap-6 items-start">
               {formData.fotoSiswaUrl ? (
                  <img src={formData.fotoSiswaUrl} alt="Foto Siswa" className="w-[3cm] h-[4cm] object-cover border border-gray-400 p-1" />
               ) : (
                  <div className="w-[3cm] h-[4cm] border-2 border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-400 text-center">Foto<br/>3x4</div>
               )}
               
               <table className="text-sm flex-1"><tbody>
                  <tr><td className="py-1 pr-4 align-top w-36">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.namaKeterangan}</td></tr>
                  <tr><td className="py-1 pr-4 align-top">Tempat/Tanggal lahir</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.ttlKeterangan}</td></tr>
                  <tr><td className="py-1 pr-4 align-top">NIS</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.identitasKeterangan}</td></tr>
                  <tr><td className="py-1 pr-4 align-top">Kelas</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.kelasJabatanKeterangan}</td></tr>
               </tbody></table>
            </div>

            <p className="mb-4 text-justify">adalah benar-benar siswa SMK Kesehatan Purworejo Tahun Ajaran 2025/2026, dan duduk di kelas {formData.kelasJabatanKeterangan}.</p>
            <p className="mb-4 text-justify">Surat Keterangan ini di gunakan untuk {formData.tujuanKeteranganFoto}</p>
            <p className="mb-10">Demikian Surat Keterangan ini dibuat untuk dipergunakan sebagai mestinya.</p>
          </div>
        </>
      );
      case 'KET_KOLEKTIF': return (
        <>
          <div className="text-center mb-8"><h3 className="text-lg font-bold underline m-0">SURAT KETERANGAN</h3><p className="text-sm m-0">No. {formData.nomorSurat}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4">Yang bertanda tangan di bawah ini:</p>
            <table className="mb-6 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-36">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.kepalaSekolah}</td></tr>
              <tr><td className="py-1 pr-4 align-top">NIP</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.nipKepalaSekolah}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Pangkat/Golongan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.pangkatKepalaSekolah}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Jabatan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">Kepala Sekolah</td></tr>
              <tr><td className="py-1 pr-4 align-top">Instansi</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">SMK Kesehatan Purworejo</td></tr>
            </tbody></table>
            
            <p className="mb-4 whitespace-pre-wrap">{formData.pembukaKetKolektif}</p>
            <div className="mb-4 mt-2">
              <table className="w-full border-collapse border border-black text-sm">
                <thead><tr className="bg-gray-100"><th className="border border-black py-1 px-2 w-10">No.</th><th className="border border-black py-1 px-2 text-left">Nama<br/>TTL</th><th className="border border-black py-1 px-2 text-left">Kelas<br/>NISN</th></tr></thead>
                <tbody>{personil.map((p, index) => (<tr key={p.id}><td className="border border-black py-1 px-2 text-center align-top">{index + 1}.</td><td className="border border-black py-1 px-2 align-top"><span className="font-semibold">{p.nama}</span><br/>{p.ttl}</td><td className="border border-black py-1 px-2 align-top">{p.keterangan}<br/>{p.identitas}</td></tr>))}</tbody>
              </table>
            </div>

            <p className="mb-10 whitespace-pre-wrap">{formData.penutupKetKolektif}</p>
          </div>
        </>
      );
      case 'KET_LAMPIRAN': return (
        <>
          <div className="text-center mb-8"><h3 className="text-lg font-bold underline m-0">SURAT KETERANGAN</h3><p className="text-sm m-0">Nomor: {formData.nomorSurat}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4">Yang bertandatangan di bawah ini:</p>
            <table className="mb-6 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-36">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.kepalaSekolah}</td></tr>
              <tr><td className="py-1 pr-4 align-top">NIP</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.nipKepalaSekolah}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Jabatan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">Kepala SMK Kesehatan Purworejo</td></tr>
              <tr><td className="py-1 pr-4 align-top">Alamat Instansi</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top whitespace-pre-wrap">{formData.alamatInstansi}</td></tr>
            </tbody></table>
            <p className="mb-10 whitespace-pre-wrap">{formData.isiKetLampiran}</p>
          </div>
        </>
      );
      case 'REKOMENDASI': return (
        <>
          <div className="text-center mb-8"><h3 className="text-lg font-bold underline m-0">SURAT REKOMENDASI</h3><p className="text-sm m-0">NOMOR: {formData.nomorSurat}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4">Yang bertanda tangan dibawah ini :</p>
            <table className="mb-6 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-36">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.kepalaSekolah}</td></tr>
              <tr><td className="py-1 pr-4 align-top">NIP</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.nipKepalaSekolah}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Jabatan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">Kepala Sekolah</td></tr>
            </tbody></table>
            <p className="mb-4">Dengan ini memberikan rekomendasi untuk melanjutkan kuliah di {formData.tujuanRekomendasi} kepada :</p>
            <table className="mb-6 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-36">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.namaKeterangan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Tempat/Tanggal Lahir</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.ttlKeterangan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">NISN</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.identitasKeterangan}</td></tr>
            </tbody></table>
            <p className="mb-2">Siswa tersebut benar merupakan siswa SMK Kesehatan Purworejo dan memiliki prestasi non akademik sebagai berikut:</p>
            <div className="mb-4 ml-8 whitespace-pre-wrap">{formData.prestasiRekomendasi}</div>
            <p className="mb-10">Demikian Surat Rekomendasi ini dibuat dengan sesungguhnya, untuk dapat digunakan sebagaimana mestinya.</p>
          </div>
        </>
      );
      case 'DISPENSASI': return (
        <>
          <div className="flex justify-between text-sm mb-6"><div><table className="text-sm"><tbody>
            <tr><td className="pr-4 py-0.5 align-top">Nomor</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.nomorSurat}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Lampiran</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.lampiran}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Hal</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top font-bold">{formData.halDispensasi}</td></tr>
          </tbody></table></div></div>
          <div className="text-sm mb-6 whitespace-pre-wrap"><p className="mb-0">Kepada Yth.</p><p className="font-semibold">{formData.tujuanDispensasi}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4 whitespace-pre-wrap">{formData.pembukaDispensasi}</p>
            <div className="mb-4 mt-2">
              <table className="w-full border-collapse border border-black text-sm">
                <thead><tr className="bg-gray-100"><th className="border border-black py-1 px-2 w-10">No.</th><th className="border border-black py-1 px-2 text-left">Nama</th><th className="border border-black py-1 px-2 text-left">Sekolah</th><th className="border border-black py-1 px-2 text-left">Kelas</th></tr></thead>
                <tbody>{personil.map((p, index) => (<tr key={p.id}><td className="border border-black py-1 px-2 text-center align-top">{index + 1}.</td><td className="border border-black py-1 px-2 align-top">{p.nama}</td><td className="border border-black py-1 px-2 align-top">{p.jabatan || 'SMK Kesehatan Purworejo'}</td><td className="border border-black py-1 px-2 align-top">{p.keterangan}</td></tr>))}</tbody>
              </table>
            </div>
            <p className="mb-2 mt-4 whitespace-pre-wrap">{formData.teksBawahTabelDispensasi}</p>
            <table className="mb-6 ml-8 text-sm"><tbody>
              <tr><td className="py-1 pr-4 align-top w-24">Hari, Tanggal</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.hariTanggalKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Waktu</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.waktuKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Tempat</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.tempatKegiatan}</td></tr>
            </tbody></table>
            <p className="mb-10 whitespace-pre-wrap">{formData.penutupDispensasi}</p>
          </div>
        </>
      );
      case 'DISP_EKSTERNAL': return (
        <>
          <div className="flex justify-between text-sm mb-6"><div><table className="text-sm"><tbody>
            <tr><td className="pr-4 py-0.5 align-top">Nomor</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.nomorSurat}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Lampiran</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.lampiran}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Hal</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top font-bold">{formData.halDispensasi}</td></tr>
          </tbody></table></div></div>
          
          <div className="text-sm mb-6 whitespace-pre-wrap"><p className="mb-0">Kepada Yth.</p><p className="font-semibold">{formData.tujuanDispEkst}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4 whitespace-pre-wrap">{formData.pembukaDispEkst}</p>
            
            <table className="mb-6 ml-8 text-sm"><tbody>
              <tr><td className="py-1 pr-4 align-top w-24">Hari, Tanggal</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.hariTanggalKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Tempat</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top whitespace-pre-wrap">{formData.tempatKegiatan}</td></tr>
            </tbody></table>
            
            <p className="mb-4">maka kami mohon dispensasi siswa :</p>
            <table className="mb-4 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-24">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.namaSiswaDispEkst}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Kelas</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.kelasSiswaDispEkst}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Sekolah</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">SMK Kesehatan Purworejo</td></tr>
            </tbody></table>
            
            <p className="mb-4 text-justify whitespace-pre-wrap">{formData.alasanDispEkst}</p>
            <p className="mb-10 text-justify whitespace-pre-wrap">{formData.penutupDispEkst}</p>
          </div>
        </>
      );
      case 'BALASAN_DISP': return (
        <>
          <div className="flex justify-between text-sm mb-6"><div><table className="text-sm"><tbody>
            <tr><td className="pr-4 py-0.5 align-top">Nomor</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.nomorSurat}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Lampiran</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.lampiran}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Perihal</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top font-bold">{formData.halBalasan}</td></tr>
          </tbody></table></div></div>
          <div className="text-sm mb-6 whitespace-pre-wrap"><p className="mb-0">Kepada Yth.</p><p className="font-semibold">{formData.tujuanBalasan}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4 whitespace-pre-wrap">{formData.pembukaBalasan}</p>
            <table className="mb-4 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-24">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.namaPegawai}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Jabatan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.jabatanPegawai}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Tempat tugas</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.tempatTugasPegawai}</td></tr>
            </tbody></table>
            <p className="mb-2 text-justify">{formData.alasanTugas}</p>
            <table className="mb-6 ml-8 text-sm"><tbody>
              <tr><td className="py-1 pr-4 align-top w-24">Hari, Tanggal</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.hariTanggalKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Waktu</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.waktuKegiatan}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Tempat</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.tempatKegiatan}</td></tr>
            </tbody></table>
            <p className="mb-10 text-justify">Demikian pemberitahuan ini disampaikan, atas perhatian dan kerjasamanya diucapkan terima kasih.</p>
          </div>
        </>
      );
      case 'BALASAN_IZIN': return (
        <>
          <div className="flex justify-between text-sm mb-6"><div><table className="text-sm"><tbody>
            <tr><td className="pr-4 py-0.5 align-top">No</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.nomorSurat}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Lamp</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.lampiran}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Hal</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top font-bold">{formData.halBalasanIzin}</td></tr>
          </tbody></table></div></div>
          <div className="text-sm mb-6 whitespace-pre-wrap"><p className="mb-0">Kepada</p><p className="font-semibold">Yth. {formData.tujuanBalasanIzin}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4 whitespace-pre-wrap">{formData.pembukaBalasanIzin}</p>
            <table className="mb-4 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-28">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.namaPemohonIzin}</td></tr>
              <tr><td className="py-1 pr-4 align-top">NIM / NIK</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.identitasPemohonIzin}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Program Studi</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.prodiPemohonIzin}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Judul</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top whitespace-pre-wrap">{formData.judulPemohonIzin}</td></tr>
            </tbody></table>
            <p className="mb-2">perlu kami sampaikan beberapa hal sebagai berikut:</p>
            <p className="mb-4 ml-4 whitespace-pre-wrap leading-relaxed">{formData.poinBalasanIzin}</p>
            <p className="mb-10 text-justify whitespace-pre-wrap">{formData.penutupBalasanIzin}</p>
          </div>
        </>
      );
      case 'PEMBERITAHUAN': return (
        <>
          <div className="flex justify-between text-sm mb-6"><div><table className="text-sm"><tbody>
            <tr><td className="pr-4 py-0.5 align-top">Nomor</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.nomorSurat}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Hal</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top font-bold">{formData.halPemberitahuan}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Lampiran</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.lampiran}</td></tr>
          </tbody></table></div></div>
          <div className="text-sm mb-6 whitespace-pre-wrap"><p className="font-semibold">{formData.tujuanPemberitahuan}</p></div>
          <div className="text-sm text-justify leading-relaxed whitespace-pre-wrap mb-10">{formData.isiPemberitahuan}</div>
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
          <div className="text-sm text-justify leading-relaxed whitespace-pre-wrap mb-4">{formData.isiPermohonan}</div>
          {formData.hariTanggalKegiatan && (
             <div className="text-sm text-justify leading-relaxed mb-6">
                <table className="ml-8 text-sm"><tbody>
                  <tr><td className="py-1 pr-4 align-top w-24">Hari, Tanggal</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.hariTanggalKegiatan}</td></tr>
                  <tr><td className="py-1 pr-4 align-top">Waktu</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.waktuKegiatan}</td></tr>
                  <tr><td className="py-1 pr-4 align-top">Tempat</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.tempatKegiatan}</td></tr>
                </tbody></table>
             </div>
          )}
        </>
      );
      case 'PERMOHONAN_BANK': return (
        <>
          <div className="flex justify-between text-sm mb-6"><div><table className="text-sm"><tbody>
            <tr><td className="pr-4 py-0.5 align-top">Nomor</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.nomorSurat}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Lampiran</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.lampiran}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Hal</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top font-bold">{formData.halPermohonanBank}</td></tr>
          </tbody></table></div></div>
          <div className="text-sm mb-6 whitespace-pre-wrap"><p className="mb-0">Kepada Yth.</p><p className="font-semibold">{formData.tujuanPermohonanBank}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4">Dengan Hormat,</p>
            <p className="mb-4">Saya yang bertanda tangan di bawah ini :</p>
            <table className="mb-6 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-36">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.kepalaSekolah}</td></tr>
              <tr><td className="py-1 pr-4 align-top">NIP</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.nipKepalaSekolah}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Jabatan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">Kepala SMK Kesehatan Purworejo</td></tr>
              <tr><td className="py-1 pr-4 align-top">Alamat Instansi</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top whitespace-pre-wrap">{formData.alamatInstansi}</td></tr>
            </tbody></table>
            <p className="mb-4 text-justify">Bermaksud mengajukan permohonan Cetak Rekening Koran dari {formData.namaBank} mulai {formData.periodeCetak} dengan nomor rekening: <span className="font-semibold">{formData.noRekening}</span>, a/n rekening: <span className="font-semibold">{formData.namaRekening}</span> yang beralamat di {formData.alamatInstansi} (sesuai rekening), guna kepentingan {formData.keperluanRekening}.</p>
            <p className="mb-10 text-justify">Demikian surat permohonan ini dibuat dengan sebenar-benarnya. Atas perhatian dan bantuannya diucapkan terima kasih.</p>
          </div>
        </>
      );
      case 'PERMOHONAN_DATA': return (
        <>
          <div className="flex justify-between text-sm mb-6"><div><table className="text-sm"><tbody>
            <tr><td className="pr-4 py-0.5 align-top">No</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.nomorSurat}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Lamp</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.lampiran}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Hal</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top font-bold">{formData.halPermohonanData}</td></tr>
          </tbody></table></div></div>
          <div className="text-sm mb-6 whitespace-pre-wrap"><p className="mb-0">Kepada</p><p className="font-semibold">Yth. {formData.tujuanPermohonanData}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4 whitespace-pre-wrap">{formData.pembukaPermohonanData}</p>
            <table className="mb-4 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-36">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.namaPegawaiData}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Tempat, Tgl. Lahir</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.ttlPegawaiData}</td></tr>
              <tr><td className="py-1 pr-4 align-top">NIK</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.nikPegawaiData}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Agama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.agamaPegawaiData}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Ijazah terakhir</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.ijazahPegawaiData}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Jurusan/Tahun Lulus</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.jurusanPegawaiData}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Jabatan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.jabatanPegawaiData}</td></tr>
            </tbody></table>
            <div className="mb-4 w-11/12 ml-8">
              <table className="w-full border-collapse border border-black text-sm">
                <thead><tr className="bg-gray-100"><th className="border border-black py-1 px-2 text-left">{formData.dataLamaLabel}</th><th className="border border-black py-1 px-2 text-left">{formData.dataBaruLabel}</th></tr></thead>
                <tbody><tr><td className="border border-black py-2 px-2 align-top whitespace-pre-wrap">{formData.dataLamaIsi}</td><td className="border border-black py-2 px-2 align-top whitespace-pre-wrap">{formData.dataBaruIsi}</td></tr></tbody>
              </table>
            </div>
            <p className="mb-2">Sebagai bahan pertimbangan kami lampirkan berkas-berkas sebagai berikut:</p>
            <p className="mb-4 ml-8 whitespace-pre-wrap leading-relaxed">{formData.listLampiranData}</p>
            <p className="mb-10 text-justify whitespace-pre-wrap">{formData.penutupPermohonanData}</p>
          </div>
        </>
      );
      case 'TAMBAH_PTK': return (
        <>
          <div className="flex justify-between text-sm mb-6"><div><table className="text-sm"><tbody>
            <tr><td className="pr-4 py-0.5 align-top">Nomor</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">{formData.nomorSurat}</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Lampiran</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top">1 bendel</td></tr>
            <tr><td className="pr-4 py-0.5 align-top">Perihal</td><td className="px-1 py-0.5 align-top">:</td><td className="py-0.5 align-top font-bold">{formData.halTambahPTK}</td></tr>
          </tbody></table></div></div>
          <div className="text-sm mb-6 whitespace-pre-wrap"><p className="mb-0">Kepada,</p><p className="font-semibold">Yth. {formData.tujuanTambahPTK}</p></div>
          <div className="text-sm text-justify leading-relaxed">
            <p className="mb-4">Dengan hormat, bersama surat ini kami mengajukan permohonan kepada Ketua Yayasan Bina Tani Bagelen Purworejo untuk melakukan tambah PTK baru pada aplikasi Dapodik SMK Kesehatan Purworejo, sebagai berikut:</p>
            <table className="mb-4 ml-8 text-sm w-full"><tbody>
              <tr><td className="py-1 pr-4 align-top w-36">Nama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 font-semibold align-top">{formData.namaPtk}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Tempat, Tgl. Lahir</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.ttlPtk}</td></tr>
              <tr><td className="py-1 pr-4 align-top">NIK</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.nikPtk}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Agama</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.agamaPtk}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Ijazah terakhir</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.ijazahPtk}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Jurusan/Tahun Lulus</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.jurusanPtk}</td></tr>
              <tr><td className="py-1 pr-4 align-top">Jabatan</td><td className="py-1 px-2 align-top">:</td><td className="py-1 align-top">{formData.jabatanPtk}</td></tr>
            </tbody></table>
            <p className="mb-2">Sebagai bahan pertimbangan kami lampirkan berkas-berkas sebagai berikut:</p>
            <p className="mb-4 ml-8 whitespace-pre-wrap leading-relaxed">{formData.lampiranPtk}</p>
            <p className="mb-10 text-justify whitespace-pre-wrap">Demikian kami sampaikan permohonan ini, atas perkenannya kami ucapkan terima kasih.</p>
          </div>
        </>
      );
      default: return null;
    }
  };

  const isSPPD = jenisSurat === 'SPPD';

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

      {/* DATALIST AUTOCOMPLETE */}
      <datalist id="guru-list">{dataGuru.map((g, i) => <option key={`g-${i}`} value={g.nama}>{g.keterangan}</option>)}</datalist>
      <datalist id="siswa-list">{dataSiswa.map((s, i) => <option key={`s-${i}`} value={s.nama}>{s.identitas} - {s.keterangan}</option>)}</datalist>
      <datalist id="siswa-guru-list">{allMasterData.map((d, i) => <option key={`all-${i}`} value={d.nama}>{d.identitas} - {d.keterangan}</option>)}</datalist>

      {/* MODAL DATA MASTER */}
      {showDataMasterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2"><h2 className="text-xl font-bold flex items-center gap-2"><Database size={20} /> Kelola Data Sekolah</h2><button onClick={() => setShowDataMasterModal(false)} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"><X size={20} /></button></div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">1. Logo Kop Surat</label>
                <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 border border-blue-200 transition-colors w-full"><Upload size={16} /> Ganti File Logo<input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></label>
                <div className="border border-gray-200 rounded-md p-4 bg-gray-50 mt-4 shadow-inner">
                  <h3 className="text-sm font-bold mb-3 text-gray-800">Atur Posisi & Ukuran Logo</h3>
                  <div className="space-y-4">
                    <div><div className="flex justify-between text-xs text-gray-600 font-semibold mb-1"><label>Ukuran Logo</label><span>{logoWidth} px</span></div><input type="range" min="40" max="250" value={logoWidth} onChange={(e) => setLogoWidth(Number(e.target.value))} className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer" /></div>
                    <div><div className="flex justify-between text-xs text-gray-600 font-semibold mb-1"><label>Geser Kanan / Kiri</label><span>{logoOffsetX} px</span></div><input type="range" min="-150" max="150" value={logoOffsetX} onChange={(e) => setLogoOffsetX(Number(e.target.value))} className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer" /></div>
                    <div><div className="flex justify-between text-xs text-gray-600 font-semibold mb-1"><label>Geser Atas / Bawah</label><span>{logoOffsetY} px</span></div><input type="range" min="-100" max="100" value={logoOffsetY} onChange={(e) => setLogoOffsetY(Number(e.target.value))} className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer" /></div>
                  </div>
                  <button onClick={simpanPengaturanLogo} disabled={!logoUrl} className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-2 rounded-md text-sm font-bold transition-colors flex justify-center items-center gap-2 shadow-sm"><Save size={16} /> Simpan Pengaturan Logo</button>
                </div>
                <p className="text-xs text-gray-500 text-center italic mt-2">*Klik 'Simpan Pengaturan Logo' agar perubahan tersimpan permanen.</p>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">2. Upload Data Master CSV</label>
                <p className="text-xs text-gray-600 mb-3 text-justify">Upload file CSV secara terpisah untuk Siswa dan Guru agar penyimpanan lebih rapi dan aman. Gunakan pembatas <b>titik koma (;)</b> dengan format kolom: <b>Nama;Kategori;NIS/NIP;Jabatan/Kelas</b>.</p>
                {(dataSiswa.length > 0 || dataGuru.length > 0) && (<div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md text-xs text-green-700 font-semibold">✓ Total data tersimpan: <b>{dataSiswa.length + dataGuru.length}</b> orang<br/><br/>&nbsp;&nbsp;• Siswa: <b>{dataSiswa.length}</b> data<br/>&nbsp;&nbsp;• Guru/Staf: <b>{dataGuru.length}</b> data</div>)}
                <div className="flex flex-col gap-3">
                  <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 border border-blue-200 transition-colors w-full"><Database size={16} /> Import CSV Khusus Siswa<input type="file" accept=".csv" onChange={handleCsvUpload('siswa')} className="hidden" /></label>
                  <label className="cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 border border-emerald-200 transition-colors w-full"><Database size={16} /> Import CSV Khusus Guru/Staf<input type="file" accept=".csv" onChange={handleCsvUpload('guru')} className="hidden" /></label>
                  <button onClick={downloadContohCSV} className="text-sm flex items-center justify-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-200 transition-colors w-full mt-2"><Download size={16} /> Download Contoh Format CSV</button>
                  {(dataSiswa.length > 0 || dataGuru.length > 0) && (<button onClick={hapusSemuaData} className="text-sm flex items-center justify-center gap-1 bg-red-50 text-red-600 px-3 py-2 rounded-md border border-red-200 hover:bg-red-100 transition-colors w-full mt-2"><Trash2 size={16} /> Hapus Semua Data Master</button>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FIREBASE SETTINGS */}
      {showFirebaseSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Settings size={20} /> Pengaturan API Firebase</h2>
            <p className="text-sm text-gray-600 mb-6">Ubah konfigurasi jika ingin menyambungkan ke project Firebase lain.</p>
            {Object.keys(DEFAULT_FIREBASE_CONFIG).map((key) => (
              <div key={key} className="mb-4"><label className="block text-xs font-semibold text-gray-700 mb-1">{key}</label><input type="text" name={key} value={tempConfig[key] || ''} onChange={handleConfigChange} className="w-full text-sm border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500 font-mono" /></div>
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

        {/* PANEL KIRI */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-lg p-6 h-fit no-print">
          <div className="flex items-center justify-between gap-2 mb-6 border-b pb-4">
            <div className="flex items-center gap-2"><FileText className="text-blue-600" size={24} /><h2 className="text-xl font-bold text-gray-800">Aplikasi Surat Sekolah</h2></div>
            <div className="flex gap-2">
              <button onClick={() => setShowDataMasterModal(true)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Data Sekolah & Logo"><Database size={20} /></button>
              <button onClick={() => setShowFirebaseSettings(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" title="Pengaturan Database"><Settings size={20} /></button>
            </div>
          </div>

          {initError && (
            <div className="p-3 mb-6 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div><strong>Koneksi Database Gagal!</strong><br />Klik ikon gear (⚙️) untuk memperbaiki.</div>
            </div>
          )}

          {/* Navigasi Surat yang responsive */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setJenisSurat('TUGAS')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'TUGAS' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><BriefcaseIcon size={14} /> Tugas (Guru)</button>
            <button onClick={() => setJenisSurat('TUGAS_TU')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'TUGAS_TU' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Users size={14} /> Tugas (TU)</button>
            <button onClick={() => setJenisSurat('TUGAS_INDIVIDU')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'TUGAS_INDIVIDU' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><User size={14} /> Tugas (Indiv)</button>
            <button onClick={() => setJenisSurat('TUGAS_SISWA')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'TUGAS_SISWA' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><GraduationCap size={14} /> Tugas (Siswa)</button>
            <button onClick={() => setJenisSurat('TUGAS_SISWA_SINGKAT')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'TUGAS_SISWA_SINGKAT' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><ClipboardList size={14} /> Tugas/Disp 2 Kolom</button>
            <button onClick={() => setJenisSurat('SPPD')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'SPPD' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Map size={14} /> SPPD</button>
            
            <button onClick={() => setJenisSurat('KETERANGAN')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'KETERANGAN' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Info size={14} /> Keterangan (Umum)</button>
            <button onClick={() => setJenisSurat('KET_AKTIF')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'KET_AKTIF' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Info size={14} /> Ket. Aktif (Gaji)</button>
            <button onClick={() => setJenisSurat('KET_KOLEKTIF')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'KET_KOLEKTIF' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><FileBadge size={14} /> Ket. Kolektif</button>
            <button onClick={() => setJenisSurat('KET_LAMPIRAN')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'KET_LAMPIRAN' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Paperclip size={14} /> Ket. Lampiran</button>
            <button onClick={() => setJenisSurat('KET_FOTO')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'KET_FOTO' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><ImageIcon size={14} /> Ket. Berfoto</button>
            <button onClick={() => setJenisSurat('KET_PENELITIAN')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'KET_PENELITIAN' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><BookOpen size={14} /> Ket. Penelitian</button>
            
            <button onClick={() => setJenisSurat('REKOMENDASI')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'REKOMENDASI' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Award size={14} /> Rekomendasi</button>
            <button onClick={() => setJenisSurat('DISPENSASI')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'DISPENSASI' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Users size={14} /> Dispensasi (Umum)</button>
            <button onClick={() => setJenisSurat('DISP_EKSTERNAL')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'DISP_EKSTERNAL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><UserMinus size={14} /> Disp. Eksternal</button>
            <button onClick={() => setJenisSurat('BALASAN_DISP')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'BALASAN_DISP' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Reply size={14} /> Balasan Disp.</button>
            <button onClick={() => setJenisSurat('BALASAN_IZIN')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'BALASAN_IZIN' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Reply size={14} /> Balasan Izin</button>
            
            <button onClick={() => setJenisSurat('PEMBERITAHUAN')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'PEMBERITAHUAN' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Bell size={14} /> Pemberitahuan</button>
            <button onClick={() => setJenisSurat('UNDANGAN')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'UNDANGAN' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Mail size={14} /> Undangan</button>
            <button onClick={() => setJenisSurat('PERMOHONAN')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'PERMOHONAN' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Send size={14} /> Permohonan (Umum)</button>
            <button onClick={() => setJenisSurat('PERMOHONAN_BANK')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'PERMOHONAN_BANK' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Landmark size={14} /> Permohonan (Bank)</button>
            <button onClick={() => setJenisSurat('PERMOHONAN_DATA')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'PERMOHONAN_DATA' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><FileText size={14} /> Permohonan (Ubah Data)</button>
            <button onClick={() => setJenisSurat('TAMBAH_PTK')} className={`px-2 py-1 text-[11px] rounded-md font-bold transition-colors flex items-center gap-1 ${jenisSurat === 'TAMBAH_PTK' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><UserPlus size={14} /> Permohonan (Tambah PTK)</button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Nomor Surat (Bisa Diedit Manual)</label><input type="text" name="nomorSurat" value={formData.nomorSurat} onChange={handleInputChange} className="w-full border border-blue-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-mono text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Surat</label><input type="text" name="tanggalSurat" value={formData.tanggalSurat} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Kepala Sekolah</label><input type="text" name="kepalaSekolah" list="guru-list" value={formData.kepalaSekolah} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white" /></div>
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

        {/* PANEL KANAN: PREVIEW */}
        <div className="lg:col-span-7 overflow-auto flex justify-center pb-10">
          <div id="print-area" className="bg-white shadow-xl w-[210mm] min-h-[330mm] p-10 text-black mx-auto shrink-0 relative" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <div className="flex items-center border-b-[3px] border-double border-black pb-4 mb-6">
              <div className="w-[120px] flex-shrink-0 flex items-center justify-center relative">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo SMK" style={{ width: `${logoWidth}px`, height: 'auto', maxWidth: 'none', transform: `translate(${logoOffsetX}px, ${logoOffsetY}px)` }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', border: '2px dashed #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8', textAlign: 'center' }}>Logo<br />Belum Ada</div>
                )}
              </div>
              <div className="flex-1 text-center px-2 relative z-10">
                <h3 className="text-base font-bold m-0 leading-tight">YAYASAN BINA TANI BAGELEN PURWOREJO</h3>
                <h2 className="text-2xl font-bold m-0 leading-tight">SMK KESEHATAN PURWOREJO</h2>
                <p className="text-sm font-bold m-0 leading-tight">STATUS : TERAKREDITASI A</p>
                <p className="text-sm font-bold m-0 leading-tight">KOMPETENSI KEAHLIAN : KEPERAWATAN DAN FARMASI</p>
                <p className="text-[11px] m-0 leading-tight mt-1">Kampus 1 : Jl. Kesatrian No. 4 Purworejo</p>
                <p className="text-[11px] m-0 leading-tight">Kampus 2 : Jl. Mayjend. Sarbini Pangenjurutengah Purworejo Telp. (0275) 2971364</p>
                <p className="text-[11px] m-0 leading-tight">e-mail: smkkesehatan.pwr@gmail.com &nbsp;&nbsp;&nbsp; NPSN : 69888413</p>
              </div>
              <div className="w-[120px] flex-shrink-0"></div>
            </div>

            {renderPrintBody()}

            {!isSPPD && (
              <div className="flex justify-end text-sm mt-4">
                <div className="text-center w-64">
                  <p className="m-0">Purworejo, {formData.tanggalSurat}</p>
                  <p className="m-0 mb-20">Kepala Sekolah</p>
                  <p className="font-bold underline m-0">{formData.kepalaSekolah}</p>
                </div>
              </div>
            )}
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