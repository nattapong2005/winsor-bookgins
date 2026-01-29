import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home({ apiUrl }) {
    const navigate = useNavigate();
    const [searchPhone, setSearchPhone] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchPhone) return alert("กรุณากรอกเบอร์โทรศัพท์");
        setIsSearching(true);
        try {
            const res = await fetch(`${apiUrl}/api/bookings/search/${searchPhone}`);
            const data = await res.json();

            const mappedData = Array.isArray(data) ? data.map(item => {
                const dateObj = new Date(item.booking_date);
                const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                return {
                    ...item,
                    booking_time: timeStr,
                };
            }) : [];

            setSearchResult(mappedData);
        } catch (err) {
            alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        } finally {
            setIsSearching(false);
        }
    };

    const services = [
        { icon: "🏠", title: "ติดตั้งไวนิล", desc: "บริการติดตั้งไวนิลคุณภาพสูงสำหรับบ้านและอาคาร พร้อมทีมช่างมืออาชีพ" },
        { icon: "📐", title: "วัดหน้างาน", desc: "บริการวัดพื้นที่หน้างานฟรี พร้อมประเมินราคาอย่างละเอียด" },
        { icon: "🎨", title: "ออกแบบลาย", desc: "ให้คำปรึกษาและออกแบบลายไวนิลตามสไตล์ที่คุณต้องการ" },
        { icon: "🔧", title: "ซ่อมแซม", desc: "บริการซ่อมแซมและบำรุงรักษาไวนิลเก่าให้เหมือนใหม่" },
    ];

    const reviews = [
        { name: "คุณสมชาย ก.", rating: 5, comment: "ทีมงานมืออาชีพมาก ติดตั้งเสร็จไวและคุณภาพดี ประทับใจมากครับ", avatar: "https://i.pravatar.cc/100?img=11" },
        { name: "คุณมานี ด.", rating: 5, comment: "ราคาไม่แพง งานสวย ช่างใส่ใจรายละเอียดมาก แนะนำให้เพื่อนๆ ทุกคนเลยค่ะ", avatar: "https://i.pravatar.cc/100?img=5" },
        { name: "คุณวิชัย ส.", rating: 4, comment: "ติดต่อง่าย นัดหมายสะดวก มาตรงเวลา ผลงานเรียบร้อยสวยงามครับ", avatar: "https://i.pravatar.cc/100?img=12" },
    ];

    return (
        <div className="w-full pt-20">
            {/* Hero Section */}
            <section className="flex min-h-[calc(100vh-80px)] flex-col lg:flex-row items-stretch">
                <div className="flex-1 flex items-center justify-center p-8 lg:p-20 bg-slate-50 text-center lg:text-left order-2 lg:order-1">
                    <div className="max-w-[580px] w-full animate-fade-in">
                        <span className="inline-block text-blue-500 font-bold text-xs tracking-widest uppercase bg-blue-50 px-4 py-1.5 rounded-full mb-6">PREMIUM VINYL SERVICE</span>
                        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6 tracking-tight">
                            ยกระดับบ้านคุณด้วย <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-tr from-blue-500 to-blue-400">ทีมช่างมืออาชีพ</span>
                        </h1>
                        <p className="text-lg text-slate-500 mb-12 leading-relaxed max-w-lg mx-auto lg:mx-0">
                            ระบบจองคิวออนไลน์ที่ง่ายที่สุด เช็คสถานะได้ทันที พร้อมดูแลทุกรายละเอียดเรื่องงานไวนิล
                        </p>

                        <div className="mb-12">
                            <form onSubmit={handleSearch} className="flex bg-white p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-slate-100 max-w-[500px] mx-auto lg:mx-0 ring-offset-2 focus-within:ring-2 ring-blue-100">
                                <input
                                    type="text"
                                    placeholder="ใส่เบอร์โทรศัพท์เพื่อตรวจคิว..."
                                    value={searchPhone}
                                    onChange={(e) => setSearchPhone(e.target.value)}
                                    className="flex-1 border-none bg-transparent px-6 text-base text-slate-800 outline-none placeholder:text-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={isSearching}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-semibold text-sm transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
                                >
                                    {isSearching ? "..." : "ค้นหา"}
                                </button>
                            </form>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button
                                className="bg-slate-800 hover:bg-blue-600 text-white px-9 py-4 rounded-full font-semibold text-base transition-all shadow-md hover:-translate-y-0.5"
                                onClick={() => navigate("/booking")}
                            >
                                นัดหมายช่างตอนนี้
                            </button>
                            <button
                                className="bg-transparent border border-slate-200 text-slate-800 px-9 py-4 rounded-full font-semibold text-base transition-all hover:border-slate-800 hover:bg-slate-800 hover:text-white"
                                onClick={() => {
                                    const el = document.getElementById('services-section');
                                    el?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                ดูบริการของเรา
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 relative overflow-hidden lg:rounded-bl-[40px] order-1 lg:order-2 h-[300px] lg:h-auto mt-20 lg:mt-0">
                    <img src="./assets/image/Win.jpg" alt="Vinyl House" className="w-full h-full object-cover hover:scale-105 transition-transform duration-[10000ms]" />
                    <div className="absolute bottom-4 lg:bottom-16 left-1/2 lg:left-16 -translate-x-1/2 lg:translate-x-0 bg-white/90 backdrop-blur-sm px-10 py-6 rounded-2xl shadow-lg text-center animate-bounce-slow border border-white/50">
                        <h3 className="text-4xl font-bold text-blue-500 leading-none">10+</h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">Years Experience</p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about-section" className="py-20 px-6 lg:px-20 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block text-blue-500 font-bold text-xs tracking-widest uppercase bg-blue-50 px-4 py-1.5 rounded-full mb-4">ABOUT US</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">เกี่ยวกับเรา</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            เราคือทีมช่างมืออาชีพที่มีประสบการณ์มากกว่า 10 ปี ในการติดตั้งไวนิลและตกแต่งบ้าน ด้วยความใส่ใจในทุกรายละเอียดและคุณภาพงานที่เหนือระดับ
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🎯</div>
                            <h3 className="font-bold text-slate-800 text-xl mb-2">พันธกิจ</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">มอบบริการที่มีคุณภาพสูงสุดแก่ลูกค้าทุกท่าน ด้วยราคาที่เป็นธรรมและความใส่ใจในทุกขั้นตอน</p>
                        </div>
                        <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✨</div>
                            <h3 className="font-bold text-slate-800 text-xl mb-2">ค่านิยม</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">ซื่อสัตย์ ตรงเวลา มุ่งมั่นสร้างสรรค์ผลงานที่ดี และสร้างความพึงพอใจสูงสุด</p>
                        </div>
                        <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🏆</div>
                            <h3 className="font-bold text-slate-800 text-xl mb-2">ความสำเร็จ</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">ดูแลลูกค้ามากกว่า 500+ หลังคาเรือน ด้วยอัตราความพึงพอใจ 98%</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services-section" className="py-20 px-6 lg:px-20 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block text-blue-500 font-bold text-xs tracking-widest uppercase bg-blue-50 px-4 py-1.5 rounded-full mb-4">OUR SERVICES</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">บริการของเรา</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">
                            เรามีบริการครบวงจรเพื่อตอบโจทย์ทุกความต้องการของคุณ
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((service, index) => (
                            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>
                                <h3 className="font-bold text-slate-800 text-lg mb-2">{service.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section id="reviews-section" className="py-20 px-6 lg:px-20 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block text-blue-500 font-bold text-xs tracking-widest uppercase bg-blue-50 px-4 py-1.5 rounded-full mb-4">CUSTOMER REVIEWS</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">ลูกค้าพูดถึงเรา</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">
                            เสียงตอบรับจากลูกค้าของเราที่ไว้วางใจใช้บริการ
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {reviews.map((review, index) => (
                            <div key={index} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-4 mb-4">
                                    <img src={review.avatar} alt={review.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                                    <div>
                                        <h4 className="font-bold text-slate-800">{review.name}</h4>
                                        <div className="text-yellow-400 text-sm">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                                    </div>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed italic">"{review.comment}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact-section" className="py-20 px-6 lg:px-20 bg-slate-800 text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block text-blue-400 font-bold text-xs tracking-widest uppercase bg-blue-900/50 px-4 py-1.5 rounded-full mb-4">CONTACT US</span>
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4">ติดต่อเรา</h2>
                            <p className="text-slate-400 leading-relaxed mb-8">
                                พร้อมให้บริการและตอบทุกคำถาม สามารถติดต่อเราได้ทุกช่องทาง หรือนัดหมายออนไลน์ได้ตลอด 24 ชั่วโมง
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-xl">📞</div>
                                    <div>
                                        <p className="text-sm text-slate-400">โทรศัพท์</p>
                                        <p className="font-semibold">088-888-8888</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-xl">📧</div>
                                    <div>
                                        <p className="text-sm text-slate-400">อีเมล</p>
                                        <p className="font-semibold">contact@vinylservice.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-xl">📍</div>
                                    <div>
                                        <p className="text-sm text-slate-400">ที่อยู่</p>
                                        <p className="font-semibold">123 ถ.สุขุมวิท กรุงเทพฯ 10110</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-700/50 p-8 rounded-2xl border border-slate-600">
                            <h3 className="font-bold text-xl mb-6">ส่งข้อความถึงเรา</h3>
                            <form className="space-y-4">
                                <input type="text" placeholder="ชื่อ-นามสกุล" className="w-full bg-slate-600/50 border border-slate-500 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500" />
                                <input type="email" placeholder="อีเมล" className="w-full bg-slate-600/50 border border-slate-500 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500" />
                                <textarea placeholder="ข้อความ" rows="4" className="w-full bg-slate-600/50 border border-slate-500 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                                <button type="button" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors">
                                    ส่งข้อความ
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 lg:px-20 bg-slate-900 text-slate-400 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} Vinyl Service. All rights reserved.</p>
            </footer>

            {/* Modal สำหรับผลการค้นหา */}
            {searchResult && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[2000] animate-in fade-in" onClick={() => setSearchResult(null)}>
                    <div className="bg-white w-[90%] max-w-[550px] rounded-3xl p-8 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">คิวการจองของคุณ</h2>
                                <p className="text-sm text-slate-500 mt-1">รายการจองสำหรับเบอร์: {searchPhone}</p>
                            </div>
                            <button onClick={() => setSearchResult(null)} className="text-2xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors">✕</button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto pr-2">
                            {searchResult.length > 0 ? searchResult.map(res => (
                                <div key={res._id} className="bg-slate-50 rounded-2xl p-6 mb-4 border border-slate-100/50">
                                    <div className="mb-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <strong className="block text-lg text-blue-600 font-semibold">{res.service_type}</strong>
                                                <div className="text-sm text-slate-500 mt-1">ID: #{res._id}</div>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide
                        ${res.status === 'เสร็จสิ้น' ? 'bg-green-100 text-green-700' :
                                                    res.status === 'ยืนยันแล้ว' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {res.status || 'รอรับคิว'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200/60 text-sm text-slate-700 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span>📅</span> <span><strong>วันที่นัด:</strong> {new Date(res.booking_date).toLocaleDateString('th-TH')}</span>
                                            <span className="ml-2">⏰ <strong>เวลา:</strong> {res.booking_time} น.</span>
                                        </div>

                                        <div className="leading-relaxed">
                                            <span className="mr-2">📍</span> <strong>ที่อยู่ติดตั้ง:</strong> {res.address_detail}
                                            {res.sub_district && ` ต.${res.sub_district}`}
                                            {res.district && ` อ.${res.district}`}
                                            {res.province && ` จ.${res.province}`}
                                            {res.postcode && ` ${res.postcode}`}
                                        </div>

                                        {res.notes && (
                                            <div className="mt-3 bg-amber-50 text-amber-700 p-3 rounded-lg text-sm border border-amber-100">
                                                <span className="mr-1">📝</span> <strong>หมายเหตุ:</strong> {res.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : <p className="text-center py-10 text-slate-400">ไม่พบข้อมูลการจอง</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
