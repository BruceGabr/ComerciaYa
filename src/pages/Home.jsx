import React from 'react';
import Header from '../components/Header';

const Home = () => {
    return (
        <div className="home">
            <Header />
            <main className="home__content">
                <h2>Bienvenidos a la Plataforma de Emprendimientos Locales</h2>
                <p>Aquí podrás conocer los productos y servicios de emprendedores locales.</p>
                {/* Aquí puedes agregar más contenido, como una lista de productos */}
            </main>
        </div>
    );
}

export default Home;
