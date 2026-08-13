from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
db = client['leaddesk_mini']
leads = list(db.leads.find({}))
print(f'Total leads in DB: {len(leads)}')
if len(leads) > 0:
    print(leads[0])
users = list(db.users.find({}))
print(f'Total users in DB: {len(users)}')
if len(users) > 0:
    print(users[0])
