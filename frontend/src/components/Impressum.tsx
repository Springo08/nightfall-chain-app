import '../App.css';

export default function Impressum() {
    return (
        <div className="impressum-page container">
            <h1>Impressum</h1>
            <div className="legal-content card">
                <h2>Angaben gemäß § 5 TMG</h2>
                <p><strong>Nightfall Systems Ltd.</strong></p>
                <p>Eichweide 12</p>
                <p>82418 Seehausen am Staffelsee</p>
                <p>Deutschland</p>

                <h3>Vertreten durch:</h3>
                <p>Leopold Springorum</p>

                <h3>Kontakt:</h3>
                <p>E-Mail: contact@nightfall-systems.com</p>
                {/* Add phone if available, otherwise omit */}

                <h3>Haftungsausschluss (Disclaimer)</h3>
                <p><strong>Haftung für Inhalte</strong></p>
                <p>
                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
                    allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
                    verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
                    zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>

                <p><strong>Haftung für Links</strong></p>
                <p>
                    Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben.
                    Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
                    Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>

                <p><strong>Urheberrecht</strong></p>
                <p>
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
                    Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
                    Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                </p>
            </div>
        </div>
    );
}
