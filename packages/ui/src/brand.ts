/**
 * Project-wide brand asset paths, relative to each application's own origin.
 *
 * Every MFE keeps its own copy of these files in `public/images/` (each app
 * deploys independently), but the path literal lives here once. Owning
 * applications wrap the constant with their own `withBasePath()` before
 * handing it to the chrome; the shell, mounted at `/`, uses it as-is.
 */
export const BRAND_LOGO_SRC = "/images/xlsmart-logo.png";
export const BRAND_AVATAR_SRC = "/images/photo-profile.jpeg";
