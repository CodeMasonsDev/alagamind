import axios from "axios";
import { BASEURL } from "./base";

const axiosInstance = axios.create({
  baseURL: BASEURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
