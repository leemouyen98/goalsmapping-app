import SecurePDFViewerModal from './SecurePDFViewerModal'

export default function UnderwritingPDFViewerModal({ onClose }) {
  return (
    <SecurePDFViewerModal
      title="Underwriting Handbook"
      endpoint="/api/documents/underwriting"
      scrollMode
      onClose={onClose}
    />
  )
}
