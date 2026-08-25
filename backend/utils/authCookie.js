const AUTH_COOKIE_NAME = "token";
const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const getAuthCookieOptions = (includeMaxAge = true) => {
  const isProduction = process.env.NODE_ENV === "production";
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };

  if (includeMaxAge) {
    options.maxAge = AUTH_COOKIE_MAX_AGE;
  }

  return options;
};

module.exports = { AUTH_COOKIE_NAME, getAuthCookieOptions };