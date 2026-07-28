import { Model, UpdateQuery } from "mongoose";

export abstract class BaseRepository<T extends { deletedAt: Date | null }> {
  constructor(protected readonly model: Model<T>) {}

  async findAll(filter: object = {}): Promise<T[]> {
    return this.model.find({ ...filter, deletedAt: null }).exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findOne({ _id: id, deletedAt: null }).exec();
  }

  async findOne(filter: object): Promise<T | null> {
    return this.model.findOne({ ...filter, deletedAt: null }).exec();
  }

  async create(data: Record<string, unknown>): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = await this.model.create(data as any);
    return doc.toObject() as T;
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model
      .findOneAndUpdate({ _id: id, deletedAt: null }, data, { returnDocument: 'after' })
      .exec();
  }

  async softDelete(id: string): Promise<T | null> {
    return this.model
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() } as unknown as UpdateQuery<T>,
        { returnDocument: 'after' },
      )
      .exec();
  }

  async restore(id: string): Promise<T | null> {
    return this.model
      .findOneAndUpdate({ _id: id }, { deletedAt: null } as unknown as UpdateQuery<T>, {
        returnDocument: 'after',
      })
      .exec();
  }

  async hardDelete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async count(filter: object = {}): Promise<number> {
    return this.model.countDocuments({ ...filter, deletedAt: null }).exec();
  }

  async exists(filter: object): Promise<boolean> {
    const count = await this.model.countDocuments({ ...filter, deletedAt: null }).exec();
    return count > 0;
  }
}
