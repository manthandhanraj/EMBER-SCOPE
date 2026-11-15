"""Production smoke checks. Start runner.py on port 3002 first; optional --live-ai uses local/provider generation."""
import argparse
import csv
from datetime import datetime, timezone
import io
import json
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', default='http://127.0.0.1:3002')
    parser.add_argument('--live-ai', action='store_true', help='Generate two explicit answers; may use a configured hosted provider')
    args = parser.parse_args()
    origin = urlparse(args.base)
    if origin.hostname not in ('localhost', '127.0.0.1', '::1') or origin.scheme != 'http':
        parser.error('Use a local HTTP verification server.')
    checks, generated = [], []

    def request(path, body=None, expected=200):
        req = Request(args.base.rstrip('/') + path, data=None if body is None else json.dumps(body).encode(), headers={} if body is None else {'Content-Type':'application/json'})
        try:
            response = urlopen(req, timeout=180 if body else 50)
        except HTTPError as error:
            response = error
        with response:
            status, headers, raw = response.status, {k.lower():v for k,v in response.headers.items()}, response.read()
        assert status == expected, f'{path}: expected {expected}, got {status}: {raw[:200]!r}'
        return headers, raw.decode('utf-8-sig')

    def packet(path, body=None, expected=200):
        headers, text = request(path, body, expected)
        return headers, json.loads(text)

    def record(name, **details):
        checks.append({'check':name,'passed':True,**details})

    pages = ['/', '/research', '/research?view=rank', '/research?view=insights', '/research?view=report', '/investigations', '/psi', '/flammability', '/model-lab', '/applications', '/readiness', '/sources', '/methodology', '/atlas', '/compare', '/gaps', '/mission', '/data-guide']
    for path in pages:
        headers, text = request(path)
        assert 'EmberScope' in text and 'content-security-policy' in {k.lower() for k in headers}, path
    record('production-pages-and-security-headers', routes=len(pages))

    studies = json.loads((ROOT/'apps/web/data/investigations.json').read_text(encoding='utf-8'))
    for study in studies:
        study_id = study['id']
        request('/investigations/' + study_id)
        headers, data = packet('/api/investigations/' + study_id)
        assert data['status']['summaryAvailable'] and len(data['fields']) == 8
        assert headers.get('content-disposition','').startswith('attachment')
        _, detailed = request(f'/api/investigations/{study_id}?format=markdown')
        _, concise = request(f'/api/investigations/{study_id}?format=markdown&mode=concise')
        assert 'Original references' in detailed and 'Missing data and review' in concise and len(concise) < len(detailed)
        if study_id in ('same', 'fm2', 'sofie'):
            assert data['testCoverage']['total'] == 0
        if study_id in ('fm2', 'sofie'):
            assert not data['findings']['observed']
    record('curated-profile-pages-and-summary-exports', profiles=len(studies))

    _, catalog = packet('/api/psi')
    original_tables = json.loads((ROOT/'apps/web/data/psi-numerical.json').read_text(encoding='utf-8'))['tables']
    assert len(catalog['investigations']) == 24
    assert any(s['accession']=='PSI-39' and s['sourceWarnings'] for s in catalog['investigations'])
    seen = {}
    for table in original_tables:
        # Table key: the accession for its first table, "PSI-10:2" for the second, matching the app.
        seen[table['accession']] = seen.get(table['accession'], 0) + 1
        accession = table['accession'] if seen[table['accession']] == 1 else f"{table['accession']}:{seen[table['accession']]}"
        _, downloaded = packet('/api/psi?' + urlencode({'accession':accession}))
        assert downloaded['rows'] == table['rows'] and downloaded['provenance']['sha256'] == table['provenance']['sha256']
        headers, text = request('/api/psi?' + urlencode({'accession':accession,'format':'csv'}))
        rows = list(csv.reader(io.StringIO(text)))
        assert rows[0] == table['columns'] and len(rows)-1 == table['rowCount']
        _, model_source = packet('/api/model-data?' + urlencode({'source':'psi','accession':accession}))
        assert model_source['table']['rows'] == table['rows']
    _, harmonized = packet('/api/psi?' + urlencode({'format':'harmonized'}))
    assert harmonized['totals']['rows'] == sum(t['rowCount'] for t in original_tables) and not harmonized['totals']['unmappedTables']
    _, flammability = packet('/api/flammability')
    assert flammability['flammabilityMap']['limits']['SIBAL fabric']['flameMin'] is not None and len(flammability['partialGravity']) == 2
    record('real-psi-table-fidelity-and-downloads', entries=24, tables=len(original_tables), sourceRows=sum(t['rowCount'] for t in original_tables), modelReadyRows=harmonized['totals']['modelReady'])

    for target, size in [('catalog',78),('ignition',41),('spread',4)]:
        _, data = packet('/api/model-data?' + urlencode({'target':target}))
        assert len(data['rows']) == size
        groups = {}
        for row in data['rows']:
            assert row['source_url']
            groups.setdefault(row['group'], set()).add(row['split'])
        assert all(len(values)==1 for values in groups.values())
        _, text = request('/api/model-data?' + urlencode({'target':target,'format':'csv'}))
        assert len(list(csv.reader(io.StringIO(text))))-1 == size
    record('model-target-exports-and-group-separation', catalog=78, ignition=41, spread=4)

    reports = []
    for environment in ('spacecraft','station','rover'):
        _, report = packet('/api/research/report?' + urlencode({'q':'smoke particle detection','goal':'detection','environment':environment}))
        assert report['rankingMethod']['neural'] and report['rankingMethod']['model']=='all-minilm'
        assert report['ranked'][0]['study']['id'] in ('same','same-r')
        assert all(0 <= row['points'] <= 100 for row in report['ranked'])
        reports.append(report)
    points = [next(row['componentScores']['habitat'] for row in r['ranked'] if row['study']['id']=='saffire') for r in reports]
    assert len(set(points)) == 3
    record('live-neural-ranking-and-distinct-habitat-priorities', model='all-minilm', habitats=3)

    for path, status in [('/api/psi?accession=unknown',404),('/api/psi?format=csv',400),('/api/model-data?target=unknown',400),('/api/investigations/unknown',404),('/investigations/unknown',404),('/api/investigations/same?format=bad',400),('/api/research/report?oxygen=101',400)]:
        request(path, expected=status)
    packet('/api/ask', {'question':'101% oxygen','evidenceOnly':True}, expected=400)
    for study_id in ('same','fm2'):
        _, data = packet('/api/ask', {'question':'Summarize this investigation','research':True,'investigationId':study_id,'goal':'prevention','evidenceOnly':True})
        assert data['mode']=='evidence-only' and 'No AI provider was called' in data['reason']
        assert any(item['key']==f'I:{study_id}' for item in data['evidence'])
        if study_id=='same':
            assert any(item['key']=='P:PSI-102:table' for item in data['evidence'])
            assert any(item['key']=='F:same-smoke-size-mass' for item in data['evidence'])
        else:
            assert all(item['rung']=='context' for item in data['evidence'])
    record('invalid-inputs-and-scoped-no-model-retrieval')

    if args.live_ai:
        for study_id, question, goal in [
            ('same','Quote the original SAME silicone-rubber smoke-size finding exactly, then identify the detector-validation gap in this corpus.','detection'),
            ('bass2','Summarize the BASS-II low-airflow findings. Identify limits before applying them to a lunar habitat; do not predict safety.','suppression'),
        ]:
            _, answer = packet('/api/ask', {'question':question,'research':True,'investigationId':study_id,'goal':goal,'input':{'environment':'station'}})
            assert answer['mode']=='ai' and answer.get('provider')
            accepted = [c for c in answer['claims'] if c['verified']]
            assert accepted, f'{study_id}: no claims passed defined checks'
            assert any(c['cites'] for c in accepted), f'{study_id}: no accepted source-linked claim'
            generated.append({'investigation':study_id,'question':question,'response':answer})
        record('live-grounded-ai-smoke-cases', cases=len(generated), note='Developer smoke cases; automatic checks are not semantic/expert validation.')

    output={'checkedAt':datetime.now(timezone.utc).isoformat(),'base':args.base,'checks':checks,'liveAi':generated,'scope':'Engineering acceptance checks, not a judge score or scientific accuracy evaluation. Source completeness and independent expert validation remain separate.'}
    destination=ROOT/'evaluation'/'delivery-acceptance.json'
    destination.parent.mkdir(parents=True,exist_ok=True)
    destination.write_text(json.dumps(output,indent=2,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({'passedChecks':len(checks),'profileCount':len(studies),'psiSourceRows':sum(t['rowCount'] for t in original_tables),'liveAiCases':len(generated),'report':str(destination)},indent=2))

if __name__=='__main__':
    main()
