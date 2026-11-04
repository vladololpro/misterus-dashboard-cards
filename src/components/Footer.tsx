import logo from '/misteRus.jpg'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <img src={logo} alt="Логотип" className="footer-logo" />
        <span className="footer-text">misteRus © 2026</span>
        <a
          href="https://steamcommunity.com/id/misteRus/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Мой Steam
        </a>
      </div>
    </footer>
  )
}

export default Footer