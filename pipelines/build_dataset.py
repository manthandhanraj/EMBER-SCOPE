"""Validate the shipped, manually curated evidence and export its exact snapshot.

This does not claim to re-transcribe NASA PDFs. Source transcription remains a reviewed input.
"""
import csv
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'apps/web/data'

def build():
    corpus = {name: json.loads((DATA/f'{name}.json').read_text(encoding='utf-8')) for name in ['experiments','saffire','luci','findings','sources']}
    sources = {s['source_id'] for s in corpus['sources']}
    errors = []
    def walk(value, path):
        if isinstance(value, dict):
            for k,v in value.items():
                if k == 'source_id' and v not in sources: errors.append(f'{path}: missing source {v}')
                walk(v, path+'/'+k)
        elif isinstance(value,list):
            for i,v in enumerate(value): walk(v,path+'/'+str(i))
    for name, rows in corpus.items():
        if name != 'sources': walk(rows,name)
        key = 'source_id' if name == 'sources' else 'id'
        ids = [r[key] for r in rows]
        if len(ids) != len(set(ids)): errors.append(f'Duplicate identifiers in {name}')
    for e in corpus['experiments']:
        if e.get('oxygen_vol_pct') is not None and not 0 <= e['oxygen_vol_pct'] <= 100: errors.append(f"Invalid oxygen: {e['id']}")
        if not e.get('provenance',{}).get('record'): errors.append(f"Missing test provenance: {e['id']}")
    if errors: raise ValueError('\n'.join(errors))
    out = ROOT/'runtime/evidence-snapshot'
    out.mkdir(parents=True,exist_ok=True)
    manifest = {'method':'Validation/export of upstream curated records; original transcription not reproduced', 'files':{}}
    for name, rows in corpus.items():
        content = (DATA/f'{name}.json').read_bytes()
        manifest['files'][name] = {'rows':len(rows),'sha256':hashlib.sha256(content).hexdigest()}
        (out/f'{name}.json').write_bytes(content)
    (out/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    print(json.dumps(manifest,indent=2))
    return manifest

if __name__ == '__main__': build()
