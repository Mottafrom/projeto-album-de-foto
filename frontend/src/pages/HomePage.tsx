import { useEffect, useMemo, useState } from "react";
import { deletePhoto, listPhotos, type Photo } from "../api/photos";
import { Gallery } from "../components/Gallery";
import { Header } from "../components/Header";
import { PhotoViewer } from "../components/PhotoViewer";
import { UploadModal } from "../components/UploadModal";
import { useTheme } from "../hooks/useTheme";
import { authClient } from "../lib/auth-client";

export function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = authClient.useSession();
  const isAdmin = Boolean(session?.user);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [query, setQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const items = await listPhotos();
      setPhotos(items);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar álbum.");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const visiblePhotos = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return photos
      .filter((photo) => photo.title.toLocaleLowerCase("pt-BR").includes(normalized))
      .sort((a, b) => b.takenOn.localeCompare(a.takenOn));
  }, [photos, query]);

  async function handleDelete(id: string) {
    const photo = photos.find((item) => item.id === id);
    if (!photo) return;
    const confirmed = window.confirm(
      `Tem certeza de que deseja excluir a foto "${photo.title}"? Esta ação não poderá ser desfeita.`,
    );
    if (!confirmed) return;

    try {
      await deletePhoto(id);
      if (viewerIndex !== null) setViewerIndex(null);
      await refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Não foi possível excluir.");
    }
  }

  return (
    <div className="mx-auto w-[min(1120px,calc(100%-48px))] max-md:w-[min(100%-32px,600px)]">
      <Header theme={theme} onToggleTheme={toggleTheme} isAdmin={isAdmin} />

      <main>
        <section className="px-0 py-[76px] text-center max-md:py-[62px]">
          <div className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase">
            Memórias que ficam
          </div>
          <h1 className="my-4 font-display text-[clamp(48px,8vw,82px)] leading-[0.98] font-normal tracking-[-0.045em]">
            Every picture
            <br />
            tells a story.
          </h1>
          <p className="m-0 text-[15px] leading-relaxed text-muted">
            Um espaço para reunir momentos especiais.
            <br />
            Reviva, compartilhe e guarde cada lembrança.
          </p>
        </section>

        <section className="flex items-center justify-between gap-4 border-y border-line py-5 max-md:flex-col max-md:items-start">
          <div className="font-display text-[24px] font-normal">
            Nossa galeria{" "}
            <span className="ml-2 font-sans text-[12px] text-muted">
              {photos.length} {photos.length === 1 ? "foto" : "fotos"}
            </span>
          </div>
          <div className="flex w-full items-center gap-2 md:w-auto">
            <input
              className="min-w-0 flex-1 rounded-full border border-line bg-surface px-3.5 py-2.5 text-[12px] text-ink outline-none focus:border-accent md:w-[190px] md:flex-none"
              type="search"
              placeholder="Buscar uma foto..."
              aria-label="Buscar fotos"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {isAdmin ? (
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="rounded-full bg-accent px-[18px] py-[11px] text-[12px] tracking-[0.02em] text-white hover:bg-accent-dark"
              >
                ＋ Adicionar fotos
              </button>
            ) : null}
          </div>
        </section>

        {error ? <p className="py-4 text-[13px] text-red-700">{error}</p> : null}

        <Gallery
          photos={visiblePhotos}
          query={query}
          isAdmin={isAdmin}
          onOpenUpload={() => setUploadOpen(true)}
          onOpenPhoto={(id) => {
            const index = visiblePhotos.findIndex((photo) => photo.id === id);
            if (index >= 0) setViewerIndex(index);
          }}
          onDeletePhoto={handleDelete}
        />
      </main>

      <footer className="flex justify-between border-t border-line py-6 text-[11px] tracking-[0.04em] text-muted max-md:flex-col max-md:gap-2">
        <span>MEMORIES. — Feito para guardar o que importa.</span>
        <span>
          {photos.length}{" "}
          {photos.length === 1 ? "momento compartilhado" : "momentos compartilhados"}
        </span>
      </footer>

      {isAdmin ? (
        <UploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploaded={() => void refresh()}
        />
      ) : null}

      {viewerIndex !== null ? (
        <PhotoViewer
          photos={visiblePhotos}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onMove={(direction) => {
            setViewerIndex((current) => {
              if (current === null || !visiblePhotos.length) return current;
              return (current + direction + visiblePhotos.length) % visiblePhotos.length;
            });
          }}
        />
      ) : null}
    </div>
  );
}
