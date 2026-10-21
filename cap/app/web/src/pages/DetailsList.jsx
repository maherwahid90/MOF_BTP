import { Link, useNavigate } from 'react-router-dom'
import { api, DETAILS } from '../api.js'
import { useI18n } from '../i18n.jsx'
import { useUser } from '../user.jsx'
import { Messages, useLoad } from '../components/ui.jsx'

export default function DetailsList() {
  const { t, lang } = useI18n()
  const { canEdit } = useUser()
  const navigate = useNavigate()
  const [rows, error] = useLoad(() => api.list(
    `${DETAILS}/SrcDetails?$expand=objectType&$orderby=objectType_code,objectId,begda`
  ), [])

  return (
    <section>
      <div className="page-head">
        <h1>{t('detailsTitle')}</h1>
        {canEdit && <Link className="button primary" to="/details/new">+ {t('newDetails')}</Link>}
      </div>
      <Messages error={error} />
      {!rows && !error && <p className="muted">{t('loading')}</p>}
      {rows && (
        <div className="table-wrap">
          <table className="grid">
            <thead>
              <tr>
                <th>{t('objectType')}</th>
                <th>{t('objectId')}</th>
                <th>{t('shortText')}</th>
                <th>{t('begda')}</th>
                <th>{t('endda')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={5} className="empty">{t('noData')}</td></tr>}
              {rows.map(r => (
                <tr key={r.ID} className="clickable" onClick={() => navigate(`/details/${r.ID}`)}>
                  <td>{r.objectType_code} - {lang === 'ar' ? r.objectType?.nameAr : r.objectType?.nameEn}</td>
                  <td className="code">{r.objectId}</td>
                  <td>{r.shortText}</td>
                  <td>{r.begda}</td>
                  <td>{r.endda}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
