import { Request, Response } from "express";

export const getDashboard = async (req: Request, res: Response) => {
  res.json({ message: "Dashboard data" });
};
