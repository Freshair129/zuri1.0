'use client'

export default function RegisterPage() {
  return (
    <div className="font-body text-white selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover"
          alt="Exquisite Thai cuisine on dark slate background"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB96E7ajPvK6pMoMuY4eTM0-08JFT7sY5G7dfrMjiUd5vqneME8F-y99LDuqDmQJVzo1YorM8-E0CyXrxUs33zgOnUnkoBHKgGw0-lMLtnTtuB9wrE_Qs6g3IVS9eiLAzh0Fda9GOcWn1uGfyIhgr-CbMr5jCp9ABc0uqTTaDgzvj5VHz1-r1SH80Fq5s7XywlPGyBPGeHCEtuF-hsMrcCo7u9k8G1rRA-40omugVibvKvFCKbpPvzW6_AEh8Y0oougPafiyYTDhpI"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Thai pattern overlay */}
      <div className="absolute inset-0 thai-pattern-overlay pointer-events-none z-[1]" />

      <main className="w-full max-w-md px-6 z-10">
        {/* Register card */}
        <div className="glass-card p-10 md:p-12 rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] animate-entrance">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8 animate-entrance delay-1">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-[#d4a017] mb-2 drop-shadow-sm">Zuri</h1>
            <div className="h-0.5 w-16 gold-gradient rounded-full" />
            <div className="mt-4 flex flex-col items-center">
              <p className="font-label text-sm uppercase tracking-[0.25em] text-white/90">สมัครสมาชิก</p>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-white/50 mt-1">Create Account</p>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1 animate-entrance delay-2">
              <label className="block font-label text-[0.65rem] uppercase tracking-widest text-white/70 ml-1" htmlFor="name">
                ชื่อ-นามสกุล / Full Name
              </label>
              <div className="relative group">
                <input
                  className="w-full px-5 py-3 bg-white/10 border border-white/10 text-white focus:border-[#d4a017] focus:bg-white/15 focus:ring-0 transition-all duration-300 rounded-xl placeholder:text-white/30 font-body"
                  id="name"
                  placeholder="Zuri User"
                  type="text"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#d4a017] transition-colors">person</span>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1 animate-entrance delay-2">
              <label className="block font-label text-[0.65rem] uppercase tracking-widest text-white/70 ml-1" htmlFor="email">
                อีเมล / Email
              </label>
              <div className="relative group">
                <input
                  className="w-full px-5 py-3 bg-white/10 border border-white/10 text-white focus:border-[#d4a017] focus:bg-white/15 focus:ring-0 transition-all duration-300 rounded-xl placeholder:text-white/30 font-body"
                  id="email"
                  placeholder="example@zuri.com"
                  type="email"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#d4a017] transition-colors">mail</span>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1 animate-entrance delay-3">
              <label className="block font-label text-[0.65rem] uppercase tracking-widest text-white/70 ml-1" htmlFor="password">
                รหัสผ่าน / Password
              </label>
              <div className="relative group">
                <input
                  className="w-full px-5 py-3 bg-white/10 border border-white/10 text-white focus:border-[#d4a017] focus:bg-white/15 focus:ring-0 transition-all duration-300 rounded-xl placeholder:text-white/30 font-body"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#d4a017] transition-colors">lock</span>
              </div>
            </div>

            {/* Tenant Name */}
            <div className="space-y-1 animate-entrance delay-3">
              <label className="block font-label text-[0.65rem] uppercase tracking-widest text-white/70 ml-1" htmlFor="tenant">
                ชื่อร้านค้า / Store Name
              </label>
              <div className="relative group">
                <input
                  className="w-full px-5 py-3 bg-white/10 border border-white/10 text-white focus:border-[#d4a017] focus:bg-white/15 focus:ring-0 transition-all duration-300 rounded-xl placeholder:text-white/30 font-body"
                  id="tenant"
                  placeholder="My Restaurant"
                  type="text"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#d4a017] transition-colors">store</span>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 animate-entrance delay-4">
              <button
                className="w-full gold-gradient text-[#0B2D5E] font-label font-bold text-sm uppercase tracking-widest py-4 rounded-xl shadow-xl hover:shadow-[#d4a017]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500"
                type="submit"
              >
                สมัครใช้งาน / Register
              </button>
            </div>
          </form>

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center animate-entrance delay-5">
            <p className="font-label text-xs text-white/60 tracking-wide">
              มีบัญชีแล้ว? / Already have an account?{' '}
              <a className="text-[#d4a017] font-bold ml-2 hover:underline decoration-[#d4a017]" href="/login">เข้าสู่ระบบ</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
