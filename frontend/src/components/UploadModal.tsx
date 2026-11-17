import { useRef, useState } from "react";
import { MAX_UPLOAD_BYTES, uploadPhoto } from "../api/photos";

type UploadModalProps = {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
};

export function UploadModal({ open, onClose, onUploaded }: UploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const images = [...fileList].filter((file) => file.type.startsWith("image/"));
    if (!images.length) {
      setNotice("Selecione arquivos de imagem, como JPG, PNG ou WEBP.");
      return;
    }

    setBusy(true);
    let added = 0;
    try {
      for (const file of images) {
        if (file.size > MAX_UPLOAD_BYTES) {
          setNotice(`"${file.name}" excede 5 MB e foi ignorada.`);
          continue;
        }
        await uploadPhoto(file);
        added += 1;
      }
      if (added) {
        setNotice(`${added} ${added === 1 ? "foto adicionada" : "fotos adicionadas"}.`);
        onUploaded();
        setTimeout(onClose, 900);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Falha no upload.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-[rgba(20,20,18,.68)] p-5">
      <div className="w-full max-w-[480px] rounded-[10px] bg-surface p-7 text-ink shadow-[0_18px_55px_rgba(40,38,30,.09)]">
        <h2 className="m-0 mb-2 font-display text-[28px] font-normal">Adicionar memórias</h2>
        <p className="mb-5 text-[12px] leading-relaxed text-muted">
          Escolha as fotos (máx. 5 MB). Elas serão convertidas para WebP no servidor.
        </p>
        <div
          role="button"
          tabIndex={0}
          className={`cursor-pointer rounded-[7px] border border-dashed border-[#9b9b8f] bg-soft p-8 text-center ${
            dragging ? "border-accent" : ""
          }`}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void handleFiles(event.dataTransfer.files);
          }}
        >
          <div className="text-[25px] text-accent">＋</div>
          <strong className="mt-2 block text-[13px]">Arraste suas fotos para cá</strong>
          <span className="text-[11px] text-muted">ou clique para selecionar imagens</span>
        </div>
        {notice ? (
          <div className="mt-3 rounded-md bg-soft px-3 py-2 text-[11px] leading-relaxed text-ink">
            {notice}
          </div>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-surface px-4 py-2 text-[12px]"
            disabled={busy}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full bg-accent px-4 py-2 text-[12px] text-white hover:bg-accent-dark"
            disabled={busy}
          >
            {busy ? "Enviando..." : "Selecionar fotos"}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>
    </div>
  );
}
