export type Specialist = {
  id: string;
  display_name?: string | null;
  email?: string | null;
  avatar_url?: string | null; // si lo agregas a tu API
};

export type Props = {
  items: Specialist[];
  selectedId?: string;
  onSelect: (id: string) => void;
  className?: string;
};