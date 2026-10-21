import { Fragment, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { ADMIN, api, key } from '../api.js'
import { useI18n } from '../i18n.jsx'
import { useUser } from '../user.jsx'
import { Input, Messages, useLoad } from '../components/ui.jsx'

const code = { name: 'code', label: 'mdCode', maxLength: 10 }
const name = { name: 'name', label: 'mdName', maxLength: 120 }
const isActive = { name: 'isActive', label: 'isActive', type: 'checkbox' }

const ENTITIES = {
  SrcTypes: [code, name],
  SrcMethods: [code, name],
  SrcNatures: [code, name],
  PaymentTypes: [code, name, isActive],
  GovEntities: [
    { ...code, maxLength: 20 }, name,
    { name: 'region', label: 'region', maxLength: 60 },
    { name: 'iban', label: 'iban', maxLength: 34 },
    isActive
  ],
  ObjectTypes: [code, { name: 'nameAr', label: 'nameAr' }, { name: 'nameEn', label: 'nameEn' }],
  RelationTypes: [code, { name: 'relation', label: 'relation', maxLength: 10 }, { name: 'nameAr', label: 'nameAr' }, { name: 'nameEn', label: 'nameEn' }]
}

export default function MasterData() {
  const { entity } = useParams()
  const { t } = useI18n()
  const { canAdmin } = useUser()
  const columns = ENTITIES[entity] ?? ENTITIES.SrcTypes
  const [rows, loadError, reload] = useLoad(() => api.list(`${ADMIN}/${entity}?$orderby=code`), [entity])

  const [editKey, setEditKey] = useState(null) // code of the row being edited, or '' for a new row
  const [draft, setDraft] = useState({})
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const startEdit = row => { setEditKey(row ? row.code : ''); setDraft(row ? { ...row } : { isActive: true }); setError(null); setSuccess(null) }
  const stop = () => { setEditKey(null); setDraft({}) }

  const save = async () => {
    setError(null)
    try {
      const payload = Object.fromEntries(columns.map(c => [c.name, draft[c.name] ?? null]))
      if (editKey === '') await api.create(`${ADMIN}/${entity}`, payload)
      else {
        delete payload.code
        await api.update(`${ADMIN}/${entity}${key(editKey)}`, payload)
      }
      stop()
      setSuccess(t('saved'))
      await reload()
    } catch (e) {
      setError(e)
    }
  }

  const remove = async row => {
    if (!window.confirm(t('confirmDelete'))) return
    setError(null); setSuccess(null)
    try {
      await api.remove(`${ADMIN}/${entity}${key(row.code)}`)
      setSuccess(t('deleted'))
      await reload()
    } catch (e) {
      setError(e)
    }
  }

  const editRow = isNewRow => (
    <tr className="editing">
      {columns.map(c => (
        <td key={c.name}>
          <Input type={c.type} value={draft[c.name]} maxLength={c.maxLength} editable={!(c.name === 'code' && !isNewRow)}
            onChange={v => setDraft(d => ({ ...d, [c.name]: v }))} />
        </td>
      ))}
      <td className="actions-col">
        <button className="primary small" onClick={save}>{t('save')}</button>
        <button className="secondary small" onClick={stop}>{t('cancel')}</button>
      </td>
    </tr>
  )

  return (
    <section className="with-sidebar">
      <aside className="sidebar">
        <h2>{t('navMasterData')}</h2>
        {Object.keys(ENTITIES).map(e => (
          <NavLink key={e} to={`/admin/${e}`} onClick={stop}>{t(`master${e}`)}</NavLink>
        ))}
      </aside>
      <div>
        <div className="page-head">
          <h1>{t(`master${entity}`)}</h1>
          {canAdmin && editKey === null && <button className="primary" onClick={() => startEdit(null)}>+ {t('add')}</button>}
        </div>
        {!canAdmin && <p className="muted">{t('readOnlyHint')}</p>}
        <Messages error={error ?? loadError} success={success} onClose={() => { setError(null); setSuccess(null) }} />
        {rows && (
          <div className="table-wrap">
            <table className="grid">
              <thead>
                <tr>
                  {columns.map(c => <th key={c.name}>{t(c.label)}</th>)}
                  {canAdmin && <th className="actions-col" />}
                </tr>
              </thead>
              <tbody>
                {editKey === '' && editRow(true)}
                {rows.length === 0 && editKey !== '' && <tr><td colSpan={columns.length + 1} className="empty">{t('noData')}</td></tr>}
                {rows.map(row => (row.code === editKey ? <Fragment key={row.code}>{editRow(false)}</Fragment> : (
                  <tr key={row.code}>
                    {columns.map(c => (
                      <td key={c.name} className={c.name === 'code' ? 'code' : undefined}>
                        <Input type={c.type} value={row[c.name]} editable={false} />
                      </td>
                    ))}
                    {canAdmin && (
                      <td className="actions-col">
                        <button className="secondary small" disabled={editKey !== null} onClick={() => startEdit(row)}>{t('edit')}</button>
                        <button className="ghost danger small" disabled={editKey !== null} onClick={() => remove(row)}>{t('delete')}</button>
                      </td>
                    )}
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
