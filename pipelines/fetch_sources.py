"""Fetch official NASA PDF sources while retaining expected and observed fingerprints."""
import hashlib
import json
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]

def main():
    sources = json.loads((ROOT/'apps/web/data/sources.json').read_text(encoding='utf-8'))
    out = ROOT/'runtime/sources'
    out.mkdir(parents=True,exist_ok=True)
    results=[]
    for source in sources:
        record={'source_id':source['source_id'],'expected_sha256':source.get('sha256')}
        try:
            url=source.get('pdf_url')
            if not url: raise ValueError('No PDF URL in curated source record')
            u=urlparse(url)
            if u.scheme!='https' or u.hostname!='ntrs.nasa.gov': raise ValueError('Only official HTTPS NTRS files are fetched')
            with urlopen(Request(url,headers={'User-Agent':'EmberScope research downloader'}),timeout=45) as response:
                if urlparse(response.url).hostname!='ntrs.nasa.gov': raise ValueError('Unexpected download redirect')
                data=response.read(80*1024*1024+1)
            if len(data)>80*1024*1024 or not data.startswith(b'%PDF'): raise ValueError('Not a PDF under 80 MiB')
            observed=hashlib.sha256(data).hexdigest()
            (out/(source['source_id']+'.pdf')).write_bytes(data)
            record.update(status='downloaded',observed_sha256=observed,expected_matches=observed==source.get('sha256'),url=url)
        except Exception as e: record.update(status='failed',error=str(e))
        results.append(record)
        print(record['source_id'],record['status'])
    (out/'download-manifest.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    if any(r['status']=='failed' for r in results): raise SystemExit('Some sources unavailable. See runtime/sources/download-manifest.json.')

if __name__=='__main__': main()
