// API服务文件 - 用于与后端连接
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'

// 通用API请求函数
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// 获取出版物数据
export async function fetchPublications(searchQuery = '') {
  const endpoint = searchQuery 
    ? `/publications?search=${encodeURIComponent(searchQuery)}`
    : '/publications'
  
  return apiRequest(endpoint)
}

// 获取生物体统计数据
export async function fetchOrganismStats() {
  return apiRequest('/stats/organisms')
}

// 获取研究空白数据
export async function fetchResearchGaps() {
  return apiRequest('/research-gaps')
}

// 根据搜索条件获取研究空白
export async function fetchResearchGapsBySearch(searchQuery) {
  const endpoint = `/research-gaps?search=${encodeURIComponent(searchQuery)}`
  return apiRequest(endpoint)
}

// 获取特定类型的研究空白
export async function fetchResearchGapsByType(type) {
  return apiRequest(`/research-gaps?type=${type}`)
}

// 获取特定严重程度的研究空白
export async function fetchResearchGapsBySeverity(severity) {
  return apiRequest(`/research-gaps?severity=${severity}`)
}

// 提交新的研究空白
export async function submitResearchGap(gapData) {
  return apiRequest('/research-gaps', {
    method: 'POST',
    body: JSON.stringify(gapData),
  })
}

// 更新研究空白
export async function updateResearchGap(id, gapData) {
  return apiRequest(`/research-gaps/${id}`, {
    method: 'PUT',
    body: JSON.stringify(gapData),
  })
}

// 删除研究空白
export async function deleteResearchGap(id) {
  return apiRequest(`/research-gaps/${id}`, {
    method: 'DELETE',
  })
}
