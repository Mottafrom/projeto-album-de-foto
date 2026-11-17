import { type UUID } from "../../../lib/uuid.js";

export type PhotoProps = {
  id: UUID;
  title: string;
  storagePath: string;
  publicUrl: string;
  takenOn: Date;
  createdAt: Date;
};

export class Photo {
  readonly id: UUID;
  readonly title: string;
  readonly storagePath: string;
  readonly publicUrl: string;
  readonly takenOn: Date;
  readonly createdAt: Date;

  constructor(props: PhotoProps) {
    this.id = props.id;
    this.title = props.title;
    this.storagePath = props.storagePath;
    this.publicUrl = props.publicUrl;
    this.takenOn = props.takenOn;
    this.createdAt = props.createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      storagePath: this.storagePath,
      publicUrl: this.publicUrl,
      takenOn: this.takenOn.toISOString().slice(0, 10),
      createdAt: this.createdAt.toISOString(),
    };
  }
}
