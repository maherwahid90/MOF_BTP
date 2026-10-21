import { useCallback, useEffect, useState } from 'react'
import { useI18n } from '../i18n.jsx'

/** Loads data with `loader` whenever `deps` change; returns [data, error, reload, setData]. */
export function useLoad(loader, deps) {
  const [state, setState] = useState({ data: undefined, error: null })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps)
  const reload = useCallback(async () => {
    try {
      setState({ data: await run(), error: null })
    } catch (error) {
      setState(s => ({ ...s, error }))
    }
  }, [run])
  useEffect(() => { reload() }, [reload])
  const setData = useCallback(update => {
    setState(s => ({ ...s, data: typeof update === 'function' ? update(s.data) : update }))
  }, [])
  return [state.data, state.error, reload, setData]
}

export function StatusBadge({ status }) {
  const { t } = useI18n()
  if (!status) return null
  return <span className={`badge status-${status}`}>{t(`status${status}`)}</span>
}

export function Messages({ error, success, onClose }) {
  if (!error && !success) return null
  if (success) {
    return (
      <div className="message success" role="status">
        <span>{success}</span>
        {onClose && <button className="link" onClick={onClose} aria-label="close">×</button>}
      </div>
    )
  }
  const messages = error.messages ?? [{ message: error.message }]
  return (
    <div className="message error" role="alert">
      <ul>
        {messages.map((m, i) => <li key={i}>{m.message}</li>)}
      </ul>
      {onClose && <button className="link" onClick={onClose} aria-label="close">×</button>}
    </div>
  )
}

/** Error targets (e.g. "code", "payMethods[1]/endDate") reported by the server. */
export function errorTargets(error) {
  return new Set((error?.details ?? []).map(d => d.target).filter(Boolean))
}

export function Field({ label, children, invalid, wide }) {
  return (
    <label className={`field${invalid ? ' invalid' : ''}${wide ? ' wide' : ''}`}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}

/**
 * Input for one value. `type`: text | textarea | number | date | checkbox | select.
 * In display mode it renders the formatted value instead.
 */
export function Input({ type = 'text', value, onChange, editable, options = [], required, maxLength, invalid }) {
  const { t, formatAmount } = useI18n()
  if (!editable) {
    let shown = value
    if (type === 'checkbox') shown = value ? t('yes') : t('no')
    else if (type === 'select') shown = options.find(o => o.value === value)?.label ?? value
    else if (type === 'number') shown = formatAmount(value)
    return <span className="value">{shown === null || shown === undefined || shown === '' ? t('none') : shown}</span>
  }
  const common = { 'aria-invalid': invalid || undefined, required }
  switch (type) {
    case 'checkbox':
      return <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} {...common} />
    case 'select':
      return (
        <select value={value ?? ''} onChange={e => onChange(e.target.value || null)} {...common}>
          <option value="">{t('none')}</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
    case 'textarea':
      return <textarea value={value ?? ''} maxLength={maxLength} rows={3} onChange={e => onChange(e.target.value)} {...common} />
    case 'number':
      return (
        <input type="number" step="0.01" dir="ltr" value={value ?? ''}
          onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))} {...common} />
      )
    case 'date':
      return <input type="date" value={value ?? ''} onChange={e => onChange(e.target.value || null)} {...common} />
    default:
      return <input type="text" value={value ?? ''} maxLength={maxLength} onChange={e => onChange(e.target.value)} {...common} />
  }
}

let tempId = 0
export const newRowKey = () => `new-${++tempId}`

/**
 * Editable list of child records. `columns`: [{ name, label, type, options }].
 * Rows keep their server ID; new rows get a temporary `_key`. `errorPrefix` maps server targets
 * like "payMethods[0]/endDate" to cells.
 */
export function EditableTable({ columns, rows, onChange, editable, errorPrefix, errors, footer }) {
  const { t } = useI18n()
  const update = (index, name, value) => onChange(rows.map((r, i) => (i === index ? { ...r, [name]: value } : r)))
  const removeRow = index => onChange(rows.filter((_, i) => i !== index))
  const addRow = () => onChange([...rows, { _key: newRowKey() }])

  return (
    <div className="table-wrap">
      <table className="grid">
        <thead>
          <tr>
            {columns.map(c => <th key={c.name}>{c.label}</th>)}
            {editable && <th className="actions-col" />}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length + 1} className="empty">{t('noData')}</td></tr>
          )}
          {rows.map((row, i) => (
            <tr key={row.ID ?? row._key}>
              {columns.map(c => (
                <td key={c.name}>
                  <Input type={c.type} value={row[c.name]} options={c.options} editable={editable}
                    invalid={errors?.has(`${errorPrefix}[${i}]/${c.name}`)}
                    onChange={v => update(i, c.name, v)} />
                </td>
              ))}
              {editable && (
                <td className="actions-col">
                  <button className="icon danger" title={t('delete')} onClick={() => removeRow(i)}>×</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {footer && <tfoot>{footer}</tfoot>}
      </table>
      {editable && <button className="secondary small" onClick={addRow}>+ {t('add')}</button>}
    </div>
  )
}

export function Modal({ title, children, onClose, actions }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
        <div className="modal-actions">{actions}</div>
      </div>
    </div>
  )
}

/** Strips server-managed fields and temporary keys before a deep create / update. */
export function cleanRows(rows, parentKey) {
  return rows.map(row => {
    const copy = {}
    for (const [k, v] of Object.entries(row)) {
      if (['_key', 'createdAt', 'createdBy', 'modifiedAt', 'modifiedBy', parentKey].includes(k)) continue
      copy[k] = v === '' ? null : v
    }
    return copy
  })
}
