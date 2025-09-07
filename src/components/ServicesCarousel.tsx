import { useRef } from "react";
import { cn } from "../utils/ui";

export type Service = {
  id: string;
  name: string;
  duration_min: number;
  price: number;
};

type Props = {
  items: Service[];
  selectedId?: string;
  onSelect: (id: string) => void;
  className?: string;
};

export default function ServicesCarousel({
  items,
  selectedId,
  onSelect,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollBy = (dx: number) =>
    ref.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Servicios</h3>
        {items.length > 0 && (
          <div className="flex gap-1">
            <button
              className="px-2 py-1 border rounded hover:bg-zinc-50"
              onClick={() => scrollBy(-320)}
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              className="px-2 py-1 border rounded hover:bg-zinc-50"
              onClick={() => scrollBy(+320)}
              aria-label="Siguiente"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-zinc-600">
          No hay servicios disponibles todavía. Pídele al administrador que cree
          al menos uno (por ejemplo “Consulta general” o “Control”).
        </div>
      ) : (
        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        >
          {items.map((s) => {
            const active = s.id === selectedId;
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={cn(
                  "min-w-[220px] snap-start text-left rounded-2xl border p-4 bg-white hover:shadow transition",
                  active && "ring-2 ring-black border-black"
                )}
              >
                <div className="text-sm text-zinc-500">
                  {s.duration_min} min
                </div>
                <div className="font-medium">{s.name}</div>
                <div className="text-zinc-700 mt-2">
                  {Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0,
                  }).format(s.price)}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
