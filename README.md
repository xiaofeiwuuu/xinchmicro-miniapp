# 芯辰微电子微信小程序后端接口文档

## 基本信息

- **项目名称**：芯辰微电子微信小程序后端服务
- **基础URL**：https://[您的云托管域名]
- **数据格式**：所有接口均返回JSON格式数据
- **通用返回格式**：
  ```json
  {
    "code": 0,       // 0表示成功，非0表示失败
    "data": {},      // 返回的数据
    "message": ""    // 提示信息（可选）
  }
  ```

## 目录

1. [用户管理接口](#1-用户管理接口)
2. [公司信息接口](#2-公司信息接口)
3. [轮播图接口](#3-轮播图接口)
4. [文件上传接口](#4-文件上传接口)
5. [产品相关接口](#5-产品相关接口)
6. [操作日志接口](#6-操作日志接口)

## 1. 用户管理接口

### 1.1 用户登录

- **接口**：`POST /api/users/login`
- **功能**：用户登录
- **请求体**：
  ```json
  {
    "username": "admin",
    "password": "123456"
  }
  ```
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "username": "admin",
        "userType": "main"
      }
    },
    "message": "登录成功"
  }
  ```

### 1.2 创建主账号

- **接口**：`POST /api/users/main`
- **功能**：创建主账号（仅在初始化时使用）
- **请求体**：
  ```json
  {
    "username": "admin",
    "password": "123456"
  }
  ```
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "username": "admin",
      "userType": "main"
    },
    "message": "主账号创建成功"
  }
  ```

### 1.3 修改密码

- **接口**：`POST /api/users/change-password`
- **功能**：修改密码（仅主账号）
- **请求头**：需要携带 token
- **请求体**：
  ```json
  {
    "oldPassword": "123456",
    "newPassword": "654321"
  }
  ```
- **成功响应**：
  ```json
  {
    "code": 0,
    "message": "密码修改成功"
  }
  ```

### 1.4 创建子账号

- **接口**：`POST /api/users/sub`
- **功能**：创建子账号（仅主账号）
- **请求头**：需要携带 token
- **请求体**：
  ```json
  {
    "username": "operator",
    "password": "123456"
  }
  ```
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 2,
      "username": "operator",
      "userType": "sub"
    },
    "message": "子账号创建成功"
  }
  ```

### 1.5 获取用户列表

- **接口**：`GET /api/users`
- **功能**：获取用户列表（仅主账号）
- **请求头**：需要携带 token
- **查询参数**：
  - `username`：（可选）按用户名模糊查询
  - `userType`：（可选）按用户类型查询，可选值：main、sub
  - `page`：（可选）页码，默认1
  - `pageSize`：（可选）每页条数，默认20
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": {
      "total": 2,
      "list": [
        {
          "id": 1,
          "username": "admin",
          "userType": "main",
          "createdAt": "2023-01-01T00:00:00.000Z",
          "updatedAt": "2023-01-01T00:00:00.000Z"
        },
        {
          "id": 2,
          "username": "operator",
          "userType": "sub",
          "createdAt": "2023-01-02T00:00:00.000Z",
          "updatedAt": "2023-01-02T00:00:00.000Z"
        }
      ],
      "page": 1,
      "pageSize": 20,
      "totalPages": 1
    }
  }
  ```

### 1.6 获取用户详情

- **接口**：`GET /api/users/:id`
- **功能**：获取单个用户详情（仅主账号或用户本人）
- **请求头**：需要携带 token
- **路径参数**：
  - `id`：用户ID
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 2,
      "username": "operator",
      "userType": "sub",
      "createdAt": "2023-01-02T00:00:00.000Z",
      "updatedAt": "2023-01-02T00:00:00.000Z"
    }
  }
  ```

### 1.7 更新用户信息

- **接口**：`PUT /api/users/:id`
- **功能**：更新用户信息（仅主账号或用户本人）
- **请求头**：需要携带 token
- **路径参数**：
  - `id`：用户ID
- **请求体**：
  ```json
  {
    "username": "new_operator"
  }
  ```
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 2,
      "username": "new_operator",
      "userType": "sub"
    },
    "message": "用户信息更新成功"
  }
  ```

