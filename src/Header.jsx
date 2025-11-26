import { Link } from 'react-router'

export default function Header() {
    return (
        <header>
            <h1>Carls Laguerre Cosmic Lynx 💠 ITIS3135</h1>
            <p><em><strong>Eyes of the future</strong></em></p>
            <nav>
                <Link to="/">Home</Link> 💠
                <Link to="/introduction">Introduction</Link> 💠
                <Link to="/contract">Contract</Link> 💠
                <Link to="/introduction-data">Introduction data</Link>
                  
            </nav>
            
        </header>
    )

}
