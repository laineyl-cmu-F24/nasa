import { parseCSV, inferOutcome, extractYear } from "../utils/csvParser"
import SB_publication_PMC_enriched from "./SB_publication_PMC_enriched.csv?raw"

const parsedCSV = parseCSV(SB_publication_PMC_enriched)

console.log("Parsed Enriched CSV:", parsedCSV)

export const mockPubs = parsedCSV.map((entry) => ({
  title: entry.title,
  link: entry.link,
  year: entry.pubDate ? parseInt(entry.pubDate) : extractYear(entry.title) || 2020,
  organism: entry.inferredOrganism || "Unknown", // Use inferred organism from CSV
  outcome: inferOutcome(entry.title), // Dynamically infer outcome from title
  author: entry.firstAuthor || "Unknown Author", // Add first author
  pmcid: entry.pmcid,
  pmid: entry.pmid,
  abstract: entry.abstract
}))
