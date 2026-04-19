import SecurePDFViewerModal from './SecurePDFViewerModal'

export default function RecruitmentPDFViewerModal({ onClose }) {
  return (
    <SecurePDFViewerModal
      title="TM Recruitment Deck"
      endpoint="/api/documents/recruitment"
      onClose={onClose}
    />
  )
}
