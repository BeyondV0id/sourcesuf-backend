import { User } from "better-auth/types";

export const getUserFromLocals = (locals:Express.Locals):User =>{
  const user = locals.session?.user;
   if (!user) {
    throw new Error('User not authenticated');
  }
  return user;
}; 

