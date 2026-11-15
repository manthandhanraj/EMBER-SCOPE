"""Offline regression checks for PSI import boundaries and source preservation."""
import hashlib
import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from import_psi import accession, validate_url, normalize_metadata, parse_csv


class PsiImportTests(unittest.TestCase):
    def test_only_verified_https_services_are_allowed(self):
        for url in ["http://psi.nasa.gov/x", "https://psi.nasa.gov.evil.example/x", "https://user:password@psi.nasa.gov/x", "https://psi.nasa.gov:444/x", "https://127.0.0.1/x"]:
            with self.assertRaises(ValueError):
                validate_url(url)
        validate_url("https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-25")
        validate_url("https://psi-repo-prod.s3.amazonaws.com/psi-data/PSI-25/a.csv", download=True)
        with self.assertRaises(ValueError):
            validate_url("https://psi-repo-prod.s3.amazonaws.com/other/a.csv", download=True)

    def test_accessions_cannot_be_paths_or_queries(self):
        for value in [None, "PSI-25/../x", "PSI-25?x=1", "PSI-0", "OSD-25", "PSI-25\n"]:
            with self.assertRaises(ValueError):
                accession(value)

    def test_normalization_preserves_provenance_and_does_not_invent_results(self):
        source = {"accession": "PSI-25", "title": "<b>Burning</b> research", "version": 4,
                  "public": True, "restricted": False, "doi": "10.60555/example", "objective": "Study flame spread",
                  "added": [{"file_name": "test.csv", "file_size": 42, "remote_path": "/Home/psi-data/PSI-25/Raw Data/test.csv", "restricted": False}],
                  "experimentalTable": [], "removed": [], "modified": []}
        raw = json.dumps(source).encode()
        result = normalize_metadata(source, raw, "2026-11-15T00:00:00+00:00")
        self.assertEqual(result["provenance"]["sha256"], hashlib.sha256(raw).hexdigest())
        self.assertEqual(result["provenance"]["retrievedAt"], "2026-11-15T00:00:00+00:00")
        self.assertTrue(result["metadataOnly"])
        self.assertNotIn("outcome", result)
        self.assertEqual(result["files"][0]["category"], "Raw Data")
        self.assertEqual(result["files"][0]["sourceUrl"], "https://psi.nasa.gov/physci/repo/data/investigations/PSI-25")

    def test_private_or_malformed_record_is_not_imported(self):
        for source in [{"accession": "PSI-25"}, {"accession": "PSI-25", "title": "x", "version": 1, "public": False}, {"accession": "PSI-25", "title": "x", "version": 1, "public": True, "restricted": True}]:
            with self.assertRaises(ValueError):
                normalize_metadata(source, b"{}", "today")

    def test_source_csv_retains_zero_negative_censored_and_unknown_strings(self):
        columns, rows = parse_csv(b'\xef\xbb\xbf Test # ,O2 vol %,CO ppm,Air display\r\r\nA,0,-1,<1\r\r\nB,none,,see notes\r\r\n')
        self.assertEqual(columns, ["Test #", "O2 vol %", "CO ppm", "Air display"])
        self.assertEqual(rows, [{"Test #": "A", "O2 vol %": "0", "CO ppm": "-1", "Air display": "<1"}, {"Test #": "B", "O2 vol %": "none", "CO ppm": None, "Air display": "see notes"}])

    def test_malformed_table_does_not_silently_shift_columns(self):
        for payload in [b'a,a\n1,2', b'a,b\n1,2,3', b'a,\n1,2']:
            with self.assertRaises(ValueError):
                parse_csv(payload)


if __name__ == "__main__":
    unittest.main()
