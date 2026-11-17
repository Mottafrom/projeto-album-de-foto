import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Gallery } from "../../components/Gallery";

describe("Gallery", () => {
  it("shows empty state without upload CTA for visitors", () => {
    render(
      <Gallery
        photos={[]}
        query=""
        isAdmin={false}
        onOpenUpload={vi.fn()}
        onOpenPhoto={vi.fn()}
        onDeletePhoto={vi.fn()}
      />,
    );

    expect(screen.getByText("As histórias começam aqui.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Adicionar primeira foto/i })).toBeNull();
  });

  it("shows upload CTA for admin when album is empty", () => {
    render(
      <Gallery
        photos={[]}
        query=""
        isAdmin
        onOpenUpload={vi.fn()}
        onOpenPhoto={vi.fn()}
        onDeletePhoto={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /Adicionar primeira foto/i })).toBeInTheDocument();
  });
});
