import { Entity } from '@/shared/domain/entities/entity';
import { InMemoryRepository } from '../../in-memory.repository';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';

type StubEntityProps = {
  name: string;
  price: number;
};

class StubEntity extends Entity<StubEntityProps> {}

class StubInMemoryRepository extends InMemoryRepository<StubEntity> {}

describe('InMemoryRepository unit tests', () => {
  let sut: StubInMemoryRepository;

  beforeEach(() => {
    sut = new StubInMemoryRepository();
  });

  it('Should inserts a new entity', async () => {
    const entity = new StubEntity({ name: 'test name', price: 50 });
    await sut.insert(entity);
    expect(entity.toJSON()).toStrictEqual(sut.items[0].toJSON());
  });

  it('Should throw error when entity not found', () => {
    return expect(sut.findById('fakeId')).rejects.toThrow(NotFoundError);
  });

  it('Should find a new entity by id', async () => {
    const entity = new StubEntity({ name: 'test name', price: 50 });
    await sut.insert(entity);
    const foundEntity = await sut.findById(entity.id);
    expect(foundEntity.toJSON()).toStrictEqual(entity.toJSON());
  });

  it('Should list all entities', async () => {
    const entity = new StubEntity({ name: 'test name', price: 50 });
    await sut.insert(entity);
    const allEntities = await sut.findAll();
    expect([entity]).toStrictEqual(allEntities);
  });

  it('Should throw error when trying to updating a entity not found', () => {
    const entity = new StubEntity({ name: 'test name', price: 50 });
    return expect(sut.update(entity)).rejects.toThrow(NotFoundError);
  });

  it('Should update a entity', async () => {
    const entity = new StubEntity({ name: 'test name', price: 50 });
    await sut.insert(entity);
    const entityUpdated = new StubEntity(
      { name: 'new test name', price: 50 },
      entity._id,
    );
    await sut.update(entityUpdated);
    expect(sut.items[0].toJSON()).toStrictEqual(entityUpdated.toJSON());
  });

  it('Should throw error when trying to delete a entity not found', () => {
    const entity = new StubEntity({ name: 'test name', price: 50 });
    return expect(sut.delete(entity)).rejects.toThrow(NotFoundError);
  });

  it('Should update a entity', async () => {
    const entity = new StubEntity({ name: 'test name', price: 50 });
    await sut.insert(entity);
    expect(sut.items.length).toBe(1);
    await sut.delete(entity._id);
    expect(sut.items.length).toStrictEqual(0);
  });
});
