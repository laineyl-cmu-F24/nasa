import { useState, useEffect } from "react"
import { fetchResearchGaps, fetchResearchGapsBySearch } from "../services/api"
import { mockResearchGaps } from "../data/mockData"

export function useResearchGaps(searchQuery = '') {
  const [gaps, setGaps] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadGaps = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // 在实际应用中，这里会调用真实的API
        // const data = searchQuery 
        //   ? await fetchResearchGapsBySearch(searchQuery)
        //   : await fetchResearchGaps()
        
        // 目前使用模拟数据
        let data = mockResearchGaps
        
        // 如果有搜索查询，过滤数据
        if (searchQuery) {
          data = mockResearchGaps.filter(gap => 
            gap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            gap.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            gap.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }
        
        setGaps(data)
      } catch (err) {
        setError(err.message)
        // 在API失败时使用模拟数据作为后备
        setGaps(mockResearchGaps)
      } finally {
        setLoading(false)
      }
    }

    loadGaps()
  }, [searchQuery])

  return {
    gaps,
    loading,
    error,
    refetch: () => {
      const loadGaps = async () => {
        setLoading(true)
        setError(null)
        
        try {
          // 在实际应用中，这里会调用真实的API
          // const data = searchQuery 
          //   ? await fetchResearchGapsBySearch(searchQuery)
          //   : await fetchResearchGaps()
          
          setGaps(mockResearchGaps)
        } catch (err) {
          setError(err.message)
          setGaps(mockResearchGaps)
        } finally {
          setLoading(false)
        }
      }
      loadGaps()
    }
  }
}
