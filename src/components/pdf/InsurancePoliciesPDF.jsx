import {
  Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink,
} from '@react-pdf/renderer'
import { formatRMFull } from '../../lib/calculations'

const getLogo = () => `${window.location.origin}/assets/sora-logo.png`

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  navy:   '#060F1E',
  blue:   '#2E96FF',
  green:  '#34C759',
  orange: '#FF9500',
  red:    '#FF3B30',
  gray1:  '#1C1C1E',
  gray2:  '#636366',
  gray3:  '#AEAEB2',
  gray5:  '#E5E5EA',
  gray6:  '#F5F5F7',
  white:  '#FFFFFF',
}

function fmtRM(val) {
  if (!val && val !== 0) return 'RM 0'
  return formatRMFull(val)
}

function fmtDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return d }
}

const STATUS_COLOR = {
  Active: C.green,
  Lapsed: C.red,
  Matured: C.blue,
  Surrendered: C.orange,
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { padding: 36, fontFamily: 'Helvetica', fontSize: 8, color: C.gray1, backgroundColor: C.white },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logo: { width: 70, height: 22, objectFit: 'contain' },
  headerRight: { alignItems: 'flex-end' },
  title: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.navy, letterSpacing: -0.3 },
  subtitle: { fontSize: 8, color: C.gray2, marginTop: 2 },
  // Client strip
  clientStrip: { flexDirection: 'row', backgroundColor: C.navy, borderRadius: 6, padding: 10, marginBottom: 16, gap: 20 },
  clientLabel: { fontSize: 6.5, color: C.gray3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  clientValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.white },
  // Summary cards
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: C.gray6, borderRadius: 5, padding: 8, alignItems: 'center' },
  summaryLabel: { fontSize: 6.5, color: C.gray2, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  summaryValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.gray1 },
  // Table
  tableHeader: { flexDirection: 'row', backgroundColor: C.navy, borderRadius: 4, paddingVertical: 5, paddingHorizontal: 6, marginBottom: 4 },
  tableHeaderText: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.white, textTransform: 'uppercase', letterSpacing: 0.4 },
  tableRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: C.gray5 },
  tableRowAlt: { backgroundColor: C.gray6 },
  tableCell: { fontSize: 7.5, color: C.gray1 },
  tableCellBold: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.gray1 },
  // Coverage section
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.navy, marginTop: 16, marginBottom: 8 },
  coverageRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: C.gray5 },
  // Status badge
  statusBadge: { paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 8, alignSelf: 'flex-start' },
  statusText: { fontSize: 6.5, fontFamily: 'Helvetica-Bold' },
  // Footer
  footer: { position: 'absolute', bottom: 20, left: 36, right: 36 },
  footerLine: { height: 0.5, backgroundColor: C.gray5, marginBottom: 6 },
  footerText: { fontSize: 6, color: C.gray3, textAlign: 'center' },
  pageNumber: { fontSize: 6, color: C.gray3, textAlign: 'right', marginTop: 2 },
  // Notes
  notesText: { fontSize: 7, color: C.gray2, fontStyle: 'italic', marginTop: 2, paddingLeft: 6 },
})

// Column widths for the policy table
const COL = { no: '8%', company: '14%', plan: '18%', type: '12%', sum: '14%', premium: '14%', status: '10%', dates: '10%' }

