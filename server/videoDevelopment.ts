// Temporary development switches. Set both defaults to false before public launch.
// Environment values "true" or "false" override these defaults without a code change.
const developmentDefaults = { passwordBypass: true, unlimitedSearch: true };
export function videoPasswordBypassed() {
  return process.env.VIDEO_DEV_PASSWORD_BYPASS === undefined ? developmentDefaults.passwordBypass : process.env.VIDEO_DEV_PASSWORD_BYPASS === 'true';
}
export function videoDailyLimitBypassed() {
  return process.env.VIDEO_DEV_UNLIMITED_SEARCH === undefined ? developmentDefaults.unlimitedSearch : process.env.VIDEO_DEV_UNLIMITED_SEARCH === 'true';
}
export function videoAdminAllowed(token: string | undefined) {
  return videoPasswordBypassed() || (!!process.env.OVERVIEW_ADMIN_TOKEN && token === process.env.OVERVIEW_ADMIN_TOKEN);
}
