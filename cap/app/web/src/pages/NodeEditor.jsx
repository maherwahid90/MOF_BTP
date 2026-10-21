import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, key, SRC } from '../api.js'
import { useI18n } from '../i18n.jsx'
import { useUser } from '../user.jsx'
import {
  cleanRows, EditableTable, errorTargets, Field, Input, Messages, Modal, StatusBadge, useLoad
} from '../components/ui.jsx'

const EDITABLE_FIELDS = [
  'parent_ID', 'code', 'name', 'type_code', 'description', 'gfsCode', 'naturalAccount', 'isRefundable',
  'method_code', 'nature_code', 'naturePct', 'ownerGovEntity_code', 'g2c', 'g2b', 'g2g',
  'startDate', 'endDate', 'price', 'discount', 'currency_code'
]

const toOptions = (list, label = r => `${r.code} - ${r.name}`) => (list ?? []).map(r => ({ value: r.code, label: label(r) }))

async function loadValueHelps() {
  const [types, methods, natures, payTypes, govEntities, currencies, nodes] = await Promise.all([
    api.list(`${SRC}/SrcTypes?$orderby=code`),
    api.list(`${SRC}/SrcMethods?$orderby=code`),
    api.list(`${SRC}/SrcNatures?$orderby=code`),
    api.list(`${SRC}/PaymentTypes?$orderby=code`),
    api.list(`${SRC}/GovEntities?$orderby=code`),
    api.list(`${SRC}/Currencies?$select=code,name&$orderby=code`),
    api.list(`${SRC}/SrcNodes?$select=ID,code,name,parent_ID&$orderby=code`)
  ])
  return { types, methods, natures, payTypes, govEntities, currencies, nodes }
}

