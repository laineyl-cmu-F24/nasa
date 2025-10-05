export function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/)
  const headers = lines[0].split(',')
  const data = []
  
  let i = 1
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }

    const values = []
    let currentValue = ''
    let inQuotes = false
    let currentLine = line

    // 处理可能跨多行的字段
    while (i < lines.length) {
      const lineToProcess = lines[i]
      
      for (let j = 0; j < lineToProcess.length; j++) {
        const char = lineToProcess[j]

        if (char === '"') {
          if (j > 0 && lineToProcess[j - 1] === '"') {
            // 处理转义的引号 ""
            currentValue += '"'
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim())
          currentValue = ''
        } else {
          currentValue += char
        }
      }
      
      // 如果当前行在引号内结束，需要继续读取下一行
      if (inQuotes) {
        currentValue += '\n'
        i++
      } else {
        // 当前行处理完毕，跳出循环
        break
      }
    }
    
    // 添加最后一个字段
    values.push(currentValue.trim())

    if (values.length >= 8) {
      data.push({
        title: values[0].replace(/^"|"$/g, ''),
        link: values[1].replace(/^"|"$/g, ''),
        inferredOrganism: values[2].replace(/^"|"$/g, ''),
        pmcid: values[3].replace(/^"|"$/g, ''),
        pmid: values[4].replace(/^"|"$/g, ''),
        pubDate: values[5].replace(/^"|"$/g, ''),
        firstAuthor: values[6].replace(/^"|"$/g, ''),
        abstract: values[7].replace(/^"|"$/g, '')
      })
    }
    
    i++
  }

  return data
}

// 从标题中提取年份
export function extractYear(title) {
  const yearMatch = title.match(/\b(19|20)\d{2}\b/)
  return yearMatch ? parseInt(yearMatch[0]) : null
}

// 从标题中推断生物体类型
export function inferOrganism(title) {
  const titleLower = title.toLowerCase()

  if (titleLower.includes('mouse') || titleLower.includes('mice') || titleLower.includes('murine')) {
    return 'Mouse'
  } else if (titleLower.includes('human') || titleLower.includes('astronaut') || titleLower.includes('crew')) {
    return 'Human'
  } else if (titleLower.includes('plant') || titleLower.includes('arabidopsis') || titleLower.includes('seedling') || titleLower.includes('root')) {
    return 'Plant'
  } else if (titleLower.includes('drosophila') || titleLower.includes('fly') || titleLower.includes('insect')) {
    return 'Drosophila'
  } else if (titleLower.includes('rat') || titleLower.includes('rodent')) {
    return 'Rat'
  } else if (titleLower.includes('bacteria') || titleLower.includes('microbial') || titleLower.includes('staphylococcus') || titleLower.includes('pseudomonas')) {
    return 'Bacteria'
  } else if (titleLower.includes('yeast') || titleLower.includes('candida')) {
    return 'Yeast'
  } else if (titleLower.includes('c. elegans') || titleLower.includes('nematode')) {
    return 'C. elegans'
  } else {
    return 'Other'
  }
}

// 从标题中推断研究结果
export function inferOutcome(title) {
  const titleLower = title.toLowerCase()

  if (titleLower.includes('bone') || titleLower.includes('skeletal') || titleLower.includes('osteoporosis')) {
    return 'Bone loss/remodeling'
  } else if (titleLower.includes('immune') || titleLower.includes('immunity') || titleLower.includes('lymphocyte')) {
    return 'Immune system changes'
  } else if (titleLower.includes('muscle') || titleLower.includes('atrophy') || titleLower.includes('sarcopenia')) {
    return 'Muscle atrophy'
  } else if (titleLower.includes('cardiovascular') || titleLower.includes('heart') || titleLower.includes('cardiac')) {
    return 'Cardiovascular changes'
  } else if (titleLower.includes('radiation') || titleLower.includes('dna') || titleLower.includes('genomic')) {
    return 'Radiation effects'
  } else if (titleLower.includes('microgravity') || titleLower.includes('gravity')) {
    return 'Microgravity effects'
  } else if (titleLower.includes('growth') || titleLower.includes('development') || titleLower.includes('morphology')) {
    return 'Growth/development changes'
  } else if (titleLower.includes('metabolism') || titleLower.includes('metabolic')) {
    return 'Metabolic changes'
  } else if (titleLower.includes('stress') || titleLower.includes('oxidative')) {
    return 'Stress response'
  } else {
    return 'General spaceflight effects'
  }
}

// Added default export for the module
export default {
  parseCSV,
  extractYear,
  inferOrganism,
  inferOutcome
}
