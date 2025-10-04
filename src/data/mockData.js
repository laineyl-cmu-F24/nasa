export const mockPubs = [
  {
    title: "Effect of Microgravity on Bone Density in Mice",
    year: 2018,
    organism: "Mouse",
    outcome: "Bone loss",
    link: "https://pmc.ncbi.nlm.nih.gov/example1"
  },
  {
    title: "Immune Dysregulation in Astronauts after Long Duration Missions",
    year: 2020,
    organism: "Human",
    outcome: "Immune dysregulation",
    link: "https://pmc.ncbi.nlm.nih.gov/example2"
  },
  {
    title: "Root Growth in Arabidopsis Under Spaceflight Conditions",
    year: 2021,
    organism: "Plant",
    outcome: "Reduced root elongation",
    link: "https://pmc.ncbi.nlm.nih.gov/example3"
  },
]

export const organismStats = [
  { name: "Human", value: 12 },
  { name: "Mouse", value: 20 },
  { name: "Plant", value: 8 },
]

export const mockResearchGaps = [
  {
    id: 1,
    type: "temporal",
    icon: "📉",
    title: "Few studies on plants after 2021",
    description: "potential gap for Mars agriculture",
    severity: "medium",
    category: "Plant Biology"
  },
  {
    id: 2,
    type: "methodological",
    icon: "⚠️",
    title: "Limited combined radiation + microgravity studies",
    description: "Most studies focus on single stress factors",
    severity: "high",
    category: "Space Environment"
  },
  {
    id: 3,
    type: "duration",
    icon: "🧬",
    title: "Sparse long-duration (>180 days) immune system data",
    description: "Limited data for extended space missions",
    severity: "high",
    category: "Human Physiology"
  }
]
