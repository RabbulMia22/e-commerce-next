import axios from "axios";

const useAxios = () => {
    const axiosSecure = axios.create({
        baseURL: "/api",
        withCredentials: true,
    });

    return axiosSecure;
};

export default useAxios;