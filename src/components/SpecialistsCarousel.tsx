import { useRef } from "react";
import Avatar from "./Avatar";
import { cn } from "../utils/ui";

export type Specialist = {
  id: string;
  display_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

type Props = {
  items: Specialist[];
  selectedId?: string;
  onSelect: (id: string) => void;
  className?: string;
};

export default function SpecialistsCarousel({
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
        <h3 className="font-semibold">Especialistas</h3>
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
          Aún no hay especialistas disponibles. Cuando el administrador los
          registre, aparecerán aquí con su foto o sus iniciales.
        </div>
      ) : (
        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        >
          {items.map((p) => {
            const active = p.id === selectedId;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={cn(
                  "snap-start min-w-[220px] rounded-2xl border bg-white p-4 text-left hover:shadow transition",
                  active && "ring-2 ring-black border-black"
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    name={p.display_name || undefined}
                    email={p.email || undefined}
                    src={p.avatar_url ?? undefined}
                  />
                  <div>
                    <div className="font-medium">
                      {p.display_name || p.email || "Especialista"}
                    </div>
                    <div className="text-xs text-zinc-500">{p.email}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
