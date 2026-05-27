import { useState } from 'react';
import type { ActivityEvent } from '../../core/activity/activity.types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';

interface ActivityScreenProps {
    activity: ActivityEvent[];
}

export function ActivityScreen({ activity }: ActivityScreenProps) {
    const [showAll, setShowAll] = useState(false);
    const visibleActivity = showAll ? activity : activity.slice(0, 3);

    return (
        <main>
            <h1 className="screen-title">Actividad</h1>
            <p className="screen-subtitle">Últimos cambios realizados en tu colección.</p>

            <section style={{ marginTop: 18 }}>
                {activity.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon="🕒"
                            title="Sin actividad"
                            description="Cuando marques láminas o agregues repetidas, aparecerán aquí."
                        />
                    </Card>
                ) : (
                    <>
                        <div className="grid">
                            {visibleActivity.map((event) => (
                                <Card key={event.id}>
                                    <strong>{event.title}</strong>
                                    {event.description && (
                                        <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)' }}>
                                            {event.description}
                                        </p>
                                    )}
                                    <small style={{ display: 'block', marginTop: 8, color: 'var(--color-text-soft)' }}>
                                        {new Date(event.createdAt).toLocaleString()}
                                    </small>
                                </Card>
                            ))}
                        </div>

                        {activity.length > 3 && (
                            <div style={{ marginTop: 16 }}>
                                <Button variant="secondary" fullWidth onClick={() => setShowAll((value) => !value)}>
                                    {showAll ? 'Mostrar menos' : `Mostrar más (${activity.length - 3})`}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}