import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePatient } from '../../../../lib/patient/patientservice';

export const usePatients = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { listQuery, remove, removeMultiple } = usePatient({
    page,
    limit,
    search: debouncedSearch,
  });

  const { data: response, isLoading, refetch } = listQuery;

  const patients = useMemo(() => {
    if (!response) return [];

    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.result?.data)) return response.result.data;
    if (Array.isArray(response?.result)) return response.result;

    return [];
  }, [response]);

  const totalPatients = useMemo(() => {
    if (!response) return 0;

    return (
      response?.total ??
      response?.result?.pagination?.total ??
      response?.result?.total ??
      patients.length
    );
  }, [response, patients.length]);

  const totalPages = useMemo(() => {
    if (!response) return 0;

    return (
      response?.totalPages ??
      response?.result?.pagination?.totalPages ??
      Math.ceil(totalPatients / limit)
    );
  }, [response, totalPatients, limit]);

  const filteredPatients = useMemo(() => {
    if (!Array.isArray(patients)) return [];
    if (!debouncedSearch) return patients;

    const searchLower = debouncedSearch.toLowerCase();

    return patients.filter((patient) => {
      return (
        (patient?.name || '').toLowerCase().includes(searchLower) ||
        (patient?.email || '').toLowerCase().includes(searchLower) ||
        (patient?.phone || '').includes(searchLower) ||
        (patient?.uhid || '').toLowerCase().includes(searchLower) ||
        (patient?.guardianName || '').toLowerCase().includes(searchLower) ||
        (patient?.insuranceProvider || '').toLowerCase().includes(searchLower) ||
        (patient?.bloodGroup || '').toLowerCase().includes(searchLower)
      );
    });
  }, [patients, debouncedSearch]);

  const paginatedPatients = useMemo(() => {
    if (!Array.isArray(filteredPatients)) return [];

    const hasServerPagination =
      Array.isArray(response?.data) || Array.isArray(response?.result?.data);

    if (hasServerPagination) {
      return filteredPatients;
    }

    const start = (page - 1) * limit;
    return filteredPatients.slice(start, start + limit);
  }, [filteredPatients, page, limit, response]);

  const isActivePatient = useCallback((patient) => {
    return patient?.status === true || patient?.status === 'Active';
  }, []);

  const stats = useMemo(() => {
    if (!Array.isArray(patients) || patients.length === 0) {
      return { total: 0, active: 0, inactive: 0 };
    }

    return {
      total: totalPatients || patients.length,
      active: patients.filter(isActivePatient).length,
      inactive: patients.filter((p) => !isActivePatient(p)).length,
    };
  }, [patients, isActivePatient, totalPatients]);

  const removePatients = useCallback(
    async (ids) => {
      if (!ids || ids.length === 0) return;

      try {
        if (ids.length === 1) {
          await remove(ids[0]);
        } else {
          await removeMultiple(ids);
        }

        await refetch();

        if (paginatedPatients.length === ids.length && page > 1) {
          setPage(page - 1);
        }
      } catch (error) {
        console.error('Remove patients error:', error);
      }
    },
    [remove, removeMultiple, refetch, paginatedPatients.length, page],
  );

  return {
    search,
    setSearch,
    page,
    setPage,
    limit,
    setLimit,
    filteredPatients,
    paginatedPatients,
    stats,
    totalPatients,
    totalPages,
    isLoading,
    removePatients,
    refetch,
  };
};
