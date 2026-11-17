import type { Photo } from "../api/photos";

type PhotoViewerProps = {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onMove: (direction: number) => void;
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateString}T12:00:00`));
}

export function PhotoViewer({ photos, index, onClose, onMove }: PhotoViewerProps) {
  const photo = photos[index];
  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(25,25,22,.92)] p-7"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
        if (event.key === "ArrowLeft") onMove(-1);
        if (event.key === "ArrowRight") onMove(1);
      }}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <button
        type="button"
        aria-label="Fechar"
        className="absolute top-[22px] right-[22px] grid h-[42px] w-[42px] place-items-center rounded-full border border-white/30 bg-white/10 text-[22px] text-white"
        onClick={onClose}
      >
        ×
      </button>
      <button
        type="button"
        aria-label="Foto anterior"
        className="absolute top-1/2 left-[22px] grid h-[42px] w-[42px] -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/10 text-[22px] text-white"
        onClick={() => onMove(-1)}
      >
        ‹
      </button>
      <img
        src={photo.publicUrl}
        alt={photo.title}
        className="max-h-[82vh] max-w-[min(100%,1100px)] object-contain"
      />
      <button
        type="button"
        aria-label="Próxima foto"
        className="absolute top-1/2 right-[22px] grid h-[42px] w-[42px] -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/10 text-[22px] text-white"
        onClick={() => onMove(1)}
      >
        ›
      </button>
      <div className="absolute bottom-[22px] text-center text-[12px] text-[#eee]">
        {photo.title} · {formatDate(photo.takenOn)}
      </div>
    </div>
  );
}
