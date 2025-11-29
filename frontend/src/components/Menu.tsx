import { Link, useLocation } from 'react-router-dom';
import '../App.css';

export default function Menu() {
    const location = useLocation();

    return (
        <nav className="main-nav">
            <div className="nav-logo-container">
                <img src="/nightfall_logo.jpg" alt="Nightfall Systems" className="nav-logo-img" />
                <div className="nav-logo">Nightfall Systems</div>
            </div>
            <div className="nav-links">
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
                <Link to="/app" className={location.pathname === '/app' ? 'active' : ''}>Messages</Link>
                <Link to="/impressum" className={location.pathname === '/impressum' ? 'active' : ''}>Impressum</Link>
            </div>
        </nav>
    );
}
