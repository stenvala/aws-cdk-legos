from fastapi import FastAPI, HTTPException
from mangum import Mangum
import jwt
from datetime import datetime, timedelta
from models import Area, EncodeBody, DecodeBody

SECRET = 'SECRET_CODE'
ISSUER = 'AUTH'

app = FastAPI(title='auth',
              description='API for encoding/decoding JWT tokens')


@app.get('/')
def read_root():
    return {'msg': 'API is up and running'}


@app.post('/jwt')
def encode(body: EncodeBody):
    docId = body.docId
    to_encode = {
        'exp': datetime.utcnow() + timedelta(hours=10),
        'iss': ISSUER,
        'iat': datetime.utcnow(),
        'docId': docId,
        # {i.id: {p: 0 for p in i.permissions} for i in body.permissions},
        'permissions': [{"id": i.id, "permissions": i.permissions} for i in body.permissions],
    }
    if body.meta:
        to_encode['meta'] = body.meta
    encoded_jwt = jwt.encode(to_encode, SECRET, algorithm='HS256')
    return {'jwt': encoded_jwt}


@app.post('/auth')
def auth(body: DecodeBody):
    try:
        decoded_jwt = jwt.decode(
            body.jwt, SECRET, issuer=ISSUER, algorithms=['HS256'])
    except:
        raise HTTPException(status_code=401, detail='Unauthorized')

    if decoded_jwt['docId'] != body.docId or \
            not has_permission(body.area, body.permission, decoded_jwt['permissions']):
        #    body.area not in decoded_jwt['permissions'] or \
        #    body.permission not in decoded_jwt['permissions'][body.area]:
        raise HTTPException(status_code=403, detail='Forbidden')
    fields = ['docId', 'permissions', 'meta']
    return {i: decoded_jwt[i] for i in fields if i in decoded_jwt}


def has_permission(area, permission, permissions):
    for i in permissions:
        if i['id'] == area and permission in i['permissions']:
            return True
    return False


# to make it work with Amazon Lambda, we create a handler object
lambda_handler = Mangum(app=app)
