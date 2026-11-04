import avatar from '/ava-steam.jpg'

function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <img src={avatar} alt="Аватар" className="header-avatar" />
        <span className="header-title">
          <span className="header-title__brand">misteRus</span>
          <span className="header-title__dash">Dashboard</span>
          <span className="header-title__cards">Cards</span>
        </span>
      </div>
    </header>
  )
}

export default Header