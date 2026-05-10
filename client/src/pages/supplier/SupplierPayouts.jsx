import Card from "../../components/ui/Card.jsx";

export default function SupplierPayouts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Payouts</h1>
        <p className="text-sm text-slate-400">Invoices, payment status, and tax documents.</p>
      </div>
      <Card className="p-8 text-center">
        <i className="ti ti-coin text-4xl text-slate-600" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-slate-300">Payouts coming in Phase 3</p>
        <p className="mt-1 text-xs text-slate-500">Invoice reconciliation, tax docs, and dispute handling will appear here.</p>
      </Card>
    </div>
  );
}