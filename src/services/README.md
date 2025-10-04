# API服务配置

## 环境变量配置

创建 `.env` 文件在项目根目录，添加以下配置：

```env
# API配置
REACT_APP_API_URL=http://localhost:8000/api

# 开发环境配置
REACT_APP_ENV=development
```

## 后端API端点

### 出版物相关
- `GET /api/publications` - 获取所有出版物
- `GET /api/publications?search={query}` - 搜索出版物

### 统计数据
- `GET /api/stats/organisms` - 获取生物体分布统计

### 研究空白
- `GET /api/research-gaps` - 获取所有研究空白
- `GET /api/research-gaps?search={query}` - 搜索研究空白
- `GET /api/research-gaps?type={type}` - 按类型筛选
- `GET /api/research-gaps?severity={severity}` - 按严重程度筛选
- `POST /api/research-gaps` - 创建新的研究空白
- `PUT /api/research-gaps/{id}` - 更新研究空白
- `DELETE /api/research-gaps/{id}` - 删除研究空白

## 数据结构

### 研究空白数据结构
```javascript
{
  id: number,
  type: "temporal" | "methodological" | "duration" | "other",
  icon: string,
  title: string,
  description: string,
  severity: "high" | "medium" | "low",
  category: string
}
```

## 使用说明

1. 确保后端API服务正在运行
2. 配置正确的API URL
3. 在 `useResearchGaps` hook中取消注释API调用代码
4. 注释掉模拟数据的使用
