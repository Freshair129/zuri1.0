import ClientInit from './_client-init'

export default function DashboardHome() {
  return (
    <div>
      <ClientInit />
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {/* TODO: StatCards, RevenueChart, RecentActivity */}
    </div>
  )
}
