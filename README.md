# 🚀 NASA Bioscience Publications Dashboard

An interactive web application that leverages AI to explore, summarize, and analyze 608+ NASA bioscience publications. Built for the NASA Space Apps Challenge 2025.

![NASA GeneLab](https://img.shields.io/badge/NASA-GeneLab-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Python](https://img.shields.io/badge/Python-3.10+-green)
![License](https://img.shields.io/badge/license-MIT-green)

Project Detail Description: https://docs.google.com/document/d/1uAcnC263qhUb7thO46WZlE6nJivdbXp9iV9nPuOsbt0/edit?tab=t.0

---

## ✨ Features

### 🔍 **Intelligent Search & Filtering**
- Real-time search across titles, organisms, and outcomes
- Paginated results (7 publications per page)
- Dynamic filtering with instant feedback

### 🤖 **AI-Powered Document Summarization**
- Upload PDF/TXT files for instant AI summarization using **Google Gemini API**
- Structured output: TL;DR, Mission Objectives, Scientific Focus, Timeline, Keywords
- Fallback to local extractive summarization when offline
- Smart recommendations: Find similar publications based on uploaded content

### 📊 **Interactive Data Visualization**
- **Organism Distribution Chart**: Dynamic pie chart showing research distribution across species
- **Research Gaps Detection**: AI-generated insights identifying under-researched areas
- Top categories highlight with study counts

### 🎨 **Modern UI/UX**
- Hero section with immersive space-themed background video
- Collapsible sections with persistent state (localStorage)
- Responsive design (mobile-friendly)
- Dark theme optimized for readability

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **pdfjs-dist** - PDF parsing

### Backend
- **FastAPI** - Python API framework
- **Google Gemini API** - AI text summarization
- **CORS middleware** - Cross-origin support

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (for AI backend)
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Setup Backend (Optional - for AI summarization)

#### Create virtual environment
```bash
cd src/api
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Python dependencies
```bash
pip install -r requirements.txt
```

#### Configure API key
Create a `.env` file in `src/api/`:
```bash
GEMINI_API_KEY=your_api_key_here
```

#### Start backend server
```bash
python summarize.py
# Server will run on http://localhost:8000
```

### 3. Start Frontend
```bash
npm run dev
# App will run on http://localhost:5173
```

---

## 📁 Project Structure

```
nasa/
├── src/
│   ├── components/          # React components
│   │   ├── HeroHeader.jsx   # Hero section
│   │   ├── SearchBar.jsx    # Search input
│   │   ├── PublicationCard.jsx  # Publication display
│   │   ├── OrganismChart.jsx    # Pie chart visualization
│   │   ├── ResearchGaps.jsx     # Dynamic gap detection
│   │   ├── UploadSummarize.jsx  # AI summarization feature
│   │   └── Footer.jsx       # Footer with links
│   ├── data/
│   │   ├── SB_publication_PMC.csv         # Original dataset (608 pubs)
│   │   ├── SB_publication_PMC_enriched.csv  # Enriched with abstracts
│   │   └── mockData.js      # Parsed publication data
│   ├── utils/
│   │   ├── csvParser.js     # CSV parsing utilities
│   │   ├── summarizer.js    # Local text summarization
│   │   └── searchUtils.js   # Text similarity scoring
│   ├── hooks/
│   │   └── useSearch.js     # Search & pagination logic
│   ├── api/
│   │   ├── summarize.py     # FastAPI backend for Gemini
│   │   ├── requirements.txt # Python dependencies
│   │   └── README.md        # Backend setup guide
│   └── scripts/
│       ├── fetch_osdr.py    # Fetch abstracts from NASA OSDR
│       └── enriched_script.py  # CSV enrichment script
├── public/
│   └── galaxy_space.mp4     # Background video
└── README.md
```

---

## 🎯 Key Features Explained

### 1. Upload & Summarize
- **Upload**: Drag & drop or click to select PDF/TXT files
- **AI Processing**: Sends content to Gemini API for structured summarization
- **Fallback**: Uses local extractive summarization if API fails
- **Similarity Search**: Recommends top 5 similar publications from corpus
- **Persistent**: Summary and recommendations saved in localStorage

### 2. Research Gaps Detection
Dynamically identifies research gaps using:
- Publication count thresholds (< 10 studies)
- Temporal analysis (recent decade vs. previous)
- Timeline gaps (years without research)

### 3. Smart Search
- Tokenizes and scores text similarity
- Case-insensitive partial matching
- Searches across title, organism, and outcome fields

---

## 📊 Data Sources

- **Primary Dataset**: `SB_publication_PMC.csv` (608 NASA-funded bioscience publications)
- **Enriched Dataset**: `SB_publication_PMC_enriched.csv` (includes abstracts fetched from NASA OSDR)
- **NASA Resources**:
  - [NASA Open Science Data Repository (OSDR)](https://osdr.nasa.gov/)
  - [NASA GeneLab](https://genelab.nasa.gov/)

---

## 🔧 Configuration

### Environment Variables
Create `.env` in `src/api/`:
```
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend Configuration
Edit `src/components/UploadSummarize.jsx` to change:
- API endpoint (default: `http://localhost:8000/api/summarize`)
- Number of similar publications (default: 5)
- Max bullets in summary (default: 3)

---

## 🐛 Troubleshooting

### PDF Parsing Fails
- Ensure `pdfjs-dist` worker is loaded correctly
- Try uploading a text-based PDF (not scanned images)
- Check browser console for detailed errors

### AI Summarization Returns Fallback
- Verify backend is running (`http://localhost:8000/health`)
- Check `.env` file has valid `GEMINI_API_KEY`
- Review backend logs for API errors

### Chart Not Displaying
- Ensure CSV data is parsed correctly
- Check browser console for Recharts errors
- Verify `mockData.js` has valid organism fields

---

## 🤝 Contributing

This project was built for the NASA Space Apps Challenge. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **NASA Biological and Physical Sciences Division** for the publication dataset
- **NASA GeneLab** for open science data and APIs
- **Google Gemini** for AI summarization capabilities
- **NASA Space Apps Challenge** for the hackathon opportunity

---

## 📬 Contact

For questions or feedback, please open an issue on GitHub.

**Built with 💙 for space exploration and scientific discovery**
