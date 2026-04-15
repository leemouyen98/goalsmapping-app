import SectionCard from '../../ui/SectionCard'

export default function RecommendationsPanel({ insurancePlans }) {
  return (
    <>
      <SectionCard title="Existing insurance" subtitle="Current active plans used in the gap scan.">
        <div className="space-y-2">
          {insurancePlans.length ? insurancePlans.map((plan) => (
            <div key={plan.id} className="rounded-hig-sm border border-hig-gray-5 px-3 py-2">
              <div className="text-hig-footnote font-medium">{plan.name}</div>
              <div className="mt-0.5 text-hig-caption2 text-hig-text-secondary">
                {[plan.type, plan.insurer, plan.policyNo].filter(Boolean).join(' • ') || 'Policy details not fully captured'}
              </div>
            </div>
          )) : (
            <div className="rounded-hig-sm bg-hig-gray-6 px-3 py-2 text-hig-caption1 text-hig-text-secondary">
              No insurance plans captured yet.
            </div>
          )}
        </div>
      </SectionCard>
    </>
  )
}
