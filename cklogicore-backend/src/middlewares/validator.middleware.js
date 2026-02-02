// src/middleware/validator.middleware.js

export const validate = (schema) => (req, res, next) => {
  try {
    const parsedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.body = parsedData.body;
 
    next();
  } catch (err) {
    next(err); 
  }
};