// ─── Document ────────────────────────────────────────────────────────────────
function InsurancePoliciesDocument({ policies, contact, agentName }) {
  const activePolicies = policies.filter(p => p.status === 'Active')
  const totalAnnualPremium = policies.reduce((s, p) => s + (Number(p.annualPremium) || 0), 0)
  const totalSumAssured = policies.reduce((s, p) => s + (Number(p.sumAssured) || 0), 0)
  const totalDeath = policies.reduce((s, p) => s + (Number(p.coverageDetails?.death) || 0), 0)
  const totalTPD = policies.reduce((s, p) => s + (Number(p.coverageDetails?.tpd) || 0), 0)
  const totalCI = policies.reduce((s, p) => s + (Number(p.coverageDetails?.ci) || 0), 0)
  const totalMedical = policies.reduce((s, p) => s + (Number(p.coverageDetails?.medicalCard) || 0), 0)
  const totalPA = policies.reduce((s, p) => s + (Number(p.coverageDetails?.paDb) || 0), 0)

  const hasCoverage = totalDeath || totalTPD || totalCI || totalMedical || totalPA

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Image src={getLogo()} style={s.logo} />
          <View style={s.headerRight}>
            <Text style={s.title}>Insurance Portfolio</Text>
            <Text style={s.subtitle}>
              Prepared by {agentName || 'Adviser'} · {new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* ── Client Strip ── */}
        <View style={s.clientStrip}>
          <View>
            <Text style={s.clientLabel}>Client</Text>
            <Text style={s.clientValue}>{contact?.name || 'Client'}</Text>
          </View>
          <View>
            <Text style={s.clientLabel}>Total Policies</Text>
            <Text style={s.clientValue}>{policies.length}</Text>
          </View>
          <View>
            <Text style={s.clientLabel}>Active</Text>
            <Text style={s.clientValue}>{activePolicies.length}</Text>
          </View>
          <View>
            <Text style={s.clientLabel}>Annual Premium</Text>
            <Text style={s.clientValue}>{fmtRM(totalAnnualPremium)}</Text>
          </View>
          <View>
            <Text style={s.clientLabel}>Total Sum Assured</Text>
            <Text style={s.clientValue}>{fmtRM(totalSumAssured)}</Text>
          </View>
        </View>

        {/* ── Summary Cards ── */}
        <View style={s.summaryRow}>
          {[
            { label: 'Death', value: totalDeath },
            { label: 'TPD', value: totalTPD },
            { label: 'Critical Illness', value: totalCI },
            { label: 'Medical', value: totalMedical },
            { label: 'PA / DB', value: totalPA },
          ].map(c => (
            <View key={c.label} style={s.summaryCard}>
              <Text style={s.summaryLabel}>{c.label}</Text>
              <Text style={[s.summaryValue, c.value > 0 ? { color: C.blue } : { color: C.gray3 }]}>{fmtRM(c.value)}</Text>
            </View>
          ))}
        </View>

        {/* ── Policy Table ── */}
        <Text style={s.sectionTitle}>Policy Details</Text>

        {/* Header row */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, { width: COL.no }]}>No.</Text>
          <Text style={[s.tableHeaderText, { width: COL.company }]}>Company</Text>
          <Text style={[s.tableHeaderText, { width: COL.plan }]}>Plan Name</Text>
          <Text style={[s.tableHeaderText, { width: COL.type }]}>Type</Text>
          <Text style={[s.tableHeaderText, { width: COL.sum, textAlign: 'right' }]}>Sum Assured</Text>
          <Text style={[s.tableHeaderText, { width: COL.premium, textAlign: 'right' }]}>Annual Prem.</Text>
          <Text style={[s.tableHeaderText, { width: COL.status, textAlign: 'center' }]}>Status</Text>
          <Text style={[s.tableHeaderText, { width: COL.dates, textAlign: 'right' }]}>Start</Text>
        </View>

        {/* Data rows */}
        {policies.map((p, i) => (
          <View key={i} wrap={false}>
            <View style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={[s.tableCell, { width: COL.no }]}>{p.policyNo || `#${i + 1}`}</Text>
              <Text style={[s.tableCell, { width: COL.company }]}>{p.company || '—'}</Text>
              <Text style={[s.tableCellBold, { width: COL.plan }]}>{p.planName || '—'}</Text>
              <Text style={[s.tableCell, { width: COL.type }]}>{p.type || '—'}</Text>
              <Text style={[s.tableCell, { width: COL.sum, textAlign: 'right' }]}>{fmtRM(p.sumAssured)}</Text>
              <Text style={[s.tableCell, { width: COL.premium, textAlign: 'right' }]}>{fmtRM(p.annualPremium)}</Text>
              <View style={{ width: COL.status, alignItems: 'center' }}>
                <View style={[s.statusBadge, { backgroundColor: (STATUS_COLOR[p.status] || C.gray3) + '22' }]}>
                  <Text style={[s.statusText, { color: STATUS_COLOR[p.status] || C.gray3 }]}>{p.status}</Text>
                </View>
              </View>
              <Text style={[s.tableCell, { width: COL.dates, textAlign: 'right' }]}>{fmtDate(p.commencementDate)}</Text>
            </View>
            {p.notes ? <Text style={s.notesText}>{p.notes}</Text> : null}
          </View>
        ))}

        {/* ── Coverage Breakdown Table ── */}
        {hasCoverage ? (
          <>
            <Text style={s.sectionTitle}>Coverage Breakdown by Policy</Text>

            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, { width: '26%' }]}>Policy</Text>
              <Text style={[s.tableHeaderText, { width: '15%', textAlign: 'right' }]}>Death</Text>
              <Text style={[s.tableHeaderText, { width: '15%', textAlign: 'right' }]}>TPD</Text>
              <Text style={[s.tableHeaderText, { width: '15%', textAlign: 'right' }]}>CI</Text>
              <Text style={[s.tableHeaderText, { width: '15%', textAlign: 'right' }]}>Medical</Text>
              <Text style={[s.tableHeaderText, { width: '14%', textAlign: 'right' }]}>PA / DB</Text>
            </View>

            {policies.map((p, i) => {
              const cd = p.coverageDetails || {}
              const hasAny = (cd.death || cd.tpd || cd.ci || cd.medicalCard || cd.paDb)
              if (!hasAny) return null
              return (
                <View key={i} style={[s.coverageRow, i % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
                  <Text style={[s.tableCellBold, { width: '26%' }]}>{p.planName || p.type || `Policy #${i + 1}`}</Text>
                  <Text style={[s.tableCell, { width: '15%', textAlign: 'right' }]}>{cd.death ? fmtRM(cd.death) : '—'}</Text>
                  <Text style={[s.tableCell, { width: '15%', textAlign: 'right' }]}>{cd.tpd ? fmtRM(cd.tpd) : '—'}</Text>
                  <Text style={[s.tableCell, { width: '15%', textAlign: 'right' }]}>{cd.ci ? fmtRM(cd.ci) : '—'}</Text>
                  <Text style={[s.tableCell, { width: '15%', textAlign: 'right' }]}>{cd.medicalCard ? fmtRM(cd.medicalCard) : '—'}</Text>
                  <Text style={[s.tableCell, { width: '14%', textAlign: 'right' }]}>{cd.paDb ? fmtRM(cd.paDb) : '—'}</Text>
                </View>
              )
            })}

            {/* Totals row */}
            <View style={[s.coverageRow, { backgroundColor: C.navy, borderRadius: 4, marginTop: 2 }]}>
              <Text style={[s.tableCellBold, { width: '26%', color: C.white }]}>TOTAL</Text>
              <Text style={[s.tableCellBold, { width: '15%', textAlign: 'right', color: C.white }]}>{fmtRM(totalDeath)}</Text>
              <Text style={[s.tableCellBold, { width: '15%', textAlign: 'right', color: C.white }]}>{fmtRM(totalTPD)}</Text>
              <Text style={[s.tableCellBold, { width: '15%', textAlign: 'right', color: C.white }]}>{fmtRM(totalCI)}</Text>
              <Text style={[s.tableCellBold, { width: '15%', textAlign: 'right', color: C.white }]}>{fmtRM(totalMedical)}</Text>
              <Text style={[s.tableCellBold, { width: '14%', textAlign: 'right', color: C.white }]}>{fmtRM(totalPA)}</Text>
            </View>
          </>
        ) : null}

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <View style={s.footerLine} />
          <Text style={s.footerText}>
            This document is prepared for {contact?.name || 'the client'} by {agentName || 'Adviser'} and is for reference only. Please verify all policy details with the respective insurance companies.
          </Text>
          <Text style={s.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}

// ─── Export Button ────────────────────────────────────────────────────────────
export function InsuranceExportButton({ policies, contact, agentName }) {
  const fileName = `Insurance_Portfolio_${(contact?.name || 'Client').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
  return (
    <PDFDownloadLink
      document={<InsurancePoliciesDocument policies={policies} contact={contact} agentName={agentName} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-hig-blue text-hig-blue hover:bg-hig-blue hover:text-white transition-colors disabled:opacity-50"
          disabled={loading}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {loading ? 'Generating...' : 'Export PDF'}
        </button>
      )}
    </PDFDownloadLink>
  )
}
