'use client'

export default function LoginPage() {
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
        {/* Login card */}
        <div className="glass-card p-10 md:p-12 rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] animate-entrance">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10 animate-entrance delay-1">
            <h1 className="font-headline text-5xl font-extrabold tracking-tight text-[#d4a017] mb-2 drop-shadow-sm">Zuri</h1>
            <div className="h-0.5 w-16 gold-gradient rounded-full" />
            <div className="mt-6 flex flex-col items-center">
              <p className="font-label text-sm uppercase tracking-[0.25em] text-white/90">ยินดีต้อนรับ</p>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-white/50 mt-1">Welcome Back</p>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* Email / Phone */}
            <div className="space-y-2 animate-entrance delay-2">
              <div className="flex justify-between items-end ml-1">
                <label className="block font-label text-[0.65rem] uppercase tracking-widest text-white/70" htmlFor="identity">
                  อีเมลหรือเบอร์โทรศัพท์ / Email or Phone
                </label>
              </div>
              <div className="relative group">
                <input
                  className="w-full px-5 py-4 bg-white/10 border border-white/10 text-white focus:border-[#d4a017] focus:bg-white/15 focus:ring-0 transition-all duration-300 rounded-xl placeholder:text-white/30 font-body"
                  id="identity"
                  placeholder="example@zuri.com"
                  type="text"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#d4a017] transition-colors">person</span>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 animate-entrance delay-3">
              <div className="flex justify-between items-center ml-1">
                <label className="block font-label text-[0.65rem] uppercase tracking-widest text-white/70" htmlFor="password">
                  รหัสผ่าน / Password
                </label>
                <a className="font-label text-[0.65rem] uppercase tracking-widest text-[#d4a017] hover:text-white transition-colors" href="#">ลืมรหัสผ่าน?</a>
              </div>
              <div className="relative group">
                <input
                  className="w-full px-5 py-4 bg-white/10 border border-white/10 text-white focus:border-[#d4a017] focus:bg-white/15 focus:ring-0 transition-all duration-300 rounded-xl placeholder:text-white/30 font-body"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#d4a017] transition-colors">lock</span>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 animate-entrance delay-4">
              <button
                className="w-full gold-gradient text-[#0B2D5E] font-label font-bold text-sm uppercase tracking-widest py-5 rounded-xl shadow-xl hover:shadow-[#d4a017]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500"
                type="submit"
              >
                เข้าสู่ระบบ / Login
              </button>
            </div>
          </form>

          {/* Social login */}
          <div className="mt-10 flex flex-col items-center space-y-6 animate-entrance delay-5">
            <div className="flex items-center w-full space-x-4">
              <div className="h-[1px] flex-1 bg-white/10" />
              <span className="font-label text-[0.6rem] uppercase tracking-widest text-white/30">หรือเชื่อมต่อผ่าน / or connect via</span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            <div className="flex space-x-6">
              <button className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#d4a017]/50 transition-all group">
                <img
                  alt="Google"
                  className="w-6 h-6 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFQQjsEX4l_kpVP1KNDqwwSdrJsqDKpkkluwuHDDtAQQEuhQojOV2dx15YbLLH636qpsFKsbky-3hTpSHF-RD1CWZSdz9ugBVc5HUJhPpyfeMgYcMeCvra-mhkICwz9BkhZB8QIOM-ZRn6vPXri44Emwg9Ze0JuEpygiFGVZD5Fv34fOzGSvQ62XkkqCdC9wC-EEo9LFr6KGij9vlqVouLxZE68ccC8OHLc1p2t7tClCvQj7hpOi9048Ga1K2Dp8tw6I4ub0sUMeA"
                />
              </button>
              <button className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#d4a017]/50 transition-all group">
                <span className="material-symbols-outlined text-white/50 group-hover:text-white transition-colors text-2xl">apple</span>
              </button>
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-10 pt-8 border-t border-white/10 text-center animate-entrance delay-5">
            <p className="font-label text-xs text-white/60 tracking-wide">
              ยังไม่มีบัญชี? / Don&apos;t have an account?{' '}
              <a className="text-[#d4a017] font-bold ml-2 hover:underline decoration-[#d4a017]" href="#">สมัครสมาชิก</a>
            </p>
          </div>
        </div>

        {/* Bottom branding */}
        <p className="mt-10 text-center font-label text-[0.65rem] uppercase tracking-[0.4em] text-white/40 animate-entrance delay-5">
          © 2024 Zuri Heritage. All rights reserved.
        </p>
      </main>

      {/* Side heritage motif */}
      <div className="hidden xl:block absolute left-12 bottom-12 max-w-[240px] z-10 animate-entrance delay-3">
        <div className="flex flex-col space-y-4">
          <div className="w-16 h-1 gold-gradient" />
          <p className="font-headline text-xl font-light text-white leading-relaxed">
            Experience the <br /> art of <span className="text-[#d4a017] font-bold">Royal Thai</span> <br /> culinary excellence.
          </p>
        </div>
      </div>
    </div>
  )
}
