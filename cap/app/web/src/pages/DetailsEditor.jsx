import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, DETAILS, key } from '../api.js'
import { useI18n } from '../i18n.jsx'
import { useUser } from '../user.jsx'
import { cleanRows, EditableTable, errorTargets, Field, Input, Messages, useLoad } from '../components/ui.jsx'

const LISTS = ['classifications', 'prices', 'discounts', 'relations']
const HEADER_FIELDS = ['objectType_code', 'objectId', 'begda', 'endda', 'shortText', 'longText']

export default function DetailsEditor() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const { t, lang } = useI18n()
  const { canEdit } = useUser()

  const [record, loadError, reload] = useLoad(() => (isNew
    ? Promise.resolve({ classifications: [], prices: [], discounts: [], relations: [] })
    : api.get(`${DETAILS}/SrcDetails${key(id)}?$expand=${LISTS.join(',')}`)), [id])
  const [vh] = useLoad(async () => {
    const [objectTypes, relationTypes, currencies] = await Promise.all([
      api.list(`${DETAILS}/ObjectTypes?$orderby=code`),
      api.list(`${DETAILS}/RelationTypes?$orderby=code`),
      api.list(`${DETAILS}/Currencies?$select=code&$orderby=code`)
    ])
    return { objectTypes, relationTypes, currencies }
  }, [])

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const [tab, setTab] = useState('classifications')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [busy, setBusy] = useState(false)

  if (loadError) return <Messages error={loadError} />
  if (!record || !vh) return <p className="muted">{t('loading')}</p>

  const inEdit = isNew || editing
  const data = inEdit ? (draft ?? record) : record
  const targets = errorTargets(error)
  const set = (name, value) => setDraft(d => ({ ...(d ?? record), [name]: value }))
  const name = r => (lang === 'ar' ? r.nameAr : r.nameEn)
  const objectTypeOptions = vh.objectTypes.map(o => ({ value: o.code, label: `${o.code} - ${name(o)}` }))
  const relationTypeOptions = vh.relationTypes.map(o => ({ value: o.code, label: `${o.code} - ${name(o)}` }))
  const currencyOptions = vh.currencies.map(c => ({ value: c.code, label: c.code }))

  const columns = {
    classifications: [
      { name: 'gfs', label: t('gfs') },
      { name: 'naturalAccount', label: t('naturalAccount') }
    ],
    prices: [
      { name: 'price', label: t('price'), type: 'number' },
      { name: 'currency_code', label: t('currency'), type: 'select', options: currencyOptions }
    ],
    discounts: [
      { name: 'discount', label: t('discount'), type: 'number' },
      { name: 'currency_code', label: t('currency'), type: 'select', options: currencyOptions }
    ],
    relations: [
      { name: 'fromType_code', label: t('fromType'), type: 'select', options: objectTypeOptions },
      { name: 'fromId', label: t('fromId') },
      { name: 'relationType_code', label: t('relationType'), type: 'select', options: relationTypeOptions },
      { name: 'relationId', label: t('relationId') },
      { name: 'toType_code', label: t('toType'), type: 'select', options: objectTypeOptions },
      { name: 'toId', label: t('toId') }
    ]
  }
  const dated = [{ name: 'begda', label: t('begda'), type: 'date' }, { name: 'endda', label: t('endda'), type: 'date' }]

  const save = async () => {
    setBusy(true); setError(null); setSuccess(null)
    try {
      const payload = Object.fromEntries(HEADER_FIELDS.map(f => [f, data[f] === '' ? null : data[f] ?? null]))
      for (const list of LISTS) payload[list] = cleanRows(data[list] ?? [], 'details_ID')
      if (isNew) {
        const created = await api.create(`${DETAILS}/SrcDetails`, payload)
        navigate(`/details/${created.ID}`, { replace: true })
      } else {
        await api.update(`${DETAILS}/SrcDetails${key(id)}`, payload)
        setEditing(false); setDraft(null)
        await reload()
      }
      setSuccess(t('saved'))
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!window.confirm(t('confirmDelete'))) return
    try {
      await api.remove(`${DETAILS}/SrcDetails${key(id)}`)
      navigate('/details')
    } catch (e) {
      setError(e)
    }
  }

  const f = (field, type = 'text', extra = {}) => (
    <Field label={t(field.replace(/_code$/, ''))} invalid={targets.has(field)} wide={extra.wide}>
      <Input type={type} value={data[field]} editable={inEdit} options={extra.options} maxLength={extra.maxLength}
        invalid={targets.has(field)} onChange={v => set(field, v)} />
    </Field>
  )

  return (
    <section>
      <div className="page-head">
        <div>
          <Link to="/details" className="back">← {t('back')}</Link>
          <h1>{isNew ? t('newDetails') : <><span className="code">{record.objectType_code}-{record.objectId}</span> {record.shortText}</>}</h1>
        </div>
        <div className="actions">
          {inEdit ? (
            <>
              <button className="primary" disabled={busy} onClick={save}>{isNew ? t('create') : t('save')}</button>
              <button className="secondary" onClick={() => (isNew ? navigate(-1) : (setEditing(false), setDraft(null), setError(null)))}>
                {t('cancel')}
              </button>
            </>
          ) : canEdit && (
            <>
              <button className="primary" onClick={() => { setDraft(structuredClone(record)); setEditing(true); setSuccess(null) }}>{t('edit')}</button>
              <button className="ghost danger" onClick={remove}>{t('delete')}</button>
            </>
          )}
        </div>
      </div>

      <Messages error={error} success={success} onClose={() => { setError(null); setSuccess(null) }} />

      <div className="card">
        <div className="form-grid">
          {f('objectType_code', 'select', { options: objectTypeOptions })}
          {f('objectId', 'text', { maxLength: 10 })}
          {f('begda', 'date')}
          {f('endda', 'date')}
          {f('shortText', 'text', { maxLength: 100, wide: true })}
          {f('longText', 'textarea', { maxLength: 200, wide: true })}
        </div>
      </div>

      <div className="card">
        <div className="tabs" role="tablist">
          {LISTS.map(list => (
            <button key={list} role="tab" aria-selected={tab === list} className={tab === list ? 'tab active' : 'tab'}
              onClick={() => setTab(list)}>
              {t(list)} <span className="count">{(data[list] ?? []).length}</span>
            </button>
          ))}
        </div>
        <EditableTable key={tab} editable={inEdit} rows={data[tab] ?? []} errorPrefix={tab} errors={targets}
          onChange={rows => set(tab, rows)} columns={[...columns[tab], ...dated]} />
      </div>
    </section>
  )
}
