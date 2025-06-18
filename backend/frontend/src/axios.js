import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:8000/api',
})

const token = localStorage.getItem('api_token')
if (token) {
  instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default instance
