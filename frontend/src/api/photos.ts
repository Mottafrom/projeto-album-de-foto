const API_URL = import.meta.env.VITE_API_URL ?? "";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type Photo = {
  id: string;
  title: string;
  storagePath: string;
  publicUrl: string;
  takenOn: string;
  createdAt: string;
};

export async function listPhotos(): Promise<Photo[]> {
  const response = await fetch(`${API_URL}/api/photos`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar as fotos.");
  }

  const data = (await response.json()) as { photos: Photo[] };
  return data.photos;
}

export async function uploadPhoto(file: File, title?: string): Promise<Photo> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("A imagem excede o limite de 5 MB.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem.");
  }

  const form = new FormData();
  form.append("file", file);
  if (title) form.append("title", title);
  form.append("takenOn", new Date(file.lastModified || Date.now()).toISOString().slice(0, 10));

  const response = await fetch(`${API_URL}/api/photos`, {
    method: "POST",
    credentials: "include",
    body: form,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Falha ao enviar a foto.");
  }

  const data = (await response.json()) as { photo: Photo };
  return data.photo;
}

export async function deletePhoto(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/photos/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Falha ao excluir a foto.");
  }
}

export { MAX_UPLOAD_BYTES };
