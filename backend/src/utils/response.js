/**
 * Response shape helpers matching what the frontend's unwrap logic expects:
 *   - unwrapList(): body.result.data ?? body.result.records ?? body.result
 *   - RTK Query transformResponse(): response.result.data + response.result.pagination
 */

export const paginated = (res, { data, page = 1, limit = 10, total }) => {
  const totalPages = limit ? Math.ceil(total / limit) : 1;
  return res.json({
    result: {
      data,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages },
    },
  });
};

// Flat shape — required specifically by /user (doctors) which reads
// response.result directly as { data, total, page, limit, totalPages }
export const paginatedFlat = (res, { data, page = 1, limit = 10, total }) => {
  const totalPages = limit ? Math.ceil(total / limit) : 1;
  return res.json({
    result: { data, total, page: Number(page), limit: Number(limit), totalPages },
  });
};

export const listResult = (res, data) => res.json({ result: { data } });

export const single = (res, data, status = 200) => res.status(status).json({ result: data });

export const noContent = (res) => res.status(204).send();
