'''
activate the virtual environment and install requests, since base py3 may not have it
source py/bin/activate
'''

import requests

url = 'http://localhost:9000'
body= {"principal": 1000000.0, "annual_rate": 2.0, "years": 5}

r = requests.post(url, json=body)
#r.text

print(r.text)
print("done")