### 1.8 删除用户

- **接口**：`DELETE /api/users/:id`
- **功能**：删除用户（仅主账号，且不能删除自己）
- **请求头**：需要携带 token
- **路径参数**：
  - `id`：用户ID
- **成功响应**：
  ```json
  {
    "code": 0,
    "message": "用户删除成功"
  }
  ```

### 1.9 重置用户密码

- **接口**：`POST /api/users/:id/reset-password`
- **功能**：重置用户密码（仅主账号）
- **请求头**：需要携带 token
- **路径参数**：
  - `id`：用户ID
- **请求体**：
  ```json
  {
    "newPassword": "123456"
  }
  ```
- **成功响应**：
  ```json
  {
    "code": 0,
    "message": "密码重置成功"
  }
  ```

## 2. 公司信息接口

### 2.1 获取公司信息

- **接口**：`GET /api/company`
- **功能**：获取公司信息
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "name": "公司名称",
      "description": "公司介绍",
      "contacts": ["联系方式1", "联系方式2"],
      "email": "example@company.com",
      "website": "https://www.company.com",
      "address": "公司地址",
      "logoUrl": "https://xxx.com/logo.png",
      "logoFileID": "cloud://xxx/logo.png",
      "safetyManualUrl": "https://xxx.com/manual.pdf",
      "safetyManualFileID": "cloud://xxx/manual.pdf"
    }
  }
  ```

### 2.2 更新公司信息

- **接口**：`PUT /api/company`
- **功能**：更新公司信息
- **请求头**：需要携带 token
- **请求体**：
  ```json
  {
    "name": "公司名称",
    "description": "公司介绍",
    "contacts": ["联系方式1", "联系方式2"],
    "email": "example@company.com",
    "website": "https://www.company.com",
    "address": "公司地址",
    "logoUrl": "https://xxx.com/logo.png",
    "logoFileID": "cloud://xxx/logo.png",
    "safetyManualUrl": "https://xxx.com/manual.pdf",
    "safetyManualFileID": "cloud://xxx/manual.pdf"
  }
  ```
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "name": "公司名称",
      "description": "公司介绍",
      "contacts": ["联系方式1", "联系方式2"],
      "email": "example@company.com",
      "website": "https://www.company.com",
      "address": "公司地址",
      "logoUrl": "https://xxx.com/logo.png",
      "logoFileID": "cloud://xxx/logo.png",
      "safetyManualUrl": "https://xxx.com/manual.pdf",
      "safetyManualFileID": "cloud://xxx/manual.pdf"
    },
    "message": "公司信息更新成功"
  }
  ```

## 3. 轮播图接口

### 3.1 获取轮播图列表

- **接口**：`GET /api/carousels`
- **功能**：获取轮播图列表
- **查询参数**：
  - `status`：（可选）轮播图状态，可选值：active、inactive
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": [
      {
        "id": 1,
        "title": "轮播图标题",
        "imageUrl": "https://xxx.com/image.jpg",
        "fileID": "cloud://xxx/image.jpg",
        "order": 0,
        "link": "https://xxx.com",
        "status": "active",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

### 3.2 创建轮播图

- **接口**：`POST /api/carousels`
- **功能**：创建新的轮播图
- **请求头**：需要携带 token
- **请求体**：
  ```json
  {
    "title": "轮播图标题",
    "imageUrl": "https://xxx.com/image.jpg",
    "fileID": "cloud://xxx/image.jpg",
    "order": 0,
    "link": "https://xxx.com",
    "status": "active"
  }
  ```
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "title": "轮播图标题",
      "imageUrl": "https://xxx.com/image.jpg",
      "fileID": "cloud://xxx/image.jpg",
      "order": 0,
      "link": "https://xxx.com",
      "status": "active",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "message": "轮播图创建成功"
  }
  ```

### 3.3 更新轮播图

- **接口**：`PUT /api/carousels/:id`
- **功能**：更新轮播图
- **请求头**：需要携带 token
- **路径参数**：
  - `id`：轮播图ID
- **请求体**：
  ```json
  {
    "title": "新标题",
    "imageUrl": "https://xxx.com/new-image.jpg",
    "fileID": "cloud://xxx/new-image.jpg",
    "order": 1,
    "link": "https://xxx.com/new",
    "status": "inactive"
  }
  ```
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "title": "新标题",
      "imageUrl": "https://xxx.com/new-image.jpg",
      "fileID": "cloud://xxx/new-image.jpg",
      "order": 1,
      "link": "https://xxx.com/new",
      "status": "inactive",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "message": "轮播图更新成功"
  }
  ```

