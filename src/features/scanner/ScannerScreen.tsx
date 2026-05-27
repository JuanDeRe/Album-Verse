import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';

export function ScannerScreen() {
    return (
        <main>
            <h1 className="screen-title">Scanner</h1>
            <p className="screen-subtitle">
                Aquí vamos a conectar la cámara y el scanner local de páginas.
            </p>

            <section style={{ marginTop: 18 }}>
                <Card>
                    <EmptyState
                        icon="📷"
                        title="Scanner pendiente"
                        description="Primero estamos organizando la app. Después conectaremos cámara, recorte de página y detección de casillas ocupadas/vacías."
                    />
                </Card>
            </section>
        </main>
    );
}