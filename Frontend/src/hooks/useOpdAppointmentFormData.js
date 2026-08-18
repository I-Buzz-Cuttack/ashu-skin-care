import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/tokenService";
import { getApiBaseUrl } from "../utils/apiBaseUrl";

const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const unwrap = (response) => {
  const body = response?.data;
  const result = body?.result ?? body?.data ?? body;
  return result?.data ?? result?.records ?? result ?? [];
};

const normalizeList = (value) => Array.isArray(value) ? value : [];

export const useOpdAppointmentFormData = () => {
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [chargeCategories, setChargeCategories] = useState([]);
  const [consultationCharges, setConsultationCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = getApiBaseUrl();
      const headers = getHeaders();
      const [patientRes, departmentRes, categoryRes] = await Promise.all([
        axios.get(`${baseUrl}/patient`, { headers, params: { page: 1, limit: 1000 } }),
        axios.get(`${baseUrl}/department`, { headers, params: { page: 1, limit: 1000, is_active: true } }),
        axios.get(`${baseUrl}/opd-charge-categories`, { headers, params: { page: 1, limit: 1000, isActive: true } }),
      ]);

      setPatients(normalizeList(unwrap(patientRes)));
      setDepartments(normalizeList(unwrap(departmentRes)));
      setChargeCategories(normalizeList(unwrap(categoryRes)));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDoctors = useCallback(async (departmentId) => {
    if (!departmentId) {
      setDoctors([]);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const baseUrl = getApiBaseUrl();
      const headers = getHeaders();
      const res = await axios.get(`${baseUrl}/user`, {
        headers,
        params: { page: 1, limit: 1000, department_id: departmentId },
      });
      const list = normalizeList(unwrap(res));
      setDoctors(list);
      return list;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCharges = useCallback(async (chargeCategoryId) => {
    if (!chargeCategoryId) {
      setConsultationCharges([]);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const baseUrl = getApiBaseUrl();
      const headers = getHeaders();
      const res = await axios.get(`${baseUrl}/opd-consultation-charges`, {
        headers,
        params: { page: 1, limit: 1000, isActive: true, chargeCategoryId },
      });
      const list = normalizeList(unwrap(res));
      setConsultationCharges(list);
      return list;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    patients,
    departments,
    doctors,
    chargeCategories,
    consultationCharges,
    loading,
    error,
    refetch,
    fetchDoctors,
    fetchCharges,
  };
};

export const useSaveOpdAppointment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveAppointment = useCallback(async (payload, id) => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = getApiBaseUrl();
      const headers = getHeaders();
      const response = id
        ? await axios.put(`${baseUrl}/opd-appointments/${id}`, payload, { headers })
        : await axios.post(`${baseUrl}/opd-appointments`, payload, { headers });
      return response?.data?.result ?? response?.data?.data ?? response?.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { saveAppointment, loading, error };
};

export const useOpdAppointment = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const baseUrl = getApiBaseUrl();
    const headers = getHeaders();
    axios.get(`${baseUrl}/opd-appointments/${id}`, { headers })
      .then(res => {
        const body = res?.data;
        const record = body?.result?.data ?? body?.result ?? body?.data ?? body;
        setData(Array.isArray(record) ? record[0] : record);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};
