import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../lib/errors.js";
import { photoIdParamsSchema, uploadFieldsSchema } from "./photos.schemas.js";
import { PhotosService } from "./photos.service.js";

export class PhotosController {
  constructor(private readonly service = new PhotosService()) {}

  list = async (_request: FastifyRequest, reply: FastifyReply) => {
    const photos = await this.service.list();
    return reply.send({ photos: photos.map((photo) => photo.toJSON()) });
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (!file) {
      throw new AppError("Image file is required", 400, "FILE_REQUIRED");
    }

    const buffer = await file.toBuffer();
    const fields = Object.fromEntries(
      Object.entries(file.fields).map(([key, value]) => {
        const field = Array.isArray(value) ? value[0] : value;
        if (field && "value" in field) {
          return [key, String(field.value)];
        }
        return [key, undefined];
      }),
    );

    const parsedFields = uploadFieldsSchema.parse(fields);

    const photo = await this.service.create({
      buffer,
      mimeType: file.mimetype,
      originalName: file.filename,
      title: parsedFields.title,
      takenOn: parsedFields.takenOn ? new Date(`${parsedFields.takenOn}T12:00:00.000Z`) : undefined,
    });

    return reply.status(201).send({ photo: photo.toJSON() });
  };

  remove = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = photoIdParamsSchema.parse(request.params);
    await this.service.delete(id);
    return reply.status(204).send();
  };
}
