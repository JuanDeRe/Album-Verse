import { useEffect, useMemo, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '../Button';
import { Card } from '../Card';

interface QrScannerProps {
    onScan: (text: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [scannerError, setScannerError] = useState<string | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    const readerId = useMemo(
        () => `qr-reader-${Math.random().toString(16).slice(2)}`,
        [],
    );

    useEffect(() => {
        if (!isOpen) return;

        const scanner = new Html5QrcodeScanner(
            readerId,
            {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250,
                },
                rememberLastUsedCamera: true,
            },
            false,
        );

        scannerRef.current = scanner;

        scanner.render(
            async (decodedText) => {
                onScan(decodedText);

                try {
                    await scanner.clear();
                } catch {
                    // no-op
                }

                scannerRef.current = null;
                setIsOpen(false);
            },
            () => {
                // Ignoramos errores por frame. Es normal que falle mientras busca el QR.
            },
        );

        return () => {
            const currentScanner = scannerRef.current;

            if (currentScanner) {
                currentScanner
                    .clear()
                    .catch(() => {
                        // no-op
                    })
                    .finally(() => {
                        scannerRef.current = null;
                    });
            }
        };
    }, [isOpen, onScan, readerId]);

    async function closeScanner() {
        try {
            await scannerRef.current?.clear();
        } catch {
            // no-op
        }

        scannerRef.current = null;
        setIsOpen(false);
    }

    return (
        <Card>
            <div className="grid">
                <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                    Escanea el QR de intercambio de otra persona. Si la cámara no funciona en tu navegador,
                    puedes seguir pegando el código manualmente.
                </p>

                {!isOpen ? (
                    <Button
                        fullWidth
                        onClick={() => {
                            setScannerError(null);
                            setIsOpen(true);
                        }}
                    >
                        Escanear QR con cámara
                    </Button>
                ) : (
                    <>
                        <div
                            id={readerId}
                            style={{
                                width: '100%',
                                overflow: 'hidden',
                                borderRadius: 16,
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface-alt)',
                            }}
                        />

                        <Button variant="secondary" fullWidth onClick={closeScanner}>
                            Cancelar escaneo
                        </Button>
                    </>
                )}

                {scannerError && (
                    <p style={{ margin: 0, color: 'var(--color-danger)', fontSize: 13 }}>
                        {scannerError}
                    </p>
                )}
            </div>
        </Card>
    );
}