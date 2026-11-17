import PageShell from '../components/PageShell'
import { pick, useLang } from '../i18n'
import type { L10n } from '../i18n'
import { ui } from '../ui'

export default function ComingSoon({ title }: { title: Partial<L10n> }) {
  const { lang } = useLang()
  return (
    <PageShell title={title}>
      <div className="card coming-soon">
        <p className="coming-soon-title">{pick(ui.comingSoonTitle, lang)}</p>
        <p className="card-value">{pick(ui.comingSoonBody, lang)}</p>
      </div>
    </PageShell>
  )
}
