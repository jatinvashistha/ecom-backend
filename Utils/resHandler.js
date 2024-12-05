const successResponse = (res, data, message) => {
  res.status(200).json({ message: message, statusCode: 200, data: data });
};
const errorResponse = (res, message, statusCode = 400) => {
  res.status(statusCode).json({ message: message, statusCode: statusCode });
};
const internalServerError = (res, message) => {
  res.status(500).json({ message: message, statusCode: 500 });
};
const notFoundError = (res, message) => {
  res.status(404).json({ message: message, statusCode: 404 });
};
const validationError = (res, message) => {
  res.status(400).json({ message: message, statusCode: 400 });
};

const badRequestError = (res, message) => res.status(400).json({ message });
const conflictError = (res, message) => res.status(409).json({ message });


module.exports = {
  successResponse,
  errorResponse,
  internalServerError,
  notFoundError,
  validationError,
  badRequestError,
  conflictError
};
 