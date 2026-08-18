// src/hooks/useWards.js

import { useState, useEffect, useMemo, useCallback } from "react";
// import { useWard } from "../../../../lib/ward/wardservice";
import {
  useGetWardsQuery,
  useDeleteWardMutation,
} from "../../../../../store/api/wardAPI/ward.js";

export const useWards = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ================= DEBOUNCE SEARCH =================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // ================= API =================
  const listQuery = useGetWardsQuery({
    page,
    limit,
    search: debouncedSearch,
  });
  const [deleteWard] = useDeleteWardMutation();

  const { data: response, isLoading, refetch } = listQuery;

  // ================= EXTRACT WARDS =================
  const wards = useMemo(() => {
    if (!response) return [];

    if (Array.isArray(response)) return response;

    if (Array.isArray(response?.data))
      return response.data;

    if (Array.isArray(response?.result?.data))
      return response.result.data;

    if (Array.isArray(response?.result))
      return response.result;

    return [];
  }, [response]);

  // ================= TOTAL WARDS =================
  const totalWards = useMemo(() => {
    if (!response) return 0;

    return (
      response?.total ??
      response?.result?.pagination?.total ??
      response?.result?.total ??
      wards.length
    );
  }, [response, wards.length]);

  // ================= TOTAL PAGES =================
  const totalPages = useMemo(() => {
    if (!response) return 0;

    return (
      response?.totalPages ??
      response?.result?.pagination?.totalPages ??
      Math.ceil(totalWards / limit)
    );
  }, [response, totalWards, limit]);

  // ================= FILTER WARDS =================
  const filteredWards = useMemo(() => {
    if (!Array.isArray(wards)) return [];

    if (!debouncedSearch) return wards;

    const searchLower =
      debouncedSearch.toLowerCase();

    return wards.filter((ward) => {
      return (
        (ward?.name || "")
          .toLowerCase()
          .includes(searchLower) ||

        (ward?.description || "")
          .toLowerCase()
          .includes(searchLower) ||

        (ward?.wardType || "")
          .toLowerCase()
          .includes(searchLower) ||

        String(ward?.floorNumber || "")
          .toLowerCase()
          .includes(searchLower) ||

        String(ward?.totalBeds || "")
          .toLowerCase()
          .includes(searchLower)
      );
    });
  }, [wards, debouncedSearch]);

  // ================= PAGINATION =================
  const paginatedWards = useMemo(() => {
    if (!Array.isArray(filteredWards))
      return [];

    const hasServerPagination =
      Array.isArray(response?.data) ||
      Array.isArray(response?.result?.data);

    if (hasServerPagination) {
      return filteredWards;
    }

    const start = (page - 1) * limit;

    return filteredWards.slice(
      start,
      start + limit
    );
  }, [filteredWards, page, limit, response]);

  // ================= ACTIVE CHECK =================
  const isActiveWard = useCallback((ward) => {
    return (
      ward?.isActive === true ||
      ward?.isActive === "Active"
    );
  }, []);

  // ================= STATS =================
  const stats = useMemo(() => {
    if (!Array.isArray(wards) || wards.length === 0) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
      };
    }

    return {
      total: wards.length,

      active: wards.filter(isActiveWard).length,

      inactive: wards.filter(
        (w) => !isActiveWard(w)
      ).length,
    };
  }, [wards, isActiveWard]);

  // ================= REMOVE =================
  const removeWards = useCallback(
    async (ids) => {
      if (!ids || ids.length === 0) return;

      try {
        if (ids.length === 1) {
          await deleteWard(ids[0]).unwrap();
        } else {
          await Promise.all(
            ids.map((id) => deleteWard(id).unwrap())
          );
        }

        await refetch();

        if (
          paginatedWards.length === ids.length &&
          page > 1
        ) {
          setPage(page - 1);
        }
      } catch (error) {
        console.error(
          "Remove wards error:",
          error
        );
      }
    },
    [
      deleteWard,
      refetch,
      paginatedWards.length,
      page,
    ]
  );

  return {
    search,
    setSearch,

    page,
    setPage,

    limit,
    setLimit,

    wards,
    filteredWards,
    paginatedWards,

    stats,

    totalWards,
    totalPages,

    isLoading,

    removeWards,

    refetch,
  };
};
