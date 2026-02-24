import { Request, Response } from "express";

export const getMe = (req: Request, res: Response) => {
  res.json({ user: req.user });
};

export const updateMe = (req: Request, res: Response) => {
  // req.user is set by authenticate middleware
  const user = req.user as any;

  const { first_name, last_name, phone } = req.body;

  if (first_name !== undefined) user.first_name = first_name;
  if (last_name !== undefined) user.last_name = last_name;
  if (phone !== undefined) user.phone = phone;

  // If you use a real DB model, replace this with user.save()
  // For example: await UserModel.findByIdAndUpdate(user.id, { first_name, last_name, phone }, { new: true })

  res.json({ user });
};
