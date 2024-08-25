// Author: TrungQuanDev: https://youtube.com/@trungquandev
import axios from 'axios'
import { toast } from 'react-toastify'
import { handleLogoutAPI, refreshTokenAPI } from '~/apis'

// Khởi tạo một đối tượng Axios (authorizedAxiosInstance) mục đích cấu hình chung cho dự án

let authorizedAxiosInstance = axios.create()

// Thời gian chờ tối đa của 1 request là 10p
authorizedAxiosInstance.defaults.timeout = 10 * 60 * 1000
// withCredentials: true giúp axios tự động đính kèm và gửi cookie của client lên server
authorizedAxiosInstance.defaults.withCredentials = true

// Cấu hình interceptors cho axios instance
// https://axios-http.com/docs/interceptors

// Can thiệp vào giữa những request gửi đi
authorizedAxiosInstance.interceptors.request.use((config) => {
  // Lấy accessToken từ localStorage đính kèm vào header Authorization
  // const accessToken = localStorage.getItem('accessToken')
  // if (accessToken) {
  //   config.headers.Authorization = `Bearer ${accessToken}`
  // }

  return config
}, (error) => {
  // Do something with request error
  return Promise.reject(error)
})

// Khởi tạo một biến promise để lưu lại request refresh token
// Mục đích tạo Promise này là khi nhận yêu cầu refresh token đầu tiên thì hold lại việc gọi refresh token
// cho đến khi request refresh token đó trả về kết quả, sau đó mới thực hiện các request khác
let refreshTokenPromise = null

// Can thiệp vào giữa những response trả về
authorizedAxiosInstance.interceptors.response.use((response) => {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Mọi mã http status nằm trong khoảng 2xx sẽ chạy vào đây
  // Do something with response data
  return response
}, (error) => {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Mọi mã http status ngoài 2xx sẽ chạy vào đây
  // Do something with response error

  // Xử lí refresh token tự động
  // Nếu như nhận mã 401 (UNAUTHORIZED) từ server thì logout luôn
  if (error.response?.status === 401) {
    handleLogoutAPI().then(() => {
      // Redirect to login page
      location.href = '/login'
    })
  }

  // Xử lí lỗi 410 (Gone) để refresh token
  // Đầu tiên lấy được request API đang bị lỗi thông qua error.config
  const originalRequest = error.config
  if (error.response?.status === 410 && originalRequest) {
    if (!refreshTokenPromise) {
      // Lấy refresh token từ localStorage
    // const refreshToken = localStorage.getItem('refreshToken')

      // Gọi API refresh token
      // return refreshTokenAPI(refreshToken)
      refreshTokenPromise = refreshTokenAPI()
        .then(() => {
        // Nếu refresh token thành công thì lưu lại token mới vào localStorage (cho trường hợp localStorage)
        // localStorage.setItem('accessToken', res.data.accessToken)
        // authorizedAxiosInstance.defaults.headers.Authorization = `Bearer ${res.data.accessToken}`

          // Đồng thời accessToken cũng đã được update ở cookie (cho trường hợp http only cookie)
        })
        .catch((_error) => {
          handleLogoutAPI().then(() => {
          // Redirect to login page
            location.href = '/login'
          })
          return Promise.reject(_error)
        })
        .finally(() => {
          refreshTokenPromise = null
        })
    }

    // Cuối cùng trả về refresh token promise trong trường hợp success ở đây
    return refreshTokenPromise.then(() => {
      // Quan trọng: return lại axios instance để thực hiện lại request ban đầu bị lỗi
      return authorizedAxiosInstance(originalRequest)
    })
  }

  // Xử lí tập trung lỗi trả về từ mọi API ở đây
  // Ngoại trừ lỗi 410 (Gone) vì đây là để xử lí refresh token
  if (error.response?.status !== 410) {
    toast.error(error.response?.data?.message || error?.message)
  }
  return Promise.reject(error)
})

export default authorizedAxiosInstance