import { useNavigate } from 'react-router-dom';
import '../App.css';

// Placeholder if image generation fails, or use the generated one
// import heroImage from '../../assets/blockchain_landing_hero.png';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <div className="hero-section">
                <div className="hero-content">
                    <div className="brand-header">
                        <h1 className="company-name">Nightfall Systems Ltd.</h1>
                    </div>
                    <h2 className="project-title">Decentralized Marketportal</h2>
                    <p className="description">
                        Experience the future of decentralized finance. Our state-of-the-art blockchain ecosystem
                        empowers you to mine, trade, and communicate securely. Built with precision and
                        designed for the modern era.
                    </p>

                    <div className="developer-info">
                        <p>Developed by</p>
                        <h3>Leopold Springorum</h3>
                        <p className="collaboration">in collaboration with Nightfall Systems Ltd.</p>
                    </div>

                    <button className="btn-enter" onClick={() => navigate('/app')}>
                        Launch Application
                    </button>
                </div>
                <div className="hero-image-container">
                    <img src="/nightfall_logo.jpg" alt="Nightfall Systems Logo" className="hero-image" />
                </div>
            </div>
        </div>
    );
}
