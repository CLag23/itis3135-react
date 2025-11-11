import Header from './Header'
export default function Introduction() {
    document.title += ' - Introduction';
    return (<> 
        <Header />
        <main>
            <h2>hello</h2>
            <p>world</p>
        </main>
        <footer>
            <p>Carls Laguerre &copy; 2024</p>
        </footer>
        
    </>)
}