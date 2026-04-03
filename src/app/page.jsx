export default function LandingPage() {
  return (
    <div className="bg-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* ── Top Nav ── */}
      <nav className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-white/80 backdrop-blur-xl z-50 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center text-white font-bold">Z</div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-headline">Zuri</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a className="text-amber-700 font-bold font-label text-xs uppercase tracking-wider" href="#">Features</a>
            <a className="text-slate-600 font-label text-xs uppercase tracking-wider hover:text-amber-700 transition-colors" href="#">Pricing</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a className="text-slate-600 font-label text-xs uppercase tracking-wider hover:bg-slate-50 px-4 py-2 rounded-lg transition-all" href="/login">Login</a>
          <button className="gold-gradient text-white px-6 py-2 rounded-md font-label font-bold text-xs uppercase shadow-lg active:scale-95 transition-all">เริ่มใช้ฟรี</button>
        </div>
      </nav>

      <main className="pt-32 pb-20 overflow-x-hidden">
        {/* ── Hero Section ── */}
        <section className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-3/5 space-y-8">
              <div className="ornate-lead">
                <span className="font-label text-primary font-bold uppercase tracking-[0.2em] text-xs">Modern Sovereign AI</span>
                <h1 className="text-5xl md:text-7xl font-bold font-headline mt-4 leading-tight tracking-tight text-on-surface">
                  มีซูริ <br /><span className="text-primary-container">ไม่ต้องเป็นห่วง</span>
                </h1>
              </div>
              <p className="text-xl text-secondary font-body thai-line-height max-w-xl">
                ระบบจัดการร้านครบวงจรที่ถูกออกแบบมาเพื่อความเงียบสงบของคุณ ด้วยเทคโนโลยี AI ที่ช่วยดูแลงานหลังบ้านให้เป็นเรื่องง่ายในทุกขั้นตอน
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="gold-gradient text-white px-8 py-4 rounded-md font-label font-bold text-sm uppercase shadow-xl hover:scale-105 active:scale-95 transition-all">
                  เริ่มใช้ฟรี
                </button>
                <button className="border border-secondary/20 text-secondary px-8 py-4 rounded-md font-label font-bold text-sm uppercase hover:bg-surface-container-low transition-all">
                  ดูฟีเจอร์ทั้งหมด
                </button>
              </div>
            </div>
            <div className="w-full lg:w-2/5 relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(86,94,113,0.2)] bg-surface-container-lowest p-2">
                <img
                  alt="Zuri Platform Dashboard"
                  className="rounded-xl w-full h-auto"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVK8ICMrGr5tAzKEE_RY0haggK-sg_PaB4SXysoKf2wlsjQfGuD6ZoR8NbHXRjkmmsl5ifkmJRbjphJ3GewAFwBbZ1zG8hyk818C3gqTqX3UMu-YQ--6eBYJi5y-NeXiWIK0_4SPdfQGKK7quD8d8HGP-ASCvwrCZsNmWn3VAxTbhuVrOKEpz2v0OoaOc9SyKQ34BBNPY6rztR6a2vUQ4-G8Tx1ITkEsv7LvuG6s8QUslPmZOB6W8H8twIJBeNTZ52Ot_B1nmIzas"
                />
              </div>
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary/5 rounded-full blur-3xl -z-0" />
            </div>
          </div>
        </section>

        {/* ── Social Proof Bar ── */}
        <section className="mt-24 border-y border-outline-variant/10 bg-surface-container-low py-10">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <p className="font-body text-secondary italic">
                <span className="font-bold text-on-surface not-italic">V School</span> ใช้ Zuri จัดการนักเรียน <span className="text-primary font-bold">500+</span> คน อย่างมีประสิทธิภาพ
              </p>
            </div>
            <div className="h-px w-12 bg-outline-variant/30 hidden md:block" />
            <div className="flex gap-8 opacity-40 grayscale">
              <span className="font-headline font-extrabold text-xl">ACADEMY</span>
              <span className="font-headline font-extrabold text-xl">LMS+</span>
              <span className="font-headline font-extrabold text-xl">TECH HUB</span>
            </div>
          </div>
        </section>

        {/* ── Features Bento Grid ── */}
        <section className="container mx-auto px-6 py-32">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold font-headline mb-4">นวัตกรรมเพื่อการจัดการที่เหนือกว่า</h2>
            <p className="text-secondary font-body">ยกระดับธุรกิจของคุณด้วยฟีเจอร์ที่เราตั้งใจออกแบบมาเพื่อคนไทย</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dashboard Card — large */}
            <div className="md:col-span-2 bg-white rounded-2xl p-10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[400px]">
              <div>
                <span className="material-symbols-outlined text-primary text-4xl mb-6">analytics</span>
                <h3 className="text-2xl font-bold font-headline mb-4">Dashboard อัจฉริยะ</h3>
                <p className="text-secondary font-body thai-line-height max-w-md">สรุปยอดขายและวิเคราะห์แนวโน้มธุรกิจแบบ Real-time ให้คุณตัดสินใจได้อย่างแม่นยำ ไม่พลาดทุกโอกาสสำคัญ</p>
              </div>
              <div className="mt-8 rounded-xl overflow-hidden border border-outline-variant/10">
                <img
                  alt="Analytics charts"
                  className="w-full h-48 object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJWJkTX-18CsvAsWsRq_2wuGqNO7qR3cqmD-zeQiBEZi0Afp2QkfuWBwyulknKMiyaejRdGxjTMe8H47qPntqXKWHcvspiMMSYdLg8xErENl6BLWh8Buob5veMNYE53QmNNAjAmIlBSBy0vPFz7ju2S16lZ0cgvoCtIySfgscqUBIT-C-UmITLNPKSozOAg1YgvA5aYrk1A_7Xmh_fWaYke8hhXvq-_pp_iLJ8jnVSV3iLA5a0Yyk9wEOX1kGnHRbQpY99tsCRd8"
                />
              </div>
            </div>

            {/* CRM Card */}
            <div className="bg-surface-container-low rounded-2xl p-10 flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-primary text-4xl mb-6">group</span>
                <h3 className="text-xl font-bold font-headline mb-4">CRM &amp; Members</h3>
                <p className="text-secondary font-body text-sm thai-line-height">เก็บข้อมูลลูกค้าอย่างเป็นระบบ พร้อมฟีเจอร์สะสมแต้มและโปรโมชั่นเฉพาะบุคคล</p>
              </div>
              <div className="pt-8">
                <div className="flex -space-x-4">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-300" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-400" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-fixed flex items-center justify-center text-[10px] font-bold">+500</div>
                </div>
              </div>
            </div>

            {/* Inventory Card */}
            <div className="bg-surface-container-high rounded-2xl p-10 flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-primary text-4xl mb-6">inventory_2</span>
                <h3 className="text-xl font-bold font-headline mb-4">Inventory AI</h3>
                <p className="text-secondary font-body text-sm thai-line-height">ระบบจัดการสต็อกสินค้าอัตโนมัติ แจ้งเตือนทันทีเมื่อสินค้าใกล้หมด</p>
              </div>
              <div className="mt-4 py-2 px-4 bg-white/50 rounded-lg inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                <span className="text-xs font-label uppercase font-bold text-on-surface">Low Stock Alert</span>
              </div>
            </div>

            {/* Security Card — wide */}
            <div className="md:col-span-2 bg-inverse-surface rounded-2xl p-10 text-white flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1">
                <span className="material-symbols-outlined text-primary-fixed-dim text-4xl mb-6">security</span>
                <h3 className="text-2xl font-bold font-headline mb-4">Sovereign Data Security</h3>
                <p className="text-slate-300 font-body thai-line-height">ความปลอดภัยระดับสากล ข้อมูลของคุณจะถูกเก็บรักษาอย่างดีที่สุดบน Sovereign Cloud ที่มีความเสถียรสูงสุด</p>
                <button className="mt-8 text-primary-fixed-dim font-label font-bold text-xs uppercase tracking-widest hover:underline">Learn more about security</button>
              </div>
              <div className="flex-1 w-full">
                <img
                  alt="Server room security"
                  className="rounded-xl opacity-80 hover:opacity-100 transition-opacity"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOp9G3UmCmUPfjS3qg5Dv7_Nw4yCM0TyaV1FXjxLKCJsPqz9Ac2X7GMFgSO9CGXL3VSfo9N5faIdfmUIvqrMZHGUc46kqVwly-y4J0P3upoz6ZOZW9Zh3oOJJBEDOsvaeQY9qiYBCcdBOjWmFsTz0pGd-bvz5VhnRVb9If-xgLeZsCyZUw3dO6G5UZPFj-txAjZiot6-XGZ_tJ-JgiWm47BtH5mhBuBWFxMRTNOSCT7w6Cpei7NSZasHz23krEw-B4brAUa4u5XmQ"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="container mx-auto px-6 py-20">
          <div className="gold-gradient rounded-[2rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold font-headline mb-6">พร้อมยกระดับร้านค้าของคุณหรือยัง?</h2>
              <p className="text-white/80 font-body text-lg mb-10 thai-line-height">เข้าร่วมกับธุรกิจกว่า 2,000 แห่งที่ไว้วางใจให้ Zuri ดูแลระบบหลังบ้าน</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="bg-white text-primary px-10 py-4 rounded-md font-label font-bold text-sm uppercase shadow-xl hover:bg-surface-container-low transition-all">
                  เริ่มใช้ฟรี 14 วัน
                </button>
                <button className="bg-black/10 border border-white/20 text-white px-10 py-4 rounded-md font-label font-bold text-sm uppercase hover:bg-black/20 transition-all">
                  ติดต่อฝ่ายขาย
                </button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -ml-32 -mb-32 blur-2xl" />
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/10 py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 gold-gradient rounded-md flex items-center justify-center text-white font-bold text-xs">Z</div>
                <span className="text-xl font-bold tracking-tight text-on-surface font-headline">Zuri</span>
              </div>
              <p className="text-secondary font-body text-sm thai-line-height">
                ผู้นำด้านระบบจัดการร้านค้าอัจฉริยะที่ผสมผสานศิลปะแห่งการบริการเข้ากับเทคโนโลยีสมัยใหม่
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h4 className="font-label font-bold text-xs uppercase text-on-surface tracking-widest">Product</h4>
                <ul className="space-y-2 text-sm text-secondary font-body">
                  <li><a className="hover:text-primary transition-colors" href="#">Features</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Integrations</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Pricing</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Changelog</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-label font-bold text-xs uppercase text-on-surface tracking-widest">Company</h4>
                <ul className="space-y-2 text-sm text-secondary font-body">
                  <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Legal</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-label font-bold text-xs uppercase text-on-surface tracking-widest">Support</h4>
                <ul className="space-y-2 text-sm text-secondary font-body">
                  <li><a className="hover:text-primary transition-colors" href="#">Help Center</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Documentation</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-secondary font-label">© 2024 Zuri Platform. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-secondary hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-lg">language</span></a>
              <a className="text-secondary hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-lg">mail</span></a>
              <a className="text-secondary hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-lg">share</span></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
