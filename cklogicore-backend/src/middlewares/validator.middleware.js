// src/middleware/validator.middleware.js

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    // Ye error seedha Global Error Handler (app.js wala) pakad lega
    next(err); 
  }
};