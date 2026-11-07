"""
Indian Number Plate OCR Engine with PaddleOCR & Heuristic Disambiguation
"""

import re
from typing import Dict, Any, Tuple, List, Optional

INDIAN_STATE_CODES: Dict[str, str] = {
    "AN": "Andaman & Nicobar",
    "AP": "Andhra Pradesh",
    "AR": "Arunachal Pradesh",
    "AS": "Assam",
    "BR": "Bihar",
    "CG": "Chhattisgarh",
    "CH": "Chandigarh",
    "DD": "Daman & Diu",
    "DL": "Delhi",
    "DN": "Dadra & Nagar Haveli",
    "GA": "Goa",
    "GJ": "Gujarat",
    "HP": "Himachal Pradesh",
    "HR": "Haryana",
    "JH": "Jharkhand",
    "JK": "Jammu & Kashmir",
    "KA": "Karnataka",
    "KL": "Kerala",
    "LA": "Ladakh",
    "LD": "Lakshadweep",
    "MH": "Maharashtra",
    "ML": "Meghalaya",
    "MN": "Manipur",
    "MP": "Madhya Pradesh",
    "MZ": "Mizoram",
    "NL": "Nagaland",
    "OD": "Odisha",
    "PB": "Punjab",
    "PY": "Puducherry",
    "RJ": "Rajasthan",
    "SK": "Sikkim",
    "TN": "Tamil Nadu",
    "TR": "Tripura",
    "TS": "Telangana",
    "UK": "Uttarakhand",
    "UP": "Uttar Pradesh",
    "WB": "West Bengal",
}

CHAR_TO_DIGIT = {
    'O': '0', 'D': '0', 'Q': '0',
    'I': '1', 'L': '1', 'T': '1',
    'Z': '2', 'E': '3', 'A': '4',
    'S': '5', 'G': '6', 'B': '8'
}

CHAR_TO_ALPHA = {
    '0': 'O', '1': 'I', '2': 'Z',
    '3': 'E', '4': 'A', '5': 'S',
    '6': 'G', '8': 'B'
}

def clean_plate_string(text: str) -> str:
    """Strips spaces, hyphens, and non-alphanumeric chars."""
    if not text:
        return ""
    return re.sub(r'[^A-Z0-9^]', '', text.upper().strip())

def normalize_indian_plate(raw_text: str, base_confidence: float = 0.85) -> Dict[str, Any]:
    """
    Normalizes recognized registration plate text according to Indian MoRTH standards.
    Supports Standard Indian format, BH Series, Military, and custom formats.
    """
    cleaned = clean_plate_string(raw_text)
    corrections: List[str] = []

    if len(cleaned) < 5:
        return {
            "raw_text": raw_text,
            "normalized_plate": cleaned,
            "is_valid": False,
            "format_type": "INVALID",
            "confidence_score": min(base_confidence, 0.4),
            "corrections": corrections,
        }

    # 1. Bharat Series (YY BH #### XX)
    bh_pattern = r'^([0-9]{2}|[A-Z]{2})([B8][H#])([0-9OIZSB]{4})([A-Z0-9]{1,2})$'
    bh_match = re.match(bh_pattern, cleaned)
    if bh_match:
        raw_year, _, raw_digits, raw_suffix = bh_match.groups()
        
        # Normalize Year to digits
        year = "".join(CHAR_TO_DIGIT.get(c, c) if not c.isdigit() else c for c in raw_year)
        # Normalize Digits
        digits = "".join(CHAR_TO_DIGIT.get(c, c) if not c.isdigit() else c for c in raw_digits)
        # Normalize Suffix to letters
        suffix = "".join(CHAR_TO_ALPHA.get(c, c) if not c.isalpha() else c for c in raw_suffix)

        normalized = f"{year}BH{digits}{suffix}"
        is_valid = bool(re.match(r'^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$', normalized))

        return {
            "raw_text": raw_text,
            "normalized_plate": normalized,
            "is_valid": is_valid,
            "format_type": "BHARAT_SERIES",
            "state_name": "Bharat Series (Pan-India)",
            "confidence_score": base_confidence if is_valid else base_confidence * 0.75,
            "corrections": ["Normalized Bharat Series plate format"],
        }

    # 2. Standard Indian Registration: [State 2] [District 1-2] [Series 0-3] [Number 4]
    state_candidate = cleaned[:2]
    # Disambiguate state letters
    s0 = CHAR_TO_ALPHA.get(state_candidate[0], state_candidate[0]) if not state_candidate[0].isalpha() else state_candidate[0]
    s1 = CHAR_TO_ALPHA.get(state_candidate[1], state_candidate[1]) if not state_candidate[1].isalpha() else state_candidate[1]
    candidate_state = s0 + s1

    state_fix_map = {
        "0L": "DL", "OL": "DL", "1L": "DL", "IL": "DL",
        "K4": "KA", "M1": "MH", "G3": "GJ", "U9": "UP", "H8": "HR", "7N": "TN"
    }
    if candidate_state in state_fix_map or cleaned[:2] in state_fix_map:
        candidate_state = state_fix_map.get(candidate_state, state_fix_map.get(cleaned[:2], candidate_state))
        corrections.append(f"Mapped ambiguous state to {candidate_state}")

    state_name = INDIAN_STATE_CODES.get(candidate_state)

    remainder = cleaned[2:]
    rem_match = re.match(r'^([0-9OIDLQZESAB]{1,2})([A-Z0-9OIDLQZESAB]*?)([0-9OIDLQZESAB]{1,4})$', remainder)

    if rem_match:
        raw_dist, raw_ser, raw_num = rem_match.groups()

        # Normalize district to digits
        dist = "".join(CHAR_TO_DIGIT.get(c, c) if not c.isdigit() else c for c in raw_dist)
        if len(dist) == 1:
            dist = f"0{dist}"

        # Normalize number block to digits (4-digit padded)
        num = "".join(CHAR_TO_DIGIT.get(c, c) if not c.isdigit() else c for c in raw_num)
        num = num.zfill(4)

        # Normalize series to alpha
        ser = "".join(CHAR_TO_ALPHA.get(c, c) if not c.isalpha() else c for c in raw_ser)

        normalized = f"{candidate_state}{dist}{ser}{num}"
        is_valid = bool(state_name and re.match(r'^[A-Z]{2}[0-9]{2}[A-Z]{0,3}[0-9]{4}$', normalized))

        score = base_confidence
        if state_name:
            score += 0.05
        if not is_valid:
            score *= 0.8
        score = max(0.3, min(0.99, round(score, 2)))

        return {
            "raw_text": raw_text,
            "normalized_plate": normalized,
            "is_valid": is_valid,
            "format_type": "STANDARD" if is_valid else "CUSTOM",
            "state_code": candidate_state,
            "state_name": state_name or "Unknown State",
            "district_code": dist,
            "series_code": ser,
            "unique_number": num,
            "confidence_score": score,
            "corrections": corrections,
        }

    return {
        "raw_text": raw_text,
        "normalized_plate": cleaned,
        "is_valid": False,
        "format_type": "CUSTOM",
        "confidence_score": max(0.35, base_confidence * 0.6),
        "corrections": corrections,
    }
