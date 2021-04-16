import jwt
import boto3
import os
import datetime
from fastapi import HTTPException

secret = None
secret_saved = None

def get_secret(force_reset=False):    
    if not 'AWS' in os.environ:
        return 'LOCAL_SECRET'
    global secret
    global secret_saved
    if not force_reset and secret is not None:
        now = datetime.datetime.now()        
        # Keep cached for one hour
        if (now - secret_saved).seconds < 3600:
            return secret

    secret_saved = datetime.datetime.now()    
    ssm = boto3.client('ssm')
    # Check this from history if fails well, because previous token might be used (or next, do this with force_reset only)
    # SEE: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/ssm.html#SSM.Client.get_parameter_history
    parameter = ssm.get_parameter(Name=os.environ['KEY'], WithDecryption=True)        
    #return parameter['Parameter']['Value']
    secret = parameter['Parameter']['Value']
    return secret


def get_issuer():
    return os.environ['ISSUER'] if 'ISSUER' in os.environ else 'LOCAL_ISSUER'        


def encode(to_encode):
    return jwt.encode(to_encode, get_secret(), algorithm='HS256')


def decode(token, reset=False):
    try:
        return jwt.decode(
            token, get_secret(reset), issuer=get_issuer(), algorithms=['HS256'])
    except:
        if not reset:
            return decode(token, True)

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
