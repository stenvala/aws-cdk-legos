from fastapi import FastAPI, HTTPException, Request
from mangum import Mangum
from datetime import datetime, timedelta
from models import Area, EncodeBody, DecodeBody
from starlette.middleware.cors import CORSMiddleware
import utils

app = FastAPI(title='auth',
              description='API for encoding/decoding JWT tokens')


app.add_middleware(
    CORSMiddleware,
    allow_origins='*',
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
def read_root():
    return {'msg': 'API is up and running'}


@app.post('/jwt')
def encode(body: EncodeBody):
    docId = body.docId
    to_encode = {
        'exp': datetime.utcnow() + timedelta(hours=10),
        'iss': utils.ISSUER,
        'iat': datetime.utcnow(),
        'docId': docId,
        # {i.id: {p: 0 for p in i.permissions} for i in body.permissions},
        'permissions': [{"id": i.id, "permissions": i.permissions} for i in body.permissions],
    }
    if body.meta:
        to_encode['meta'] = body.meta

    return {'jwt': utils.encode(to_encode)}


@app.post('/auth')
def auth(body: DecodeBody, request: Request):
    decoded_jwt = utils.decode(body.jwt)
    utils.confirm_jwt(decoded_jwt, body.docId, body.area, body.permission)
    fields = ['docId', 'permissions', 'meta']
    return {i: decoded_jwt[i] for i in fields if i in decoded_jwt}


# to make it work with Amazon Lambda, we create a handler object
lambda_handler = Mangum(app=app)
