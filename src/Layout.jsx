import Header from './Header.jsx';
import { Outlet  } from 'react-router';

export default function Layout() {
    return (
        <>
            <Header />
            <main>
                <Outlet />

            </main>
            <footer>
                <p>Carls Laguerre &copy; 2024</p>
            </footer>
        
        </>
    );

}