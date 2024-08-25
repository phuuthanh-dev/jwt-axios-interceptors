import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { API_ROOT } from '~/utils/constants'

export const handleLogoutAPI = async () => {
  // Trường hợp 1: Dùng localStorage -> Xóa token trong localStorage
  localStorage.removeItem('userInfo')
  // localStorage.removeItem('accessToken')
  // localStorage.removeItem('refreshToken')

  // Trường hợp 2: Dùng http only cookie -> Gọi api để xóa cookie
  return await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/logout`)
}

export const refreshTokenAPI = async () => {
  return await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/refresh_token`)
}