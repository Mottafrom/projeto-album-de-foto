import type { Photo } from "../api/photos";

type GalleryProps = {
  photos: Photo[];
  query: string;
  isAdmin: boolean;
  onOpenUpload: () => void;
  onOpenPhoto: (id: string) => void;
  onDeletePhoto: (id: string) => void;
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateString}T12:00:00`));
}

export function Gallery({
  photos,
  query,
  isAdmin,
  onOpenUpload,
  onOpenPhoto,
  onDeletePhoto,
}: GalleryProps) {
  if (!photos.length) {
    return (
      <div className="border-b border-line px-5 py-16 text-center">
        <div className="mx-auto mb-5 grid h-[58px] w-[58px] place-items-center rounded-full border border-line text-[24px] text-accent">
          ✳
        </div>
        <h2 className="m-0 mb-2 font-display text-[28px] font-normal">
          {query ? "Nenhuma foto encontrada." : "As histórias começam aqui."}
        </h2>
        <p className="mx-auto mb-5 max-w-[360px] text-[13px] leading-relaxed text-muted">
          {query
            ? "Tente buscar por outro nome."
            : "Este álbum ainda está vazio. Adicione as primeiras fotos para começar a construir nossa linha do tempo."}
        </p>
        {!query && isAdmin ? (
          <button
            type="button"
            onClick={onOpenUpload}
            className="rounded-full bg-accent px-[18px] py-[11px] text-[12px] text-white hover:bg-accent-dark"
          >
            Adicionar primeira foto
          </button>
        ) : null}
      </div>
    );
  }

  const groups = photos.reduce<Record<string, Photo[]>>((acc, photo) => {
    (acc[photo.takenOn] ??= []).push(photo);
    return acc;
  }, {});

  return (
    <section className="pb-20 pt-8">
      {Object.keys(groups)
        .sort((a, b) => b.localeCompare(a))
        .map((date) => (
          <section key={date} className="mb-10">
            <div className="mb-4 flex items-center gap-3 text-[11px] tracking-[0.13em] text-muted uppercase">
              <span>{formatDate(date)}</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
              {groups[date].map((photo) => (
                <article
                  key={photo.id}
                  className="group relative aspect-[1/1.12] overflow-hidden rounded-[5px] bg-soft"
                >
                  <button
                    type="button"
                    className="block h-full w-full border-0 bg-transparent p-0 text-left"
                    onClick={() => onOpenPhoto(photo.id)}
                    aria-label={`Abrir foto ${photo.title}`}
                  >
                    <img
                      src={photo.publicUrl}
                      alt={photo.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.045]"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent px-3 pt-8 pb-3 text-[12px] text-white opacity-100 md:opacity-0 md:group-hover:opacity-100">
                      {photo.title}
                    </span>
                  </button>
                  {isAdmin ? (
                    <button
                      type="button"
                      title="Excluir esta foto"
                      aria-label={`Excluir foto ${photo.title}`}
                      className="absolute top-2 right-2 z-[2] grid h-[35px] w-[35px] place-items-center rounded-full border border-white/50 bg-[rgba(25,25,22,.72)] text-[17px] text-white opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      onClick={() => onDeletePhoto(photo.id)}
                    >
                      ⌫
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ))}
    </section>
  );
}
