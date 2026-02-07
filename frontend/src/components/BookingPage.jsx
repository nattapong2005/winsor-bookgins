import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showAlert } from "./Alert";
// import "./BookingPage.css"; // Removed

// ✅ รับ apiUrl มาจาก props (ที่ส่งมาจาก App.js)
const BookingPage = ({ apiUrl }) => {
  const navigate = useNavigate();
  const initialFormState = {
    name: "", phone: "", date: "", time: "", service: "",
    address_detail: "", sub_district: "", district: "", province: "", postcode: "", notes: ""
  };
  const [form, setForm] = useState(initialFormState);
  const [allBookings, setAllBookings] = useState([]);
  const [searchPhone, setSearchPhone] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const timeSlots = ["09:00", "12:00", "15:00"];

  // ✅ เปลี่ยนเป็นใช้ apiUrl จาก Props
  const fetchAllBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      // Map Backend Data to Frontend Structure (Updated for new schema)
      const mappedData = Array.isArray(data) ? data.map(item => {
        const dateObj = new Date(item.booking_date);
        const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        return {
          _id: item.id,
          booking_date: item.booking_date,
          booking_time: timeStr,
          status: item.status, // Status from backend is now used directly.
          customer_name: item.customer_name,
          phone: item.phone,
          service_type: item.service_type,
          address_detail: item.address_detail,
          notes: item.notes
        };
      }) : [];

      setAllBookings(mappedData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => { fetchAllBookings(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const getAvailableTimes = (selectedDate) => {
    if (!selectedDate) return timeSlots;
    const bookedTimes = allBookings
      .filter(item => (item.booking_date?.split('T')[0] === selectedDate && item.status !== 'ยกเลิก'))
      .map(item => item.booking_time);
    return timeSlots.filter(time => !bookedTimes.includes(time));
  };

  const handleSearch = () => {
    if (!searchPhone) return showAlert("warning", "กรุณากรอกเบอร์โทรศัพท์");
    const filtered = allBookings.filter(item => item.phone === searchPhone);
    setSearchResults(filtered);
    setIsSearching(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.time) return showAlert("warning", "กรุณาเลือกช่วงเวลาที่ต้องการ");

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      // Combine date and time
      const dateTimeString = `${form.date}T${form.time}:00`;

      // Append all fields to FormData
      formData.append("customer_name", form.name);
      formData.append("phone", form.phone);
      formData.append("service_type", form.service);
      formData.append("booking_date", dateTimeString);
      formData.append("sub_district", form.sub_district);
      formData.append("district", form.district);
      formData.append("province", form.province);
      formData.append("postcode", form.postcode);
      formData.append("address_detail", form.address_detail);
      formData.append("notes", form.notes);

      if (selectedFile) {
        // Send file with the field name 'image' as expected by backend
        formData.append("image", selectedFile);
      }

      // ✅ แก้ไข URL ให้ใช้ apiUrl จาก Props
      const response = await fetch(`${apiUrl}/api/bookings`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
          // Content-Type is automatically set for FormData
        },
        body: formData,
      });

      if (response.ok) {
        setShowSuccess(true);
        fetchAllBookings();
        setForm(initialFormState);
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        const errorData = await response.json();
        showAlert("error", `❌ จองไม่สำเร็จ: ${errorData.message || "มีข้อผิดพลาดเกิดขึ้น"}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      showAlert("error", "❌ ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต");
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 animate-fade-in">
        <div className="bg-white p-12 rounded-[2rem] text-center max-w-md w-[90%] shadow-2xl animate-zoom-in">
          <div className="text-6xl text-green-500 mb-6 animate-bounce">✨</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">การจองคิวสำเร็จ!</h2>
          <p className="text-lg text-slate-500 mb-8 leading-relaxed">เราได้รับข้อมูลของคุณแล้ว ทีมงานจะติดต่อกลับเพื่อยืนยันนัดหมายเร็วที่สุด</p>
          <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1 transition-all" onClick={() => navigate("/")}>กลับสู่หน้าหลัก</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full flex flex-col lg:flex-row bg-slate-50 font-['Prompt'] overflow-hidden z-[9999]">
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
      </div>

      <aside className="lg:w-[35%] bg-slate-900 text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden shadow-2xl">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 z-0"></div>

        <div className="relative z-10 w-full">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5 mb-8 lg:mb-0 w-fit">
            ← กลับหน้าหลัก
          </button>
        </div>

        <div className="relative z-10 my-8 lg:my-0">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight tracking-tight">Vinyl <span className="text-blue-500">House</span></h1>
          <p className="text-xl text-slate-400 font-light mb-6">บริการจองคิวทีมช่างมืออาชีพ</p>
          <div className="hidden lg:block text-slate-400 leading-relaxed max-w-xs">
            <p>สัมผัสประสบการณ์การติดตั้งที่ได้มาตรฐานและบริการที่ยอดเยี่ยมจากทีมงานผู้เชี่ยวชาญ</p>
          </div>
        </div>

        <div className="relative z-10 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">🔍 ตรวจสอบสถานะคิวของคุณ</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="กรอกเบอร์โทรศัพท์..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-900/20" onClick={handleSearch}>ค้นหา</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-white relative z-10 overflow-y-auto w-full">
        <div className="min-h-full px-6 py-12 lg:p-16 flex justify-center">
          {isSearching ? (
            <div className="w-full max-w-2xl animate-fade-in-up">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800">ประวัติการจอง</h2>
                <button className="text-slate-500 hover:text-slate-800 font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setIsSearching(false)}>← กลับไปหน้าจอง</button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {searchResults.length > 0 ? searchResults.map((item) => (
                  <div key={item._id || item.id} className="p-6 border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors flex justify-between items-start gap-4">
                    <div>
                      <p className="font-semibold text-lg text-slate-800 mb-1">{item.service_type}</p>
                      <p className="text-slate-500 text-sm">
                        <span className="font-medium text-slate-700">วันที่:</span> {new Date(item.booking_date).toLocaleDateString('th-TH')} <span className="mx-2">|</span> <span className="font-medium text-slate-700">เวลา:</span> {item.booking_time} น.
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold
                        ${item.status === 'เสร็จสิ้น' ? 'bg-green-100 text-green-700' :
                        item.status === 'ยกเลิก' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {item.status || 'รอยืนยัน'}
                    </span>
                  </div>
                )) : <div className="p-12 text-center text-slate-400">ไม่พบข้อมูลการจองสำหรับเบอร์โทรศัพท์นี้</div>}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full max-w-2xl animate-fade-in-up space-y-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-2">ลงทะเบียนจองคิว</h2>
                <p className="text-slate-500 text-lg">กรุณากรอกข้อมูลให้ครบถ้วนเพื่อประสิทธิภาพสูงสุดในการบริการ</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">ชื่อ-นามสกุล</label>
                  <input type="text" placeholder="ระบุชื่อจริง-นามสกุล" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">เบอร์โทรศัพท์</label>
                  <input type="tel" placeholder="08x-xxx-xxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">📍 สถานที่ติดตั้ง / วัดหน้างาน</label>
                <input type="text" placeholder="บ้านเลขที่, หมู่บ้าน, ซอย, ถนน" value={form.address_detail} onChange={(e) => setForm({ ...form, address_detail: e.target.value })} required
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none mb-3"
                />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <input type="text" placeholder="แขวง/ตำบล" value={form.sub_district} onChange={(e) => setForm({ ...form, sub_district: e.target.value })} required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                  />
                  <input type="text" placeholder="เขต/อำเภอ" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                  />
                  <input type="text" placeholder="จังหวัด" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                  />
                  <input type="text" placeholder="รหัสไปรษณีย์" value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">วันที่สะดวก</label>
                  <input type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">ช่วงเวลา</label>
                  <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required disabled={!form.date}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">-- เลือกเวลา --</option>
                    {getAvailableTimes(form.date).map(t => <option key={t} value={t}>{t} น.</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">บริการที่ต้องการ</label>
                <div className="relative">
                  <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none"
                  >
                    <option value="">เลือกประเภทบริการ...</option>
                    <option value="ติดตั้งประตู">ติดตั้งประตู (Vinyl Door)</option>
                    <option value="ติดตั้งหน้าต่าง">ติดตั้งหน้าต่าง (Vinyl Window)</option>
                    <option value="เช็คคุณภาพ / แก้ไขจุดบกพร่อง">เช็คคุณภาพ / แก้ไขจุดบกพร่อง</option>
                    <option value="วัดหน้างาน / ประเมินราคา">วัดหน้างาน / ประเมินราคา</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">หมายเหตุ / ข้อมูลเพิ่มเติม</label>
                <input type="text" placeholder="รายละเอียดเพิ่มเติมที่ต้องการแจ้งช่าง" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">📷 แนบรูปภาพหน้างาน (ถ้ามี)</label>
                <div className={`border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center transition-all hover:bg-slate-50 hover:border-blue-400 group cursor-pointer relative ${previewUrl ? 'border-blue-500 bg-blue-50/30' : ''}`}>
                  <input type="file" accept="image/*" onChange={handleFileChange} id="file-upload" hidden />
                  <label htmlFor="file-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    {previewUrl ? (
                      <div className="relative">
                        <img src={previewUrl} alt="Preview" className="max-h-[200px] rounded-lg shadow-md" />
                      </div>
                    ) : (
                      <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
                        <div className="mb-2 text-3xl">📤</div>
                        <span className="text-sm font-medium">คลิกเพื่ออัปโหลดรูปภาพ</span>
                      </div>
                    )}
                  </label>
                  {previewUrl && (
                    <button type="button" className="absolute top-[-10px] right-[-10px] bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    >✕</button>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-1 transition-all">
                ยืนยันการจองคิว
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookingPage;