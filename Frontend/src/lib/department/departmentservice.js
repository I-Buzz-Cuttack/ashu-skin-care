/**
 * departmentService.js
 *
 * Thin service layer that wraps departmentApi RTK Query hooks.
 * Components import from here — not directly from the API slice —
 * so any future caching / transformation logic lives in one place.
 *
 * Usage:
 *   import { useDepartments } from '@services/departmentService';
 */

import {
  useCreateDepartmentMutation,
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useUpdateDepartmentMutation,
  usePatchDepartmentMutation,
  useDeleteDepartmentMutation,
} from '@store/api/departmentApi/department';

// ── Types / constants ─────────────────────────────────────────────────────────

/**
 * Enum-like map for department_type (mirrors Prisma schema).
 * Keep in sync with the backend `department_type` enum.
 */
export const DEPARTMENT_TYPES = [
  'clinical',
  'diagnostic',
  'surgical',
  'administrative',
];

// ── Read hooks ────────────────────────────────────────────────────────────────

/**
 * Fetch paginated / filtered departments.
 *
 * @param {object}  params
 * @param {string}  [params.hospital_id]  - Filter by hospital (required in multi-tenant setup)
 * @param {string}  [params.search]       - Name search string
 * @param {string}  [params.type]         - department_type filter
 * @param {boolean} [params.is_active]    - Active status filter
 * @param {boolean} [params.skip]         - Skip the query entirely
 *
 * @returns RTK Query result object
 *   { data, isLoading, isFetching, isError, error, refetch }
 */
export const useDepartments = ({ skip = false, ...params } = {}) =>
  useGetDepartmentsQuery(params, { skip });

/**
 * Fetch a single department by ID.
 *
 * @param {string} id - Department UUID
 * @returns RTK Query result object
 */
export const useDepartment = (id) =>
  useGetDepartmentByIdQuery(id, { skip: !id });

// ── Mutation hooks ────────────────────────────────────────────────────────────

/**
 * Create a new department.
 *
 * Payload shape (matches POST /api/department):
 * {
 *   hospital_id:    string   (required)
 *   name:           string   (required)
 *   code:           string   (required, max 20)
 *   type:           department_type
 *   head_doctor_id: bigint | null
 *   is_active:      boolean  (default true)
 * }
 *
 * @returns [createDepartment, { isLoading, isError, error, reset }]
 */
export const useCreateDepartment = () => useCreateDepartmentMutation();

/**
 * Full update (PUT) — replace entire department record.
 * Payload: { id, ...fields }
 *
 * @returns [updateDepartment, mutationState]
 */
export const useUpdateDepartment = () => useUpdateDepartmentMutation();

/**
 * Partial update (PATCH) — update only provided fields.
 * Payload: { id, ...partialFields }
 *
 * @returns [patchDepartment, mutationState]
 */
export const usePatchDepartment = () => usePatchDepartmentMutation();

/**
 * Delete a department by ID.
 *
 * @returns [deleteDepartment, mutationState]
 */
export const useDeleteDepartment = () => useDeleteDepartmentMutation();

// ── Convenience: toggle active status ─────────────────────────────────────────

/**
 * Returns a ready-to-call toggle function that PATCHes is_active.
 *
 * @example
 *   const toggleActive = useToggleDepartmentStatus();
 *   await toggleActive(row.id, row.is_active);
 */
export const useToggleDepartmentStatus = () => {
  const [patch] = usePatchDepartmentMutation();
  return (id, currentStatus) =>
    patch({ id, is_active: !currentStatus }).unwrap();
};