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
            <li>About</li>
            <li>Compliance</li>
            <li>Careers</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">Platform</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>Supplier Network</li>
            <li>Bulk Pricing</li>
            <li>Order Tracking</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>support@medflow.pk</li>
            <li>+92 300 123 4567</li>
            <li>Karachi, Pakistan</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        MedFlow © 2026. All rights reserved.
      </div>
    </footer>
  );
}
