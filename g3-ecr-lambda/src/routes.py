from fastapi import APIRouter, Response, status
from pydantic import BaseModel

router = APIRouter()


class PostRequest(BaseModel):
    name: str


HELLO = 'Hi'


@router.get('')
def get_test():
    return {
        'msg': f'{HELLO} World!'
    }


@router.get('/{who}')
async def get_test_for_somebody(who: str):
    return {
        'msg': f'{HELLO} {who}!'
    }


@router.post('')
def post_test(body: PostRequest, response: Response):
    response.status_code = status.HTTP_202_ACCEPTED
    return {
        'msg': f'{HELLO} {body.name}!'
    }
