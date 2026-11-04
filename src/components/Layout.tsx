import { Outlet, NavLink } from 'react-router-dom'
import Header from '@components/Header'
import Footer from '@components/Footer'
import { useBankData } from '../hooks/useBankData'

function Layout() {
  const { isFetching, refresh } = useBankData()

  return (
    <div className="app">
      <Header />
      
      <nav className="nav-menu">
        <div className="nav-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
            end
          >
            Мои карты
          </NavLink>
          <NavLink 
            to="/operations" 
            className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}
          >
            Все операции
          </NavLink>
        </div>
        
        <div className="nav-actions">
          {isFetching && (
            <span className="load-indicator" style={{ fontSize: '0.85rem', margin: 0 }}>
              <span className="load-spinner"></span> Обновление...
            </span>
          )}
          <button 
            className="load-btn load-btn--small" 
            onClick={refresh}
            disabled={isFetching}
          >
            Обновить данные
          </button>
        </div>
      </nav>

      <main className="main">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  )
}

export default Layout