import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>404</h1>
      <p>Страница не найдена</p>
      <Link to="/" className="load-btn load-btn--small" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '20px' }}>
        Вернуться на главную
      </Link>
    </div>
  )
}

export default NotFoundPage