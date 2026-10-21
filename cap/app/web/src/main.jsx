import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { I18nProvider, useI18n } from './i18n.jsx'
import { UserProvider, useUser } from './user.jsx'
import { DEV_USERS } from './api.js'
import { Messages } from './components/ui.jsx'
import Hierarchy from './pages/Hierarchy.jsx'
import NodeEditor from './pages/NodeEditor.jsx'
import DetailsList from './pages/DetailsList.jsx'
import DetailsEditor from './pages/DetailsEditor.jsx'
import MasterData from './pages/MasterData.jsx'
import './styles.css'

function Shell() {
  const { t, lang, setLang } = useI18n()
  const { user, error, devUser, switchDevUser } = useUser()

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo" aria-hidden="true">SRC</span>
          <span>{t('appTitle')}</span>
        </div>
        <nav>
          <NavLink to="/nodes">{t('navHierarchy')}</NavLink>
          <NavLink to="/details">{t('navDetails')}</NavLink>
          <NavLink to="/admin">{t('navMasterData')}</NavLink>
        </nav>
        <div className="topbar-end">
          <button className="ghost" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
          {DEV_USERS.length > 0 ? (
            <label className="dev-user" title="Local mocked user">
              {t('user')}
              <select value={devUser} onChange={e => switchDevUser(e.target.value)}>
                {DEV_USERS.map(u => <option key={u}>{u}</option>)}
              </select>
            </label>
          ) : (
            <>
              {user && <span className="user-name">{user.id}</span>}
              <a className="ghost button" href="/do/logout">{t('logout')}</a>
            </>
          )}
        </div>
      </header>
      <main>
        {error && <Messages error={error} />}
        {user && (
          <Routes>
            <Route path="/" element={<Navigate to="/nodes" replace />} />
            <Route path="/nodes" element={<Hierarchy />} />
            <Route path="/nodes/new" element={<NodeEditor />} />
            <Route path="/nodes/:id" element={<NodeEditor />} />
            <Route path="/details" element={<DetailsList />} />
            <Route path="/details/new" element={<DetailsEditor />} />
            <Route path="/details/:id" element={<DetailsEditor />} />
            <Route path="/admin" element={<Navigate to="/admin/SrcTypes" replace />} />
            <Route path="/admin/:entity" element={<MasterData />} />
            <Route path="*" element={<Navigate to="/nodes" replace />} />
          </Routes>
        )}
        {!user && !error && <p className="muted">{t('loading')}</p>}
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <UserProvider>
          <Shell />
        </UserProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>
)
