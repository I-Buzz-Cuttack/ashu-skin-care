import prisma from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listResult, single, noContent } from "../utils/response.js";

export const getDesignations = asyncHandler(async (req, res) => {
  const data = await prisma.designation.findMany({ orderBy: { name: "asc" } });
  return listResult(res, data);
});

export const createDesignation = asyncHandler(async (req, res) => {
  const designation = await prisma.designation.create({ data: req.body });
  return single(res, designation, 201);
});

export const updateDesignation = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  delete body.id;
  const designation = await prisma.designation.update({ where: { id: req.params.id }, data: body });
  return single(res, designation);
});

export const deleteDesignation = asyncHandler(async (req, res) => {
  await prisma.designation.delete({ where: { id: req.params.id } });
  return noContent(res);
});
