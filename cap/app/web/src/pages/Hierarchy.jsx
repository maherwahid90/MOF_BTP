import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, SRC } from '../api.js'
import { useI18n } from '../i18n.jsx'
import { useUser } from '../user.jsx'
import { Messages, StatusBadge, useLoad } from '../components/ui.jsx'

const STATUSES = ['01', '02', '03', '04']

function buildTree(nodes) {
  const byId = new Map(nodes.map(n => [n.ID, { ...n, children: [] }]))
  const roots = []
  for (const node of byId.values()) {
    const parent = node.parent_ID && byId.get(node.parent_ID)
    if (parent) parent.children.push(node)
    else roots.push(node)
  }
  const sort = list => {
    list.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
    list.forEach(n => sort(n.children))
  }
  sort(roots)
  return { roots, byId }
}

export default function Hierarchy() {
  const { t, formatAmount } = useI18n()
  const { canEdit } = useUser()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [collapsed, setCollapsed] = useState(() => new Set())

  const [nodes, error] = useLoad(() => api.list(
    `${SRC}/SrcNodes?$select=ID,parent_ID,code,name,level,status,isActive,price,currency_code` +
    `&$expand=type($select=name)&$orderby=code`
  ), [])

  const { roots, byId } = useMemo(() => buildTree(nodes ?? []), [nodes])

  // when filtering, show matching nodes plus their ancestors
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term && !status) return null
    const keep = new Set()
    for (const node of byId.values()) {
      const matchesTerm = !term || node.code.toLowerCase().includes(term) || node.name.toLowerCase().includes(term)
      if (matchesTerm && (!status || node.status === status)) {
        for (let n = node; n && !keep.has(n.ID); n = byId.get(n.parent_ID)) keep.add(n.ID)
      }
    }
    return keep
  }, [byId, search, status])

  const counts = useMemo(() => {
    const c = Object.fromEntries(STATUSES.map(s => [s, 0]))
    for (const n of nodes ?? []) c[n.status] = (c[n.status] ?? 0) + 1
    return c
  }, [nodes])

  const toggle = id => setCollapsed(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const rows = []
  const walk = list => {
    for (const node of list) {
      if (visible && !visible.has(node.ID)) continue
      rows.push(node)
      if (!collapsed.has(node.ID) || visible) walk(node.children)
    }
  }
  walk(roots)

  return (
    <section>
      <div className="page-head">
        <h1>{t('navHierarchy')}</h1>
        {canEdit && <Link className="button primary" to="/nodes/new">+ {t('newRoot')}</Link>}
      </div>

      <div className="stats">
        {STATUSES.map(s => (
          <button key={s} className={`stat${status === s ? ' selected' : ''}`} onClick={() => setStatus(status === s ? '' : s)}>
            <span className="stat-value">{counts[s]}</span>
            <StatusBadge status={s} />
          </button>
        ))}
      </div>

      <div className="toolbar">
        <input type="search" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} />
        <select value={status} onChange={e => setStatus(e.target.value)} aria-label={t('status')}>
          <option value="">{t('allStatuses')}</option>
          {STATUSES.map(s => <option key={s} value={s}>{t(`status${s}`)}</option>)}
        </select>
        <span className="spacer" />
        <button className="secondary" onClick={() => setCollapsed(new Set())}>{t('expandAll')}</button>
        <button className="secondary" onClick={() => setCollapsed(new Set([...byId.values()].filter(n => n.children.length).map(n => n.ID)))}>
          {t('collapseAll')}
        </button>
      </div>

      <Messages error={error} />
      {!nodes && !error && <p className="muted">{t('loading')}</p>}

      {nodes && (
        <div className="table-wrap">
          <table className="grid tree">
            <thead>
              <tr>
                <th>{t('code')}</th>
                <th>{t('name')}</th>
                <th>{t('type')}</th>
                <th className="num">{t('price')}</th>
                <th>{t('status')}</th>
                <th>{t('active')}</th>
                {canEdit && <th className="actions-col" />}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={7} className="empty">{t('noData')}</td></tr>}
              {rows.map(node => (
                <tr key={node.ID} className="clickable" onClick={() => navigate(`/nodes/${node.ID}`)}>
                  <td>
                    <span className="tree-cell" style={{ paddingInlineStart: `${(node.level - 1) * 1.5}rem` }}>
                      {node.children.length > 0 ? (
                        <button className="twisty" aria-expanded={!collapsed.has(node.ID)}
                          onClick={e => { e.stopPropagation(); toggle(node.ID) }}>
                          {collapsed.has(node.ID) && !visible ? '▸' : '▾'}
                        </button>
                      ) : <span className="twisty-space" />}
                      <span className="code">{node.code}</span>
                    </span>
                  </td>
                  <td>{node.name}</td>
                  <td>{node.type?.name}</td>
                  <td className="num">{formatAmount(node.price)} {node.price != null && node.currency_code}</td>
                  <td><StatusBadge status={node.status} /></td>
                  <td>{node.isActive ? <span className="dot on" title={t('active')} /> : <span className="dot" title={t('inactive')} />}</td>
                  {canEdit && (
                    <td className="actions-col">
                      <Link className="button small secondary" to={`/nodes/new?parent=${node.ID}`}
                        onClick={e => e.stopPropagation()} title={t('addChild')}>+</Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
