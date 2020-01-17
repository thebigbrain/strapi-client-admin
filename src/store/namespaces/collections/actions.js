import { pipe, map, mutate } from "overmind";
import * as o from 'store/operators';
import * as internal from './internal';

export const restSearch = pipe(
  o.search(),
  mutate(({state}, {collection, result}) => {
    Object.assign(state.collections.cache, {[collection]: result.data});
  })
);

export const doSearch = o.debouncePipe(
  300,
  internal.convertFilters,
  map(({state}, {globalFilter, collection, pageSize, pageIndex, filters, sortBy}) => {
    const query = new URLSearchParams();
    query.append('_limit', pageSize);
    query.append('_start', pageSize * pageIndex);
    if (sortBy.length > 0) {
      const {id, desc} = sortBy[0]
      query.append('_sort', `${id}:${desc ? 'desc' : 'asc'}`);
    }
    if (globalFilter) query.append('_q', globalFilter);
    
    filters.forEach(v => {
      query.append(v.id, v.value);
    });
    return {collection, query};
  }),
  restSearch
);

export const setFilter = ({state}, c) => {
  state.collections.filterTypes[c.accessor] = c.filter;
};

export const saveInstance = ({state}, instance) => {
  const collection = instance.state.collections;
  state.collections.instances[collection] = instance;
};

export const updateInstance = pipe(
  mutate(({state}, instance) => {
    const collection = instance.state.collection;
    state.collections.instances[collection] = instance;
  }),
  map(({state}, instance) => {
    return instance.state;
  }),
  doSearch
);

export const resetInstance = ({state}, collection) => {
  state.collections.instances[collection] = null;
};