import { Entity } from '../entities/entity';
import { NotFoundError } from '../errors/not-found-error';
import { InMemoryRepository } from './in-memory.repository';
import { RepositoryInterface } from './repository-contracts';
import {
  SearchableRepositoryInterface,
  SearchParams,
  SearchResult,
  SortDirection,
} from './searchable-repository-contracts';

export abstract class InMemorySearchableRepository<
  E extends Entity,
  Filter extends string = string,
>
  extends InMemoryRepository<E>
  implements
    SearchableRepositoryInterface<
      E,
      Filter,
      SearchParams<Filter>,
      SearchResult<E, Filter>
    >
{
  sortableFields: string[] = [];
  async search(props: SearchParams<Filter>): Promise<SearchResult<E, Filter>> {
    const itemsFiltered = await this.applyFilter(this.items, props.filter);
    const itemsSorted = await this.applySort(
      itemsFiltered,
      props.sort,
      props.sortDir,
    );
    const itemsPaginated = await this.applyPaginate(
      itemsSorted,
      props.page,
      props.perPage,
    );
    return new SearchResult<E, Filter>({
      items: itemsPaginated,
      total: itemsFiltered.length,
      currentPage: props.page,
      perPage: props.perPage,
      sort: props.sort,
      sortDir: props.sortDir,
      filter: props.filter,
    });
  }

  protected abstract applyFilter(
    items: E[],
    filter: Filter | null,
  ): Promise<E[]>;

  protected async applySort(
    items: E[],
    sort: string | null,
    sortDir: SortDirection | null,
  ): Promise<E[]> {
    if (!sort || !this.sortableFields.includes(sort)) {
      return items;
    }
    return [...items].sort((a, b) => {
      if (a.props[sort] < b.props[sort]) {
        return sortDir === 'asc' ? -1 : 1;
      }
      if (a.props[sort] > b.props[sort]) {
        return sortDir === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  protected async applyPaginate(
    items: E[],
    page: SearchParams<Filter>['page'],
    perPage: SearchParams<Filter>['perPage'],
  ): Promise<E[]> {
    const start = (page - 1) * perPage;
    const limit = start + perPage;
    return items.slice(start, limit);
  }
}
