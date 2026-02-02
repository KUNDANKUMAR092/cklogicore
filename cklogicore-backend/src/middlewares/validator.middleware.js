const nestedObjectParser = (obj) => {
  const result = {};
  for (const key in obj) {
    const value = obj[key];

    // ✅ Already an object → copy as-is
    if (typeof value === "object" && !Array.isArray(value)) {
      result[key] = value;
      continue;
    }

    // Agar key mein dot nahi hai, seedha set karein
    if (!key.includes(".")) {
      result[key] = value;
      continue;
    }

    // Dot notation ko object mein convert karein
    const keys = key.split(".");
    keys.reduce((acc, part, index) => {
      if (index === keys.length - 1) {
        acc[part] = value;
      } else {
        acc[part] = acc[part] || {};
      }
      return acc[part];
    }, result);
  }
  return result;
};

// validator.middleware.js
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const body = req.body || {};
      const parsedBody = nestedObjectParser(body);

      const parsedData = schema.parse({
        body: parsedBody,
        query: req.query,
        params: req.params,
      });

      req.body = parsedData.body;
      next(); // <--- Confirm karein ki ye execute ho raha hai
    } catch (err) {
      // Agar validation fail ho toh 'next' ko call na karein, seedha response bhejein
      return res.status(400).json({
        success: false,
        message: err.errors?.[0]?.message || "Validation Error"
      });
    }
  };
};



// export const validate = (schema) => (req, res, next) => {
//   try {
//     const parsedBody = nestedObjectParser(req.body);
//     const parsedData = schema.parse({
//       body: parsedBody,
//       query: req.query,
//       params: req.params,
//     });
//     req.body = parsedData.body;
//     next();
//   } catch (err) {
//     next(err); 
//   }
// };