import SecurePDFViewerModal from './SecurePDFViewerModal'

const LANG_OPTIONS = [
  { key: 'zh', label: '中',  endpoint: '/api/documents/plan?lang=zh', title: '5-in-1 完整保障计划' },
  { key: 'en', label: 'Eng', endpoint: '/api/documents/plan?lang=en', title: '5-in-1 Complete Protection' },
]

export default function PlanPDFViewerModal({ onClose }) {
  return (
    <SecurePDFViewerModal
      title="5-in-1 完整保障计划"
      endpoint="/api/documents/plan?lang=zh"
      langOptions={LANG_OPTIONS}
      onClose={onClose}
    />
  )
}
