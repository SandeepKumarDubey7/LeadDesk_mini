import requests

data = {
    'name': 'Test User',
    'email': 'test2@example.com',
    'budget': '1 million',
    'message': 'This is a test message with more than 10 chars.'
}
res = requests.post('http://localhost:8000/api/leads', data=data)
print(res.status_code)
print(res.text)
