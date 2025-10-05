import re,time,random,csv,requests,pandas as pd

SRC="src/data/SB_publication_PMC.csv"
OUT="src/data/SB_publication_PMC_enriched.csv"
EMAIL=""
TOOL="pmc_meta_enricher"
API_TIMEOUT=30
SLEEP=0.34
MAX_RETRY=3

print(f"[DEBUG] reading CSV: {SRC}")
try:
    df=pd.read_csv(SRC)
    print(f"[DEBUG] df.shape={df.shape}")
    print(f"[DEBUG] df.columns={list(df.columns)}")
except Exception as e:
    print("[ERROR] read_csv failed:", e); sys.exit(1)

S=requests.Session()
S.headers.update({"User-Agent":"Mozilla/5.0 (MetaFetcher/1.0)","Accept":"*/*","Accept-Language":"en-US,en;q=0.9"})

def sleep(): time.sleep(SLEEP+random.random()*0.05)

def pmcid_from(url,v):
    if isinstance(v,str) and v.strip():
        return v.strip()
    m=re.search(r'PMC(\d+)',str(url) if url is not None else "")
    if m: return "PMC"+m.group(1)
    return ""

def req(url,params,tag):
    for i in range(1,MAX_RETRY+1):
        try:
            r=S.get(url,params=params,timeout=API_TIMEOUT)
            print(f"[DEBUG] {tag} GET {r.url} status={r.status_code}")
            r.raise_for_status()
            return r
        except Exception as ex:
            print(f"[WARN] {tag} attempt {i} failed: {ex}")
            if hasattr(ex,"response") and getattr(ex.response,"status_code",None) in (429,500,502,503,504):
                time.sleep(1.2*i)
            else:
                time.sleep(0.6*i)
    raise RuntimeError(f"{tag} failed after {MAX_RETRY} attempts")

def elink_pmc_to_pmid(pmcid):
    if not pmcid:
        return ""
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi"
    p = {
        "dbfrom": "pmc",
        "db": "pubmed",
        "id": pmcid.replace("PMC", ""),
        "retmode": "json",
        "email": EMAIL,
        "tool": TOOL,
    }
    r = req(url, p, "ELink")
    j = r.json()
    linksets = j.get("linksets", [])
    if not linksets:
        return ""
    ldbs = linksets[0].get("linksetdbs", [])
    def pick_id(entry):
        links = entry.get("links", [])
        if not links:
            return ""
        first = links[0]
        if isinstance(first, dict):
            return str(first.get("id", "")) or ""
        return str(first)
    for e in ldbs:
        if e.get("dbto") == "pubmed" and e.get("linkname") == "pmc_pubmed":
            pmid = pick_id(e)
            if pmid:
                return pmid
    for e in ldbs:
        if e.get("dbto") == "pubmed":
            pmid = pick_id(e)
            if pmid:
                return pmid
    return ""

def esummary_pub_fields(pmid):
    if not pmid: return "",""
    url="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
    p={"db":"pubmed","id":pmid,"retmode":"json","email":EMAIL,"tool":TOOL}
    r=req(url,p,"ESummary")
    d=""; fa=""
    try:
        j=r.json()
        it=j.get("result",{}).get(str(pmid),{})
        d=it.get("pubdate") or it.get("epubdate") or ""
        a=it.get("authors") or []
        if isinstance(a,list) and a:
            a0=a[0]
            if isinstance(a0,dict): fa=a0.get("name") or ""
            elif isinstance(a0,str): fa=a0
        print(f"[DEBUG] ESummary PMID={pmid} pub_date='{d}' first_author='{fa}'")
    except Exception as e:
        print("[WARN] ESummary parse error:", e, r.text[:300])
    return d,fa

def efetch_abstract(pmid):
    if not pmid: return ""
    url="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    p={"db":"pubmed","id":pmid,"retmode":"text","rettype":"abstract","email":EMAIL,"tool":TOOL}
    r=req(url,p,"EFetch")
    t=r.text.strip()
    print(f"[DEBUG] EFetch PMID={pmid} abstract_len={len(t)}")
    return t

def process(df,out,limit=607):
    if limit: df=df.head(limit).copy()
    rows=[]
    for idx,row in df.iterrows():
        try:
            title=row.get("Title","")
            link=row.get("Link","")
            org=row.get("Inferred Organism","")
            pmcid=pmcid_from(link,row.get("PMCID",""))
            pmid=str(row.get("PMID","") or "")
            pub_date=str(row.get("pub_date","") or "")
            first_author=str(row.get("first_author","") or "")
            abstract=str(row.get("abstract","") or "")

            print(f"\n[DEBUG] row={idx} title='{str(title)[:80]}' link='{link}'")
            print(f"[DEBUG] initial PMCID='{pmcid}' PMID='{pmid}' pub_date='{pub_date}' first_author='{first_author}' abstract_len={len(abstract)}")

            if not pmid and pmcid:
                try:
                    pmid=elink_pmc_to_pmid(pmcid)
                except Exception as e:
                    print("[ERROR] ELink failed:", e, traceback.format_exc())
                sleep()

            if (not pub_date or not first_author) and pmid:
                try:
                    d,fa=esummary_pub_fields(pmid)
                    if not pub_date: pub_date=d
                    if not first_author: first_author=fa
                except Exception as e:
                    print("[ERROR] ESummary failed:", e, traceback.format_exc())
                sleep()

            if not abstract and pmid:
                try:
                    abstract=efetch_abstract(pmid)
                except Exception as e:
                    print("[ERROR] EFetch failed:", e, traceback.format_exc())
                sleep()

            print(f"[DEBUG] final PMCID='{pmcid}' PMID='{pmid}' pub_date='{pub_date}' first_author='{first_author}' abstract_len={len(abstract)}")

            rows.append({
                "Title":title,"Link":link,"Inferred Organism":org,
                "PMCID":pmcid,"PMID":pmid,"pub_date":pub_date,"first_author":first_author,"abstract":abstract
            })
        except Exception as e:
            print("[ERROR] row failed:", e, traceback.format_exc())

    try:
        pd.DataFrame(rows,columns=["Title","Link","Inferred Organism","PMCID","PMID","pub_date","first_author","abstract"]).to_csv(out,index=False,quoting=csv.QUOTE_MINIMAL)
        print(f"\n[SAVED] -> {out} rows={len(rows)}")
    except Exception as e:
        print("[ERROR] save failed:", e)

process(df,OUT)
