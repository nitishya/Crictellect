import urllib.request
import xml.etree.ElementTree as ET
import time
import re

# Simple in-memory cache for efficiency
_cache = {
    "data": None,
    "last_fetched": 0
}

CACHE_TTL_SECONDS = 30

def fetch_live_match_data():
    current_time = time.time()
    if _cache["data"] and (current_time - _cache["last_fetched"]) < CACHE_TTL_SECONDS:
        return _cache["data"]

    try:
        url = "http://static.cricinfo.com/rss/livescores.xml"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        xml_data = response.read()
        root = ET.fromstring(xml_data)
        
        matches = []
        for item in root.findall('.//item'):
            title = item.find('title').text
            if title:
                matches.append(title)
                
        # Try to find an IPL match or take the first one
        selected_match = None
        for m in matches:
            if 'IPL' in m or 'Royal Challengers' in m or 'Gujarat' in m or 'Titans' in m:
                selected_match = m
                break
        
        if not selected_match and matches:
            selected_match = matches[0]
            
        if selected_match:
            parts = selected_match.split(' v ')
            team_a_str = parts[0].strip() if len(parts) > 0 else "Team A"
            team_b_str = parts[1].strip() if len(parts) > 1 else "Team B"
            
            def parse_team_str(s):
                match = re.search(r'(.*?)\s+(\d+)/(\d+)', s)
                if match:
                    return match.group(1).strip(), int(match.group(2)), int(match.group(3))
                match_allout = re.search(r'(.*?)\s+(\d+)$', s)
                if match_allout:
                    return match_allout.group(1).strip(), int(match_allout.group(2)), 10
                return s.replace('*', '').strip(), 0, 0

            team_a, score_a, wkts_a = parse_team_str(team_a_str)
            team_b, score_b, wkts_b = parse_team_str(team_b_str)
            
            result = {
                "team_a": team_a,
                "team_b": team_b,
                "score_a": score_a,
                "wkts_a": wkts_a,
                "score_b": score_b,
                "wkts_b": wkts_b,
                "status": selected_match
            }
            
            _cache["data"] = result
            _cache["last_fetched"] = current_time
            return result
    except Exception as e:
        print("Error fetching live data:", e)
        # Fallback to stale cache if available
        if _cache["data"]:
            return _cache["data"]
    return None
