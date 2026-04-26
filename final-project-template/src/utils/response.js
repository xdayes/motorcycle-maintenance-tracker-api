export function badRequest(res, message = 'Bad Request') {
  return res.status(400).json({ error: message });
}

export function unauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({ error: message });
}

export function forbidden(res, message = 'Forbidden') {
  return res.status(403).json({ error: message });
}

export function notFound(res, message = 'Not Found') {
  return res.status(404).json({ error: message });
}

export function conflict(res, message = 'Conflict') {
  return res.status(409).json({ error: message });
}

export function serverError(res, message = 'Internal Server Error') {
  return res.status(500).json({ error: message });
}

export function parsePositiveId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}
