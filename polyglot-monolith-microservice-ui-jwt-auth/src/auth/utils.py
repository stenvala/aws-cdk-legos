import jwt
from fastapi import HTTPException


SECRET = 'SECRET_CODE'
ISSUER = 'AUTH'


def encode(to_encode):
    return jwt.encode(to_encode, SECRET, algorithm='HS256')


def decode(token):
    try:
        return jwt.decode(
            token, SECRET, issuer=ISSUER, algorithms=['HS256'])
    except:
        raise HTTPException(status_code=401, detail='Unauthorized')


def confirm_jwt(decoded_jwt, docId, area, permission):
    if not 'docId' in decoded_jwt or \
            not 'permissions' in decoded_jwt or \
            decoded_jwt['docId'] != docId or \
            not has_permission(area, permission, decoded_jwt['permissions']):
        #    body.area not in decoded_jwt['permissions'] or \
        #    body.permission not in decoded_jwt['permissions'][body.area]:
        raise HTTPException(status_code=403, detail='Forbidden')


def has_permission(area, permission, permissions):
    for i in permissions:
        if i['id'] == area and permission in i['permissions']:
            return True
    return False
