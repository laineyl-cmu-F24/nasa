import argparse, json, re, sys, time, requests, math, os

META = "https://osdr.nasa.gov/osdr/data/osd/meta/{id}"
FILES = "https://osdr.nasa.gov/osdr/data/osd/files/{id}"
UA = {"User-Agent": "Mozilla/5.0"}

def get_json(url, retries=3, backoff=0.6, timeout=30):
    for i in range(retries):
        try:
            r = requests.get(url, headers=UA, timeout=timeout)
            if r.status_code == 200:
                return r.json()
            if 400 <= r.status_code < 500:
                return None
        except Exception:
            pass
        time.sleep(backoff * (2**i))
    return None

_osd_key_pat = re.compile(r"^OSD-\d+$")

def _first_osd_key(d):
    for k in (d or {}):
        if isinstance(k, str) and _osd_key_pat.match(k):
            return k
    return None

def _find_study_in_list(lst):
    if not isinstance(lst, list):
        return None, None
    for obj in lst:
        ident = (obj or {}).get("identifier")
        if isinstance(ident, str) and _osd_key_pat.match(ident):
            return ident, obj
    for obj in lst:
        if isinstance(obj, dict) and obj:
            ident = obj.get("identifier")
            return (ident if isinstance(ident, str) else None), obj
    return None, None

def _get_study_obj(j):
    if not isinstance(j, dict):
        return None, None
    if isinstance(j.get("study"), dict):
        k = _first_osd_key(j["study"])
        if k:
            return k, j["study"][k]
        if "identifier" in j["study"]:
            return j["study"].get("identifier"), j["study"]
    studies = j.get("studies")
    if isinstance(studies, dict):
        k = _first_osd_key(studies)
        if k:
            return k, studies[k]
    elif isinstance(studies, list):
        ident, obj = _find_study_in_list(studies)
        if obj is not None:
            return ident, obj
    return None, None

def _parse_year(s):
    m = re.search(r"(\d{4})", str(s or ""))
    return int(m.group(1)) if m else None

def _parse_publications(container):
    pubs = []
    for p in (container.get("publications") or []):
        pubs.append({
            "title": p.get("title", ""),
            "authors": p.get("authorList", ""),
            "doi": p.get("doi", ""),
            "pubmed": p.get("pubMedID", ""),
            "status": (p.get("status") or {}).get("annotationValue", "")
        })
    return pubs

def extract_meta(j):
    k_guess, s = _get_study_obj(j)
    if not s:
        return None

    subs = s.get("studies") or []
    sub = subs[0] if subs and isinstance(subs[0], dict) else {}

    dataset_id = sub.get("identifier") or s.get("identifier") or k_guess or ""

    title = (sub.get("title")
             or s.get("title")
             or s.get("studyTitle")
             or s.get("name")
             or "").strip()

    desc = (sub.get("description")
            or s.get("description")
            or s.get("studyDescription")
            or "").strip()

    release = sub.get("publicReleaseDate") or s.get("publicReleaseDate") or ""
    year = _parse_year(release)

    mission = ""
    for container in (sub, s):
        comments = container.get("comments") or []
        for c in comments:
            nm = (c.get("name") or "").lower()
            if any(key in nm for key in ("mission name", "mission", "flight program", "space program")):
                mission = (c.get("value") or "").strip()
                if mission:
                    break
        if mission:
            break

    orgs = []
    for container in (s, sub):
        ob = ((container.get("additionalInformation") or {}).get("organisms") or {})
        if isinstance(ob, dict):
            ont = ob.get("ontologies") or {}
            for _, v in ont.items():
                nm = v.get("name") or v.get("preferredTerm") or v.get("label")
                if nm:
                    orgs.append(str(nm))
            if not orgs:
                ln = ob.get("links") or {}
                for _, v in ln.items():
                    txt = str(v)
                    txt = re.sub(r".*?>\s*", "", txt).strip(' "')
                    if txt:
                        orgs.append(txt)
        if orgs:
            break
    orgs = sorted({o for o in orgs if o})

    publications = _parse_publications(sub) or _parse_publications(s)

    num = re.search(r"\d+", dataset_id or "")
    access = META.format(id=num.group(0)) if num else ""

    return {
        "dataset_id": dataset_id or (k_guess or ""),
        "title": title,
        "description": desc,
        "mission": mission,
        "organisms": orgs,
        "start_year": year,
        "end_year": year,
        "access_url": access,
        "publications": publications
    }

def has_files(j):
    if not isinstance(j, dict) or "studies" not in j:
        return False
    studies = j["studies"]
    if isinstance(studies, dict):
        k = _first_osd_key(studies)
        if not k:
            return False
        files = studies.get(k, {}).get("study_files") or []
        return len(files) > 0
    elif isinstance(studies, list):
        ident, obj = _find_study_in_list(studies)
        if not obj:
            return False
        files = obj.get("study_files") or []
        return len(files) > 0
    return False

def fmt_rate(done, start_ts):
    dt = max(1e-6, time.time() - start_ts)
    return done / dt

def est_eta(left, rate):
    if rate <= 0: return "?"
    sec = left / rate
    m, s = divmod(int(sec), 60)
    h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d}"

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--start-id", type=int, default=1)
    p.add_argument("--max-id", type=int, default=3000)
    p.add_argument("--stop-misses", type=int, default=200)
    p.add_argument("--sleep", type=float, default=0.15)
    p.add_argument("--out", default="src/data/OSDR_category.json")
    p.add_argument("--jsonl", default=None)
    p.add_argument("--print-every", type=int, default=25)
    p.add_argument("--min-year", type=int, default=None)
    p.add_argument("--require-files", action="store_true")
    args = p.parse_args()

    out = []
    misses = 0
    t0 = time.time()
    found = 0
    total = args.max_id - args.start_id + 1
    jsonl_fp = open(args.jsonl, "w", encoding="utf-8") if args.jsonl else None

    print(f"[START] range={args.start_id}-{args.max_id} stop_misses={args.stop_misses} require_files={args.require_files}")
    for i in range(args.start_id, args.max_id + 1):
        meta = get_json(META.format(id=i))
        if not meta:
            misses += 1
        else:
            rec = extract_meta(meta)
            if not rec:
                misses += 1
            else:
                files = get_json(FILES.format(id=i))
                nofiles = (not files) or (not has_files(files))
                if args.require_files and nofiles:
                    misses += 1
                else:
                    passes_year = True
                    if args.min_year and rec.get("start_year") and rec["start_year"] < args.min_year:
                        passes_year = False
                    if passes_year:
                        if nofiles: rec["no_files"] = True
                        out.append(rec)
                        if jsonl_fp:
                            jsonl_fp.write(json.dumps(rec, ensure_ascii=False) + "\n")
                            jsonl_fp.flush()
                        found += 1
                        misses = 0
                    else:
                        misses += 1

        done = i - args.start_id + 1
        if (done % args.print_every) == 0 or i == args.max_id:
            rate = fmt_rate(done, t0)
            left = total - done
            eta = est_eta(left, rate)
            print(f"[PROGRESS] id={i} done={done}/{total} found={found} misses={misses} rate={rate:.2f}/s eta={eta}")

        if misses >= args.stop_misses:
            print(f"[STOP] consecutive_misses={misses} at id={i}")
            break

        time.sleep(args.sleep)

    if jsonl_fp:
        jsonl_fp.close()

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"[DONE] saved={args.out} records={len(out)} elapsed={time.time()-t0:.1f}s")

if __name__ == "__main__":
    main()
