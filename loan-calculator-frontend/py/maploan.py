'''
activate the virtual environment and install requests, since base py3 may not have it
source py/bin/activate
'''

import requests

url = 'http://localhost:9000'
body= {
        "purch_price": 2200000.0,
        "down_payment": 10.0,
        "annual_rate_first": 7.0,
        "duration": 30,
        "annual_rate_map": 3.0,
        "prop_tax_and_ins": 1.5,
        "hoa": 450.0 
      }

r = requests.post(url, json=body)
#r.text

print(r.text)
print("done")