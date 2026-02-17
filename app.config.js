module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      API_BASE_URL:
        process.env.API_BASE_URL || "https://portionist.up.railway.app",
    },
  };
};
