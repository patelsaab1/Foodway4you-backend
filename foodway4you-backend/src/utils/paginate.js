const paginate = (query, options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;
  
  const sort = options.sort || { createdAt: -1 };
  const select = options.select || '';
  const populate = options.populate || '';

  return {
    query: query.skip(skip).limit(limit).sort(sort).select(select).populate(populate),
    pagination: {
      page,
      limit,
      skip
    }
  };
};

const getPaginationData = (data, page, limit) => {
  const { count: totalItems, rows } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    totalItems,
    items: rows,
    totalPages,
    currentPage
  };
};

module.exports = {
  paginate,
  getPaginationData
};