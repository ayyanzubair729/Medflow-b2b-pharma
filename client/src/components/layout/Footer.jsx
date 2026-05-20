import logo from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-slate-900">
              <img src={logo} alt="MedFlow" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">MedFlow</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-300">
            Secure, verified pharmaceutical procurement for business customers across Pakistan.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li><a href="#about" className="hover:text-secondary transition">About</a></li>
            <li><a href="#certifications" className="hover:text-secondary transition">Privacy Policy</a></li>
            <li><a href="#careers" className="hover:text-secondary transition">Careers</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">Platform</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li><a href="#products" className="hover:text-secondary transition">Supplier Network</a></li>
            <li><a href="#products" className="hover:text-secondary transition">Bulk Pricing</a></li>
            <li><a href="#contact" className="hover:text-secondary transition">Order Tracking</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>support@medflow.pk</li>
            <li>+92 318 5411636</li>
            <li>Blue Area, Islamabad, Pakistan</li>
          </ul>
          <div className="mt-4 flex gap-3">
            <a href="https://www.linkedin.com/in/sohaib-usmani-564100238" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-300 hover:bg-secondary hover:text-white transition" aria-label="LinkedIn">in</a>
            <a href="https://www.facebook.com/share/18UHJknVh2/" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-300 hover:bg-secondary hover:text-white transition" aria-label="Facebook">fb</a>
            <a href="https://x.com/sohaib_135" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-300 hover:bg-secondary hover:text-white transition" aria-label="X">𝕏</a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        MedFlow © 2026. All rights reserved.
      </div>
    </footer>
  );
}
