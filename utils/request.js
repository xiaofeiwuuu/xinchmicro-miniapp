// 封装 uni.request 方法
const baseUrl = 'http://8.137.18.121:10000/api';

import { login } from '@/api/index'; // 引入登录方法
// import md5 from "@/utils/w_md5.js"; // 引入 MD5 加密工具

const request = (options) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: baseUrl + options.url,
			method: options.method || 'GET',
			data: options.data || {},
			header: options.header || {},
			success: (res) => {
				if (res.statusCode === 200) {
					if (res.data.status === 200) {
						resolve(res.data);
					} else {
						reject(new Error(res.data.message));
					}
				} else {
                    if (res.statusCode===401) {
						try {
							login({ 
								username: 'admin', 
								password: md5.hex_md5_32('123123') // 使用 MD5 加密密码
							}).then(res => {
								uni.setStorageSync('token', res.data); // 存储 token
							});
						} catch (error) {
							reject(new Error(error.message));
						}
					}
				}
			},
			fail: (err) => {
				reject(err);
			}
		});
	});
};

export default request;
