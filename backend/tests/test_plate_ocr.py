import unittest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.ai_engine.ocr_engine import normalize_indian_plate, clean_plate_string

class TestIndianPlateNormalization(unittest.TestCase):
    def test_clean_string(self):
        self.assertEqual(clean_plate_string("GJ-01-AB-1234"), "GJ01AB1234")
        self.assertEqual(clean_plate_string("dl.8.caf.1234"), "DL8CAF1234")
        self.assertEqual(clean_plate_string("MH 12 EF 3456"), "MH12EF3456")

    def test_standard_plates(self):
        p1 = normalize_indian_plate("GJ01AB1234")
        self.assertTrue(p1["is_valid"])
        self.assertEqual(p1["normalized_plate"], "GJ01AB1234")
        self.assertEqual(p1["state_name"], "Gujarat")

        p2 = normalize_indian_plate("MH12EF3456")
        self.assertTrue(p2["is_valid"])
        self.assertEqual(p2["state_name"], "Maharashtra")

        p3 = normalize_indian_plate("KA03MN9876")
        self.assertTrue(p3["is_valid"])
        self.assertEqual(p3["state_name"], "Karnataka")

    def test_delhi_format(self):
        p = normalize_indian_plate("DL8CAF1234")
        self.assertTrue(p["is_valid"])
        self.assertEqual(p["normalized_plate"], "DL08CAF1234")
        self.assertEqual(p["state_code"], "DL")

    def test_ocr_confusion_correction(self):
        # 'O' in district, 'S' in number
        res = normalize_indian_plate("GJ O1 AB 12S4")
        self.assertTrue(res["is_valid"])
        self.assertEqual(res["normalized_plate"], "GJ01AB1254")

        # '0L' state slip
        res2 = normalize_indian_plate("0L 8 CAF I234")
        self.assertTrue(res2["is_valid"])
        self.assertEqual(res2["normalized_plate"], "DL08CAF1234")

    def test_bharat_series(self):
        bh = normalize_indian_plate("22BH1234AA")
        self.assertTrue(bh["is_valid"])
        self.assertEqual(bh["format_type"], "BHARAT_SERIES")
        self.assertEqual(bh["normalized_plate"], "22BH1234AA")

if __name__ == '__main__':
    unittest.main()
