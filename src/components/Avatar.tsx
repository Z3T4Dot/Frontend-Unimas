import { initialsFrom, cn } from "../utils/ui";

type Props = {
  name?: string | null;
  email?: string | null;
  src?: string | null;
  className?: string;
};

export default function Avatar({ name, email, src, className }: Props) {
  const initials = initialsFrom(name, email);
  return src ? (
    <img
      src={src}
      alt={name || email || "Especialista"}
      className={cn("h-14 w-14 rounded-2xl object-cover border", className)}
      onError={(e) => {
        // si la imagen falla, ocultamos y mostramos fallback
        (e.currentTarget as HTMLImageElement).style.display = "none";
        const sib = e.currentTarget.nextElementSibling as HTMLElement;
        if (sib) sib.style.display = "grid";
      }}
    />
  ) : (
    <div
      className={cn(
        "h-14 w-14 rounded-2xl grid place-items-center bg-zinc-900 text-white font-semibold",
        className
      )}
    >
      {initials}
    </div>
  );
}
