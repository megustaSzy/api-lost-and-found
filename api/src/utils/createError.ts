interface CustomError extends Error {
  statusCode?: number;
}

export const createError = (message: string, statusCode: number): never => {
  const error: CustomError = new Error(message);
  error.statusCode = statusCode;
  throw error;
};