### 3.4 删除轮播图

- **接口**：`DELETE /api/carousels/:id`
- **功能**：删除轮播图
- **请求头**：需要携带 token
- **路径参数**：
  - `id`：轮播图ID
- **成功响应**：
  ```json
  {
    "code": 0,
    "message": "轮播图删除成功"
  }
  ```

### 3.5 批量更新轮播图顺序

- **接口**：`PUT /api/carousels/order/batch`
- **功能**：批量更新轮播图顺序
- **请求头**：需要携带 token
- **请求体**：
  ```json
  {
    "orders": [
      {"id": 1, "order": 0},
      {"id": 2, "order": 1},
      {"id": 3, "order": 2}
    ]
  }
  ```
- **成功响应**：
  ```json
  {
    "code": 0,
    "message": "轮播图顺序更新成功"
  }
  ```

## 4. 文件上传接口

### 4.1 获取文件上传授权

- **接口**：`POST /api/chunk-uploads/auth`
- **功能**：获取微信云存储上传文件的授权信息
- **请求头**：需要携带 token
- **请求体**：
  ```json
  {
    "path": "test.pdf"  // 可选，用于获取文件扩展名
  }
  ```
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": {
      "url": "https://api.weixin.qq.com/...",  // 上传地址
      "token": "xxx",                          // 上传token
      "authorization": "xxx",                   // 上传授权信息
      "file_id": "cloud://xxx/web/files/timestamp.pdf",  // 文件ID
      "cos_file_id": "xxx",                    // 腾讯云文件ID
      "key": "xxx"                             // 文件密钥
    },
    "message": "获取上传授权成功"
  }
  ```

## 5. 产品相关接口

### 5.1 获取产品列表

- **接口**：`GET /api/products`
- **功能**：获取产品列表
- **查询参数**：
  - `name`：（可选）按名称模糊查询
  - `catalogId`：（可选）按目录ID查询
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": [
      {
        "id": 1,
        "name": "产品名称",
        "catalogId": 1,
        "parameters": {
          "参数1": "值1",
          "参数2": "值2"
        },
        "pdfUrl": "/uploads/pdfs/1234567890-file.pdf",
        "fileID": "cloud://xxx/pdfs/1234567890-file.pdf",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z",
        "catalog": {
          "id": 1,
          "name": "目录名称",
          "paramTitles": ["参数1", "参数2"],
          "category": {
            "id": 1,
            "name": "分类名称"
          }
        }
      }
    ]
  }
  ```

### 5.2 获取单个产品

- **接口**：`GET /api/products/:id`
- **功能**：获取单个产品详情
- **路径参数**：
  - `id`：产品ID
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "name": "产品名称",
      "catalogId": 1,
      "parameters": {
        "参数1": "值1",
        "参数2": "值2"
      },
      "pdfUrl": "/uploads/pdfs/1234567890-file.pdf",
      "fileID": "cloud://xxx/pdfs/1234567890-file.pdf",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "catalog": {
        "id": 1,
        "name": "目录名称",
        "paramTitles": ["参数1", "参数2"],
        "category": {
          "id": 1,
          "name": "分类名称"
        }
      }
    }
  }
  ```

### 5.3 创建产品

- **接口**：`POST /api/products`
- **功能**：创建新产品
- **请求头**：需要携带 token
- **请求体**：
  ```json
  {
    "name": "产品名称",
    "catalogId": 1,
    "parameters": {
      "参数1": "值1",
      "参数2": "值2"
    },
    "pdfUrl": "/uploads/pdfs/1234567890-file.pdf",
    "fileID": "cloud://xxx/pdfs/1234567890-file.pdf"
  }
  ```
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "name": "产品名称",
      "catalogId": 1,
      "parameters": {
        "参数1": "值1",
        "参数2": "值2"
      },
      "pdfUrl": "/uploads/pdfs/1234567890-file.pdf",
      "fileID": "cloud://xxx/pdfs/1234567890-file.pdf",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "message": "产品创建成功"
  }
  ```

