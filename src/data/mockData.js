import { parseCSV, inferOutcome } from "../utils/csvParser"
import SB_publication_PMC from "./SB_publication_PMC.csv?raw"

const parsedCSV = parseCSV(SB_publication_PMC)

console.log("Parsed CSV:", parsedCSV)

export const mockPubs = parsedCSV.map((entry) => ({
  title: entry.title,
  link: entry.link,
  year: 2025, // Placeholder year
  organism: entry.inferredOrganism || "Unknown", // Use inferred organism from CSV
  outcome: inferOutcome(entry.title) // Dynamically infer outcome from title
}))

export const organismStats = [
  { name: "Mouse", value: 8 },
  { name: "Plant", value: 6 },
  { name: "Drosophila", value: 2 },
  { name: "Human", value: 1 },
  { name: "Other", value: 3 }
]
