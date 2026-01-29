export const tokenService = {
  getAccessToken: (state) => state.auth.accessToken,
  getUserRole: (state) => state.auth.user?.role
}