export default function NodeEditor() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isNew = !id
  const navigate = useNavigate()
  const { t, formatDateTime } = useI18n()
  const { canEdit, canApprove } = useUser()

  const [node, loadError, reload, setNode] = useLoad(async () => {
    if (isNew) {
      return { parent_ID: searchParams.get('parent'), currency_code: 'SAR', payMethods: [], govEntities: [] }
    }
    return api.get(`${SRC}/SrcNodes${key(id)}?$expand=payMethods,govEntities`)
  }, [id, searchParams.get('parent')])
  const [vh, vhError] = useLoad(loadValueHelps, [])

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [busy, setBusy] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  const inEdit = isNew || editing
  const data = inEdit ? (draft ?? node) : node
  const targets = errorTargets(error)
  const locked = node?.status === '02'

  // parents a node may be moved under: anything outside its own subtree
  const parentOptions = useMemo(() => {
    if (!vh) return []
    const blocked = new Set(id ? [id] : [])
    let grew = true
    while (grew) {
      grew = false
      for (const n of vh.nodes) {
        if (n.parent_ID && blocked.has(n.parent_ID) && !blocked.has(n.ID)) { blocked.add(n.ID); grew = true }
      }
    }
    return vh.nodes.filter(n => !blocked.has(n.ID)).map(n => ({ value: n.ID, label: `${n.code} - ${n.name}` }))
  }, [vh, id])

  if (loadError) return <Messages error={loadError} />
  if (!node || !vh) return vhError ? <Messages error={vhError} /> : <p className="muted">{t('loading')}</p>

  const set = (name, value) => setDraft(d => ({ ...(d ?? node), [name]: value }))

  const startEdit = () => { setDraft(structuredClone(node)); setEditing(true); setError(null); setSuccess(null) }
  const cancel = () => {
    if (isNew) return navigate(-1)
    setDraft(null); setEditing(false); setError(null)
  }

  const run = async (fn, message) => {
    setBusy(true); setError(null); setSuccess(null)
    try {
      await fn()
      if (message) setSuccess(message)
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  const save = () => run(async () => {
    const payload = Object.fromEntries(EDITABLE_FIELDS.map(f => [f, data[f] === '' ? null : data[f] ?? null]))
    payload.payMethods = cleanRows(data.payMethods ?? [], 'node_ID')
    payload.govEntities = cleanRows(data.govEntities ?? [], 'node_ID')
    if (isNew) {
      const created = await api.create(`${SRC}/SrcNodes`, payload)
      navigate(`/nodes/${created.ID}`, { replace: true })
    } else {
      await api.update(`${SRC}/SrcNodes${key(id)}`, payload)
      setEditing(false); setDraft(null)
      await reload()
    }
  }, t('saved'))

  const remove = () => {
    if (!window.confirm(t('confirmDelete'))) return
    run(async () => {
      await api.remove(`${SRC}/SrcNodes${key(id)}`)
      navigate('/nodes')
    })
  }

  const action = (name, message, body) => run(async () => {
    const updated = await api.action(`${SRC}/SrcNodes${key(id)}/SrcService.${name}`, body)
    setNode(n => ({ ...n, ...updated }))
  }, message)

  const confirmReject = async () => {
    await action('rejectNode', t('rejected'), { reason })
    setRejecting(false); setReason('')
  }

  const f = (name, type = 'text', extra = {}) => (
    <Field label={t(extra.label ?? name.replace(/_code$|_ID$/, ''))} invalid={targets.has(name)} wide={extra.wide}>
      <Input type={type} value={data[name]} editable={inEdit && !extra.readOnly} options={extra.options}
        maxLength={extra.maxLength} required={extra.required} invalid={targets.has(name)}
        onChange={v => set(name, v)} />
    </Field>
  )

  const totalPct = (data.govEntities ?? []).reduce((sum, g) => sum + Number(g.collectionPct ?? 0), 0)

  return (
    <section>
      <div className="page-head">
        <div>
          <Link to="/nodes" className="back">← {t('back')}</Link>
          <h1>
            {isNew ? t('newNode') : <><span className="code">{node.code}</span> {node.name}</>}
          </h1>
          {!isNew && (
            <div className="head-meta">
              <StatusBadge status={node.status} />
              <span className={`dot${node.isActive ? ' on' : ''}`} /> {node.isActive ? t('active') : t('inactive')}
              <span className="muted">· {t('level')} {node.level}</span>
            </div>
          )}
        </div>
        <div className="actions">
          {inEdit ? (
            <>
              <button className="primary" disabled={busy} onClick={save}>{isNew ? t('create') : t('save')}</button>
              <button className="secondary" disabled={busy} onClick={cancel}>{t('cancel')}</button>
            </>
          ) : (
            <>
              {canEdit && !locked && <button className="primary" onClick={startEdit}>{t('edit')}</button>}
              {canEdit && ['01', '04'].includes(node.status) && (
                <button className="accent" disabled={busy} onClick={() => action('submitForApproval', t('submitted'))}>
                  {t('submitForApproval')}
                </button>
              )}
              {canApprove && locked && (
                <>
                  <button className="success" disabled={busy} onClick={() => action('approve', t('approved'))}>{t('approve')}</button>
                  <button className="danger" disabled={busy} onClick={() => setRejecting(true)}>{t('reject')}</button>
                </>
              )}
              {canEdit && !locked && <button className="ghost danger" disabled={busy} onClick={remove}>{t('delete')}</button>}
            </>
          )}
        </div>
      </div>

      <Messages error={error} success={success} onClose={() => { setError(null); setSuccess(null) }} />
      {node.status === '04' && node.rejectionReason && !inEdit && (
        <div className="message warning"><strong>{t('rejectionReason')}:</strong> {node.rejectionReason}</div>
      )}

      <div className="card">
        <h2>{t('sectionGeneral')}</h2>
        <div className="form-grid">
          {f('code', 'text', { required: true, maxLength: 20 })}
          {f('name', 'text', { required: true, maxLength: 120 })}
          {f('type_code', 'select', { options: toOptions(vh.types), required: true })}
          {f('parent_ID', 'select', { options: parentOptions })}
          {f('description', 'textarea', { maxLength: 250, wide: true })}
          {f('gfsCode', 'text', { maxLength: 20 })}
          {f('naturalAccount', 'text', { maxLength: 20 })}
          {f('method_code', 'select', { options: toOptions(vh.methods) })}
          {f('nature_code', 'select', { options: toOptions(vh.natures) })}
          {f('naturePct', 'number')}
          {f('ownerGovEntity_code', 'select', { options: toOptions(vh.govEntities), label: 'ownerGovEntity' })}
          {f('isRefundable', 'checkbox')}
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h2>{t('sectionBeneficiaries')}</h2>
          <div className="form-grid single">
            {f('g2c', 'checkbox')}
            {f('g2b', 'checkbox')}
            {f('g2g', 'checkbox')}
          </div>
        </div>
        <div className="card">
          <h2>{t('sectionFinancial')}</h2>
          <div className="form-grid">
            {f('startDate', 'date')}
            {f('endDate', 'date')}
            {f('price', 'number')}
            {f('discount', 'number')}
            {f('currency_code', 'select', { options: toOptions(vh.currencies) })}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>{t('sectionPayMethods')}</h2>
        <EditableTable editable={inEdit} rows={data.payMethods ?? []} errorPrefix="payMethods" errors={targets}
          onChange={rows => set('payMethods', rows)}
          columns={[
            { name: 'payType_code', label: t('payType'), type: 'select', options: toOptions(vh.payTypes.filter(p => p.isActive || !inEdit)) },
            { name: 'payName', label: t('payName') },
            { name: 'beginDate', label: t('beginDate'), type: 'date' },
            { name: 'endDate', label: t('endDate'), type: 'date' }
          ]} />
      </div>

      <div className="card">
        <h2>{t('sectionGovEntities')}</h2>
        {targets.has('govEntities') && <p className="field-error">{error.details.find(d => d.target === 'govEntities')?.message}</p>}
        <EditableTable editable={inEdit} rows={data.govEntities ?? []} errorPrefix="govEntities" errors={targets}
          onChange={rows => set('govEntities', rows)}
          columns={[
            { name: 'govEntity_code', label: t('govEntity'), type: 'select', options: toOptions(vh.govEntities) },
            { name: 'collectionPct', label: t('collectionPct'), type: 'number' },
            { name: 'beginDate', label: t('beginDate'), type: 'date' },
            { name: 'endDate', label: t('endDate'), type: 'date' }
          ]}
          footer={(data.govEntities ?? []).length > 0 && (
            <tr className={totalPct > 100 ? 'over' : ''}>
              <td>{t('total')}</td><td>{totalPct.toFixed(2)}%</td><td colSpan={inEdit ? 3 : 2} />
            </tr>
          )} />
      </div>

      {!isNew && (
        <div className="card">
          <h2>{t('sectionWorkflow')}</h2>
          <dl className="meta">
            <dt>{t('submittedBy')}</dt><dd>{node.submittedBy ? <><bdi>{node.submittedBy}</bdi> · <bdi>{formatDateTime(node.submittedAt)}</bdi></> : t('none')}</dd>
            <dt>{t('decidedBy')}</dt><dd>{node.decidedBy ? <><bdi>{node.decidedBy}</bdi> · <bdi>{formatDateTime(node.decidedAt)}</bdi></> : t('none')}</dd>
          </dl>
        </div>
      )}

      {rejecting && (
        <Modal title={t('rejectTitle')} onClose={() => setRejecting(false)}
          actions={<>
            <button className="danger" disabled={busy || !reason.trim()} onClick={confirmReject}>{t('reject')}</button>
            <button className="secondary" onClick={() => setRejecting(false)}>{t('cancel')}</button>
          </>}>
          <Field label={t('rejectionReason')} wide>
            <textarea autoFocus rows={3} maxLength={255} value={reason} onChange={e => setReason(e.target.value)} />
          </Field>
        </Modal>
      )}
    </section>
  )
}
