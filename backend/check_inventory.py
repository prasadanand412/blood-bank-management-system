import urllib.request
import json

req = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/inventory/units")
data = json.loads(req.read())
print(json.dumps(data[:2], indent=2))