### 5.4 更新产品

- **接口**：`PUT /api/products/:id`
- **功能**：更新产品信息
- **请求头**：需要携带 token
- **路径参数**：
  - `id`：产品ID
- **请求体**：
  ```json
  {
    "name": "新产品名称",
    "catalogId": 1,
    "parameters": {
      "参数1": "新值1",
      "参数2": "新值2"
    },
    "pdfUrl": "/uploads/pdfs/9876543210-file.pdf",
    "fileID": "cloud://xxx/pdfs/9876543210-file.pdf"
  }
  ```
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 1,
      "name": "新产品名称",
      "catalogId": 1,
      "parameters": {
        "参数1": "新值1",
        "参数2": "新值2"
      },
      "pdfUrl": "/uploads/pdfs/9876543210-file.pdf",
      "fileID": "cloud://xxx/pdfs/9876543210-file.pdf",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "message": "产品更新成功"
  }
  ```

### 5.5 删除产品

- **接口**：`DELETE /api/products/:id`
- **功能**：删除产品
- **请求头**：需要携带 token
- **路径参数**：
  - `id`：产品ID
- **成功响应**：
  ```json
  {
    "code": 0,
    "message": "产品删除成功"
  }
  ```

## 6. 操作日志接口

### 6.1 获取日志列表

- **接口**：`GET /api/logs`
- **功能**：获取操作日志列表
- **请求头**：需要携带 token
- **查询参数**：
  - `username`：（可选）按用户名模糊查询
  - `action`：（可选）按操作类型查询
  - `startDate`：（可选）开始日期，格式：YYYY-MM-DD
  - `endDate`：（可选）结束日期，格式：YYYY-MM-DD
  - `page`：（可选）页码，默认1
  - `pageSize`：（可选）每页条数，默认20
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": {
      "total": 100,
      "list": [
        {
          "id": 1,
          "userId": 1,
          "username": "admin",
          "userType": "main",
          "method": "POST",
          "path": "/api/products",
          "action": "创建产品",
          "params": "{\"query\":{},\"body\":{\"name\":\"测试产品\"}}",
          "ip": "127.0.0.1",
          "status": 200,
          "error": null,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "page": 1,
      "pageSize": 20,
      "totalPages": 5
    }
  }
  ```

### 6.2 获取操作类型列表

- **接口**：`GET /api/logs/actions`
- **功能**：获取所有操作类型
- **请求头**：需要携带 token
- **成功响应**：
  ```json
  {
    "code": 0,
    "data": [
      "用户登录",
      "创建产品",
      "更新产品",
      "删除产品",
      "更新公司信息"
    ]
  }
  ```

## 错误码说明

- **0**: 成功
- **-1**: 一般错误
- **400**: 请求参数错误
- **404**: 资源不存在
- **500**: 服务器内部错误

## 注意事项

1. 所有接口均返回JSON格式数据
2. 产品分类、产品目录和产品详情接口均不支持分页，直接返回所有数据
3. 文件上传说明：
   - 文件大小限制：20MB
   - 支持的文件类型：PDF、Word、Excel 等常用文档格式
   - 上传前需要先调用授权接口获取授权信息
   - 文件上传直接使用微信云存储接口，无需通过后端服务器中转
4. 接口调用频率限制：
   - 普通接口：100次/分钟
   - 文件上传授权：10次/分钟